import styles from "./SiteFooter.module.css";

const STEPS = [
  { title: "Paste", text: "Your old resume, your LinkedIn profile, or plain notes about your work. Any format is fine." },
  { title: "Make", text: "Google Gemini sorts it into a one-page resume using only what you wrote. Add a job post to put the most relevant work first." },
  { title: "Fix and download", text: "Click any line on the page to change it, pick a layout, then download a PDF." },
];

export const FAQS = [
  {
    q: "What happens to my text?",
    a: "When you tap Make my resume, your text (and the job post, if you add one) is sent to Google Gemini to write the resume. Promptly does not keep it on a server. Your notes and resume are saved only in this browser so they are still here when you come back. Clear removes them. Google's own terms apply to what it receives.",
  },
  {
    q: "Will it make things up?",
    a: "It is told to use only what you wrote and to leave out anything you did not give, like a missing start date. AI can still get things wrong, so read every line before you send it.",
  },
  {
    q: "Can resume-reading software read the PDF?",
    a: "The PDF is real text, not a picture, so software that reads resumes can pull the words out. The ATS layout is the plainest of the three.",
  },
  {
    q: "One page or more?",
    a: "Your choice. One page sizes the text and spacing so the page is filled. If it's too long for readable text on one page, it moves on to a second page. Multi-page keeps the normal size and adds pages as needed.",
  },
  {
    q: "Do I need an account?",
    a: "No. There is no sign-up and nothing to pay.",
  },
];

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <section aria-labelledby="how-title">
          <h2 id="how-title" className={styles.heading}>How it works</h2>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.title} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.text}>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.heading}>Questions</h2>
          <div className={styles.faqs}>
            {FAQS.map((f) => (
              <details key={f.q} className={styles.faq}>
                <summary className={styles.question}>{f.q}</summary>
                <p className={styles.text}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} Promptly</p>
    </footer>
  );
}
