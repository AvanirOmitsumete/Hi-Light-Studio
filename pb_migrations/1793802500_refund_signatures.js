/// <reference path="../pb_data/types.d.ts" />

// Refund slips: the client signs on screen when they receive the money.
// The signature is saved once through POST /api/studioflow/refunds/:id/signature (studio_ledger.pb.js)
// and can't be replaced. Protected file: only signed-in staff who can view the refund can open it.
migrate((app) => {
  const refunds = app.findCollectionByNameOrId("refunds");
  refunds.fields.add(
    new FileField({ name: "signature", maxSelect: 1, maxSize: 2097152, mimeTypes: ["image/png"], protected: true }),
    new DateField({ name: "signed_at" }),
    new TextField({ name: "signed_witness", max: 120 }),
  );
  app.save(refunds);
}, (app) => {
  const refunds = app.findCollectionByNameOrId("refunds");
  for (const name of ["signature", "signed_at", "signed_witness"]) refunds.fields.removeByName(name);
  app.save(refunds);
});
