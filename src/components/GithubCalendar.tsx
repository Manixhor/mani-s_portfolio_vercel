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
  year: "numeric",
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
        <p className="gh-cal__empty">
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

    // Build month labels aligned to the first week that starts each month
    let lastMonth = -1;
    const monthLabels: string[] = [];
    weeks.forEach((w) => {
      const first = w.find((d) => d);
      if (!first) {
        monthLabels.push("");
        return;
      }
      const month = Number(first.date.slice(5, 7));
      if (month === lastMonth) {
        monthLabels.push("");
      } else {
        lastMonth = month;
        monthLabels.push(MONTHS[month - 1]);
      }
    });

    const columnCount = weeks.length;

    return (
      <div className="gh-cal">
        <div className="gh-cal__graph">
          {/* Month labels row */}
          <div
            className="gh-cal__months"
            style={{
              gridTemplateColumns: `32px repeat(${columnCount}, 11px)`,
              gap: "0 3px",
            }}
          >
            <span aria-hidden="true" />
            {monthLabels.map((label, i) => (
              <span key={`m-${i}`} className="gh-cal__month-label">
                {label}
              </span>
            ))}
          </div>

          {/* Grid with weekday labels + cells */}
          <div
            className="gh-cal__grid"
            style={{
              gridTemplateColumns: `32px repeat(${columnCount}, 11px)`,
              gridTemplateRows: `repeat(7, 11px)`,
              gap: "3px",
            }}
          >
            {/* Weekday labels */}
            {WEEKDAY_LABELS.map((label, i) => (
              <span
                key={`d-${i}`}
                className="gh-cal__day-label"
                style={{ gridColumn: 1, gridRow: i + 1 }}
              >
                {label}
              </span>
            ))}

            {/* Contribution cells */}
            {weeks.map((col, wi) =>
              col.map((cell, di) => (
                <span
                  key={`${wi}-${di}`}
                  className={`gh-cal__cell gh-cal__cell--${cell?.level ?? 0}`}
                  style={{
                    gridColumn: wi + 2,
                    gridRow: di + 1,
                  }}
                  data-level={cell?.level ?? 0}
                  data-date={cell?.date}
                  title={
                    cell
                      ? `${cell.level} contribution${cell.level === 1 ? "" : "s"} on ${formatDate(cell.date)}`
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Footer: total + legend */}
        <div className="gh-cal__footer">
          <p className="gh-cal__total">
            <strong>{total.toLocaleString()}</strong> contributions in the last
            year
          </p>
          <div className="gh-cal__legend" aria-hidden="true">
            <span className="gh-cal__legend-label">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className={`gh-cal__cell gh-cal__cell--${level}`}
              />
            ))}
            <span className="gh-cal__legend-label">More</span>
          </div>
        </div>

        <a
          className="gh-cal__link"
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
    <div className="gh-cal-panel">
      {isLoading && (
        <div className="gh-cal__skeleton" aria-busy="true">
          Loading GitHub activity...
        </div>
      )}
      {error && (
        <div className="gh-cal__error" role="alert">
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
