import type { Audience } from "./programs";

export interface PersonaMeta {
  id: Audience;
  label: string; // "Students"
  noun: string; // "a student"
  tagline: string;
  /** How eligibility is typically proven. */
  verify: string;
  /** provider_slug of the umbrella gateway to surface first, if any. */
  gateway?: string;
}

export const PERSONAS: PersonaMeta[] = [
  {
    id: "startup",
    label: "Startups",
    noun: "a startup",
    tagline: "Cloud, AI, and infra credits to extend your runway.",
    verify: "Company website · accelerator / VC affiliation for higher tiers",
    gateway: "ycombinator",
  },
  {
    id: "student",
    label: "Students",
    noun: "a student",
    tagline:
      "Free developer tools, learning, and design — verified with your school.",
    verify: ".edu email · SheerID",
    gateway: "github",
  },
  {
    id: "oss",
    label: "Open source",
    noun: "an OSS maintainer",
    tagline: "Free tiers and grants for your public projects.",
    verify: "A public repo with active contributions",
  },
  {
    id: "indie",
    label: "Indie devs",
    noun: "an indie developer",
    tagline: "Generous free tiers solo builders actually live on.",
    verify: "No verification — just sign up",
  },
  {
    id: "ambassador",
    label: "Ambassadors",
    noun: "an ambassador",
    tagline: "API credits for developer advocates and community leaders.",
    verify: "Program application",
  },
  {
    id: "nonprofit",
    label: "Non-profits",
    noun: "a non-profit",
    tagline: "Donated and deeply discounted software for your mission.",
    verify: "501(c)(3) letter · TechSoup",
    gateway: "techsoup",
  },
];

export const personaById = (id: Audience): PersonaMeta =>
  PERSONAS.find((p) => p.id === id)!;
