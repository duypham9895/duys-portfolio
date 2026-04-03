export interface Experience {
  readonly jobTitle: string;
  readonly companyName: string;
  readonly companyUrl: string;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly description: readonly string[];
}

export const experiences: readonly Experience[] = [
  {
    jobTitle: "Associate Product Manager",
    companyName: "Ringkas (PT Ringkas Asia Technology)",
    companyUrl: "https://ringkas.co.id",
    startDate: "Dec 2022",
    endDate: null,
    description: [
      "Define requirements and coordinate development of a loan origination system serving multiple banking partners",
      "Shape product direction for an AI chatbot and document processing platform",
      "Maintain a central configuration hub managing feature flags across multiple markets",
      "Transitioned from Software Engineer to Product Manager within the same company",
      "Write PRDs, review API contracts, and align architecture decisions across Vietnam and Indonesia teams",
    ],
  },
  {
    jobTitle: "Software Engineer",
    companyName: "Bizzi Vietnam",
    companyUrl: "https://www.bizzi.vn/",
    startDate: "Oct 2020",
    endDate: "Aug 2022",
    description: [
      "Built AI models for VAT invoice data extraction (YOLO, Faster RCNN, VietOCR)",
      "Designed PO email processing service from scratch (DB, APIs, Serverless, deployment)",
      "Integrated Oracle & SAP for major enterprise retail clients",
    ],
  },
] as const;
