/// <reference path="../pb_data/types.d.ts" />

// Pickup notices: the server records when an order became ready for pickup (ready_at),
// and the cashier records when the client was told (pickup_notified_*). The text message
// the cashier sends comes from studio_settings.pickup_message, which an admin can edit.
const PICKUP_MESSAGE = "Hi {name}! Your {studio} order JO {jo} is ready for pickup. "
  + "Please bring your claim stub.{balance} {hours}. Call {phone}.";

migrate((app) => {
  const registrations = app.findCollectionByNameOrId("registrations");
  registrations.fields.add(
    new DateField({ name: "ready_at" }),
    new DateField({ name: "pickup_notified_at" }),
    new TextField({ name: "pickup_notified_by", max: 120 }),
    new NumberField({ name: "pickup_notify_count", onlyInt: true, min: 0 })
  );
  app.save(registrations);

  const settings = app.findCollectionByNameOrId("studio_settings");
  settings.fields.add(new TextField({ name: "pickup_message", max: 500 }));
  app.save(settings);
  for (const record of app.findRecordsByFilter("studio_settings", "key = 'main'", "", 1, 0)) {
    if (!record.getString("pickup_message")) {
      record.set("pickup_message", PICKUP_MESSAGE);
      app.save(record);
    }
  }

  // Orders that are already ready (and not released) get a ready time so they show
  // up in the cashier's Ready for Pickup list.
  app.db().newQuery(`
    UPDATE registrations SET ready_at = COALESCE(NULLIF(updated, ''), created)
    WHERE status NOT IN ('cancelled', 'released', 'pending_payment') AND shoot_completed = TRUE
      AND (status IN ('completed', 'ready_for_pickup') OR framing_status IN ('framed', 'ready_for_pickup'))
  `).execute();
}, (app) => {
  const registrations = app.findCollectionByNameOrId("registrations");
  for (const name of ["ready_at", "pickup_notified_at", "pickup_notified_by", "pickup_notify_count"]) {
    registrations.fields.removeByName(name);
  }
  app.save(registrations);
  const settings = app.findCollectionByNameOrId("studio_settings");
  settings.fields.removeByName("pickup_message");
  app.save(settings);
});
