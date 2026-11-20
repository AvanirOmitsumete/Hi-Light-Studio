/// <reference path="../pb_data/types.d.ts" />

// Voids, refunds and cancellations with an audit trail.
// - payments: who voided a payment, when and why. Payments can no longer be edited or deleted
//   through the API; voids go through POST /api/studioflow/payments/:id/void (studio_ledger.pb.js).
// - refunds (new): money given back, dated when it is given back (RF-000001…). A refund never
//   changes the original payment. Created only through POST /api/studioflow/refunds.
// - registrations: who cancelled, when, why, and the status before cancelling (Restore returns to it);
//   refunded_amount is the total refunded. paid_amount is now net of refunds.
const ADMIN = "@request.auth.role = 'admin' && @request.auth.disabled = false";
const STAFF_MONEY = "(@request.auth.role = 'cashier' || @request.auth.role = 'admin') && (@request.auth.id != '' && @request.auth.disabled = false)";

// Same checks as 1793801500, but the remaining balance also counts refunds, and new payments must be completed.
function installPaymentValidation(app, withRefunds) {
  const paid = `(SELECT COALESCE(SUM(ROUND(amount * 100)), 0)
    FROM payments WHERE registration = NEW.registration AND COALESCE(status, '') IN ('', 'completed'))`;
  const refunded = withRefunds ? `(SELECT COALESCE(SUM(ROUND(amount * 100)), 0) FROM refunds WHERE registration = NEW.registration)` : "0";
  const remaining = `(SELECT MAX(0, ROUND(total_amount * 100) - (${paid} - ${refunded}))
    FROM registrations WHERE id = NEW.registration)`;
  app.db().newQuery("DROP TRIGGER IF EXISTS payments_validate_insert").execute();
  app.db().newQuery(`
    CREATE TRIGGER payments_validate_insert
    BEFORE INSERT ON payments
    BEGIN
      SELECT CASE WHEN ROUND(NEW.amount * 100) < 1
        THEN RAISE(ABORT, 'Payment must be at least 0.01') END;
      SELECT CASE WHEN NEW.payment_type NOT IN ('full', 'initial', 'additional')
        THEN RAISE(ABORT, 'Invalid collection mode') END;
      ${withRefunds ? `SELECT CASE WHEN COALESCE(NEW.status, '') NOT IN ('', 'completed')
        THEN RAISE(ABORT, 'A new payment must be completed') END;` : ""}
      SELECT CASE WHEN NEW.payment_type IN ('full', 'initial') AND ${paid} > 0
        THEN RAISE(ABORT, 'Collection mode is only available for the initial payment') END;
      SELECT CASE WHEN ROUND(NEW.amount * 100) > ${remaining}
        THEN RAISE(ABORT, 'Payment exceeds remaining balance') END;
      SELECT CASE WHEN NEW.payment_type = 'full' AND ROUND(NEW.amount * 100) != ${remaining}
        THEN RAISE(ABORT, 'Full settlement must equal remaining balance') END;
      SELECT CASE WHEN NEW.payment_type = 'initial' AND ROUND(NEW.amount * 100) != (
        SELECT MIN(ROUND(total_amount * 100), ROUND(total_amount / 2.0) * 100)
        FROM registrations WHERE id = NEW.registration
      ) THEN RAISE(ABORT, 'Downpayment must equal 50 percent of total') END;
      SELECT CASE WHEN NEW.payment_method = 'cash' AND ROUND(NEW.cash_tendered * 100) < ROUND(NEW.amount * 100)
        THEN RAISE(ABORT, 'Cash tendered is insufficient') END;
    END
  `).execute();
}

