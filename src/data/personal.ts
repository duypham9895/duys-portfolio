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
  title: "Associate Product Manager",
  positioning:
    "Ex-software engineer working toward Technical Product Manager roles, building AI and platform products for Indonesian mortgage (KPR) fintech.",
  location: "Based in Ho Chi Minh City · Hybrid preferred · Open to relocation with company support",
  languages: ["Vietnamese (Native)", "English (Professional working)"],
  education: "Ton Duc Thang University · Software Engineering · Degree not completed",
  about: {
    opener:
      "Engineer first, product manager now: 5+ years at Bizzi and Ringkas, 3.5 of them in software engineering, and product at Ringkas since Aug 2024.",
    howIWork: [
      {
        title: "Investigate before you spec.",
        body: "Find the cause before writing the fix into a spec: the OCR result in case 01 came from tracing the failures, not adding a vendor.",
      },
      {
        title: "Design for cost and risk.",
        body: "The AI Financial Assistant went out in three phases behind cost gates and feature flags, with daily and global caps on anonymous usage to limit what it could cost.",
      },
      {
        title: "Bridge engineering and business.",
        body: "I coordinate engineering work across Vietnam and Indonesia. For a major Indonesian e-wallet partner's security questionnaire, I brought Engineering, AI and Compliance into one cross-functional response, drawing on what I knew of the system from my engineering years.",
      },
    ],
  },
  contact: {
    location: "Ho Chi Minh City, Vietnam",
    email: "phamanhduy.sg@gmail.com",
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
