/// <reference path="../pb_data/types.d.ts" />

// Printed receipts: each payment remembers the balance before and after it, and the
// cashier station sends a client_key so a retried request can find the saved payment.
// Official receipt numbers (OR-000001…) are assigned by the payments hook.
migrate((app) => {
  const payments = app.findCollectionByNameOrId("payments");
  payments.fields.add(
    new TextField({ name: "client_key", max: 64 }),
    new NumberField({ name: "balance_before" }),
    new NumberField({ name: "balance_after" })
  );
  payments.addIndex("idx_payments_client_key", true, "client_key", "client_key != ''");
  app.save(payments);

  // DynamicModel: -0 scans as a float.
  // Backfill balances for existing payments: before = total minus completed payments made earlier.
  const rows = arrayOf(new DynamicModel({ id: "", registration: "", amount: -0, status: "", total: -0 }));
  app.db().newQuery(`
    SELECT p.id, p.registration, p.amount, COALESCE(p.status, '') AS status, COALESCE(r.total_amount, 0) AS total
    FROM payments p LEFT JOIN registrations r ON r.id = p.registration
    ORDER BY p.registration, p.created, p.id
  `).all(rows);
  let current = null;
  let paid = 0;
  for (const row of rows) {
    if (row.registration !== current) { current = row.registration; paid = 0; }
    const before = Math.max(0, Math.round(row.total * 100) - paid);
    const amount = Math.round(row.amount * 100);
    app.db().newQuery("UPDATE payments SET balance_before = {:before}, balance_after = {:after} WHERE id = {:id}")
      .bind({ before: before / 100, after: Math.max(0, before - amount) / 100, id: row.id }).execute();
    if (row.status === "completed" || row.status === "") paid += amount;
  }
}, (app) => {
  const payments = app.findCollectionByNameOrId("payments");
  payments.removeIndex("idx_payments_client_key");
  payments.fields.removeByName("client_key");
  payments.fields.removeByName("balance_before");
  payments.fields.removeByName("balance_after");
  app.save(payments);
});
