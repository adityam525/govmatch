/** Start of the local calendar day. Last-date jobs stay visible through that day. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isApplicationOpen(
  endDate: Date | string | null | undefined,
): boolean {
  if (!endDate) return true;
  return new Date(endDate).getTime() >= startOfToday().getTime();
}

export const openApplicationWhere = {
  OR: [{ applicationEndDate: null }, { applicationEndDate: { gte: startOfToday() } }],
};
