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
        title: "I build what people use",
        name: "Manikanta",
        tagline: "Software Developer | Full Stack Developer",
        year: "2024 - Present",
        resumeLabel: "Download Resume",
        resumeUrl: "https://drive.google.com/file/d/1ot8sEzU71vKmRVdMo-XamOrXVWgmhZv5/view?usp=sharing",
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
        sectionLabel: "",
        heading: "Work Experience",
      }),
      skills: JSON.stringify({
        sectionLabel: "",
        heading: "Technical Skills",
      }),
      certifications: JSON.stringify({
        sectionLabel: "Certifications",
        heading: "Certifications",
      }),
      projects: JSON.stringify({
        sectionLabel: "",
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
          role: 'Python Developer Intern',
          company: 'Lagran Software Solutions Pvt Ltd',
          period: 'December 2025 - Present',
          points: 'Built 7 production HRMS modules including Attendance, Leave, Reporting, Employee Management, HR Operations, Asset Management, and Background Verification, adopted by 100% of company staff and reducing manual HR tracking by approximately 5 hours per week.\nStreamlined leave-approval email notification workflows using SMTP integration, reducing HR team response time by 60% and eliminating manual email communication effort.\nDeveloped and deployed the Subhagruha property web application end-to-end with property listings, blog module, SEO enhancements, and contact forms on Django and MySQL.\nMaintained zero-downtime deployments across 2 simultaneous Django projects by managing Gunicorn configuration, environment variables, and backend-frontend integration.\nWorked within an Agile Scrum framework, participating in sprint planning, daily stand-ups, and retrospectives while delivering HRMS modules iteratively.',
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
          name: 'SpendWise - Personal Finance Tracker',
          description: 'A Progressive Web Application for personal finance tracking with savings-goal allocation, secure REST APIs, and a custom analytics dashboard.',
          brief: 'Built a savings-goal allocation engine with priority-based fund distribution, deployed on Render with Gunicorn, and maintained 99.9% uptime across 5+ months of production use.',
          stack: 'PostgreSQL | Django REST Framework | REST API | Progressive Web Application | Render',
          liveUrl: '',
          showLiveUrl: false,
          githubUrl: '',
          showGithubUrl: false,
          imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
          imageAlt: 'Personal finance charts and budget planning workspace',
          order: 0,
          isVisible: true,
        },
        {
          name: 'Water Potability Prediction System',
          description: 'A machine learning system that predicts water potability using multiple classification models and water quality parameters.',
          brief: 'Achieved 87% classification accuracy using Support Vector Machine on 3,276 samples after missing value imputation and min-max scaling across 9 water quality parameters.',
          stack: 'Python | scikit-learn | Support Vector Machine | Random Forest | Decision Tree',
          liveUrl: '',
          showLiveUrl: false,
          githubUrl: '',
          showGithubUrl: false,
          imageUrl: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=900&q=80',
          imageAlt: 'Water quality testing and lab analysis setup',
          order: 1,
          isVisible: true,
        },
        {
          name: 'PY-Vault Banking System',
          description: 'A command-line banking system built with object-oriented Python, JSON persistence, and secure transaction workflows.',
          brief: 'Architected account creation, deposits, withdrawals, and balance queries with 100% transaction accuracy validated across 50+ unit test scenarios.',
          stack: 'Python | Object-Oriented Programming | JSON | Command Line Interface',
          liveUrl: '',
          showLiveUrl: false,
          githubUrl: '',
          showGithubUrl: false,
          imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80',
          imageAlt: 'Secure digital banking and payment cards',
          order: 2,
          isVisible: true,
        },
        {
          name: 'Reverse Auction System',
          description: 'An auction engine with real-time bid comparison, winner selection, modular processing layers, and structured error handling.',
          brief: 'Engineered a bid comparison and winner-selection algorithm that reduced processing errors by 30% compared to a sequential baseline implementation.',
          stack: 'Python | Object-Oriented Programming | Error Handling',
          liveUrl: '',
          showLiveUrl: false,
          githubUrl: '',
          showGithubUrl: false,
          imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80',
          imageAlt: 'Business negotiation and auction bidding workflow',
          order: 3,
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
