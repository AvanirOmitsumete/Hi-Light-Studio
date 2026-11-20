/// <reference path="../pb_data/types.d.ts" />

// Repair: before the Restore fix, a job order cancelled from Paid, fully refunded, and then restored
// came back as "Paid" (shown as In Photo Queue) with nothing paid. It is waiting for payment again.
// Only orders with a refund and no money held are changed; the photo queue already skips them.
migrate((app) => {
  app.db().newQuery(`
    UPDATE registrations SET status = 'pending_payment'
    WHERE status = 'paid' AND paid_amount <= 0 AND refunded_amount > 0
  `).execute();
}, () => {
  // Nothing to undo: "Paid" with nothing paid was never a valid state.
});
