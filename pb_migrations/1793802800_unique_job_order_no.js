/// <reference path="../pb_data/types.d.ts" />

// Job order numbers must be unique: the client's photo folder is now named
// <job order no>_<Last>_<First>, with no record ID to tell two folders apart.
// job_order.pb.js assigns the number inside a transaction; this index is the backstop.
// A database that already holds duplicates (from the old, unlocked numbering) keeps them:
// those orders are printed already, so they are not renumbered, and the index is skipped.
migrate((app) => {
  const duplicates = arrayOf(new DynamicModel({ job_order_no: "", n: 0 }));
  app.db().newQuery(
    "SELECT job_order_no, COUNT(*) AS n FROM registrations WHERE job_order_no != '' GROUP BY job_order_no HAVING n > 1"
  ).all(duplicates);
  if (duplicates.length) {
    console.log("StudioFlow: duplicate job order numbers found (" + duplicates.map((row) => row.job_order_no).join(", ") +
      "); the unique index was not added. New numbers are still assigned one at a time.");
    return;
  }
  const registrations = app.findCollectionByNameOrId("registrations");
  registrations.addIndex("idx_registration_job_order_no", true, "job_order_no", "job_order_no != ''");
  app.save(registrations);
}, (app) => {
  const registrations = app.findCollectionByNameOrId("registrations");
  registrations.removeIndex("idx_registration_job_order_no");
  app.save(registrations);
});
