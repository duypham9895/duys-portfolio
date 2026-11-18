export interface Social {
  readonly title: string;
  readonly url: string;
  readonly icon: string;
}

export interface HowIWork {
  readonly title: string;
  readonly body: string;
}

export interface About {
  readonly opener: string;
  readonly howIWork: readonly HowIWork[];
}

export interface Personal {
  readonly fullName: string;
  readonly title: string;
  readonly positioning: string;
  readonly location: string;
  readonly languages: readonly string[];
  readonly education: string;
  readonly about: About;
  readonly contact: {
    readonly location: string;
    readonly email: string;
    readonly phone: string;
  };
  readonly socials: readonly Social[];
  readonly resumeUrl: string;
}

export const personal: Personal = {
  fullName: "Duy Pham",
  title: "Product Manager",
  positioning:
    "Ex-software engineer shipping B2B AI agents, partner APIs, and digital lending products in Indonesian mortgage (KPR) fintech. Targeting Technical Product Manager roles.",
  location:
    "Based in Ho Chi Minh City, Vietnam · Hybrid, Remote, or International Relocation (Visa Sponsorship)",
  languages: ["Vietnamese (Native)", "English (Professional working)"],
  education: "Ton Duc Thang University · Software Engineering (Undergraduate coursework, non-degree)",
  about: {
    opener:
      "I wrote production backend and ML code for 3.5+ years at Bizzi and Ringkas before moving into product at Ringkas in Aug 2024 — 5+ years in fintech and B2B SaaS overall.",
    howIWork: [
      {
        title: "Debug the cause before buying a tool.",
        body: "When OCR failed ~60% of the time, I traced the image pipeline in parallel with a second-vendor PRD. Fixing an auth bug and two resize regressions lifted success from ~40% to ~89%. We kept the existing vendor and dropped the new contract.",
      },
      {
        title: "Put hard ceilings on cost and risk.",
        body: "Ringkas's AI Financial Assistant rolled out in three feature-flagged phases behind spend caps. Anonymous visitors hit strict daily and global limits; signed-in borrowers get higher quotas. That capped LLM bills and gave users a clear reason to register.",
      },
      {
        title: "Speak both payload and business.",
        body: "I work across engineering in Vietnam and business teams in Indonesia and Saudi Arabia. I build workflow prototypes so engineers see edge cases before Design polishes visuals, test live partner APIs against specs, and align Engineering, AI, and Compliance on partner security reviews.",
      },
    ],
  },
  contact: {
    location: "Ho Chi Minh City, Vietnam",
    email: "hello@duypham.me",
    phone: "+84 963 769 049",
  },
  socials: [
    { title: "LinkedIn", url: "https://www.linkedin.com/in/phamanhduy", icon: "linkedin" },
    { title: "GitHub", url: "https://github.com/duypham9895", icon: "github" },
    { title: "Telegram", url: "https://t.me/phamanhduy", icon: "telegram" },
    { title: "Zalo", url: "https://zalo.me/0963769049", icon: "zalo" },
  ],
  resumeUrl: "/resume.pdf",
};