// Same guard as 1793801600; with restore, an order may return from Cancelled to the status it had before.
function installQueueGuard(app, allowRestore) {
  app.db().newQuery("DROP TRIGGER IF EXISTS studio_photo_queue_guard").execute();
  app.db().newQuery(`
    CREATE TRIGGER studio_photo_queue_guard
    BEFORE UPDATE OF status ON registrations
    WHEN NEW.status != OLD.status
      ${allowRestore ? "AND NOT (OLD.status = 'cancelled' AND NEW.status = COALESCE(OLD.status_before_cancel, ''))" : ""}
      AND (
        (NEW.status IN ('shooting', 'done_shooting', 'completed') AND (
          OLD.status IN ('pending_payment', 'cancelled')
          OR (OLD.status = 'paid' AND OLD.paid_amount <= 0)
          OR (OLD.status = 'paid' AND (OLD.makeup_service != '' OR NEW.makeup_service != '') AND OLD.makeup_state != 'completed')
        ))
        OR (NEW.status IN ('shooting', 'done_shooting', 'completed', 'ready_for_pickup', 'released') AND OLD.makeup_state IN ('claimed', 'in_progress'))
      )
    BEGIN
      SELECT RAISE(ABORT, 'The student is not eligible for photography yet.');
    END
  `).execute();
}

migrate((app) => {
  const payments = app.findCollectionByNameOrId("payments");
  payments.fields.add(
    new DateField({ name: "voided_at" }),
    new TextField({ name: "voided_by", max: 120 }),
    new TextField({ name: "void_reason", max: 500 })
  );
  // Saved payments are never edited or deleted through the API (voids use the void route).
  payments.updateRule = null;
  payments.deleteRule = null;
  app.save(payments);

  const registrations = app.findCollectionByNameOrId("registrations");
  registrations.fields.add(
    new NumberField({ name: "refunded_amount" }),
    new DateField({ name: "cancelled_at" }),
    new TextField({ name: "cancelled_by", max: 120 }),
    new TextField({ name: "cancel_reason", max: 500 }),
    new TextField({ name: "status_before_cancel", max: 30 }),
    new DateField({ name: "restored_at" }),
    new TextField({ name: "restored_by", max: 120 })
  );
  app.save(registrations);

  const refunds = new Collection({
    type: "base", name: "refunds",
    listRule: STAFF_MONEY, viewRule: STAFF_MONEY, createRule: null, updateRule: null, deleteRule: null,
  });
  refunds.fields.add(
    new RelationField({ name: "registration", required: true, collectionId: registrations.id, maxSelect: 1, cascadeDelete: false }),
    new NumberField({ name: "amount", required: true }),
    new SelectField({ name: "method", required: true, maxSelect: 1, values: ["cash", "gcash", "maya", "card"] }),
    new TextField({ name: "reason", required: true, max: 500 }),
    new TextField({ name: "refund_no", max: 20 }),
    new TextField({ name: "refunded_by", max: 120 }),
    new TextField({ name: "refunded_by_id", max: 30 }),
    new TextField({ name: "client_key", max: 64 }),
    new AutodateField({ name: "created", onCreate: true }),
    new AutodateField({ name: "updated", onCreate: true, onUpdate: true }),
  );
  refunds.addIndex("idx_refunds_refund_no", true, "refund_no", "refund_no != ''");
  refunds.addIndex("idx_refunds_client_key", true, "client_key", "client_key != ''");
  refunds.addIndex("idx_refunds_registration", false, "registration", "");
  app.save(refunds);

  app.db().newQuery("UPDATE registrations SET refunded_amount = 0 WHERE refunded_amount IS NULL").execute();
  // Cancelled job orders owe nothing (Restore recalculates the balance).
  app.db().newQuery("UPDATE registrations SET balance = 0 WHERE status = 'cancelled'").execute();
  installPaymentValidation(app, true);
  installQueueGuard(app, true);
}, (app) => {
  installQueueGuard(app, false);
  installPaymentValidation(app, false);
  app.delete(app.findCollectionByNameOrId("refunds"));
  const registrations = app.findCollectionByNameOrId("registrations");
  for (const name of ["refunded_amount", "cancelled_at", "cancelled_by", "cancel_reason", "status_before_cancel", "restored_at", "restored_by"]) {
    registrations.fields.removeByName(name);
  }
  app.save(registrations);
  const payments = app.findCollectionByNameOrId("payments");
  for (const name of ["voided_at", "voided_by", "void_reason"]) payments.fields.removeByName(name);
  payments.updateRule = STAFF_MONEY.replace("(@request.auth.role = 'cashier' || @request.auth.role = 'admin')", "(@request.auth.role = 'admin')");
  payments.deleteRule = payments.updateRule;
  app.save(payments);
});
