/**
 * Refreshes the PDF copies of a job order's paperwork in the client's folder (RECEIPTS\) after a
 * payment, void, refund, signature, cancel, restore or edit. Runs in the background: the money
 * action already succeeded, so a failure here only warns. The PDF code (jsPDF) loads lazily.
 */
export function refreshClientDocuments(registrationId: string, warn: (message: string) => void): void {
  if (!registrationId) return;
  void import('./receiptPdf')
    .then((pdf) => pdf.saveClientDocuments(registrationId))
    .catch((error: unknown) => {
      console.error('Could not save the job order PDFs to the client folder:', error);
      warn('Saved, but the PDF copies could not be written to the client folder. They will be written on the next change.');
    });
}
