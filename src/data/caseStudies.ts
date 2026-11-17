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
    title: "Fix the cause, not the vendor: an OCR investigation",
    tagline: "A second OCR vendor was in integration. I debugged the live pipeline in parallel.",
    stat: { value: "~40% → ~89%", label: "OCR success rate" },
    rows: [
      {
        label: "Context",
        paragraphs: [
          "ID-card (KTP) OCR on the Ringkas platform succeeded only ~40% of the time, and I was writing the PRD to integrate a second OCR vendor.",
        ],
      },
      {
        label: "Problem",
        paragraphs: [
          "Adding a second vendor meant new contract and engineering cost, yet nobody had checked why the existing pipeline was failing.",
        ],
      },
      {
        label: "Options",
        paragraphs: [],
        options: [
          { key: "A", text: "Integrate the second vendor and rely on fallback routing to lift accuracy." },
          {
            key: "B",
            text: "Trace and fix the live pipeline in parallel so the new vendor is needed only if the fix falls short.",
            chosen: true,
          },
        ],
      },
      {
        label: "Decision",
        key: true,
        paragraphs: [
          "I kept the vendor PRD moving while digging into the production error logs. The risk was spending my own hours on a root cause that might sit inside the vendor's black box.",
          "Logs exposed two defects on our side: ~30% of uploads failed minimum-resolution checks, and 15–30% failed on a vendor authentication bug. Engineering and I fixed the auth flow first, then found the web frontend was downscaling KTP photos below the vendor's pixel threshold. When accuracy dipped again in mid-2025, I traced a backend minimum-size resize I had written as an engineer that a later refactor had altered.",
        ],
      },
      {
        label: "Outcome",
        key: true,
        paragraphs: [
          "Frontend and auth fixes lifted OCR success from **~40% to ~87%**. Restoring the backend resize brought it to **~89%**, where it held over the next year. The existing vendor stayed, and we dropped the second-vendor integration.",
        ],
        side: {
          label: "Side track · VLM proof of concept",
          body: "With the AI team, I built a vision-language model (VLM) OCR proof of concept and benchmarked **87% lower cost** against **74% higher latency**. It stayed in R&D after a company strategy shift moved engineering capacity elsewhere.",
        },
      },
    ],
  },
  {
    id: "case2",
    kicker: "Case 02 · Ringkas · Pillar AI Platform",
    title: "Why partners can't rewrite the AI agents they run",
    tagline:
      "Pillar is Ringkas's B2B AI-agent platform. The hardest call was how much prompt control enterprise partners get.",
    stat: { value: "In production", label: "Powers demos & enterprise tenders", word: true },
    rows: [
      {
        label: "Context",
        paragraphs: [
          "Pillar lets B2B partners deploy domain AI agents to their customers. Operators configure each agent in Pillar Portal (managed by Ringkas first, with partner self-serve planned next), and Pillar ChatApp serves the widget.",
        ],
      },
      {
        label: "Problem",
        paragraphs: [
          "Enterprise partners want to tailor tone and business rules, while Ringkas remains accountable for compliance, safety, and accuracy.",
        ],
      },
      {
        label: "Options",
        paragraphs: [],
        options: [
          { key: "1", text: "Let partners edit the entire agent: model, system prompt, and skills." },
          {
            key: "2",
            text: "Lock Ringkas's base prompt, model, and skills template, and let partners append scoped instructions on top.",
            chosen: true,
          },
        ],
      },
      {
        label: "Decision",
        key: true,
        paragraphs: [
          "I recommended option 2, and Engineering built Pillar on that prompt-governance model.",
          "Ringkas owns the base system prompt, model, and toolset; each partner appends business instructions in a separate layer.",
          "The trade-off: partners get less freedom to alter core behavior, and in return every live agent stays inside guardrails Ringkas has tested.",
          "I also defined the template-upgrade workflow: when an agent moves to a newer base template, its public chat URL and cost caps stay intact, partners re-apply their custom instructions, and the agent returns to Draft for Ringkas's review before going live.",
        ],
      },
      {
        label: "Outcome",
        key: true,
        paragraphs: [
          "Live in production. Ringkas runs demos on Pillar and uses it in enterprise tenders; the embeddable chat-widget SDK is rolling out to a first enterprise client.",
        ],
      },
    ],
  },
] as const;
