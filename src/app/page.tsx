"use client";

import { useEffect, useState, useCallback } from "react";

interface PortfolioConfig {
  hero: {
    title?: string;
    name?: string;
    tagline?: string;
    year?: string;
    resumeLabel?: string;
    resumeUrl?: string;
    social?: {
      github?: { url: string; label: string };
      linkedin?: { url: string; label: string };
    };
  };
  about: {
    sectionLabel?: string;
    heading?: string;
    paragraphs?: string[];
    imageUrl?: string;
    imageAlt?: string;
  };
  experience: {
    sectionLabel?: string;
    heading?: string;
    items?: Array<{
      period?: string;
      role?: string;
      company?: string;
      points?: string[];
    }>;
  };
  skills: {
    sectionLabel?: string;
    heading?: string;
    items?: Array<{
      name?: string;
      icon?: string;
    }>;
  };
  certifications: {
    sectionLabel?: string;
    heading?: string;
    items?: Array<{
      title?: string;
      issuer?: string;
      issuedDate?: string;
      credentialUrl?: string;
      description?: string;
      imageUrl?: string;
      imageAlt?: string;
    }>;
  };
  projects: {
    sectionLabel?: string;
    heading?: string;
    items?: Array<{
      name?: string;
      description?: string;
      brief?: string;
      stack?: string;
      liveUrl?: string;
      githubUrl?: string;
      imageUrl?: string;
      imageAlt?: string;
    }>;
  };
  contact: {
    sectionLabel?: string;
    heading?: string;
    subtitle?: string;
    email?: string;
    phone?: string;
    location?: string;
    imageUrl?: string;
    imageAlt?: string;
    quote?: string;
  };
}

const DEFAULT_SOCIAL = {
  github: {
    url: "https://github.com/Manixhor",
    label: "GitHub",
  },
  linkedin: {
    url: "https://www.linkedin.com/in/manikanta-gururam/",
    label: "LinkedIn",
  },
};

