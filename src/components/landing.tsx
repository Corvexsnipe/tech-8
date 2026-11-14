import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, BarChart3, Building2, Check, ChevronDown, CircleHelp, ClipboardList, Layers3, LockKeyhole, MapPin, MessageSquare, Search, ShieldCheck } from "lucide-react";
import { GRADES, gradeFor } from "@/lib/grades";
import type { LandingData } from "@/lib/landing-data";
import { BusinessLogo } from "./business-logo";
import { Carousel, GradeLab } from "./landing-interactions";

const names = ["Excellent", "Very Good", "Good", "Average", "Poor"];
const faqs = [
  ["How are reputation grades calculated?", "Each review scores Service Quality and, where enabled, Customer Support. A+ is worth 100 points, A 80, B 70, C 50, and D 15. The review score averages those categories. A business's overall score averages its eligible published reviews; a minimum number of reviews is required before an overall grade appears."],
  ["Will my review appear immediately?", "No. Submitted reviews stay pending until staff verification and approval. Security checks also determine whether a review is eligible for publication. You can follow its status in your account."],
  ["Do I need to include proof?", "Proof is optional. You can attach supporting photos, receipts, or bookings. Staff review attachments separately from the review itself. Avoid uploading sensitive personal or payment information."],
  ["What does verified ownership mean?", "It means an administrator has approved a person's authority to manage that business profile. It is not an endorsement of the business or a guarantee of service quality."],
  ["Can businesses respond to reviews?", "Yes. Approved business owners can submit replies from their dashboard. Replies go through moderation and do not change a customer's review score."],
  ["How do I list or claim my business?", "Create an account, verify your email, and submit your business details and ownership evidence. An administrator will review the claim before granting management access."],
];
const hrefFor = (b: { domain: string | null; slug: string }) => `/review/${encodeURIComponent(b.domain || b.slug)}`;

