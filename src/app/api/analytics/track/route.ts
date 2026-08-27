import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer } = body;

    // Get IP address from headers
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;

    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';

    // Save page view
    await prisma.pageView.create({
      data: {
        path: path?.substring(0, 500) || '/',
        ipAddress: ip?.substring(0, 45),
        userAgent: userAgent.substring(0, 1000),
        referrer: referrer?.substring(0, 1000) || '',
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    // Don't fail the user experience if analytics fails
    console.error('Analytics error:', error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
