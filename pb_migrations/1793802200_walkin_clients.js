/// <reference path="../pb_data/types.d.ts" />

// Walk-in clients: the studio is not only for school/graduation pictorials.
// - studio_settings (one record, key "main"): school/walk-in on/off switches and the walk-in terms.
// - session_types: what a walk-in client books (Family Portrait, Wedding, ...). on_location asks for date and venue.
// - registrations: client_kind ("school" | "walkin"), session_type, event_date, event_venue, client_org.
// - packages: client_kind ("school" | "walkin" | "both") so each kiosk form shows the right packages.
const ADMIN = "@request.auth.role = 'admin' && @request.auth.disabled = false";

const WALKIN_TERMS = [
  "The session date, time, and venue are confirmed upon downpayment. Rescheduling must be requested at least 3 days before the session.",
  "For events outside the studio, transportation and venue-related fees outside the studio's service area may be charged separately.",
  "Downpayment is NON-REFUNDABLE. The remaining balance must be settled before photos are released.",
  "Hair and make-up are included only when listed in the selected package or purchased as an add-on.",
  "Edited photos are released after the client's photo selection, within the time agreed with the studio.",
  "Soft copies are provided through Google Drive or USB.",
  "Hi-Light Studio may use selected photos for its advertising materials unless the client requests otherwise in writing.",
  "Unclaimed prints and soft copies are disposed of one year after the session date.",
  "Upon signing this Job Order the client agrees with the foregoing terms and conditions.",
];

const SESSION_TYPES = [
  ["Family Portrait", "FAM", false],
  ["Solo / Personal Portrait", "SOLO", false],
  ["ID / Passport Photo", "ID", false],
  ["Pre-Wedding / Prenup", "PRENUP", true],
  ["Wedding", "WED", true],
  ["Birthday / Debut", "BDAY", true],
  ["Corporate / Company Event", "CORP", true],
];

migrate((app) => {
  const registrations = app.findCollectionByNameOrId("registrations");

  const settings = new Collection({
    type: "base", name: "studio_settings",
    listRule: "", viewRule: "", createRule: null, updateRule: ADMIN, deleteRule: null,
  });
  settings.fields.add(
    new TextField({ name: "key", required: true, max: 20 }),
    new BoolField({ name: "school_enabled" }),
    new BoolField({ name: "walkin_enabled" }),
    new JSONField({ name: "walkin_terms", maxSize: 20000 }),
    new AutodateField({ name: "created", onCreate: true }),
    new AutodateField({ name: "updated", onCreate: true, onUpdate: true }),
  );
  settings.addIndex("idx_studio_settings_key", true, "key", "");
  app.save(settings);
  const main = new Record(settings);
  main.set("key", "main");
  main.set("school_enabled", true);
  main.set("walkin_enabled", false);
  main.set("walkin_terms", WALKIN_TERMS);
  app.save(main);

  const sessions = new Collection({
    type: "base", name: "session_types",
    listRule: "", viewRule: "", createRule: ADMIN, updateRule: ADMIN, deleteRule: ADMIN,
  });
  sessions.fields.add(
    new TextField({ name: "name", required: true, max: 80 }),
    new TextField({ name: "code", max: 20 }),
    new BoolField({ name: "on_location" }),
    new BoolField({ name: "is_active" }),
    new NumberField({ name: "order", onlyInt: true }),
    new AutodateField({ name: "created", onCreate: true }),
    new AutodateField({ name: "updated", onCreate: true, onUpdate: true }),
  );
  sessions.addIndex("idx_session_types_name", true, "name COLLATE NOCASE", "");
  app.save(sessions);
  SESSION_TYPES.forEach(([name, code, onLocation], index) => {
    const record = new Record(sessions);
    record.set("name", name);
    record.set("code", code);
    record.set("on_location", onLocation);
    record.set("is_active", true);
    record.set("order", index + 1);
    app.save(record);
  });

  registrations.fields.add(
    new TextField({ name: "client_kind", max: 10 }),
    new RelationField({ name: "session_type", collectionId: sessions.id, maxSelect: 1 }),
    new DateField({ name: "event_date" }),
    new TextField({ name: "event_venue", max: 200 }),
    new TextField({ name: "client_org", max: 120 }),
  );
  app.save(registrations);
  app.db().newQuery("UPDATE registrations SET client_kind = 'school' WHERE client_kind = ''").execute();

  const packages = app.findCollectionByNameOrId("packages");
  packages.fields.add(new TextField({ name: "client_kind", max: 10 }));
  app.save(packages);
  app.db().newQuery("UPDATE packages SET client_kind = 'school' WHERE client_kind = ''").execute();
}, (app) => {
  const registrations = app.findCollectionByNameOrId("registrations");
  for (const name of ["client_kind", "session_type", "event_date", "event_venue", "client_org"]) registrations.fields.removeByName(name);
  app.save(registrations);
  const packages = app.findCollectionByNameOrId("packages");
  packages.fields.removeByName("client_kind");
  app.save(packages);
  app.delete(app.findCollectionByNameOrId("session_types"));
  app.delete(app.findCollectionByNameOrId("studio_settings"));
});
