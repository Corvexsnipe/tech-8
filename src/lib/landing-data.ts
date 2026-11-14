import { configured, db } from "./db";
import { businessReputation, eligibleReviews, minimumReviews } from "./data";

const EMPTY = { businesses: [], categories: [], recent: [], stats: null, unavailable: false };

// Reuse the directory's public eligibility rules and grade thresholds.
export async function landingData() {
  if (!configured()) return EMPTY;
  try {
    const [records, categories, minimum, stats, recent] = await Promise.all([
      db().business.findMany({
        where: { disabledAt: null }, take: 6, orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        select: { id: true, name: true, domain: true, slug: true, category: true, city: true, description: true, logoKey: true, supportEnabled: true,
          _count: { select: { members: true } } },
      }),
      db().business.groupBy({ by: ["category"], where: { disabledAt: null }, _count: { _all: true },
        orderBy: { _count: { category: "desc" } }, take: 8 }),
      minimumReviews(),
      Promise.all([
        db().business.count({ where: { disabledAt: null } }),
        db().review.count({ where: { ...eligibleReviews, business: { disabledAt: null } } }),
        db().business.count({ where: { disabledAt: null, members: { some: {} } } }),
        db().claim.count({ where: { status: "PENDING" } }),
      ]).then(([businesses, reviews, verified]) => ({ businesses, reviews, verified })),
      db().review.findMany({
        where: { ...eligibleReviews, business: { disabledAt: null } },
        orderBy: { createdAt: "desc" }, take: 8,
        select: { id: true, headline: true, body: true, score: true, createdAt: true,
          user: { select: { displayName: true } },
          business: { select: { name: true, domain: true, slug: true } } },
      }),
    ]);
    const businesses = await Promise.all(records.map(async b => ({ ...b, stats: await businessReputation(b.id, minimum) })));
    return { businesses, categories, recent, stats: { ...stats, categories: categories.length }, unavailable: false };
  } catch {
    // Never replace unavailable data with fabricated social proof.
    return { ...EMPTY, unavailable: true };
  }
}
export type LandingData = Awaited<ReturnType<typeof landingData>>;
