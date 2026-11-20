/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  if (!e.hasSuperuserAuth() && e.auth?.getString("role") !== "admin") {
    e.record.set("pictorial_date", "");
  }
  // PocketBase exposes JSON fields as JSONRaw. Read the JSON text before using it as an array.
  const selections = JSON.parse(e.record.getString("add_ons") || "null") ?? [];
  if (!Array.isArray(selections)) throw new BadRequestError("Invalid add-on selection.");

  if (selections.length) {
    const catalog = e.app.findAllRecords("add_ons");
    const used = new Set();
    const addOns = selections.map((selection) => {
      if (!selection || typeof selection !== "object") throw new BadRequestError("Invalid add-on selection.");
      const matches = catalog.filter((item) => {
        if (selection.id) return item.id === selection.id;
        // Accept older registration clients that submit a code or name.
        return selection.code ? item.getString("code") === selection.code
          : item.getString("name") === selection.name;
      });
      const item = matches[0];
      if (matches.length !== 1 || !item.getBool("is_active")) {
        throw new BadRequestError("A selected add-on is no longer available. Refresh the registration form and try again.");
      }
      if (used.has(item.id)) throw new BadRequestError("Each add-on can only be selected once.");
      used.add(item.id);
      return { id: item.id, code: item.getString("code"), name: item.getString("name"), amount: item.getFloat("amount") };
    });
    e.record.set("add_ons", addOns);
  }
  return e.next();
}, "registrations");

onRecordCreate((e) => {
  const packageId = e.record.getString("package");
  const pkg = packageId ? e.app.findRecordById("packages", packageId) : null;
  const base = pkg ? pkg.getFloat("amount") : 0;
  e.record.set("package_snapshot", pkg ? {
    id: pkg.id, code: pkg.getString("code"), name: pkg.getString("name"), amount: base,
  } : null);
  const addOns = JSON.parse(e.record.getString("add_ons") || "null");
  const cents = (value) => typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) : 0;
  const extras = Array.isArray(addOns) ? addOns.reduce((sum, item) => sum + cents(item?.amount), 0) : 0;
  const total = cents(base) + extras + cents(e.record.getFloat("other_fees"));
  e.record.set("total_amount", total / 100);
  e.record.set("balance", Math.max(0, total - cents(e.record.getFloat("paid_amount"))) / 100);
  return e.next();
}, "registrations");

onRecordUpdateRequest((e) => {
  const original = e.record.original();
  if (e.record.getString("pictorial_date") !== original.getString("pictorial_date")
    && !e.hasSuperuserAuth() && e.auth?.getString("role") !== "admin") {
    throw new ForbiddenError("Only administrators can schedule pictorial dates.");
  }
  const cents = (value) => typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) : 0;
  // Other fees change the price: admin only, never negative.
  const fees = cents(e.record.getFloat("other_fees"));
  const feesChanged = fees !== cents(original.getFloat("other_fees"));
  if (feesChanged && !e.hasSuperuserAuth() && e.auth?.getString("role") !== "admin") {
    throw new ForbiddenError("Only administrators can change other fees.");
  }
  if (fees < 0) throw new BadRequestError("Other fees can't be negative.");

  const packageId = e.record.getString("package");
  const packageChanged = Boolean(packageId) && packageId !== original.getString("package");
  let total = null;
  if (packageChanged) {
    const pkg = e.app.findRecordById("packages", packageId);
    const base = pkg.getFloat("amount");
    e.record.set("package_snapshot", {
      id: pkg.id, code: pkg.getString("code"), name: pkg.getString("name"), amount: base,
    });
    const addOns = JSON.parse(e.record.getString("add_ons") || "null");
    const extras = Array.isArray(addOns) ? addOns.reduce((sum, item) => sum + cents(item?.amount), 0) : 0;
    total = cents(base) + extras + fees;
  } else {
    e.record.set("package_snapshot", original.get("package_snapshot"));
    // Same package: keep the price it was registered at and swap only the other fees.
    if (feesChanged) total = cents(original.getFloat("total_amount")) - cents(original.getFloat("other_fees")) + fees;
  }
  if (total !== null) {
    e.record.set("total_amount", total / 100);
    // Balance and payment status from the receipts and refunds (a cancelled order still owes nothing).
    const ledgerRules = require(__hooks + "/studio_ledger.js");
    ledgerRules.applyTotals(e.record, ledgerRules.ledger(e.app, e.record));
  }
  return e.next();
}, "registrations");
