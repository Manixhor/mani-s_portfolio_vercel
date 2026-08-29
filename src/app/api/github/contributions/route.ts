import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Manixhor";

interface ContributionDay {
  date: string;
  level: number;
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

    const days: ContributionDay[] = [];
    const cellRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="([0-4])"/g;
    let match;
    while ((match = cellRegex.exec(html)) !== null) {
      days.push({ date: match[1], level: Number(match[2]) });
    }

    const totalMatch = html.match(
      /id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions/
    );
    const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : 0;

    return NextResponse.json({
      username: GITHUB_USERNAME,
      total,
      days,
    });
  } catch (error) {
    console.error("GitHub contributions error:", error);
    return NextResponse.json(
      { error: "Failed to load GitHub contributions" },
      { status: 502 }
    );
  }
}