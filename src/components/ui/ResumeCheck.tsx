"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import styles from "./ResumeCheck.module.css";
import { ResumeData } from "@/types/resume";
import { analyzeResume } from "@/utils/resumeQuality";

interface ResumeCheckProps {
  resumeData: ResumeData;
}

/**
 * Local (no AI) checks on the current resume: buzzwords, missing scope,
 * overlong bullets and summary, and layout tips.
 */
export default function ResumeCheck({ resumeData }: ResumeCheckProps) {
  const report = useMemo(() => analyzeResume(resumeData), [resumeData]);
  const warningCount =
    report.summaryIssues.filter((i) => i.severity === "warning").length +
    report.bullets.filter((b) => b.issues.some((i) => i.severity === "warning")).length;
  const allClear = report.flaggedCount === 0 && report.summaryIssues.length === 0;

  return (
    <section className={styles.panel} aria-labelledby="resume-check-title">
      <div className={styles.header}>
        <h2 id="resume-check-title" className={styles.title}>Resume check</h2>
        <span className={`${styles.badge} ${warningCount > 0 ? styles.badgeWarn : styles.badgeOk}`}>
          {allClear
            ? "All clear"
            : warningCount > 0
              ? `${warningCount} to fix · ${report.flaggedCount} of ${report.bulletCount} bullets flagged`
              : `${report.flaggedCount} of ${report.bulletCount} bullets could be sharper`}
        </span>
      </div>
      <p className={styles.hint}>
        Plain verbs and concrete scope (team size, %, users, systems) read better than buzzwords.
        Click any text in the preview to edit it.
      </p>

      {allClear && (
        <p className={styles.ok}>
          <CheckCircle2 size={14} aria-hidden="true" /> No buzzwords, every bullet has concrete scope.
        </p>
      )}

      {report.summaryIssues.length > 0 && (
        <ul className={styles.list}>
          {report.summaryIssues.map((issue, i) => (
            <li key={i} className={styles.issue}>
              <IssueIcon severity={issue.severity} />
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}

      {report.bullets.length > 0 && (
        <details className={styles.details} open={report.bullets.length <= 4}>
          <summary>Flagged bullets ({report.bullets.length})</summary>
          <ul className={styles.list}>
            {report.bullets.map((b) => {
              const job = resumeData.experience[b.jobIndex];
              return (
                <li key={`${b.jobIndex}-${b.bulletIndex}`} className={styles.bullet}>
                  <div className={styles.bulletMeta}>{job?.position}{job?.company ? ` · ${job.company}` : ""}</div>
                  <q className={styles.bulletText}>{b.text}</q>
                  <ul className={styles.subList}>
                    {b.issues.map((issue) => (
                      <li key={issue.code} className={styles.issue}>
                        <IssueIcon severity={issue.severity} />
                        <span>{issue.message}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {report.tips.length > 0 && (
        <ul className={styles.list}>
          {report.tips.map((tip, i) => (
            <li key={i} className={styles.issue}>
              <Info size={14} aria-hidden="true" className={styles.iconInfo} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IssueIcon({ severity }: { severity: "warning" | "info" }) {
  return severity === "warning" ? (
    <AlertTriangle size={14} className={styles.iconWarn} aria-label="Warning" />
  ) : (
    <Info size={14} className={styles.iconInfo} aria-label="Suggestion" />
  );
}