function timeAgo(date: Date) {
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return minutes <= 1 ? "Just now" : `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}

export function Landing({ data }: { data: LandingData }) {
  const stats = data.stats;
  return <div className="lp">
    {/* HERO */}
    <section className="lp-hero">
      <div className="lp-wrap lp-hero-grid">
        <div className="lp-hero-copy">
          <span className="lp-badge"><ShieldCheck size={15} /> Staff-reviewed submissions</span>
          <h1>Real Reviews.<br /><span>Better Decisions.</span></h1>
          <p>Review Matters is a trusted review platform where real people share real experiences to help others make confident choices.</p>
          <form className="lp-search" action="/explore" role="search" aria-label="Find a business"><Search size={18} /><input type="search" name="q" maxLength={100} aria-label="Search businesses" placeholder="Search for a business…" /><button type="submit" aria-label="Search businesses directory">Search</button></form>
          <div className="lp-hero-pills"><span><ShieldCheck size={16} /> Verified Businesses</span><span><MessageSquare size={16} /> Real Reviews</span><span><LockKeyhole size={16} /> Transparent Ratings</span><Link href="/claim" className="lp-hero-claim">List Your Business <ArrowUpRight size={14} /></Link></div>
        </div>
        <div className="lp-hero-img">
          {/* eslint-disable-next-line @next/next/no-img-element -- static marketing asset, tuned presentation */}
          <img
            src="/hero-laptop.png"
            alt="Laptop showing the Review Desk review platform homepage with top rated businesses"
            width={1280}
            height={852}
            fetchPriority="high"
          />
        </div>
      </div>
    </section>

    {/* STATISTICS — real platform counts only */}
    {stats && <section className="lp-stats"><div className="lp-wrap lp-stats-grid">
      {([[Building2, stats.businesses, "Listed businesses"], [MessageSquare, stats.reviews, "Published reviews"], [ShieldCheck, stats.verified, "Verified profiles"], [Layers3, stats.categories, "Categories"]] as const).map(([Icon, value, label], i) =>
        <div key={label} className={`lp-stat${i % 2 ? " lp-stat-line" : ""}${i > 1 ? " lp-stat-top" : ""}`}><Icon size={32} strokeWidth={1.6} /><div><b>{value}</b><p>{label}</p></div></div>)}
    </div></section>}

    {/* PLATFORM YOU CAN TRUST */}
    <section className="lp-section lp-trust"><div className="lp-wrap">
      <div className="lp-center"><p className="lp-eyebrow">Why choose Review Matters?</p><h2>A Platform You Can Trust</h2><p className="lp-sub">Built for transparency, trust, and real user feedback.</p></div>
      <div className="lp-pillars">
        {([[ShieldCheck, "Verified Businesses", "We verify business ownership before a profile can be managed or claim replies."],
          [MessageSquare, "Real Reviews", "Every published review was written by a registered customer and approved by our moderation team."],
          [LockKeyhole, "Transparent Ratings", "Letter grades from A+ to D, calculated from published reviews — never hidden scoring."],
          [BarChart3, "Informed Decisions", "Service and support scores, proof attachments, and business replies — the full picture."]] as const).map(([Icon, title, desc]) =>
          <div key={title} className="lp-pillar"><span className="lp-pillar-icon"><Icon size={30} strokeWidth={1.5} /></span><h3>{title}</h3><p>{desc}</p></div>)}
      </div>
    </div></section>

    {/* HOW IT WORKS */}
    <section className="lp-section lp-how"><div className="lp-wrap lp-how-grid">
      <div><p className="lp-eyebrow">How it works</p><h2>Simple Steps,<br />Better Choices</h2><p className="lp-sub">Finding the right business has never been easier.</p><Link href="/explore" className="lp-btn-forest">Explore Businesses <ArrowRight size={14} /></Link></div>
      <div className="lp-steps">
        {([[Search, "Search", "Find businesses you're interested in."],
          [ClipboardList, "Read & Compare", "Explore reviews and compare reputation grades."],
          [ShieldCheck, "Decide with Confidence", "Make better decisions based on real feedback."]] as const).map(([Icon, title, desc], i) =>
          <div key={title} className="lp-step"><span className="lp-step-n">{i + 1}</span><Icon size={34} strokeWidth={1.6} /><h3>{title}</h3><p>{desc}</p></div>)}
      </div>
    </div></section>

    {/* FEATURED BUSINESSES — real directory records */}
    <section className="lp-section lp-featured" id="businesses"><div className="lp-wrap">
      <div className="lp-head"><div><p className="lp-eyebrow">Featured Businesses</p><h2>Explore Real Business Profiles</h2><p className="lp-sub">{data.unavailable ? "Directory data is temporarily unavailable." : "Approved profiles from the directory, with real grades and review counts."}</p></div><Link href="/explore" className="lp-more">View All Businesses <ArrowRight size={14} /></Link></div>
      {data.businesses.length ? <Carousel visible={4} label="featured businesses">{data.businesses.map(b =>
        <Link key={b.id} href={hrefFor(b)} className="business-card">
          <div className="business-card-top"><BusinessLogo business={b} /><div className="business-id"><h3>{b.name} {!!b._count.members && <BadgeCheck size={17} className="verified-mark" aria-label="Verified ownership" />}</h3><span>{b.category}</span></div>{b.stats.grade ? <span className="business-grade"><strong>{b.stats.grade}</strong><small>{b.stats.score!.toFixed(1)}</small></span> : <span className="business-grade unrated"><strong>—</strong><small>Not rated</small></span>}</div>
          <div className="business-facts"><span><BadgeCheck size={13} /> {b._count.members ? "Verified owner" : "Unclaimed"}</span><span><ShieldCheck size={13} /> {b.supportEnabled ? "Support scored" : "Quality scored"}</span><span><MapPin size={13} /> {b.city}</span></div>
          <p>{b.description.slice(0, 135)}{b.description.length > 135 ? "…" : ""}</p>
          <div className="business-card-bottom"><span className="business-card-cta">View profile <ArrowUpRight size={13} /></span><span><MessageSquare size={12} /> {b.stats.count} published {b.stats.count === 1 ? "review" : "reviews"}</span></div>
        </Link>)}</Carousel> :
        <div className="lp-empty"><Layers3 size={27} /><div><h3>{data.unavailable ? "Profiles are temporarily unavailable." : "Make room for your business."}</h3><p>Only approved, real business profiles appear here.</p></div><Link href="/claim">List your business →</Link></div>}
    </div></section>

    {/* RECENT REVIEWS — real published reviews */}
    <section className="lp-section lp-reviews"><div className="lp-wrap">
      <div className="lp-head"><div><p className="lp-eyebrow">Recent Reviews</p><h2>Latest Experiences from Our Community</h2><p className="lp-sub">Fresh perspectives, shared by people like you.</p></div><Link href="/explore" className="lp-more">Browse the directory <ArrowRight size={14} /></Link></div>
      {data.recent.length ? <Carousel visible={3} label="recent reviews">{data.recent.map(r =>
        <article key={r.id} className="lp-rv">
          <div className="lp-rv-top"><span className="lp-avatar">{r.user.displayName.charAt(0).toUpperCase()}</span><div><h3>{r.user.displayName}</h3><p>{timeAgo(r.createdAt)}</p></div></div>
          <div className="lp-rv-grade"><span className="lp-grade-chip">{gradeFor(r.score)}</span><strong>{r.headline}</strong></div>
          <p className="lp-rv-body">“{r.body.slice(0, 160)}{r.body.length > 160 ? "…" : ""}”</p>
          <div className="lp-rv-foot">Reviewed <Link href={hrefFor(r.business)}>{r.business.name}</Link></div>
        </article>)}</Carousel> :
        <div className="lp-empty"><MessageSquare size={27} /><div><h3>{data.unavailable ? "Reviews are temporarily unavailable." : "The first story is waiting to be written."}</h3><p>{data.unavailable ? "Please check back shortly." : "Published, staff-approved reviews appear here."}</p></div><Link href="/explore">Find a business to review →</Link></div>}
    </div></section>

    {/* PEOPLE AND BUSINESSES */}
    <section className="lp-section lp-audiences" id="for-businesses"><div className="lp-wrap lp-audiences-grid">
      <article className="lp-aud lp-aud-light">
        <p className="lp-eyebrow">For people making choices</p><h2>Spend your trust<br />wisely.</h2>
        <p className="lp-sub">A great review answers the questions a sales page can&rsquo;t. Learn from real experiences before you commit your time or money.</p>
        <ul><li><Check size={15} /> Compare service and support separately</li><li><Check size={15} /> Read experiences, proof, and replies together</li><li><Check size={15} /> Share feedback that helps the next person</li></ul>
        <Link href="/explore" className="lp-btn-ink">Find your next good decision <ArrowUpRight size={14} /></Link>
        <div className="lp-quote">“Your experience.<br />Someone else&rsquo;s perspective.”</div>
      </article>
      <article className="lp-aud lp-aud-dark">
        <p className="lp-eyebrow">For businesses building trust</p><h2>A reputation<br />you can build on.</h2>
        <p className="lp-sub">Give customer feedback a home. Claim your profile, join the conversation, and turn everyday experiences into useful insight.</p>
        <ul><li><Check size={15} /> Manage your verified ownership profile</li><li><Check size={15} /> Reply thoughtfully to customer reviews</li><li><Check size={15} /> Invite feedback with a dedicated QR poster</li></ul>
        <Link href="/claim" className="lp-btn-light">List Your Business <ArrowUpRight size={14} /></Link>
        <div className="lp-ws"><p>Business workspace</p><Link href="/dashboard"><span>Reviews &amp; Responses</span><ChevronDown size={14} /></Link><Link href="/dashboard"><span>Your Profile, Your QR Code</span><ChevronDown size={14} /></Link></div>
      </article>
    </div></section>

    {/* GRADING SYSTEM */}
    <section className="lp-grading" id="grading"><div className="lp-wrap lp-grade-layout">
      <div><p className="lp-eyebrow">Clarity, by design</p><h2>Five grades.<br /><span>Nothing to decode.</span></h2><p className="lp-sub">A letter tells you where to look.<br />The experience tells you why.</p>
        <div className="lp-grade-key">{GRADES.map((g, i) => <div key={g}><b>{g}</b><i /><p>{names[i]}</p><small>{[100, 80, 70, 50, 15][i]} pts</small></div>)}</div>
        <Link href="/how-it-works" className="lp-more-light">See the complete methodology <ArrowUpRight size={14} /></Link></div>
      <GradeLab />
    </div></section>

    {/* FAQ */}
    <section className="lp-section lp-faq"><div className="lp-wrap lp-faq-grid">
      <div><p className="lp-eyebrow">Good Questions</p><h2>A little more<br /><span>clarity.</span></h2><p className="lp-sub">Trust starts with understanding how things work.</p><Link href="/contact" className="lp-more"><CircleHelp size={15} /> Talk to our team</Link></div>
      <div>{faqs.map(([q, a], i) => <details key={q}><summary><span className="lp-faq-n">0{i + 1}</span>{q}<span className="lp-faq-x" aria-hidden="true" /><span className="sr-only">Toggle answer</span></summary><p>{a}</p></details>)}</div>
    </div></section>

    {/* CTA */}
    <section className="lp-cta"><div className="lp-wrap lp-cta-grid">
      <div className="lp-cta-copy"><ShieldCheck size={48} strokeWidth={1.3} /><div><h2>Be Part of a Trusted Community</h2><p>Real reviews from real customers — every one verified by our team before it counts.</p></div></div>
      <Link href="/explore" className="lp-btn-cream">Write a Review <ArrowRight size={14} /></Link>
    </div></section>
  </div>;
}
