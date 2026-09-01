export const TARGET_FUND = 4000000;

function sum(rows: any[], key: string) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

export function fundTotals(members: any[], sponsors: any[]) {
  const memberProposed = sum(members, 'proposed_amount');
  const sponsorExpected = sum(sponsors, 'expected_amount');
  const memberPaid = sum(members, 'total_paid');
  const sponsorPaid = sum(sponsors, 'total_paid');
  const memberPending = sum(members, 'pending_amount');
  const sponsorPending = sum(sponsors, 'pending_amount');
  const proposed = memberProposed + sponsorExpected;
  const received = memberPaid + sponsorPaid;
  const pending = memberPending + sponsorPending;
  return {
    memberProposed,
    sponsorExpected,
    memberPaid,
    sponsorPaid,
    memberPending,
    sponsorPending,
    proposed,
    received,
    pending,
    requiredStill: Math.max(TARGET_FUND - proposed, 0),
    pendingVsTarget: Math.max(TARGET_FUND - received, 0),
  };
}
