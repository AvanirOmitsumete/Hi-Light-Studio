/// <reference path="../pb_data/types.d.ts" />

// A session type that job orders already use can only be switched off, never deleted
// (deleting it would silently blank the session on those job orders).
onRecordDeleteRequest((e) => {
  if (e.app.findRecordsByFilter("registrations", "session_type = {:id}", "", 1, 0, { id: e.record.id }).length) {
    throw new ApiError(409, "This session type is used by existing job orders. Switch it off instead.");
  }
  return e.next();
}, "session_types");

// Kiosks refresh their client-type choice and session list when the admin changes them.
onRecordAfterUpdateSuccess((e) => {
  e.next();
  require(__hooks + "/studio_station_events.js").notify(e.app);
}, "studio_settings", "session_types");
