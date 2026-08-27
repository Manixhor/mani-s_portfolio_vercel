import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get or create the singleton config
    let config = await prisma.portfolioConfig.findUnique({
      where: { id: 1 },
    });

    if (!config) {
      config = await prisma.portfolioConfig.create({
        data: { id: 1 },
      });
    }

    // Parse JSON strings
    const hero = JSON.parse(config.hero);
    const about = JSON.parse(config.about);
    const experienceConfig = JSON.parse(config.experience);
    const skillsConfig = JSON.parse(config.skills);
    const certificationsConfig = JSON.parse(config.certifications);
    const projectsConfig = JSON.parse(config.projects);
    const contact = JSON.parse(config.contact);
    const footer = JSON.parse(config.footer);

    // Fetch related items
    const [experienceItems, skillItems, certificationItems, projectItems] =
      await Promise.all([
        prisma.experienceItem.findMany({
          where: { isVisible: true },
          orderBy: [{ order: 'asc' }, { id: 'desc' }],
        }),
        prisma.skillItem.findMany({
          where: { isVisible: true },
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
        }),
        prisma.certificationItem.findMany({
          where: { isVisible: true },
          orderBy: [{ order: 'asc' }, { id: 'desc' }],
        }),
        prisma.projectItem.findMany({
          where: { isVisible: true },
          orderBy: [{ order: 'asc' }, { id: 'desc' }],
        }),
      ]);

    // Transform experience items
    const experience = {
      ...experienceConfig,
      items: experienceItems.map((item) => ({
        period: item.period,
        role: item.role,
        company: item.company,
        points: item.points
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
      })),
    };

    // Transform skill items
    const skills = {
      ...skillsConfig,
      items: skillItems.map((item) => ({
        name: item.name,
        icon: item.icon,
      })),
    };

    // Transform certification items
    const certifications = {
      sectionLabel: 'Certifications',
      heading: 'Certifications',
      items: certificationItems.map((item) => ({
        title: item.title,
        issuer: item.issuer,
        issuedDate: item.issuedDate,
        credentialUrl: item.credentialUrl,
        description: item.description,
        imageUrl:
          item.imageUrl ||
          'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
        imageAlt: item.imageAlt || `${item.title} certificate preview`,
      })),
    };

    // Transform project items
    const projects = {
      ...projectsConfig,
      items: projectItems.map((item) => ({
        name: item.name,
        description: item.description,
        brief: item.brief,
        stack: item.stack,
        liveUrl: item.showLiveUrl ? item.liveUrl : '',
        githubUrl: item.showGithubUrl ? item.githubUrl : '',
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
      })),
    };

    return NextResponse.json({
      hero,
      about,
      experience,
      skills,
      certifications,
      projects,
      contact,
      footer,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error('Portfolio config error:', error);
    return NextResponse.json(
      { error: 'Failed to load portfolio config' },
      { status: 500 }
    );
  }
}
