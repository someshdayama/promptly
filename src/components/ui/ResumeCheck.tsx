"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./ResumeCheck.module.css";
import { ResumeData } from "@/types/resume";
import { analyzeResume } from "@/utils/resumeQuality";

interface ResumeCheckProps {
  resumeData: ResumeData;
}

/**
 * Local (no AI) checks on the current resume: buzzwords, missing scope,
 * overlong bullets and summary. Shown as one line that opens for details.
 */
export default function ResumeCheck({ resumeData }: ResumeCheckProps) {
  const report = useMemo(() => analyzeResume(resumeData), [resumeData]);
  const warningCount =
    report.summaryIssues.filter((i) => i.severity === "warning").length +
    report.bullets.filter((b) => b.issues.some((i) => i.severity === "warning")).length;
  const allClear = report.flaggedCount === 0 && report.summaryIssues.length === 0;

  const status = allClear
    ? "All clear"
    : warningCount > 0
      ? `${warningCount} to fix · ${report.flaggedCount} of ${report.bulletCount} bullets flagged`
      : `${report.flaggedCount} of ${report.bulletCount} bullets could be sharper`;

  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>
        <h2 className={styles.title}>Resume check</h2>
        <span className={styles.status}>{status}</span>
        <ChevronDown size={16} className={styles.caret} aria-hidden="true" />
      </summary>

      <div className={styles.body}>
        <p className={styles.hint}>
          Plain verbs and real numbers (team size, users, %) read better than buzzwords. Click any line on the page to change it.
        </p>

        {allClear && <p className={styles.ok}>No buzzwords, and every bullet has a concrete detail.</p>}

        {report.summaryIssues.length > 0 && (
          <ul className={styles.list}>
            {report.summaryIssues.map((issue, i) => (
              <li key={i} className={styles.issue}><span>Summary: {issue.message}</span></li>
            ))}
          </ul>
        )}

        {report.bullets.length > 0 && (
          <ul className={styles.list}>
            {report.bullets.map((b) => {
              const job = resumeData.experience[b.jobIndex];
              return (
                <li key={`${b.jobIndex}-${b.bulletIndex}`} className={styles.bullet}>
                  <div className={styles.bulletMeta}>{job?.position}{job?.company ? ` · ${job.company}` : ""}</div>
                  <q className={styles.bulletText}>{b.text}</q>
                  <ul className={styles.subList}>
                    {b.issues.map((issue) => (
                      <li key={issue.code} className={styles.issue}><span>{issue.message}</span></li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}

        {report.tips.length > 0 && (
          <ul className={styles.list}>
            {report.tips.map((tip, i) => (
              <li key={i} className={styles.issue}><span>{tip}</span></li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
