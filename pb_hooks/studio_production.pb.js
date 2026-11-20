/// <reference path="../pb_data/types.d.ts" />

// Production & pickup.
// - Admins set the production status of one order or many at once (e.g. every order of a school).
// - Cashiers record that a client was told their order is ready for pickup.
// Release itself stays at the cashier's Release step, which records who claimed the order.

routerAdd("POST", "/api/studioflow/production-status", (e) => {
  const workflow = require(__hooks + "/studio_workflow.js");
  const body = e.requestInfo().body || {};
  const status = String(body.status || "");
  const ids = Array.isArray(body.ids) ? [...new Set(body.ids.map(String).filter(Boolean))] : [];
  const statuses = ["none", "pending_framing", "in_production", "framed", "ready_for_pickup"];
  if (!statuses.includes(status)) throw new BadRequestError("Choose a valid production status.");
  if (!ids.length) throw new BadRequestError("Choose at least one job order.");
  if (ids.length > 5000) throw new BadRequestError("Update at most 5,000 job orders at a time.");
  const ready = ["framed", "ready_for_pickup"].includes(status);

  const skipped = { cancelled: 0, released: 0, unpaid: 0, notShot: 0, missing: 0 };
  let updated = 0;
  let unchanged = 0;
  e.app.runInTransaction((tx) => {
    workflow.staff(tx, e.auth, ["admin"]);
    for (const id of ids) {
      let record;
      try { record = tx.findRecordById("registrations", id); } catch (_) { skipped.missing++; continue; }
      const current = record.getString("status");
      if (current === "cancelled") { skipped.cancelled++; continue; }
      if (current === "released") { skipped.released++; continue; }
      if (current === "pending_payment") { skipped.unpaid++; continue; }
      if (ready && !record.getBool("shoot_completed")) { skipped.notShot++; continue; }

      // The production status decides readiness: the main status follows it, so the
      // cashier list and badges agree with this screen.
      let nextStatus = current;
      if (ready) nextStatus = "ready_for_pickup";
      else if (["completed", "ready_for_pickup"].includes(current)) nextStatus = "done_shooting";
      if (record.getString("framing_status") === status && nextStatus === current) { unchanged++; continue; }
      record.set("framing_status", status);
      record.set("status", nextStatus);
      tx.save(record);
      updated++;
    }
  });
  if (updated) require(__hooks + "/studio_station_events.js").notify(e.app);
  return e.json(200, { updated, unchanged, skipped });
}, $apis.requireAuth("users"));

routerAdd("POST", "/api/studioflow/pickup-notified/{id}", (e) => {
  const workflow = require(__hooks + "/studio_workflow.js");
  const saved = workflow.withRegistration(e.app, e.request.pathValue("id"), (tx, record) => {
    const account = workflow.staff(tx, e.auth, ["admin", "cashier"]);
    if (!record.getString("ready_at") || ["released", "cancelled"].includes(record.getString("status"))) {
      throw new ApiError(409, "This order is not waiting for pickup.");
    }
    record.set("pickup_notified_at", new DateTime());
    record.set("pickup_notified_by", account.getString("name") || account.getString("username"));
    record.set("pickup_notify_count", record.getInt("pickup_notify_count") + 1);
    tx.save(record);
    return {
      pickup_notified_at: record.getString("pickup_notified_at"),
      pickup_notified_by: record.getString("pickup_notified_by"),
      pickup_notify_count: record.getInt("pickup_notify_count"),
    };
  });
  require(__hooks + "/studio_station_events.js").notify(e.app);
  return e.json(200, saved);
}, $apis.requireAuth("users"));
