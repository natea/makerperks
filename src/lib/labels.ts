/**
 * Display label for a tag or provider slug. CSS `text-transform: capitalize` can't
 * produce acronyms (AWS, GCP, API) or mixed-case brands (OpenAI, GitHub), so map the
 * known ones here; everything else falls back to title case. The fallback turns
 * hyphens into spaces, which is right for provider slugs (`meteor-cloud` →
 * "Meteor Cloud"); hyphenated tags that must keep their hyphen (`no-code`) are listed
 * as overrides.
 */
const OVERRIDES: Record<string, string> = {
  // category-tag acronyms / casing
  ai: "AI",
  api: "API",
  ml: "ML",
  llm: "LLM",
  gpu: "GPU",
  cdn: "CDN",
  crm: "CRM",
  cdp: "CDP",
  kyc: "KYC",
  hr: "HR",
  seo: "SEO",
  oss: "OSS",
  saas: "SaaS",
  b2b: "B2B",
  iac: "IaC",
  "ci/cd": "CI/CD",
  devops: "DevOps",
  "no-code": "No-Code",
  "low-code": "Low-Code",
  "e-commerce": "E-Commerce",
  "e-signature": "E-Signature",
  "3d": "3D",
  web3: "Web3",
  // provider brands
  aws: "AWS",
  gcp: "GCP",
  ibm: "IBM",
  openai: "OpenAI",
  xai: "xAI",
  github: "GitHub",
  gitlab: "GitLab",
  mongodb: "MongoDB",
  cockroachdb: "CockroachDB",
  tidb: "TiDB",
  datastax: "DataStax",
  "1password": "1Password",
  llamaindex: "LlamaIndex",
  assemblyai: "AssemblyAI",
  elevenlabs: "ElevenLabs",
  clickup: "ClickUp",
  ionq: "IonQ",
  heygen: "HeyGen",
  playai: "PlayAI",
  browseai: "BrowseAI",
  scraperapi: "ScraperAPI",
  posthog: "PostHog",
  digitalocean: "DigitalOcean",
  ovh: "OVHcloud",
  mlh: "MLH",
  n8n: "n8n",
  otc: "OTC",
  huggingface: "Hugging Face",
  googleads: "Google Ads",
  ycombinator: "Y Combinator",
  blockpi: "BlockPI",
};

/** Proper display casing for a tag or provider slug. */
export function label(slug: string): string {
  const key = (slug ?? "").toLowerCase().trim();
  if (OVERRIDES[key]) return OVERRIDES[key];
  return key.replace(/-/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
