export function calculateLateFee({ dueDate, returnedAt, dailyFee }) {
  const due = new Date(dueDate);
  const returned = new Date(returnedAt);

  if (Number.isNaN(due.getTime()) || Number.isNaN(returned.getTime())) {
    throw new Error("Tanggal tidak valid");
  }

  const lateMs = returned - due;
  const lateDays = Math.max(0, Math.ceil(lateMs / (1000 * 60 * 60 * 24)));

  return {
    lateDays,
    lateFee: lateDays * Number(dailyFee || 0),
  };
}
