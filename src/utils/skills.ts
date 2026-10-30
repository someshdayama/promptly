import { ResumeData, SkillGroup } from "@/types/resume";

/**
 * Keyword → category map used to auto-group a flat skills list.
 * Order matters: the first matching category wins.
 */
const CATEGORY_RULES: { category: string; pattern: RegExp }[] = [
  { category: "Cloud", pattern: /^(aws|amazon web services|gcp|google cloud|azure|oci|oracle cloud|digitalocean|heroku|vercel|netlify|cloudflare|ec2|s3|lambda|vpc)\b/i },
  { category: "CI/CD", pattern: /(github actions|gitlab|jenkins|circleci|travis|argo ?cd|spinnaker|maven|gradle|bitbucket|^git$|ci\/cd|teamcity|bamboo|tekton)/i },
  { category: "Containers & IaC", pattern: /(kubernetes|k8s|gke|eks|aks|docker|helm|terraform|ansible|pulumi|cloudformation|chef|puppet|openshift|podman|istio)/i },
  { category: "Monitoring", pattern: /(prometheus|grafana|datadog|new relic|splunk|elk|elastic|kibana|loki|opentelemetry|pagerduty|nagios|zabbix|cloudwatch|sentry|dynatrace)/i },
  { category: "Languages", pattern: /^(python|java|javascript|typescript|go|golang|rust|c|c\+\+|c#|ruby|php|kotlin|swift|scala|groovy|bash|shell|linux shell|powershell|sql|r|perl|dart)$/i },
  { category: "Frameworks", pattern: /(react|next\.?js|angular|vue|svelte|node\.?js|express|django|flask|fastapi|spring|rails|laravel|\.net|tailwind)/i },
  { category: "Data", pattern: /(postgres|mysql|mongodb|redis|kafka|spark|hadoop|snowflake|bigquery|dynamodb|cassandra|elasticsearch|airflow|dbt)/i },
  { category: "Delivery & AI", pattern: /(agile|scrum|kanban|jira|confluence|safe|release train|llm|openai|gemini|machine learning|\bml\b|\bai\b|genai|langchain)/i },
];

export const OTHER_CATEGORY = "Other";

export function categorizeSkill(skill: string): string {
  const s = skill.trim();
  const rule = CATEGORY_RULES.find((r) => r.pattern.test(s));
  return rule ? rule.category : OTHER_CATEGORY;
}

/** Groups a flat skills list by category, keeping category and item order stable. */
export function autoGroupSkills(skills: string[]): SkillGroup[] {
  const map = new Map<string, string[]>();
  for (const raw of skills) {
    const skill = raw.trim();
    if (!skill) continue;
    const category = categorizeSkill(skill);
    if (!map.has(category)) map.set(category, []);
    map.get(category)!.push(skill);
  }
  const ordered = [...CATEGORY_RULES.map((r) => r.category), OTHER_CATEGORY];
  return ordered
    .filter((c) => map.has(c))
    .map((category) => ({ category, items: map.get(category)! }));
}

/**
 * Returns the skill groups to render, or null when the skills should be shown
 * as a simple flat list.
 *
 * - Explicit `skillGroups` always win.
 * - A flat list is auto-grouped only when it is long enough to benefit and most
 *   skills land in a known category; otherwise grouping would look forced.
 */
export function getSkillGroups(data: Pick<ResumeData, "skills" | "skillGroups">): SkillGroup[] | null {
  const explicit = (data.skillGroups || [])
    .map((g) => ({ category: (g.category || "").trim(), items: (g.items || []).map((i) => i.trim()).filter(Boolean) }))
    .filter((g) => g.items.length > 0);
  if (explicit.length > 0) return explicit;

  const skills = (data.skills || []).filter((s) => s && s.trim());
  if (skills.length < 8) return null;
  const groups = autoGroupSkills(skills);
  const known = groups.filter((g) => g.category !== OTHER_CATEGORY);
  const otherCount = groups.find((g) => g.category === OTHER_CATEGORY)?.items.length || 0;
  if (known.length < 2 || otherCount > skills.length / 2) return null;
  return groups;
}

/** Parses "a, b, c" (or "a • b") into a clean list. */
export function parseSkillList(text: string): string[] {
  return text
    .split(/[•,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
