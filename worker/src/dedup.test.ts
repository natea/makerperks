/**
 * Tests for the pre-submit duplicate detection (findDuplicate).
 *
 * Run: npm test   (node:test + type-stripping; no extra deps)
 *
 * findDuplicate's only side effect is fetching perks.json, so each test stubs
 * globalThis.fetch with a controlled dataset and asserts the match (or null).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { findDuplicate } from "./dedup.ts";

const PERKS_URL = "https://example.test/perks.json";

const DATASET = {
  programs: [
    {
      slug: "aws/aws-activate",
      title: "AWS Activate",
      provider: "aws",
      url: "https://aws.amazon.com/startups/credits",
    },
    {
      slug: "neon/neon-yc-startup-deal",
      title: "Neon YC Startup Deal",
      provider: "neon",
      url: "https://neon.tech/startups",
    },
  ],
};

/** Install a fetch stub; returns a restore fn. */
function stubFetch(impl: (url: string) => unknown) {
  const original = globalThis.fetch;
  // @ts-expect-error - minimal stub for tests
  globalThis.fetch = async (input: string) => impl(String(input));
  return () => {
    globalThis.fetch = original;
  };
}

function okJson(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

test("matches on same provider + title", async () => {
  const restore = stubFetch(() => okJson(DATASET));
  try {
    const dup = await findDuplicate(PERKS_URL, {
      url: "https://aws.amazon.com/anything-else",
      provider_slug: "aws",
      title: "AWS Activate",
    });
    assert.equal(dup?.reason, "provider+title");
    assert.equal(dup?.slug, "aws/aws-activate");
  } finally {
    restore();
  }
});

test("matches on title alone when provider differs", async () => {
  const restore = stubFetch(() => okJson(DATASET));
  try {
    const dup = await findDuplicate(PERKS_URL, {
      url: "https://other.example.com/x",
      provider_slug: "someone-else",
      title: "aws activate", // case-insensitive
    });
    assert.equal(dup?.reason, "title");
    assert.equal(dup?.provider, "aws");
  } finally {
    restore();
  }
});

test("matches on url domain + provider when titles differ", async () => {
  const restore = stubFetch(() => okJson(DATASET));
  try {
    const dup = await findDuplicate(PERKS_URL, {
      url: "https://www.neon.tech/some/other/page", // www. stripped, same host
      provider_slug: "neon",
      title: "Neon Serverless Postgres Credits", // different title
    });
    assert.equal(dup?.reason, "url-domain");
    assert.equal(dup?.slug, "neon/neon-yc-startup-deal");
  } finally {
    restore();
  }
});

test("returns null when nothing matches", async () => {
  const restore = stubFetch(() => okJson(DATASET));
  try {
    const dup = await findDuplicate(PERKS_URL, {
      url: "https://fly.io/startups",
      provider_slug: "fly",
      title: "Fly.io for Startups",
    });
    assert.equal(dup, null);
  } finally {
    restore();
  }
});

test("does not false-match a different domain with the same provider slug", async () => {
  const restore = stubFetch(() => okJson(DATASET));
  try {
    const dup = await findDuplicate(PERKS_URL, {
      url: "https://aws-impostor.example.com/credits", // different host
      provider_slug: "aws",
      title: "AWS Something Brand New", // different title
    });
    assert.equal(dup, null);
  } finally {
    restore();
  }
});

test("fails open (null) when perks.json can't be fetched", async () => {
  const restore = stubFetch(() => ({ ok: false, status: 503, json: async () => ({}) }));
  try {
    const dup = await findDuplicate(PERKS_URL, {
      url: "https://aws.amazon.com/startups/credits",
      provider_slug: "aws",
      title: "AWS Activate",
    });
    assert.equal(dup, null);
  } finally {
    restore();
  }
});
