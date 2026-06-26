import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content-collection schema for MakerPerks.
 *
 * Mirrors `src/program.schema.json` (the canonical JSON Schema, validated in CI by
 * scripts/validate-data.mjs). Base fields are ported from cloudcredits.io (MIT);
 * MakerPerks extends with audience / region / aggregator / unlocks / sources / verified.
 *
 * Keep this file and program.schema.json in lockstep.
 */

export const AUDIENCES = [
  "startup",
  "student",
  "oss",
  "indie",
  "ambassador",
  "nonprofit",
] as const;

export const SOURCE_IDS = [
  "cloudcredits.io",
  "linkedin-800k",
  "awesome-builder-programs",
  "awesome-student-developer-deals",
  "dakshshah96-awesome-startup-credits",
  "avinash201199-awesome-startup-credits",
  "cloudcommunity-free-for-nonprofits",
  "tresni-awesome-nonprofit",
  "dobroslav-awesome-startup-deals",
  "athman3-awesome-free-nonprofits",
  "makerperks",
] as const;

const slug = z
  .string()
  .regex(/^[a-z0-9-]+$/, "must be a lowercase slug (a-z, 0-9, -)");

const stepToApply = z.object({
  name: z.string(),
  description: z.string(),
  action: z.string().optional(),
  action_url: z.string().url().optional(),
});

const tier = z.object({
  name: z.string(),
  intro: z.string(),
  max_value: z.number(),
  url: z.string().url(),
  benefits: z.array(z.string()).max(5).default([]),
  benefits_level: z.number().min(1).max(4),
  duration: z.array(z.string()).max(5).default([]),
  eligibility: z.array(z.string()).max(5).default([]),
  effort_level: z.number().min(1).max(4),
  steps_to_apply: z.array(stepToApply).default([]),
});

const programs = defineCollection({
  loader: glob({ pattern: "**/*.{yaml,yml}", base: "./src/content/programs" }),
  schema: z.object({
    draft: z.boolean().default(false),
    provider_slug: slug,
    title: z.string(),
    meta_title: z.string().optional(),
    intro: z.string(),
    description: z.string(),
    // Neutral, noun-first "what it is" line shown on cards. ≤120 chars.
    // Optional during rollout; cards fall back to a truncated intro when absent.
    summary: z.string().max(120).optional(),
    status: z
      .enum(["Active", "Discontinued", "Beta", "Upcoming"])
      .default("Active"),
    tags: z.array(z.string()).max(5).default([]),
    url: z.string().url(),
    value_type: z.enum(["credits", "discount", "free_tier"]).default("credits"),
    currency: z.enum(["USD", "EUR", "GBP"]).default("USD"),
    min_value: z.number().optional(),
    max_value: z.number(),
    community_notes: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
          source_url: z.string().url(),
        }),
      )
      .max(3)
      .default([]),
    tiers: z.array(tier).default([]),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .default([]),

    // --- MakerPerks extensions ---
    audience: z.array(z.enum(AUDIENCES)).min(1),
    region: z.string().default("global"),
    aggregator: z.boolean().default(false),
    unlocks: z.array(slug).default([]),
    sources: z.array(z.enum(SOURCE_IDS)).min(1),
    // YAML may parse an unquoted date as a JS Date; normalize to YYYY-MM-DD.
    verified: z.preprocess(
      (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
    ),
  }),
});

const providers = defineCollection({
  loader: glob({ pattern: "**/*.{yaml,yml}", base: "./src/content/providers" }),
  schema: z.object({
    slug: slug,
    name: z.string(),
    url: z.string().url().optional(),
    logo: z.string().optional(),
  }),
});

export const collections = { programs, providers };
