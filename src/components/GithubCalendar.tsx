"use client";

import { useCallback, useEffect, useState } from "react";

interface ContributionDay {
  date: string;
  level: number;
}

interface Contributions {
  username: string;
  total: number;
  days: ContributionDay[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return dateFormatter.format(parsed);
}

export default function GithubCalendar() {
  const [data, setData] = useState<Contributions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github/contributions");
      if (!res.ok) {
        throw new Error(`Failed to load contributions (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load GitHub activity"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderCalendar = () => {
    if (!data) return null;

    const { days, total, username } = data;

    if (days.length === 0) {
      return (
        <p className="github-calendar__empty">
          No contribution data available yet.
        </p>
      );
    }

    const firstDate = new Date(`${days[0].date}T00:00:00`);
    const startOffset = firstDate.getDay();

    const weeks: (ContributionDay | null)[][] = [];
    let week: (ContributionDay | null)[] = [];
    for (let i = 0; i < startOffset; i++) week.push(null);
    days.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    let lastMonth = -1;
    const monthLabels = weeks.map((w) => {
      const first = w.find((d) => d);
      if (!first) return "";
      const month = Number(first.date.slice(5, 7));
      if (month === lastMonth) return "";
      lastMonth = month;
      return MONTHS[month - 1];
    });

    const columnCount = weeks.length;

    return (
      <div className="github-calendar">
        <div
          className="github-calendar__grid"
          style={{
            gridTemplateColumns: `36px repeat(${columnCount}, var(--gh-cell))`,
          }}
        >
          {/* Month labels */}
          <span className="github-calendar__corner" aria-hidden="true" />
          {monthLabels.map((label, i) => (
            <span
              key={`month-${i}`}
              className="github-calendar__month"
              style={{ gridColumn: i + 2 }}
            >
              {label}
            </span>
          ))}

          {/* Weekday labels */}
          <div
            className="github-calendar__days"
            style={{ gridColumn: 1 }}
            aria-hidden="true"
          >
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          {/* Heatmap cells */}
          {weeks.map((col, wi) =>
            col.map((cell, di) => (
              <span
                key={`${wi}-${di}`}
                className="github-calendar__cell"
                style={{
                  gridColumn: wi + 2,
                  gridRow: di + 2,
                  opacity: cell ? 1 : 0,
                }}
                data-level={cell?.level ?? 0}
                title={
                  cell
                    ? `${cell.level} contribution${cell.level === 1 ? "" : "s"} on ${formatDate(cell.date)}`
                    : undefined
                }
              />
            ))
          )}
        </div>

        <div className="github-calendar__footer">
          <p className="github-calendar__total">
            <strong>{total.toLocaleString()}</strong> contributions in the last
            year
          </p>
          <div className="github-calendar__legend" aria-hidden="true">
            <span className="github-calendar__legend-label">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className="github-calendar__cell"
                data-level={level}
              />
            ))}
            <span className="github-calendar__legend-label">More</span>
          </div>
        </div>

        <a
          className="github-calendar__link"
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </div>
    );
  };

  return (
    <div className="github-calendar-panel">
      {isLoading && (
        <div className="github-calendar__skeleton" aria-busy="true">
          Loading GitHub activity...
        </div>
      )}
      {error && (
        <div className="github-calendar__error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={load}>
            Retry
          </button>
        </div>
      )}
      {!isLoading && !error && renderCalendar()}
    </div>
  );
}