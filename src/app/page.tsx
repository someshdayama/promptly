"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./hero.module.css";
import BuilderApp from "@/components/BuilderApp";

const FEATURES = [
  { icon: "✦", title: "Job-Tailored AI", desc: "Paste a job description and our AI rewrites your resume to match the exact role and company." },
  { icon: "◈", title: "3 Premium Templates", desc: "Minimalist, Modern, and ATS-optimized layouts — all built for recruiters and hiring managers." },
  { icon: "⤓", title: "One-Click PDF", desc: "Export a perfectly formatted, print-ready PDF in seconds. No layout shifts, no surprises." },
  { icon: "◎", title: "ATS Optimized", desc: "Clean semantic structure that passes applicant tracking systems at top companies." },
  { icon: "⚡", title: "Instant Formatting", desc: "No design skills needed. Paste raw text and get a polished resume in under 10 seconds." },
  { icon: "◇", title: "Always Free", desc: "No sign-up. No credit card. No paywalls. Just paste, generate, and download." },
];

const STEPS = [
  { num: "01", icon: "📋", title: "Paste your info", desc: "Dump your LinkedIn profile, old resume, or even raw notes. Any format works." },
  { num: "02", icon: "✦", title: "AI tailors it", desc: "Our AI structures, polishes, and optimizes every bullet point for maximum impact." },
  { num: "03", icon: "⤓", title: "Download & apply", desc: "Pick your template, export a pixel-perfect PDF, and send it off." },
];

const TEMPLATES = [
  { badge: "Minimalist", name: "Clean & Simple", desc: "Timeless one-column layout, perfect for any industry." },
  { badge: "Modern", name: "Contemporary", desc: "Two-column design with a bold sidebar — stands out in the pile." },
  { badge: "ATS", name: "Recruiter-Ready", desc: "Machine-parseable format for large-company applicant systems." },
];

const FAQS = [
  { q: "Is this actually free?", a: "Yes. 100% free. No paywalls, no watermarks, no credit card required. We built this to help people get jobs." },
  { q: "Do I need an account?", a: "No sign-up is required. You just paste your text, generate the resume, and download the PDF. Your data stays in your browser session." },
  { q: "What AI does it use?", a: "Promptly uses Google's Gemini Flash model to quickly structure and optimize your raw text into a professional format." },
  { q: "Are the templates ATS-friendly?", a: "Yes. All templates are built with clean, semantic HTML before being converted to PDF, ensuring applicant tracking systems can parse your text perfectly." }
];

