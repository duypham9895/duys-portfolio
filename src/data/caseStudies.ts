export interface CaseOption {
  readonly key: string;
  readonly text: string;
  readonly chosen?: boolean;
}

export interface CaseArchPart {
  readonly name: string;
  readonly description: string;
}

export interface CaseSideTrack {
  readonly label: string;
  readonly body: string;
}

/** One row of the case body. `**text**` marks a metric. */
export interface CaseRow {
  readonly label: string;
  /** Key rows (decision, outcome) get the emphasised treatment. */
  readonly key?: boolean;
  readonly paragraphs: readonly string[];
  readonly options?: readonly CaseOption[];
  readonly arch?: readonly CaseArchPart[];
  readonly side?: CaseSideTrack;
}

export interface CaseStudy {
  readonly id: string;
  readonly kicker: string;
  readonly title: string;
  readonly tagline: string;
  readonly stat: {
    readonly value: string;
    readonly label: string;
    /** True when the stat is a word, not a number. */
    readonly word?: boolean;
  };
  readonly rows: readonly CaseRow[];
}

export const caseStudies: readonly CaseStudy[] = [
  {
    id: "case1",
    kicker: "Case 01 · Ringkas · OCR",
    title: "Fix before you switch: an OCR investigation",
    tagline: "A second OCR vendor was being specced. I traced the failures first.",
    stat: { value: "~40% → ~89%", label: "OCR success rate" },
    rows: [
      {
        label: "Context",
        paragraphs: [
          "OCR on the Ringkas platform was succeeding only about 40% of the time, and a PRD to add a second OCR vendor was already in progress.",
        ],
      },
      {
        label: "Problem",
        paragraphs: ["A new vendor is costly to integrate, and the root cause of the failures had not been established."],
      },
      {
        label: "Options",
        paragraphs: [],
        options: [
          { key: "A", text: "Proceed with the second-vendor PRD as written." },
          {
            key: "B",
            text: "Find and fix the cause in the current setup first, with the new vendor held as the fallback.",
            chosen: true,
          },
        ],
      },
      {
        label: "Decision",
        key: true,
        paragraphs: [
          "I argued that fixing the defect was cheaper than integrating a new vendor, and that the vendor work should wait until we knew the cause. The risk I took on: if the fix failed, the vendor work would start later.",
          "The failure logs pointed to image size: about a third of attempts were rejected as too small. Tracing the pipeline, I found the KTP image was resized at two layers, in the frontend and again in the backend. The backend resize was code I had written as an engineer, which is why I knew where to look.",
        ],
      },
      {
        label: "Outcome",
        key: true,
        paragraphs: [
          "After the frontend fix, OCR success rose from **about 40% to about 87%**. When it slipped in mid-2025, the backend fix brought it to **about 89%**, where it has held for a year. We kept the existing vendor, and the second-vendor work was dropped.",
        ],
        side: {
          label: "Side track · VLM proof of concept",
          body: "With the AI team, I built a vision-language model (VLM) OCR proof of concept. The benchmark showed **87% lower cost** against **74% higher latency**. It was R&D only and never went to production: a company strategy shift left too few resources, so moving it forward lost priority.",
        },
      },
    ],
  },
  {
    id: "case2",
    kicker: "Case 02 · Ringkas · Pillar",
    title: "Why partners can't rewrite the AI agents they run",
    tagline:
      "Pillar is Ringkas's B2B agent platform. The hardest call was how much of each agent a partner could change.",
    stat: { value: "In production", label: "Powers demos & enterprise tenders", word: true },
    rows: [
      {
        label: "Context",
        paragraphs: [
          "Pillar is built so B2B partners can run their own AI agents. Each agent is configured in Pillar Portal (by Ringkas today, with partner self-serve in a later phase), and Pillar ChatApp serves it to their customers.",
        ],
      },
      {
        label: "Problem",
        paragraphs: [
          "Partners want to tune their agent to their business, but every agent still has to behave the way Ringkas has defined and tested.",
        ],
      },
      {
        label: "Options",
        paragraphs: [],
        options: [
          { key: "1", text: "Let partners edit the whole agent: model, prompt and skills." },
          {
            key: "2",
            text: "Keep Ringkas's base prompt and template fixed, and let partners append their own instructions on top.",
            chosen: true,
          },
        ],
      },
      {
        label: "Decision",
        key: true,
        paragraphs: [
          "I recommended option 2, and it is the design the platform is built on.",
          "Ringkas defines the base prompt, model and skills, and each partner's instructions are appended on top.",
          "The trade-off: partners get less freedom to change the core, and in return every agent runs on a base Ringkas controls.",
          "I also proposed the upgrade rule: when a partner moves to a newer template, the chat link their customers already use keeps working, their content and cost settings carry over, their appended instructions are re-reviewed, and the agent goes back through Ringkas's review before it answers again.",
        ],
      },
      {
        label: "Outcome",
        key: true,
        paragraphs: [
          "Deployed to production. Ringkas demos it and uses it in enterprise tenders, and the widget SDK is rolling out to its first enterprise client.",
        ],
      },
    ],
  },
] as const;
