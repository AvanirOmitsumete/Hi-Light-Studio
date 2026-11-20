/// <reference path="../pb_data/types.d.ts" />

// Camera hot-folder import: each station watches one server folder (the camera
// or tethering software's output folder) and moves new photos into the folder of
// the client the photographer is currently shooting.
migrate((app) => {
  const staff = "@request.auth.disabled = false && (@request.auth.role = 'admin' || @request.auth.role = 'photographer')";
  const admin = "@request.auth.role = 'admin' && @request.auth.disabled = false";
  const registrations = app.findCollectionByNameOrId("registrations");
  const stations = new Collection({
    type: "base", name: "camera_stations",
    listRule: staff, viewRule: staff, createRule: staff, updateRule: staff, deleteRule: admin,
  });
  stations.fields.add(
    new TextField({ name: "name", required: true, max: 60 }),
    new TextField({ name: "watch_folder", required: true, max: 500 }),
    new BoolField({ name: "enabled" }),
    new BoolField({ name: "include_subfolders" }),
    new BoolField({ name: "import_raw" }),
    // Session state below is written only by the server (studio_camera_import.js).
    new RelationField({ name: "active_registration", collectionId: registrations.id, maxSelect: 1 }),
    new DateField({ name: "session_started" }),
    new NumberField({ name: "session_imported", onlyInt: true }),
    new JSONField({ name: "session_skip" }),
    new NumberField({ name: "waiting_count", onlyInt: true }),
    new DateField({ name: "last_scan" }),
    new DateField({ name: "last_import" }),
    new TextField({ name: "last_error", max: 1000 }),
    new NumberField({ name: "scan_lock", onlyInt: true }),
    new AutodateField({ name: "created", onCreate: true }),
    new AutodateField({ name: "updated", onCreate: true, onUpdate: true }),
  );
  stations.addIndex("idx_camera_station_name", true, "name COLLATE NOCASE", "");
  app.save(stations);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("camera_stations"));
});