export default function HeroPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addReveal = (el: HTMLElement | null, i: number) => {
    revealRefs.current[i] = el;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className={styles.appContainer}>
      <div className={`${styles.heroView} ${showBuilder ? styles.slideOutLeft : ""}`}>
        <div className={styles.page}>

          {/* ── NAVBAR ── */}
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLogo}>promptly</Link>
            <div className={styles.navRight}>
              <button className={styles.navLink} onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                How it works
              </button>
              <button className={styles.navLink} onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}>
                Templates
              </button>
              <button className={styles.navCta} onClick={() => setShowBuilder(true)}>
                Build Resume
              </button>
            </div>
          </nav>

          {/* ── HERO ── */}
          <section className={styles.hero}>
            <div className={styles.heroBg}>
              <div className={styles.blob1} />
              <div className={styles.blob2} />
              <div className={styles.dotGrid} />
            </div>

            <div className={styles.heroInner}>
              {/* Left: copy */}
              <div className={styles.heroText}>

                <h1 className={styles.heroHeading}>
                  Your resume,<br />
                  rewritten by <em>AI</em>.
                </h1>

                <p className={styles.heroSub}>
                  Paste any text — LinkedIn profile, old resume, rough notes — and Promptly instantly structures it into a polished, ATS-friendly resume tailored for the exact role you want.
                </p>

                <div className={styles.heroCtas}>
                  <button onClick={() => setShowBuilder(true)} className={styles.heroPrimaryBtn}>
                    Build My Resume →
                  </button>
                  <button 
                    onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} 
                    className={styles.heroSecondaryBtn}
                  >
                    See how it works
                  </button>
                </div>

              </div>

              {/* Right: floating mockup */}
              <div className={styles.heroVisual}>
                <div className={styles.mockupWrap}>
                  <div className={styles.mockup}>
                    <div className={styles.mockupHeader}>
                      <div className={styles.mockupName} />
                      <div className={styles.mockupTitle} />
                      <div className={styles.mockupMeta}>
                        <div className={styles.mockupMetaItem} />
                        <div className={styles.mockupMetaItem} />
                        <div className={styles.mockupMetaItem} />
                      </div>
                    </div>

                    <div className={styles.mockupSection}>
                      <div className={styles.mockupSectionLabel} />
                      <div className={`${styles.mockupLine} ${styles.mockupLineLong}`} />
                      <div className={`${styles.mockupLine} ${styles.mockupLineMed}`} />
                      <div className={`${styles.mockupLine} ${styles.mockupLineShort}`} />
                    </div>

                    <div className={styles.mockupSection}>
                      <div className={styles.mockupSectionLabel} />
                      <div className={`${styles.mockupLine} ${styles.mockupLineLong}`} />
                      <div className={`${styles.mockupLine} ${styles.mockupLineLong}`} />
                      <div className={`${styles.mockupLine} ${styles.mockupLineMed}`} />
                    </div>

                    <div className={styles.mockupSection}>
                      <div className={styles.mockupSectionLabel} />
                      <div className={styles.mockupTags}>
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className={styles.mockupTag} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.aiBadge}>
                    <span className={styles.aiBadgeIcon}>✦</span>
                    Generated by Gemini AI
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works" className={`${styles.section} ${styles.stepsSection}`}>
            <div className={styles.sectionInner}>
              <p
                className={`${styles.sectionLabel} ${styles.reveal}`}
                ref={(el) => addReveal(el, 0)}
              >
                How It Works
              </p>
              <h2
                className={`${styles.sectionTitle} ${styles.reveal}`}
                ref={(el) => addReveal(el, 1)}
                style={{ transitionDelay: "0.08s" }}
              >
                From rough notes to<br />hired in 3 steps.
              </h2>
              
              <div className={styles.steps}>
                {STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    className={`${styles.step} ${styles.reveal}`}
                    ref={(el) => addReveal(el, 2 + i)}
                    style={{ transitionDelay: `${0.1 + i * 0.12}s` }}
                  >
                    <div className={styles.stepHeader}>
                      <span className={styles.stepNum}>{step.num}</span>
                      <span className={styles.stepIcon}>{step.icon}</span>
                    </div>
                    <div className={styles.stepTitle}>{step.title}</div>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES ── */}
          <section className={`${styles.section} ${styles.featuresSection}`}>
            <div className={styles.sectionInner}>
              <p
                className={`${styles.sectionLabel} ${styles.reveal}`}
                ref={(el) => addReveal(el, 10)}
              >
                Features
              </p>
              <h2
                className={`${styles.sectionTitle} ${styles.reveal}`}
                ref={(el) => addReveal(el, 11)}
                style={{ transitionDelay: "0.08s" }}
              >
                Everything you need.<br />Nothing you don&apos;t.
              </h2>

              <div className={styles.featuresGrid}>
                {FEATURES.map((f, i) => (
                  <div
                    key={f.title}
                    className={`${styles.featureCard} ${styles.reveal}`}
                    ref={(el) => addReveal(el, 12 + i)}
                    style={{ transitionDelay: `${0.05 + i * 0.07}s` }}
                    onMouseMove={handleMouseMove}
                  >
                    <span className={styles.featureIcon}>{f.icon}</span>
                    <div className={styles.featureTitle}>{f.title}</div>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── TEMPLATES ── */}
          <section id="templates" className={`${styles.section} ${styles.templatesSection}`}>
            <div className={styles.sectionInner}>
              <p
                className={`${styles.sectionLabel} ${styles.reveal}`}
                ref={(el) => addReveal(el, 20)}
              >
                Templates
              </p>
              <h2
                className={`${styles.sectionTitle} ${styles.reveal}`}
                ref={(el) => addReveal(el, 21)}
                style={{ transitionDelay: "0.08s" }}
              >
                Engineered to get<br />past the robots.
              </h2>

              <div className={styles.templatesGrid}>
                {TEMPLATES.map((t, i) => (
                  <button
                    onClick={() => setShowBuilder(true)}
                    key={t.badge}
                    className={`${styles.templateCard} ${styles.reveal}`}
                    ref={(el) => addReveal(el, 23 + i)}
                    style={{ transitionDelay: `${0.1 + i * 0.12}s` }}
                  >
                    <span className={styles.templateBadge}>{t.badge}</span>
                    <div className={styles.templatePreview}>
                      {t.badge === "Minimalist" && (
                        <div className={styles.miniMinimalist}>
                          <div className={styles.mMiniName}>JOHN DOE</div>
                          <div className={styles.mMiniContact}>johndoe@email.com • (555) 123-4567</div>
                          <div className={styles.mMiniSection}>EXPERIENCE</div>
                          <div className={styles.mMiniItemTitle}>Senior Software Engineer</div>
                          <div className={styles.mMiniItemSubtitle}>Tech Corp • 2020 - Present</div>
                          <div className={styles.mMiniBullet}>• Developed high-performance web applications.</div>
                          <div className={styles.mMiniBullet}>• Led a team of 5 engineers to deliver features.</div>
                        </div>
                      )}
                      {t.badge === "Modern" && (
                        <div className={styles.miniModern}>
                          <div className={styles.miniModernLeft}>
                            <div className={styles.mMiniNameInv}>JOHN DOE</div>
                            <div className={styles.mMiniSectionInv}>CONTACT</div>
                            <div className={styles.mMiniBulletInv}>johndoe@email.com</div>
                            <div className={styles.mMiniBulletInv}>(555) 123-4567</div>
                          </div>
                          <div className={styles.miniModernRight}>
                            <div className={styles.mMiniSection}>EXPERIENCE</div>
                            <div className={styles.mMiniItemTitle}>Senior Software Engineer</div>
                            <div className={styles.mMiniItemSubtitle}>Tech Corp • 2020 - Present</div>
                            <div className={styles.mMiniBullet}>• Developed high-performance web apps.</div>
                            <div className={styles.mMiniBullet}>• Led a team of 5 engineers.</div>
                          </div>
                        </div>
                      )}
                      {t.badge === "ATS" && (
                        <div className={styles.miniAts}>
                          <div className={styles.aMiniName}>John Doe</div>
                          <div className={styles.aMiniContact}>johndoe@email.com | (555) 123-4567</div>
                          <div className={styles.aMiniSection}>Experience</div>
                          <div className={styles.aMiniRow}>
                            <span className={styles.aMiniItemTitle}>Senior Software Engineer</span>
                            <span className={styles.aMiniDate}>2020 - Present</span>
                          </div>
                          <div className={styles.aMiniItemSubtitle}>Tech Corp</div>
                          <div className={styles.aMiniBullet}>• Developed high-performance web applications.</div>
                          <div className={styles.aMiniBullet}>• Led a team of 5 engineers to deliver features.</div>
                        </div>
                      )}
                    </div>
                    <div className={styles.templateName}>{t.name}</div>
                    <div className={styles.templateDesc}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className={`${styles.section} ${styles.faqSection}`}>
            <div className={styles.sectionInner}>
              <div className={styles.faqGrid}>
                
                {/* Left Column: Heading Info */}
                <div className={styles.faqLeft}>
                  <p className={`${styles.sectionLabel} ${styles.reveal}`} ref={(el) => addReveal(el, 40)}>
                    FAQ
                  </p>
                  <h2 className={`${styles.sectionTitle} ${styles.reveal}`} ref={(el) => addReveal(el, 41)} style={{ transitionDelay: "0.08s" }}>
                    Common<br />questions.
                  </h2>
                  <p className={`${styles.faqSubtitle} ${styles.reveal}`} ref={(el) => addReveal(el, 42)} style={{ transitionDelay: "0.15s" }}>
                    Everything you need to know about formats, privacy, and how the AI builds your resume.
                  </p>
                </div>

                {/* Right Column: Accordion List */}
                <div className={styles.faqRight}>
                  {FAQS.map((faq, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div
                        key={i}
                        className={`${styles.faqRow} ${isOpen ? styles.faqRowOpen : ""}`}
                      >
                        <button
                          type="button"
                          className={styles.faqHeaderBtn}
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          aria-expanded={isOpen}
                        >
                          <span className={styles.faqQuestionText}>{faq.q}</span>
                          <ChevronDown className={`${styles.faqCaret} ${isOpen ? styles.faqCaretActive : ""}`} size={18} />
                        </button>
                        <div className={`${styles.faqAnswerWrapper} ${isOpen ? styles.faqAnswerVisible : ""}`}>
                          <p className={styles.faqAnswerText}>{faq.a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </section>

          {/* ── CTA BANNER ── */}
          <section className={styles.ctaBanner}>
            <div className={styles.ctaBannerBg} />
            <h2
              className={`${styles.ctaBannerTitle} ${styles.reveal}`}
              ref={(el) => addReveal(el, 50)}
            >
              Ready to land your next role?
            </h2>
            <p
              className={`${styles.ctaBannerSub} ${styles.reveal}`}
              ref={(el) => addReveal(el, 51)}
              style={{ transitionDelay: "0.1s" }}
            >
              No sign-up. No credit card. Just paste and go.
            </p>
            <button
              onClick={() => setShowBuilder(true)}
              className={`${styles.ctaBannerBtn} ${styles.reveal}`}
              ref={(el) => addReveal(el, 52)}
              style={{ transitionDelay: "0.2s" }}
            >
              Build My Resume — It&apos;s Free →
            </button>
          </section>

          {/* ── FOOTER ── */}
          <footer className={styles.footer}>
            <span className={styles.footerLogo}>promptly</span>
            <span className={styles.footerCopy}>© {new Date().getFullYear()} Promptly. Built with Gemini AI.</span>
          </footer>

        </div>
      </div>

      {/* ── BUILDER APP ── */}
      <div className={`${styles.builderView} ${showBuilder ? styles.slideInRight : ""}`}>
        {showBuilder && <BuilderApp onGoHome={() => setShowBuilder(false)} />}
      </div>
    </div>
  );
}
