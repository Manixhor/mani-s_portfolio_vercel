const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create or update the singleton PortfolioConfig
  const config = await prisma.portfolioConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      hero: JSON.stringify({
        title: "MANI",
        name: "Manikanta",
        tagline: "Full Stack Python & Django Developer",
        year: "2024 - Present",
        resumeLabel: "Download Resume",
        resumeUrl: "#",
        social: {
          github: { url: "https://github.com/Manixhor", label: "GitHub" },
          linkedin: { url: "https://www.linkedin.com/in/manikanta-gururam/", label: "LinkedIn" },
        },
      }),
      about: JSON.stringify({
        sectionLabel: "About",
        heading: "About Me",
        paragraphs: [
          "I am a passionate Full Stack Developer specializing in Python and Django. With a strong foundation in web development, I create robust and scalable applications.",
        ],
        imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Developer workspace",
      }),
      experience: JSON.stringify({
        sectionLabel: "Experience",
        heading: "Work Experience",
      }),
      skills: JSON.stringify({
        sectionLabel: "Skills",
        heading: "Technical Skills",
      }),
      certifications: JSON.stringify({
        sectionLabel: "Certifications",
        heading: "Certifications",
      }),
      projects: JSON.stringify({
        sectionLabel: "Projects",
        heading: "My Projects",
      }),
      contact: JSON.stringify({
        sectionLabel: "Get in Touch",
        heading: "Let's Talk",
        subtitle: "Feel free to reach out for collaborations or just a friendly hello!",
        email: "manigururam08@gmail.com",
        phone: "",
        location: "India",
        imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Contact workspace",
        quote: "The best way to predict the future is to create it.",
      }),
      footer: JSON.stringify({}),
    },
  });

  console.log('✅ Portfolio config seeded:', config.id);

  // Create sample experience items
  const experienceCount = await prisma.experienceItem.count();
  if (experienceCount === 0) {
    await prisma.experienceItem.createMany({
      data: [
        {
          role: 'Full Stack Developer',
          company: 'Freelance',
          period: '2023 - Present',
          points: 'Built web applications using Django and React\nDeveloped REST APIs with Django REST Framework\nDeployed applications on cloud platforms',
          order: 0,
          isVisible: true,
        },
      ],
    });
    console.log('✅ Experience items seeded');
  }

  // Create sample skill items
  const skillCount = await prisma.skillItem.count();
  if (skillCount === 0) {
    await prisma.skillItem.createMany({
      data: [
        { name: 'Python', icon: 'devicon-python-plain', order: 0, isVisible: true },
        { name: 'Django', icon: 'devicon-django-plain', order: 1, isVisible: true },
        { name: 'JavaScript', icon: 'devicon-javascript-plain', order: 2, isVisible: true },
        { name: 'HTML', icon: 'devicon-html5-plain', order: 3, isVisible: true },
        { name: 'CSS', icon: 'devicon-css3-plain', order: 4, isVisible: true },
        { name: 'React', icon: 'devicon-react-original', order: 5, isVisible: true },
        { name: 'MySQL', icon: 'devicon-mysql-plain', order: 6, isVisible: true },
        { name: 'Git', icon: 'devicon-git-plain', order: 7, isVisible: true },
      ],
    });
    console.log('✅ Skill items seeded');
  }

  // Create sample project items
  const projectCount = await prisma.projectItem.count();
  if (projectCount === 0) {
    await prisma.projectItem.createMany({
      data: [
        {
          name: 'Portfolio Website',
          description: 'A modern portfolio website built with Django and vanilla JavaScript.',
          brief: 'This portfolio showcases my skills and projects.',
          stack: 'Django | JavaScript | HTML | CSS',
          liveUrl: '',
          showLiveUrl: true,
          githubUrl: '',
          showGithubUrl: true,
          imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
          imageAlt: 'Portfolio preview',
          order: 0,
          isVisible: true,
        },
      ],
    });
    console.log('✅ Project items seeded');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
