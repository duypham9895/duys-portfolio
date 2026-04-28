export interface Social {
  readonly title: string;
  readonly url: string;
  readonly icon: string;
}

export interface ResumeUrls {
  readonly light: string;
  readonly dark: string;
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
  readonly resumeUrls: ResumeUrls;
}

export const personal: Personal = {
  fullName: "Duy Pham",
  title: "Associate Product Manager",
  bio: [
    "Software Engineer-turned-**Associate Product Manager** at **Ringkas**, an Indonesian fintech, coordinating across engineering teams in Vietnam and Indonesia. I bring engineering depth to product work — reading source code to root-cause issues, coordinating cross-functional launches, and translating operational pain into shipped features. Most recently led the launch of **Ringkas AI Financial Assistant**, a first-of-its-kind product in Indonesia's fintech market.",
    "Previously at **Bizzi Vietnam**, where I built AI models for **VAT invoice data extraction** and integrated enterprise systems for **Oracle/SAP** retail clients.",
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
  resumeUrls: {
    light: "/resume-light.pdf",
    dark: "/resume-dark.pdf",
  },
};
