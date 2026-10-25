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
    tagline: "A vendor-swap PRD was ready. I asked for two weeks to find the cause first.",
    stat: { value: "40% → 85%+", label: "OCR success rate" },
    rows: [
      {
        label: "Context",
        paragraphs: [
          "OCR on the Ringkas platform was succeeding only 40% of the time, and a PRD to replace the OCR vendor was already on the table.",
        ],
      },
      {
        label: "Problem",
        paragraphs: ["A new vendor is costly to implement, and the root cause of the failures had not been established."],
      },
      {
        label: "Options",
        paragraphs: [],
        options: [
          { key: "A", text: "Proceed with the vendor-swap PRD as written." },
          {
            key: "B",
            text: "Time-box a fix of the current setup to 2 weeks, with the vendor switch held as the fallback.",
            chosen: true,
          },
        ],
      },
      {
        label: "Decision",
        key: true,
        paragraphs: [
          "I argued that fixing the defect was cheaper than implementing a new vendor, and asked for a 2-week time-box with a clear stop rule: if it didn't work, the switch went ahead. The risk I took on: if the fix failed, the swap would start two weeks later.",
          "Tracing the pipeline end to end, I found the root cause: the same preprocessing was being applied twice, once in the frontend and again in the backend.",
        ],
      },
      {
        label: "Outcome",
        key: true,
        paragraphs: ["OCR success rose from **40% to over 85%**. We kept the existing vendor, and the swap was not needed."],
        side: {
          label: "Side track · VLM proof of concept",
          body: "With the AI team, I built a Vision-Language-Model (VLM) OCR proof of concept. The benchmark showed **89% lower cost** against **48% higher latency**. It was R&D only and never went to production: a company strategy shift left too few resources, so moving it forward lost priority.",
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
        paragraphs: ["Pillar is built so B2B partners can run their own AI agents, in two parts:"],
        arch: [
          { name: "Pillar Portal", description: "Where partners configure their agent." },
          {
            name: "Pillar ChatApp",
            description: "An embeddable widget SDK that serves the agent to their customers.",
          },
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
          { key: "A", text: "Let partners edit the whole agent: model, prompt and skills." },
          {
            key: "B",
            text: "Keep Ringkas's base prompt and template fixed, and let partners append their own instructions on top.",
            chosen: true,
          },
        ],
      },
      {
        label: "Decision",
        key: true,
        paragraphs: [
          "I recommended option B, and it is what we built. Ringkas defines the base prompt, model and skills; partners append their instructions on top. The trade-off: partners get less freedom to change the core, and every agent runs on a base Ringkas controls.",
          "I also proposed the upgrade rule: when a partner moves to a newer template, the chat link their customers already use keeps working, their settings carry over, and the agent goes back through Ringkas's review before it answers again.",
          "Separately, I wrote the decision memo for a privacy layer that masks customers' personal data before it reaches any third-party model. Leadership approved it; it is planned, not yet built.",
        ],
      },
      {
        label: "Outcome",
        key: true,
        paragraphs: [
          "Deployed to production. Ringkas demos it and bids with it in enterprise tenders; the widget SDK is rolling out to its first enterprise client.",
        ],
      },
    ],
  },
] as const;