export default function Home() {
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [modalProject, setModalProject] = useState<{
    name?: string;
    description?: string;
    brief?: string;
    stack?: string;
    liveUrl?: string;
    githubUrl?: string;
    imageUrl?: string;
    imageAlt?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/portfolio/config")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load portfolio");
        return res.json();
      })
      .then((data) => setConfig(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load portfolio data");
      });
  }, []);

  // Progress bar
  useEffect(() => {
    const updateProgress = () => {
      const progressBar = document.getElementById("progress-bar");
      if (!progressBar) return;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  // Reveal animations
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const revealItems = document.querySelectorAll(
      ".split-panel, .experience-card, .skills-grid, .certification-card, .project-card, .contact-panel"
    );

    revealItems.forEach((item) => item.classList.add("reveal-on-scroll"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [config]);

  const skillLogo = (skillName: string, icon?: string) => {
    if (icon) return icon;
    const normalized = skillName.toLowerCase().replace(/\s+/g, "");
    const logos: Record<string, string> = {
      python: "devicon-python-plain",
      django: "devicon-django-plain",
      drf: "text:DRF",
      djangorestframework: "text:DRF",
      mysql: "devicon-mysql-plain",
      postgresql: "devicon-postgresql-plain",
      postgres: "devicon-postgresql-plain",
      sql: "devicon-mysql-plain",
      git: "devicon-git-plain",
      html: "devicon-html5-plain",
      html5: "devicon-html5-plain",
      css: "devicon-css3-plain",
      css3: "devicon-css3-plain",
      javascript: "devicon-javascript-plain",
      js: "devicon-javascript-plain",
      react: "devicon-react-original",
      fastapi: "devicon-fastapi-plain",
    };
    return logos[normalized] || "devicon-code-plain";
  };

  const splitBulletText = (value?: string) => {
    if (!value) return [];
    const text = value.replace(/\s+/g, " ");
    const sentences =
      text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [text];
    return sentences.map((s) => s.trim()).filter(Boolean);
  };

  const handleContactSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const submitButton = form.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    const status = document.querySelector("[data-contact-status]");

    submitButton.disabled = true;
    if (status) status.textContent = "Sending...";

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Message could not be sent.");
      }

      form.reset();
      if (status) {
        status.textContent = "Message sent. I will get back to you soon.";
        status.classList.add("is-success");
      }
    } catch (error) {
      if (status) {
        status.textContent =
          error instanceof Error ? error.message : "Message failed.";
        status.classList.add("is-error");
      }
    } finally {
      submitButton.disabled = false;
    }
  }, []);

  if (error) {
    return (
      <div className="portfolio-shell">
        <p style={{ textAlign: "center", padding: "2rem" }}>{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="portfolio-shell">
        <p style={{ textAlign: "center", padding: "2rem" }}>Loading...</p>
      </div>
    );
  }

  const { hero, about, experience, skills, certifications, projects, contact } =
    config;
  const social = { ...DEFAULT_SOCIAL, ...(hero.social || {}) };

  return (
    <>
      <main className="portfolio-shell">
        {/* Navigation */}
        <nav className={`top-nav ${isNavOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <a className="nav-brand" href="#hero" aria-label="Go to home">
            Mani
          </a>
          <button
            className="nav-toggle"
            type="button"
            aria-label="Open navigation"
            aria-expanded={isNavOpen}
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="nav-links" id="primary-nav">
            {["Home", "About", "Experience", "Projects", "Certifications", "Skills", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsNavOpen(false)}
                >
                  {item}
                </a>
              )
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section id="hero" className="hero-panel section-panel">
          <div className="hero-card">
            <h1>{hero.title}</h1>
            <p className="signature">{hero.name}</p>
            <p className="hero-role">{hero.tagline}</p>
            <a className="year-pill" href="#experience">
              {hero.year}
            </a>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-panel section-panel split-panel">
          <div className="section-copy">
            <p className="section-kicker">{about.sectionLabel}</p>
            <h2 style={{ fontFamily: '"Great Vibes", cursive' }}>{about.heading}</h2>
            {(about.paragraphs || []).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <a className="outline-button" href={hero.resumeUrl || "#"}>
              {hero.resumeLabel}
            </a>
          </div>
          <div className="image-panel about-image">
            <img src={about.imageUrl} alt={about.imageAlt} loading="lazy" />
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="experience-panel section-panel">
          <div className="section-heading">
            <p className="section-kicker">{experience.sectionLabel}</p>
            <h2>{experience.heading}</h2>
          </div>
          {(experience.items || []).map((item, i) => (
            <article className="experience-card" key={i}>
              <div>
                <p className="experience-period">{item.period}</p>
                <h3>{item.role}</h3>
                <span>{item.company}</span>
              </div>
              <ul>
                {(item.points || []).flatMap(splitBulletText).map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {/* Skills Section */}
        <section id="skills" className="skills-panel section-panel">
          <div className="section-heading">
            <p className="section-kicker">{skills.sectionLabel}</p>
            <h2>{skills.heading}</h2>
          </div>
          <div className="skills-grid" aria-label="Technical skills">
            {(skills.items || []).map((skill, i) => {
              const logo = skillLogo(skill.name || "", skill.icon);
              return (
                <div className="skill-item" key={i}>
                  {logo.startsWith("text:") ? (
                    <strong className="skill-logo-text">
                      {logo.replace("text:", "")}
                    </strong>
                  ) : (
                    <i className={logo} />
                  )}
                  <span>{skill.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="projects-panel section-panel">
          <div className="section-heading">
            <p className="section-kicker">{projects.sectionLabel}</p>
            <h2>{projects.heading}</h2>
          </div>
          <div className="project-grid">
            {(projects.items || []).map((project, i) => (
              <article className="project-card" key={i}>
                <img
                  src={project.imageUrl}
                  alt={project.imageAlt || `${project.name} preview`}
                  loading="lazy"
                />
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <span>{project.stack}</span>
                  <button
                    className="project-trigger"
                    type="button"
                    onClick={() => setModalProject(project)}
                  >
                    View Project <b aria-hidden="true">-&gt;</b>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="certifications-panel section-panel">
          <div className="section-heading">
            <p className="section-kicker">{certifications.sectionLabel}</p>
            <h2>{certifications.heading}</h2>
          </div>
          <div className="certification-grid">
            {(certifications.items || []).length === 0 ? (
              <article className="certification-card certification-card--empty">
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80"
                  alt="Certification preview"
                />
                <h3>Certifications coming soon</h3>
                <p>New credentials will appear here as they are added.</p>
              </article>
            ) : (
              (certifications.items || []).map((item, i) => (
                <article className="certification-card" key={i}>
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt || `${item.title} preview`}
                    loading="lazy"
                  />
                  <div>
                    <p className="certification-date">{item.issuedDate}</p>
                    <h3>{item.title}</h3>
                    <span>{item.issuer}</span>
                    <p className="certification-description">
                      {item.description}
                    </p>
                    {item.credentialUrl ? (
                      <a
                        className="certification-link"
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Credential
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-panel section-panel split-panel">
          <div className="section-copy">
            <p className="section-kicker">{contact.sectionLabel}</p>
            <h2 style={{ fontFamily: '"Great Vibes", cursive' }}>{contact.heading}</h2>
            <p>{contact.subtitle}</p>

            <ul className="contact-list">
              {contact.email && (
                <li>
                  <span aria-hidden="true">&#9993;</span> {contact.email}
                </li>
              )}
              {contact.phone && (
                <li>
                  <span aria-hidden="true">&#9742;</span> {contact.phone}
                </li>
              )}
              {contact.location && (
                <li>
                  <span aria-hidden="true">&#8982;</span> {contact.location}
                </li>
              )}
            </ul>

            <div className="social-links" aria-label="Social links">
              {social.github?.url && (
                <a
                  href={social.github.url}
                  aria-label={social.github.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="devicon-github-original" />
                </a>
              )}
              {social.linkedin?.url && (
                <a
                  href={social.linkedin.url}
                  aria-label={social.linkedin.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  in
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} aria-label="Email">
                  &#9993;
                </a>
              )}
            </div>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div>
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" name="subject" type="text" required />
              </div>
              <div>
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                />
              </div>
              <button type="submit">Send Message</button>
              <p className="contact-form__status" data-contact-status aria-live="polite" />
            </form>
          </div>

          <div className="image-panel contact-image">
            <img
              src={contact.imageUrl}
              alt={contact.imageAlt}
              loading="lazy"
            />
            <blockquote>
              <span>{contact.quote}</span>
            </blockquote>
          </div>
        </section>
      </main>

      {/* Project Modal */}
      <div
        className={`project-modal ${modalProject ? "is-open" : ""}`}
        aria-hidden={!modalProject}
      >
        <div
          className="project-modal__backdrop"
          onClick={() => setModalProject(null)}
        />
        <section
          className="project-modal__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            className="project-modal__close"
            type="button"
            aria-label="Close project details"
            onClick={() => setModalProject(null)}
          >
            &times;
          </button>
          <p className="project-modal__eyebrow">Project brief</p>
          <h2 id="modal-title">{String(modalProject?.name || '')}</h2>
          <p id="modal-brief">{String(modalProject?.brief || modalProject?.description || '')}</p>
          <span id="modal-stack">{String(modalProject?.stack || '')}</span>
          <div className="project-modal__links">
            {modalProject?.liveUrl && (
              <a
                id="modal-live"
                href={modalProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Link
              </a>
            )}
            {modalProject?.githubUrl && (
              <a
                id="modal-github"
                href={modalProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
