/**
 * The four stages of a project, in one place because two components state
 * them: the full version on /services and the short form on the home page.
 *
 * `short` is not a truncation of `body` — it is the one line that makes the
 * stage legible to someone skimming, and it has to stand on its own.
 */

export type Step = {
  n: string;
  title: string;
  short: string;
  body: string;
};

export const process: readonly Step[] = [
  {
    n: '01',
    title: 'Brief',
    short: 'What it has to do, cost, and when it opens.',
    body: 'What the space has to do, who uses it, what it can cost, and when it has to open. We would rather argue about this now than on site.',
  },
  {
    n: '02',
    title: 'Design',
    short: 'Concept, development, drawing set — signed off in stages.',
    body: 'Concept, then development, then a drawing set. Each stage signed off before the next begins, so nothing gets redrawn twice.',
  },
  {
    n: '03',
    title: 'Approvals',
    short: 'Municipality, Civil Defence and NOCs, run alongside design.',
    body: 'Dubai Municipality, Civil Defence, landlord and mall NOCs. Run alongside design rather than after it, so comments come back while there is still time to answer them.',
  },
  {
    n: '04',
    title: 'Delivery',
    short: 'Tender, supervision, snagging, handover — often on mall hours.',
    body: 'Tender, award, supervision, snagging, handover — much of it inside malls, where you work restricted hours against a fixed opening date and a lease that does not move.',
  },
] as const;
