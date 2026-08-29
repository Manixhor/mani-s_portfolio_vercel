"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ── Types ── */
interface ContributionDay {
  date: string;
  level: number;
  count: number;
}

interface Contributions {
  username: string;
  total: number;
  days: ContributionDay[];
  stats: {
    dateRange: { from: string; to: string } | null;
    currentStreak: number;
    longestStreak: number;
    bestDay: { count: number; date: string } | null;
  };
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtNice(ds: string) {
  const d = new Date(`${ds}T00:00:00`);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function fmtShort(ds: string) {
  const d = new Date(`${ds}T00:00:00`);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ── Animated counter ── */
function useCounter(target: number, dur = 1200) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, dur]);
  return v;
}

/* ── Main ── */
export default function GithubCalendar() {
  const [data, setData] = useState<Contributions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const tot = useCounter(data?.total ?? 0, 1400);
  const streak = useCounter(data?.stats?.currentStreak ?? 0, 800);
  const longest = useCounter(data?.stats?.longestStreak ?? 0, 800);
  const best = useCounter(data?.stats?.bestDay?.count ?? 0, 800);

  /* Scroll reveal — re-runs after data loads so ref is populated */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loading]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/github/contributions");
      if (!r.ok) throw new Error(`${r.status}`);
      setData(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Build grid ── */
  const buildGrid = () => {
    if (!data || data.days.length === 0) return null;
    // Sort chronologically — API returns days column-by-column (all Sundays, then Mondays...)
    const days = [...data.days].sort((a, b) => a.date.localeCompare(b.date));

    // Determine first day of week for the first date
    const first = new Date(`${days[0].date}T00:00:00`);
    const startOffset = first.getDay(); // 0=Sun

    // Build weeks array (each week = 7 slots, null = empty)
    const weeks: (ContributionDay | null)[][] = [];
    let wk: (ContributionDay | null)[] = [];
    for (let i = 0; i < startOffset; i++) wk.push(null);
    for (const day of days) {
      wk.push(day);
      if (wk.length === 7) { weeks.push(wk); wk = []; }
    }
    if (wk.length) { while (wk.length < 7) wk.push(null); weeks.push(wk); }

    // Month labels: only show when month changes
    let prevMonth = -1;
    const monthLabels = weeks.map((w) => {
      const firstDay = w.find(Boolean);
      if (!firstDay) return "";
      const m = Number(firstDay.date.slice(5, 7)) - 1;
      if (m === prevMonth) return "";
      prevMonth = m;
      return MONTHS[m];
    });

    // Track which columns have content for month label placement
    const colCount = weeks.length;

    return { weeks, monthLabels, colCount };
  };

  const grid = buildGrid();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="ghc" aria-busy="true">
          <div className="ghc__skeleton">
            <div className="ghc__sk-bar" />
            <div className="ghc__sk-bar ghc__sk-bar--sm" />
            <div className="ghc__sk-dots">
              {Array.from({ length: 49 }).map((_, i) => (
                <span key={i} className="ghc__sk-cell" />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="ghc ghc--error" role="alert">
          <p>Could not load contribution data.</p>
          <button type="button" onClick={load}>Retry</button>
        </div>
      );
    }

    if (!grid || !data) return null;

    const { weeks, monthLabels, colCount } = grid;
    const { username, stats } = data;

    return (
      <div className={`ghc ${visible ? "ghc--in" : ""}`} ref={wrapRef}>
        {/* Card header */}
        <div className="ghc__head">
          <div className="ghc__head-left">
            <svg className="ghc__icon" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="ghc__user">{username}</span>
          </div>
          <a
            className="ghc__link"
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View profile
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.75 2h3.5a.75.75 0 010 1.5H4.5v8h8V8.75a.75.75 0 011.5 0v3.5A1.75 1.75 0 0112.25 14h-8.5A1.75 1.75 0 012 12.25v-8.5C2 2.784 2.784 2 3.75 2zm6.72.72l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H7a.75.75 0 010-1.5h4.13L9.41 3.78a.75.75 0 011.06-1.06z" />
            </svg>
          </a>
        </div>

        {/* Heatmap grid */}
        <div className="ghc__body">
          <div className="ghc__scroll">
            {/* Month row */}
            <div
              className="ghc__months"
              style={{ gridTemplateColumns: `36px repeat(${colCount}, 13px)`, gap: "0 3px" }}
            >
              <span />
              {monthLabels.map((m, i) => (
                <span key={i} className="ghc__month">{m}</span>
              ))}
            </div>

            {/* Grid */}
            <div
              className="ghc__grid"
              style={{
                gridTemplateColumns: `36px repeat(${colCount}, 13px)`,
                gridTemplateRows: "repeat(7, 13px)",
                gap: "3px",
              }}
            >
              {/* Weekday labels */}
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i} className="ghc__wk" style={{ gridColumn: 1, gridRow: i + 1 }}>
                  {d}
                </span>
              ))}

              {/* Cells */}
              {weeks.map((col, wi) =>
                col.map((cell, di) => {
                  const idx = wi * 7 + di;
                  return (
                    <span
                      key={`${wi}-${di}`}
                      className={`ghc__c ghc__c--${cell?.level ?? 0}${visible ? " ghc__c--in" : ""}`}
                      style={{
                        gridColumn: wi + 2,
                        gridRow: di + 1,
                        transitionDelay: `${Math.min(idx * 1.5, 800)}ms`,
                      }}
                      title={
                        cell
                          ? `${cell.count} contribution${cell.count !== 1 ? "s" : ""} on ${fmtNice(cell.date)}`
                          : undefined
                      }
                    />
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="ghc__legend">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((l) => (
                <span key={l} className={`ghc__c ghc__c--${l} ghc__c--leg`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div className="ghc__foot">
          <div className="ghc__foot-main">
            <span className="ghc__foot-total">{tot.toLocaleString()}</span> contributions in the last year
          </div>
          <div className="ghc__foot-meta">
            {stats.dateRange && (
              <span className="ghc__foot-range">
                {fmtShort(stats.dateRange.from)} → {fmtShort(stats.dateRange.to)}
              </span>
            )}
            <span className="ghc__foot-sep">·</span>
            <span>
              current streak <strong className="ghc__foot-blue">{streak} day{streak !== 1 ? "s" : ""}</strong>
            </span>
            <span className="ghc__foot-sep">·</span>
            <span>
              longest <strong className="ghc__foot-blue">{longest} day{longest !== 1 ? "s" : ""}</strong>
            </span>
            {stats.bestDay && (
              <>
                <span className="ghc__foot-sep">·</span>
                <span>
                  best day <strong className="ghc__foot-orange">{best}</strong>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return <div className="ghc-wrap">{renderContent()}</div>;
}
