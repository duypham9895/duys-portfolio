export interface Certification {
  readonly name: string;
  readonly organization: string;
  readonly date: string;
  readonly credentialUrl: string;
}

export const certifications: readonly Certification[] = [
  {
    name: "Certificate of Completion: Claude 101",
    organization: "Anthropic",
    date: "Mar 2026",
    credentialUrl: "https://verify.skilljar.com/c/jz4vxd8txn3d",
  },
  {
    name: "Product Management: An Introduction",
    organization: "Coursera",
    date: "Mar 2025",
    credentialUrl: "https://www.coursera.org/account/accomplishments/verify/M0LM18T2RR2G",
  },
  {
    name: "Go: The Complete Developer's Guide (Golang)",
    organization: "Udemy",
    date: "Nov 2022",
    credentialUrl: "https://ude.my/UC-e42bf207-582f-468e-a55a-508f47ab5436",
  },
  {
    name: "React - The Complete Guide",
    organization: "Udemy",
    date: "Sep 2022",
    credentialUrl: "https://ude.my/UC-4e7ddc8d-97e9-48d7-aaf8-d7d7bb598bc8",
  },
  {
    name: "Neural Networks and Deep Learning",
    organization: "Coursera",
    date: "Feb 2021",
    credentialUrl: "https://www.coursera.org/account/accomplishments/certificate/CJUWD9PNBQ65",
  },
  {
    name: "JavaScript (Intermediate)",
    organization: "HackerRank",
    date: "Oct 2022",
    credentialUrl: "https://www.hackerrank.com/certificates/iframe/3f36d699fb65",
  },
] as const;
