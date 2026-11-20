/// <reference path="../pb_data/types.d.ts" />

// add_ons.client_kind ("school" | "walkin" | "both"), like packages: which kiosk form offers the add-on.
// Every add-on was offered to all clients until now, so existing ones become "both" (empty also means both).
// Checked by studio_pricing.js when an add-on is chosen at the kiosk or added by an admin.
migrate((app) => {
  const addOns = app.findCollectionByNameOrId("add_ons");
  addOns.fields.add(new TextField({ name: "client_kind", max: 10 }));
  app.save(addOns);
  app.db().newQuery("UPDATE add_ons SET client_kind = 'both' WHERE client_kind = '' OR client_kind IS NULL").execute();
}, (app) => {
  const addOns = app.findCollectionByNameOrId("add_ons");
  addOns.fields.removeByName("client_kind");
  app.save(addOns);
});
