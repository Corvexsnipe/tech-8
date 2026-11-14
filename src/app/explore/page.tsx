import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin, MessageSquare, Search, ShieldCheck } from "lucide-react";
import { Prisma } from "@prisma/client";
import { configured, db } from "@/lib/db";
import { businessReputation, minimumReviews, pageNumber } from "@/lib/data";
import { DEFAULT_MINIMUM_REVIEWS } from "@/lib/grades";
import { EmptyState, PageHeading, Pagination, SetupNotice } from "@/components/shared";
import { BusinessLogo } from "@/components/business-logo";

export const metadata: Metadata = { title: "Explore businesses", alternates: { canonical: "/explore" } };
export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").slice(0, 100), category = (params.category || "").slice(0, 60), sort = params.sort === "newest" ? "newest" : "name";
  const page = pageNumber(params.page);
  const where: Prisma.BusinessWhereInput = { disabledAt: null, ...(q ? { name: { contains: q, mode: "insensitive" } } : {}), ...(category ? { category } : {}) };
  const [businesses, total, categories, minimum] = configured() ? await Promise.all([
    db().business.findMany({ where, orderBy: sort === "newest" ? [{ createdAt: "desc" }, { id: "asc" }] : [{ name: "asc" }, { id: "asc" }], skip: (page - 1) * 12, take: 12, include: { _count: { select: { members: true } } } }),
    db().business.count({ where }), db().business.findMany({ where: { disabledAt: null }, select: { category: true }, distinct: ["category"], orderBy: { category: "asc" } }), minimumReviews(),
  ]) : [[], 0, [], DEFAULT_MINIMUM_REVIEWS] as const;
  const cards = await Promise.all(businesses.map(async business => ({ ...business, stats: await businessReputation(business.id, minimum) })));
  return <div className="page-main"><div className="container"><PageHeading eyebrow="A CLEARER PICTURE STARTS HERE" title="Find your next good decision." description="Discover businesses through the experiences of the people who know them. Search, explore, and see the full picture." /><SetupNotice />
    <form className="search-bar" action="/explore"><label className="search-field"><Search /><span className="sr-only">Business name</span><input name="q" defaultValue={q} placeholder="Search for a business…" maxLength={100} /></label><label><span className="sr-only">Category</span><select name="category" defaultValue={category}><option value="">All categories</option>{categories.map(c => <option key={c.category}>{c.category}</option>)}</select></label><label><span className="sr-only">Sort businesses</span><select name="sort" defaultValue={sort}><option value="name">Name: A–Z</option><option value="newest">Newest profiles</option></select></label><button className="button primary">Search <Search size={15} /></button></form>
    <div className="result-meta"><span>{total} {total === 1 ? "business" : "businesses"}{q ? ` matching “${q}”` : " to discover"}</span>{(q || category) && <Link href="/explore">Clear filters</Link>}</div>
    {cards.length ? <div className="business-grid">{cards.map(b => <Link className="business-card" href={`/review/${b.domain || b.slug}`} key={b.id}><div className="business-card-top"><BusinessLogo business={b} /><div className="business-id"><h2>{b.name} {!!b._count.members && <BadgeCheck size={17} className="verified-mark" aria-label="Verified ownership" />}</h2><span>{b.category}</span></div>{b.stats.grade ? <span className="business-grade"><strong>{b.stats.grade}</strong><small>{b.stats.score!.toFixed(1)}</small></span> : <span className="business-grade unrated"><strong>—</strong><small>Not rated</small></span>}</div><div className="business-facts"><span><BadgeCheck size={13} /> {b._count.members ? "Verified owner" : "Unclaimed"}</span><span><ShieldCheck size={13} /> {b.supportEnabled ? "Support scored" : "Quality scored"}</span><span><MapPin size={13} /> {b.city}</span></div><p>{b.description.slice(0, 135)}{b.description.length > 135 ? "…" : ""}</p><div className="business-card-bottom"><span className="business-card-cta">View profile <ArrowUpRight size={13} /></span><span><MessageSquare size={12} /> {b.stats.count} published {b.stats.count === 1 ? "review" : "reviews"}</span></div></Link>)}</div> : <EmptyState title={q || category ? "No matches just yet." : "Room for your next discovery."} description={q || category ? "Try a different business name or remove a filter." : "Business profiles will appear here once they are registered and approved. Own a business? Start with a claim."} href={q || category ? "/explore" : "/claim"} label={q || category ? "Reset search" : "Register your business"} />}
    <Pagination page={page} total={total} base="/explore" query={{ q, category, sort }} />
  </div></div>;
}
