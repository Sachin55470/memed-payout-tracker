type Milestone = { views: number; payout: number };


export function getMilestonePayout(views: number, milestones: Milestone[]): number {
  let payout = 0;
  for (const milestone of milestones) {
    if (views >= milestone.views && milestone.payout > payout) {
      payout = milestone.payout;
    }
  }
  return payout;
}


export function calculatePayout(
  views: number,
  milestones: Milestone[],
  alreadyPaid: number,
  remainingBudget: number
): number {
  const earned = getMilestonePayout(views, milestones);
  const owed = earned - alreadyPaid;

  if (owed <= 0 || remainingBudget <= 0) {
    return 0;
  }
  return Math.min(owed, remainingBudget);
}
