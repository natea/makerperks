/**
 * Curated reconciliation seed for MakerPerks.
 *
 * Drawn from the locked community source lists (see NOTICE.md), scope-fenced to
 * builder + dev-adjacent perks. Consumer/lifestyle deals are intentionally absent.
 *
 * MERGES add persona/provenance to existing cloudcredits.io records (matched by
 * provider_slug + optional titleHint). ADDITIONS create the non-startup and
 * aggregator programs cloudcredits.io does not carry.
 *
 * The long tail of programs continues to arrive via community PRs (per proposal).
 */

const TODAY = "2026-06-25"; // date these records were curated from the source lists

export const MERGES = [
  // provider already startup-only in cloudcredits; source lists show wider reach.
  {
    provider_slug: "cloudflare",
    audience: ["oss"],
    sources: ["awesome-student-developer-deals"],
  },
  {
    provider_slug: "digitalocean",
    audience: ["student"],
    sources: ["awesome-builder-programs", "awesome-student-developer-deals"],
  },
  {
    provider_slug: "mongodb",
    audience: ["student"],
    sources: ["awesome-student-developer-deals"],
  },
  {
    provider_slug: "jetbrains",
    audience: ["student"],
    sources: ["awesome-builder-programs", "awesome-student-developer-deals"],
  },
  {
    provider_slug: "gitlab",
    audience: ["student", "oss"],
    sources: ["awesome-builder-programs"],
  },
  {
    provider_slug: "notion",
    audience: ["student", "nonprofit"],
    sources: ["awesome-student-developer-deals"],
  },
  {
    provider_slug: "sentry",
    audience: ["oss"],
    sources: ["awesome-student-developer-deals"],
  },
  {
    provider_slug: "1password",
    audience: ["oss"],
    sources: ["awesome-builder-programs", "tresni-awesome-nonprofit"],
  },
  {
    provider_slug: "miro",
    audience: ["student", "nonprofit"],
    sources: ["awesome-student-developer-deals"],
  },
  {
    provider_slug: "airtable",
    audience: ["nonprofit"],
    sources: ["tresni-awesome-nonprofit"],
  },
  {
    provider_slug: "mailchimp",
    audience: ["nonprofit"],
    sources: ["tresni-awesome-nonprofit", "cloudcommunity-free-for-nonprofits"],
  },
  {
    provider_slug: "zapier",
    audience: ["nonprofit"],
    sources: ["cloudcommunity-free-for-nonprofits"],
  },
  {
    provider_slug: "zendesk",
    audience: ["nonprofit"],
    sources: ["cloudcommunity-free-for-nonprofits"],
  },
  {
    provider_slug: "atlassian",
    audience: ["nonprofit"],
    sources: ["tresni-awesome-nonprofit", "cloudcommunity-free-for-nonprofits"],
  },
  {
    provider_slug: "unity",
    audience: ["student"],
    sources: ["awesome-student-developer-deals"],
  },
  {
    provider_slug: "cursor",
    audience: ["student"],
    sources: ["awesome-builder-programs"],
  },
  // generous free tiers that solo / indie builders rely on day-to-day.
  {
    provider_slug: "neon",
    audience: ["indie"],
    sources: ["awesome-student-developer-deals"],
  },
  {
    provider_slug: "appwrite",
    audience: ["indie"],
    sources: ["awesome-builder-programs"],
  },
  {
    provider_slug: "browserless",
    audience: ["indie"],
    sources: ["awesome-builder-programs"],
  },
  {
    provider_slug: "qdrant",
    audience: ["indie"],
    sources: ["awesome-builder-programs"],
  },
  {
    provider_slug: "posthog",
    audience: ["indie"],
    sources: ["awesome-builder-programs"],
  },
  // aggregators that already exist as records.
  {
    provider_slug: "stripe-atlas",
    aggregator: true,
    unlocks: ["aws", "openai", "mongodb"],
    sources: [
      "dakshshah96-awesome-startup-credits",
      "avinash201199-awesome-startup-credits",
    ],
    audience: ["startup"],
  },
];

/** Helper to cut record boilerplate. */
const rec = (o) => ({
  region: "global",
  verified: TODAY,
  status: "Active",
  ...o,
});

