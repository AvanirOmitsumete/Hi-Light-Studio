/// <reference path="../pb_data/types.d.ts" />

// PDF copies of a job order's paperwork, kept in <client folder>/RECEIPTS/ for staff who browse
// the photo drive. The database stays the official record; these are convenience copies.
// The browser draws the PDFs (receiptPdf.ts) and uploads them here after each payment, void,
// refund, signature, cancel, restore or admin edit, so each copy reflects the latest state.
// Accepted names come from the database, never from the client:
//   JO-<job order no>.pdf, <receipt no>.pdf (OR-…), <refund no>.pdf (RF-…).
routerAdd("POST", "/api/studioflow/registrations/{id}/documents", (e) => {
  const workflow = require(__hooks + "/studio_workflow.js");
  const storage = require(__hooks + "/studio_photo_storage.js");
  workflow.staff(e.app, e.auth, ["admin", "cashier"]);

  let reg;
  try { reg = e.app.findRecordById("registrations", e.request.pathValue("id")); } catch (_) { throw new NotFoundError("Job order not found."); }
  const folder = reg.getString("photo_folder");
  if (!folder) throw new ApiError(409, "This job order has no client folder yet. It is created at the first payment.");

  const allowed = new Set(["JO-" + reg.getString("job_order_no") + ".pdf"]);
  for (const payment of e.app.findRecordsByFilter("payments", "registration = {:id}", "", 0, 0, { id: reg.id })) {
    if (payment.getString("receipt_no")) allowed.add(payment.getString("receipt_no") + ".pdf");
  }
  for (const refund of e.app.findRecordsByFilter("refunds", "registration = {:id}", "", 0, 0, { id: reg.id })) {
    if (refund.getString("refund_no")) allowed.add(refund.getString("refund_no") + ".pdf");
  }

  let files = [];
  try { files = e.findUploadedFiles("files") || []; } catch (_) { files = []; }
  if (!files.length) throw new BadRequestError("No documents were sent.");
  if (files.length > 50) throw new BadRequestError("Too many documents in one request.");

  const pending = [];
  for (const file of files) {
    const name = String(file.originalName || "");
    if (!allowed.has(name)) throw new BadRequestError(`"${name}" is not a document of job order ${reg.getString("job_order_no")}.`);
    const reader = file.reader.open();
    let bytes;
    try { bytes = toBytes(reader, 10 << 20); } finally { reader.close(); }
    if (bytes.length < 5 || String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") {
      throw new BadRequestError(`"${name}" is not a PDF file.`);
    }
    pending.push({ name, bytes });
  }
  // Every file is checked before any is written, so a bad request changes nothing.
  for (const doc of pending) storage.saveDocument(folder, doc.name, doc.bytes);

  return e.json(200, {
    saved: pending.map((doc) => doc.name),
    folder: storage.displayPath(folder) + "\\" + storage.documentsDir,
  });
}, $apis.requireAuth("users"), $apis.bodyLimit(40 << 20));
