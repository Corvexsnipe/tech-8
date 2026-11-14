"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Pause, Play, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { GRADES, POINTS, gradeFor, reviewScore, type Grade } from "@/lib/grades";
import { PointerScene } from "./pointer-scene";

const subscribe = () => () => {};
export function DashboardScene({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, () => {
    try { return localStorage.getItem("reviewmatters.motion") === "paused"; } catch { return false; }
  }, () => false);
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? stored;
  return <div className="lp-scene-wrap" data-paused={paused}>
    <PointerScene className="lp-scene" enabled={!paused} strength={3}>{children}</PointerScene>
    <button className="lp-motion" onClick={() => {
      setOverride(!paused);
      try { localStorage.setItem("reviewmatters.motion", paused ? "on" : "paused"); } catch { /* Optional preference. */ }
    }}>{paused ? <Play size={12} /> : <Pause size={12} />}{paused ? "Resume motion" : "Pause motion"}</button>
  </div>;
}

export function Carousel({ children, visible, label }: { children: ReactNode[]; visible: number; label: string }) {
  const [index, setIndex] = useState(0);
  const count = children.length;
  if (!count) return null;
  const window = Math.min(visible, count);
  const shown = Array.from({ length: window }, (_, i) => children[(index + i) % count]);
  return <div className="lp-carousel">
    {count > window && <>
      <button type="button" className="lp-car-btn lp-car-prev" aria-label={`Previous ${label}`} onClick={() => setIndex((index + count - 1) % count)}><ChevronLeft size={17} /></button>
      <button type="button" className="lp-car-btn lp-car-next" aria-label={`Next ${label}`} onClick={() => setIndex((index + 1) % count)}><ChevronRight size={17} /></button>
    </>}
    <div className={`lp-car-grid lp-car-${window}`}>{shown}</div>
  </div>;
}

const GRADE_NAMES: Record<Grade, string> = { "A+": "Excellent", A: "Very Good", B: "Good", C: "Average", D: "Poor" };
export function GradeLab() {
  const [service, setService] = useState<Grade>("A");
  const [support, setSupport] = useState<Grade>("B");
  const score = reviewScore(service, support);
  return <div className="lp-lab">
    <div className="lp-lab-top"><span>THE GRADE LAB</span><span>Interactive example <ArrowUpRight size={14} /></span></div>
    {([["Service Quality", service, setService], ["Customer Support", support, setSupport]] as const).map(([label, value, set]) =>
      <fieldset key={label}><legend>{label}<span>{POINTS[value]} points</span></legend>
        <div className="lp-grade-options">{GRADES.map(g => <button type="button" key={g} aria-label={`${label}: ${g}, ${GRADE_NAMES[g]}`} aria-pressed={value === g} onClick={() => set(g)}>{g}<small>{GRADE_NAMES[g]}</small></button>)}</div>
      </fieldset>)}
    <div className="lp-lab-result" aria-live="polite"><div><span>YOUR EXAMPLE REVIEW</span><p>({POINTS[service]} + {POINTS[support]}) ÷ 2 = {score} points</p></div><strong key={score}>{gradeFor(score)}</strong></div>
    <p className="lp-fine">A calculation example, not a customer rating. Overall business grades average eligible published reviews and require a minimum review count.</p>
  </div>;
}