export const ADDITIONS = [
  // ---- Students ----
  rec({
    provider_slug: "github",
    slug: "github-student-developer-pack",
    title: "GitHub Student Developer Pack",
    intro:
      "Free access to 100+ developer tools, cloud credits, and domains for verified students.",
    description:
      "The GitHub Student Developer Pack bundles free and discounted access to dozens of developer tools — GitHub Pro, cloud credits, domains, IDEs, and more — for students verified via SheerID or a school email. It is the single highest-leverage starting point for student builders.",
    url: "https://education.github.com/pack",
    value_type: "free_tier",
    max_value: 200,
    tags: ["dev tools", "students"],
    audience: ["student"],
    aggregator: true,
    unlocks: ["digitalocean", "mongodb", "namecheap", "heroku"],
    sources: ["awesome-builder-programs", "awesome-student-developer-deals"],
  }),
  rec({
    provider_slug: "figma",
    slug: "figma-for-education",
    title: "Figma for Education",
    intro: "Free Figma Professional plan for verified students and educators.",
    description:
      "Figma for Education gives verified students and teachers the Professional plan for free, including unlimited projects, version history, and team libraries.",
    url: "https://www.figma.com/education/",
    value_type: "free_tier",
    max_value: 144,
    tags: ["design", "students"],
    audience: ["student"],
    sources: ["awesome-builder-programs", "awesome-student-developer-deals"],
  }),
  rec({
    provider_slug: "mlh",
    slug: "mlh-fellowship",
    title: "MLH Fellowship",
    intro:
      "12-week remote program with a stipend, building open-source projects.",
    description:
      "The Major League Hacking Fellowship is a 12-week remote internship alternative where students contribute to open-source projects with mentorship and a stipend.",
    url: "https://fellowship.mlh.io/",
    value_type: "free_tier",
    max_value: 0,
    tags: ["learning", "oss", "students"],
    audience: ["student", "oss"],
    sources: ["awesome-builder-programs"],
  }),
  rec({
    provider_slug: "google",
    slug: "google-summer-of-code",
    title: "Google Summer of Code",
    intro: "Stipend and mentorship for students contributing to open source.",
    description:
      "Google Summer of Code pairs students and new contributors with open-source organizations for a mentored, stipended contribution program.",
    url: "https://summerofcode.withgoogle.com/",
    value_type: "free_tier",
    max_value: 0,
    tags: ["learning", "oss", "students"],
    audience: ["student", "oss"],
    sources: ["awesome-builder-programs"],
  }),
  rec({
    provider_slug: "zed",
    slug: "zed-student-plan",
    title: "Zed Student Plan",
    intro: "All Zed Pro features free for 12 months for students.",
    description:
      "Zed's student plan unlocks every Zed Pro feature free for 12 months for verified students.",
    url: "https://zed.dev/education",
    value_type: "free_tier",
    max_value: 0,
    tags: ["dev tools", "students"],
    audience: ["student"],
    sources: ["awesome-builder-programs"],
  }),

  // ---- Open Source ----
  rec({
    provider_slug: "anthropic",
    slug: "claude-for-open-source",
    title: "Claude for Open Source",
    intro: "Six months of Claude Max access for open-source maintainers.",
    description:
      "Anthropic offers open-source maintainers extended Claude Max access to support their projects.",
    url: "https://claude.com/contact-sales/claude-for-oss",
    value_type: "free_tier",
    max_value: 0,
    tags: ["ai", "oss"],
    audience: ["oss"],
    sources: ["awesome-builder-programs"],
  }),
  rec({
    provider_slug: "upstash",
    slug: "upstash-for-open-source",
    title: "Upstash for Open Source",
    intro: "$1,000/month credit grant for open-source projects.",
    description:
      "Upstash grants open-source projects a monthly credit toward its serverless Redis and Kafka offerings.",
    url: "https://upstash.com/open-source",
    value_type: "credits",
    currency: "USD",
    max_value: 1000,
    tags: ["data", "oss"],
    audience: ["oss"],
    sources: ["awesome-builder-programs"],
  }),
  rec({
    provider_slug: "vercel",
    slug: "vercel-for-open-source",
    title: "Vercel Pro for Open Source",
    intro: "Free Vercel Pro plan for qualifying open-source projects.",
    description:
      "Vercel offers free Pro-plan hosting and collaboration features for eligible open-source projects, plus startup credits.",
    url: "https://vercel.com/guides/can-i-get-vercel-pro-for-open-source",
    value_type: "free_tier",
    max_value: 240,
    tags: ["cloud", "oss"],
    audience: ["oss", "startup"],
    sources: ["awesome-student-developer-deals"],
  }),

  // ---- AI credits (startup, seed) ----
  rec({
    provider_slug: "huggingface",
    slug: "hugging-face-for-startups",
    title: "Hugging Face for Startups",
    intro:
      "Discounted/credited compute, Spaces, and Inference Endpoints for startups.",
    description:
      "Hugging Face supports AI startups with infrastructure credits and access to Spaces and Inference Endpoints. (The viral LinkedIn post linked /enterprise; the correct program page is /startups.)",
    url: "https://huggingface.co/startups",
    value_type: "credits",
    currency: "USD",
    max_value: 0,
    tags: ["ai"],
    audience: ["startup"],
    sources: ["linkedin-800k", "awesome-builder-programs"],
  }),
  rec({
    provider_slug: "anthropic",
    slug: "anthropic-startup-program",
    title: "Anthropic Startup Program",
    intro: "Up to ~$25,000 in Claude API credits for AI startups.",
    description:
      "The Anthropic Startup Program provides Claude API credits, priority rate limits, and early model access to qualifying AI startups, typically those backed by Anthropic's VC partners.",
    url: "https://claude.com/programs/startups",
    value_type: "credits",
    currency: "USD",
    max_value: 25000,
    tags: ["ai"],
    audience: ["startup"],
    sources: ["linkedin-800k", "awesome-builder-programs"],
  }),

  // ---- Non-profit ----
  rec({
    provider_slug: "techsoup",
    slug: "techsoup",
    title: "TechSoup",
    intro:
      "Donated and deeply discounted software for verified non-profits — the non-profit gateway.",
    description:
      "TechSoup validates 501(c)(3) status and distributes donated or low-cost software, hardware, and cloud services from major vendors (Microsoft, Google, Adobe, Bitdefender, and more). It is the umbrella verifier most non-profit tech perks route through.",
    url: "https://www.techsoup.org/",
    value_type: "free_tier",
    max_value: 0,
    tags: ["nonprofit"],
    audience: ["nonprofit"],
    aggregator: true,
    unlocks: ["google", "microsoft", "atlassian"],
    sources: [
      "tresni-awesome-nonprofit",
      "cloudcommunity-free-for-nonprofits",
      "athman3-awesome-free-nonprofits",
    ],
  }),
  rec({
    provider_slug: "google",
    slug: "google-for-nonprofits",
    title: "Google for Nonprofits",
    intro:
      "Free Google Workspace, $10K/mo Ad Grants, and Cloud credits for non-profits.",
    description:
      "Google for Nonprofits gives eligible 501(c)(3) organizations free Google Workspace, up to $10,000/month in Google Ad Grants, YouTube nonprofit features, and Cloud credits.",
    url: "https://www.google.com/nonprofits/",
    value_type: "credits",
    currency: "USD",
    max_value: 120000,
    tags: ["productivity", "nonprofit"],
    audience: ["nonprofit"],
    sources: ["tresni-awesome-nonprofit", "cloudcommunity-free-for-nonprofits"],
  }),
  rec({
    provider_slug: "microsoft",
    slug: "microsoft-for-nonprofits",
    title: "Microsoft for Nonprofits",
    intro:
      "$2,000/yr Azure credits plus discounted Microsoft 365 for non-profits.",
    description:
      "Microsoft for Nonprofits provides eligible organizations with annual Azure credits, discounted Microsoft 365, and onboarding support via a nonprofit concierge.",
    url: "https://www.microsoft.com/en-us/nonprofits/offers-for-nonprofits",
    value_type: "credits",
    currency: "USD",
    max_value: 2000,
    tags: ["cloud", "nonprofit"],
    audience: ["nonprofit"],
    sources: ["tresni-awesome-nonprofit", "cloudcommunity-free-for-nonprofits"],
  }),
  rec({
    provider_slug: "salesforce",
    slug: "salesforce-for-nonprofits",
    title: "Salesforce for Nonprofits",
    intro: "10 free Nonprofit Cloud CRM licenses plus discounts.",
    description:
      "Salesforce gives eligible non-profits 10 free Nonprofit Cloud CRM subscriptions plus discounts on additional licenses and products.",
    url: "https://www.salesforce.org/nonprofit/",
    value_type: "free_tier",
    max_value: 0,
    tags: ["saas", "nonprofit"],
    audience: ["nonprofit"],
    sources: ["tresni-awesome-nonprofit"],
  }),
  rec({
    provider_slug: "canva",
    slug: "canva-for-education-and-nonprofits",
    title: "Canva for Education & Nonprofits",
    intro: "Free Canva Pro for verified students, teachers, and non-profits.",
    description:
      "Canva provides free Pro access — brand kits, background remover, premium templates — to verified students and educators and to registered 501(c)(3) non-profits.",
    url: "https://www.canva.com/canva-for-nonprofits/",
    value_type: "free_tier",
    max_value: 120,
    tags: ["design", "students", "nonprofit"],
    audience: ["student", "nonprofit"],
    sources: ["awesome-student-developer-deals", "tresni-awesome-nonprofit"],
  }),

  // ---- Ambassador ----
  rec({
    provider_slug: "anthropic",
    slug: "claude-code-ambassadors",
    title: "Claude Code Ambassadors",
    intro: "API credits for community ambassadors.",
    description:
      "Anthropic's ambassador program provides API credits and community support to developer advocates building with Claude Code.",
    url: "https://claude.com/community/ambassadors",
    value_type: "credits",
    currency: "USD",
    max_value: 0,
    tags: ["ai", "ambassador"],
    audience: ["ambassador"],
    sources: ["awesome-builder-programs"],
  }),
  rec({
    provider_slug: "qwen",
    slug: "qwen-ambassadors",
    title: "Qwen Ambassadors",
    intro: "API credits for Qwen community ambassadors.",
    description:
      "Alibaba's Qwen ambassador program offers API credits to developer advocates building with Qwen models.",
    url: "https://qwen.ai/ambassador",
    value_type: "credits",
    currency: "USD",
    max_value: 0,
    tags: ["ai", "ambassador"],
    audience: ["ambassador"],
    sources: ["awesome-builder-programs"],
  }),

  // ---- Startup aggregators (credit cascades) ----
  rec({
    provider_slug: "brex",
    slug: "brex",
    title: "Brex",
    intro: "Business account that unlocks AWS, OpenAI, and 100+ SaaS credits.",
    description:
      "Opening a Brex business account unlocks an extensive partner-perks network — AWS and OpenAI credits plus discounts across 100+ SaaS tools. A common first step for stacking startup credits.",
    url: "https://www.brex.com/",
    value_type: "credits",
    currency: "USD",
    max_value: 0,
    tags: ["fintech"],
    audience: ["startup"],
    aggregator: true,
    unlocks: ["aws", "openai"],
    sources: ["avinash201199-awesome-startup-credits"],
  }),
  rec({
    provider_slug: "ramp",
    slug: "ramp",
    title: "Ramp",
    intro: "Business account that unlocks AWS, OpenAI, and 100+ SaaS credits.",
    description:
      "Ramp's business account unlocks a large partner-perks network including AWS and OpenAI credits and SaaS discounts — similar to Brex.",
    url: "https://ramp.com/",
    value_type: "credits",
    currency: "USD",
    max_value: 0,
    tags: ["fintech"],
    audience: ["startup"],
    aggregator: true,
    unlocks: ["aws", "openai"],
    sources: ["avinash201199-awesome-startup-credits"],
  }),
  rec({
    provider_slug: "mercury",
    slug: "mercury",
    title: "Mercury",
    intro: "Startup banking that unlocks GitHub, AWS, and partner perks.",
    description:
      "Mercury's business banking unlocks partner perks including a year of free GitHub, AWS credits, and more — friendlier for pre-funded founders with no minimum.",
    url: "https://mercury.com/",
    value_type: "credits",
    currency: "USD",
    max_value: 0,
    tags: ["fintech"],
    audience: ["startup"],
    aggregator: true,
    unlocks: ["github", "aws"],
    sources: ["avinash201199-awesome-startup-credits"],
  }),
  rec({
    provider_slug: "ycombinator",
    slug: "y-combinator",
    title: "Y Combinator",
    intro: "Accelerator that unlocks $1M+ in combined partner deals.",
    description:
      "Joining Y Combinator unlocks the highest credit tiers across cloud and SaaS providers — over $1M in combined partner deals — plus funding and network.",
    url: "https://www.ycombinator.com/",
    value_type: "credits",
    currency: "USD",
    max_value: 500000,
    tags: ["accelerator"],
    audience: ["startup"],
    aggregator: true,
    unlocks: ["aws", "azure", "gcp", "openai"],
    sources: [
      "awesome-builder-programs",
      "avinash201199-awesome-startup-credits",
    ],
  }),
];
