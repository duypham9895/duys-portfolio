export interface Social {
  readonly title: string;
  readonly url: string;
  readonly icon: string;
}

export interface Personal {
  readonly fullName: string;
  readonly title: string;
  readonly bio: readonly string[];
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
  bio: [
    "Software Engineer turned Associate Product Manager with 5+ years building fintech platforms and AI systems. I use deep technical understanding to ship products that solve real problems for users across Southeast Asia.",
    "Currently at Ringkas, working on a loan origination platform, an AI-powered chatbot and document processing system, and a central configuration hub, coordinating across engineering teams in Vietnam and Indonesia. Previously at Bizzi Vietnam, where I built AI models for invoice data extraction and integrated enterprise systems.",
  ],
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
