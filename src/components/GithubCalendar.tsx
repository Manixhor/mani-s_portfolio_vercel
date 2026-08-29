"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function formatDateShort(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateNice(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/* Animated counter hook */
function useAnimatedCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };
    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration]);

  return value;
}

/* Stat card component */
function StatCard({
  label,
  value,
  suffix = "",
  color,
  icon,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  color: string;
  icon: string;
}) {
  return (
    <div className="gh-cal__stat-card">
      <span className="gh-cal__stat-icon">{icon}</span>
      <span className="gh-cal__stat-value" style={{ color }}>
        {value}
        {suffix}
      </span>
      <span className="gh-cal__stat-label">{label}</span>
    </div>
  );
}

export default function GithubCalendar() {
  const [data, setData] = useState<Contributions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const animatedTotal = useAnimatedCounter(data?.total ?? 0, 1400);
  const animatedStreak = useAnimatedCounter(data?.stats?.currentStreak ?? 0, 800);
  const animatedLongest = useAnimatedCounter(data?.stats?.longestStreak ?? 0, 800);
  const animatedBest = useAnimatedCounter(data?.stats?.bestDay?.count ?? 0, 800);

  /* Intersection observer for reveal animation */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github/contributions");
      if (!res.ok) throw new Error(`Failed to load contributions (${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load GitHub activity");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderCalendar = () => {
    if (!data) return null;
    const { days, username, stats } = data;
    if (days.length === 0) {
      return <p className="gh-cal__empty">No contribution data available yet.</p>;
    }

    const firstDate = new Date(`${days[0].date}T00:00:00`);
    const startOffset = firstDate.getDay();

    const weeks: (ContributionDay | null)[][] = [];
    let week: (ContributionDay | null)[] = [];
    for (let i = 0; i < startOffset; i++) week.push(null);
    days.forEach((day) => {
      week.push(day);
      if (week.length === 7) { weeks.push(week); week = []; }
    });
    if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

    let lastMonth = -1;
    const monthLabels: string[] = [];
    weeks.forEach((w) => {
      const first = w.find((d) => d);
      if (!first) { monthLabels.push(""); return; }
      const month = Number(first.date.slice(5, 7));
      if (month === lastMonth) { monthLabels.push(""); } else { lastMonth = month; monthLabels.push(MONTHS[month - 1]); }
    });

    const columnCount = weeks.length;
    const totalCells = columnCount * 7;

    return (
      <div className={`gh-cal ${isVisible ? "gh-cal--visible" : ""}`}>
        <div className="gh-cal__terminal">
          {/* Title bar */}
          <div className="gh-cal__titlebar">
            <span className="gh-cal__dot gh-cal__dot--red" />
            <span className="gh-cal__dot gh-cal__dot--yellow" />
            <span className="gh-cal__dot gh-cal__dot--green" />
            <span className="gh-cal__titlebar-text">
              <span className="gh-cal__typed-prefix">{username}@github</span>:~$ contributions --graph
            </span>
          </div>

          {/* Graph */}
          <div className="gh-cal__graph">
            <div
              className="gh-cal__months"
              style={{ gridTemplateColumns: `40px repeat(${columnCount}, 13px)`, gap: "0 3px" }}
            >
              <span aria-hidden="true" />
              {monthLabels.map((label, i) => (
                <span key={`m-${i}`} className="gh-cal__month-label">{label}</span>
              ))}
            </div>

            <div
              className="gh-cal__grid"
              style={{ gridTemplateColumns: `40px repeat(${columnCount}, 13px)`, gridTemplateRows: `repeat(7, 13px)`, gap: "3px" }}
            >
              {WEEKDAY_LABELS.map((label, i) => (
                <span key={`d-${i}`} className="gh-cal__day-label" style={{ gridColumn: 1, gridRow: i + 1 }}>{label}</span>
              ))}
              {weeks.map((col, wi) =>
                col.map((cell, di) => {
                  const cellIndex = wi * 7 + di;
                  const delay = Math.min(cellIndex * 2, 600);
                  return (
                    <span
                      key={`${wi}-${di}`}
                      className={`gh-cal__cell gh-cal__cell--${cell?.level ?? 0} ${isVisible ? "gh-cal__cell--in" : ""}`}
                      style={{ gridColumn: wi + 2, gridRow: di + 1, transitionDelay: `${delay}ms` }}
                      data-level={cell?.level ?? 0}
                      data-date={cell?.date}
                      title={cell ? `${cell.count} contribution${cell.count === 1 ? "" : "s"} on ${formatDateNice(cell.date)}` : undefined}
                    />
                  );
                })
              )}
            </div>

            <div className="gh-cal__legend">
              <span className="gh-cal__legend-label">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span key={level} className={`gh-cal__cell gh-cal__cell--${level}`} />
              ))}
              <span className="gh-cal__legend-label">More</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="gh-cal__stats">
            <div className="gh-cal__stats-row">
              <StatCard icon="🟩" label="Contributions" value={animatedTotal.toLocaleString()} color="#39d353" />
              <StatCard icon="🔥" label="Current Streak" value={animatedStreak} suffix="d" color="#58a6ff" />
              <StatCard icon="⚡" label="Longest Streak" value={animatedLongest} suffix="d" color="#a371f7" />
              <StatCard icon="🏆" label="Best Day" value={animatedBest} color="#f0883e" />
            </div>

            <div className="gh-cal__stats-meta">
              {stats.dateRange && (
                <span className="gh-cal__daterange">
                  {formatDateShort(stats.dateRange.from)} → {formatDateShort(stats.dateRange.to)}
                </span>
              )}
            </div>
          </div>
        </div>

        <a className="gh-cal__link" href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">
          View on GitHub <span className="gh-cal__link-arrow">↗</span>
        </a>
      </div>
    );
  };

  return (
    <div className="gh-cal-panel" ref={panelRef}>
      {isLoading && (
        <div className="gh-cal__skeleton" aria-busy="true">
          <div className="gh-cal__skeleton-bar" />
          <div className="gh-cal__skeleton-bar gh-cal__skeleton-bar--short" />
          <div className="gh-cal__skeleton-grid">
            {Array.from({ length: 35 }).map((_, i) => (
              <span key={i} className="gh-cal__skeleton-cell" />
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="gh-cal__error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={load}>Retry</button>
        </div>
      )}
      {!isLoading && !error && renderCalendar()}
    </div>
  );
}
