import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Manixhor";

interface ContributionDay {
  date: string;
  level: number;
  count: number;
}

export async function GET() {
  try {
    const res = await fetch(
      `https://github.com/users/${GITHUB_USERNAME}/contributions`,
      {
        headers: {
          "User-Agent": "mani-portfolio (next.js server)",
          Accept: "text/html",
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      throw new Error(`GitHub responded with ${res.status}`);
    }

    const html = await res.text();

    // Parse contribution days with counts from tooltips
    const days: ContributionDay[] = [];

    // Match tooltip pattern: "N contributions on Month DD."
    const tooltipRegex =
      /for="(contribution-day-component-\d+-\d+)"[^>]*>(\d+)\s+contributions?\s+on/g;
    const tooltips: Record<string, number> = {};
    let tMatch;
    while ((tMatch = tooltipRegex.exec(html)) !== null) {
      tooltips[tMatch[1]] = Number(tMatch[2]);
    }

    // Match cell pattern: data-date + id + data-level
    const cellRegex =
      /data-date="(\d{4}-\d{2}-\d{2})"[^>]*?id="(contribution-day-component-\d+-\d+)"[^>]*?data-level="([0-4])"/g;
    let match;
    while ((match = cellRegex.exec(html)) !== null) {
      const id = match[2];
      days.push({
        date: match[1],
        level: Number(match[3]),
        count: tooltips[id] ?? 0,
      });
    }

    const totalMatch = html.match(
      /id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions/
    );
    const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : 0;

    // Calculate stats
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let bestDayCount = 0;
    let bestDayDate = "";

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        if (i === days.length - 1 || currentStreak > 0) {
          currentStreak++;
        }
      } else if (currentStreak > 0) {
        break;
      }
    }

    for (const day of days) {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
      if (day.count > bestDayCount) {
        bestDayCount = day.count;
        bestDayDate = day.date;
      }
    }

    const dateRange =
      days.length > 0
        ? { from: days[0].date, to: days[days.length - 1].date }
        : null;

    return NextResponse.json({
      username: GITHUB_USERNAME,
      total,
      days,
      stats: {
        dateRange,
        currentStreak,
        longestStreak,
        bestDay: bestDayCount > 0 ? { count: bestDayCount, date: bestDayDate } : null,
      },
    });
  } catch (error) {
    console.error("GitHub contributions error:", error);
    return NextResponse.json(
      { error: "Failed to load GitHub contributions" },
      { status: 502 }
    );
  }
}
