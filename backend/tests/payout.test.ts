import { calculatePayout, getMilestonePayout } from "@/utils/payout";

const milestones = [
  { views: 10000, payout: 500 },
  { views: 50000, payout: 2000 },
  { views: 100000, payout: 5000 },
];

describe("getMilestonePayout", () => {
  it("returns 0 when no milestone is crossed", () => {
    expect(getMilestonePayout(9999, milestones)).toBe(0);
  });

  it("pays a milestone when views exactly hit the threshold", () => {
    expect(getMilestonePayout(10000, milestones)).toBe(500);
  });

  it("returns the highest milestone crossed", () => {
    expect(getMilestonePayout(75000, milestones)).toBe(2000);
    expect(getMilestonePayout(1000000, milestones)).toBe(5000);
  });

  it("works even if milestones are not sorted", () => {
    const unsorted = [milestones[2]!, milestones[0]!, milestones[1]!];
    expect(getMilestonePayout(60000, unsorted)).toBe(2000);
  });
});

describe("calculatePayout", () => {
  it("pays the full milestone on the first crossing", () => {
    expect(calculatePayout(10000, milestones, 0, 100000)).toBe(500);
  });

  it("only pays the difference when moving to a higher milestone", () => {

    expect(calculatePayout(50000, milestones, 500, 100000)).toBe(1500);
  });

  it("pays only the highest milestone when several are crossed in one update", () => {
    expect(calculatePayout(120000, milestones, 0, 100000)).toBe(5000);
  });

  it("does not pay again when the same update comes twice", () => {
    expect(calculatePayout(50000, milestones, 2000, 100000)).toBe(0);
  });

  it("does not pay when views grow but no new milestone is crossed", () => {
    expect(calculatePayout(60000, milestones, 2000, 100000)).toBe(0);
  });
});

describe("budget cap", () => {
  it("pays only what is left when the budget runs short", () => {
    expect(calculatePayout(100000, milestones, 0, 3000)).toBe(3000);
  });

  it("pays nothing when the budget is used up", () => {
    expect(calculatePayout(100000, milestones, 0, 0)).toBe(0);
  });

  it("caps the difference payout too", () => {
    // owed 4500 more (5000 - 500) but only 1000 left
    expect(calculatePayout(100000, milestones, 500, 1000)).toBe(1000);
  });

  it("never pays more than the remaining budget across many posts", () => {
    let remaining = 6000;
    let totalPaid = 0;
    for (let i = 0; i < 5; i++) {
      const pay = calculatePayout(100000, milestones, 0, remaining);
      remaining -= pay;
      totalPaid += pay;
    }
    expect(totalPaid).toBe(6000);
    expect(remaining).toBe(0);
  });
});
