import type {
  InspectableEntry,
  ProjectCardSummary,
  WorkshopProject,
} from "@/domain/workshop/types";
import { officialLsEntries } from "@/domain/workshop/ls-library";

export const demoProjectId = "demo";

export const projectCards: ProjectCardSummary[] = [
  {
    id: demoProjectId,
    title: "Team Collaboration Reset",
    purposePreview:
      "Improve collaboration and communication by increasing psychological safety and clarifying team agreements.",
    sectionCountLabel: "4 sections",
    languageLabel: "EN",
    formatLabel: "Onsite",
    aiLabel: "AI enabled",
    storageLabel: "Local draft",
    updatedLabel: "Updated 14 min ago",
    footerLabel: "Preview ready",
    badgeLabel: "In motion",
    badgeTone: "success",
    featured: true,
  },
  {
    id: "retro-deep-dive",
    title: "Retrospective Deep Dive",
    purposePreview:
      "A lighter multi-section flow for surfacing friction, making sense of patterns, and converging on commitments.",
    sectionCountLabel: "3 sections",
    languageLabel: "EN",
    formatLabel: "Hybrid",
    aiLabel: "No AI",
    storageLabel: "Cloud",
    updatedLabel: "Updated yesterday",
    footerLabel: "Shared later",
    badgeLabel: "Template seed",
    badgeTone: "info",
  },
  {
    id: "leadership-alignment",
    title: "Leadership Alignment Sprint",
    purposePreview:
      "A more strategic chain with stronger decision framing and a structured handoff into the next quarter.",
    sectionCountLabel: "5 sections",
    languageLabel: "DE",
    formatLabel: "Onsite",
    aiLabel: "Manual exported",
    storageLabel: "Local",
    updatedLabel: "Updated 3 days ago",
    footerLabel: "Ready to refine",
    badgeLabel: "Ready to refine",
    badgeTone: "warning",
  },
];

export const inspectableEntries: Record<string, InspectableEntry> = {
  ...officialLsEntries,
  intro: {
    id: "intro",
    title: "Intro / Context",
    badge: "Neutral block",
    kind: "neutral",
    icon: "intro",
    typeLabel: "Neutral block",
    shortDescription: "A short, warm opening creates enough safety before deeper conversation begins.",
    description:
      "A short, warm opening creates enough safety before the room moves into more revealing conversation.",
    review:
      "This opening gives the section emotional grounding before participants are invited to share more vulnerable experiences.",
    notes:
      "Keep the tone warm and concrete. Name the intention of the section without suggesting that anyone must disclose more than they want to.",
    output:
      "Shared readiness, emotional orientation, and a clear sense of why the upcoming dialogue matters.",
    fitCues: ["safe entry", "warm tone", "gentle framing"],
    suggestions: [
      "Keep the invitation warmer and shorter.",
      "Name participation as an invitation, not an obligation.",
    ],
    reviewSummary: {
      label: "Good fit",
      score: "4.4 / 5",
      tone: "success",
    },
    libraryMeta: "8 min • Neutral • Warm framing",
    libraryDuration: "8 min",
    libraryGroupSize: "Whole group",
    libraryCategoryLabel: "Opening",
    libraryDescription: "Use a short grounding move before the room opens up.",
    relatedEntryIds: ["124all", "input"],
    alternativeEntryIds: ["reflection"],
  },
  "124all": {
    id: "124all",
    title: "1-2-4-All",
    badge: "Liberating Structure",
    kind: "ls",
    icon: "ls-124a",
    typeLabel: "Exploration",
    shortDescription: "Move quickly from individual thinking to shared synthesis.",
    description:
      "This structure fits the section because it lowers the threshold for participation while still building collective pattern recognition.",
    review:
      "Purpose fit is strong: it lets people start safely on their own, then widen participation in small steps. Transition fit is also strong because the intro creates a clear emotional frame.",
    notes:
      "Emphasize concrete moments rather than general opinions. Invite short examples first, then pull themes to the whole group.",
    output:
      "Examples of what healthy collaboration already looks like and a first shared pattern map.",
    fitCues: ["participation ramp", "many voices", "low pressure"],
    suggestions: [
      "Trim the invitation to one crisp sentence before the reflective prompt.",
      "Consider adding one explicit phrase that signals there are no perfect answers.",
    ],
    reviewSummary: {
      label: "Strong fit",
      score: "4.7 / 5",
      tone: "success",
    },
    libraryMeta: "12 min • Reveal • Official",
    libraryDuration: "12 min",
    libraryGroupSize: "8-99+",
    libraryCategoryLabel: "Reveal",
    libraryDescription: "Move quickly from individual reflection to collective harvesting.",
    matchmakerCategory: "reveal",
    sourceStatus: "official",
    relatedEntryIds: ["appreciative", "reflection"],
    alternativeEntryIds: ["input"],
    steps: [
      {
        title: "1. Solo reflection",
        role: "Prompt moment",
        prompt:
          "Think about one moment when collaboration felt easy and energizing. What made that possible?",
        facilitatorCue:
          "Give people quiet time first. Invite a concrete moment rather than a general opinion.",
      },
      {
        title: "2. Pair exchange",
        role: "Prompt moment",
        prompt:
          "Share your moment with one partner. What conditions helped that moment happen?",
        facilitatorCue:
          "Keep the exchange brisk and balanced. Encourage both partners to speak and listen in equal measure.",
      },
      {
        title: "3. Foursome synthesis",
        role: "Prompt moment",
        prompt:
          "In your group of four, what patterns or conditions show up across several examples?",
        facilitatorCue:
          "Push gently from stories toward patterns. Ask groups to cluster similar conditions together.",
      },
      {
        title: "4. Whole-group share",
        role: "Prompt moment",
        prompt:
          "What one or two conditions feel most worth carrying into the rest of this workshop?",
        facilitatorCue:
          "Harvest only the strongest themes. Resist turning this into a long report-out.",
      },
      {
        title: "5. Harvest",
        role: "Facilitator move",
        facilitatorCue:
          "Capture visible themes, key phrases, and tensions so the next structure can build directly on them.",
      },
    ],
  },
  appreciative: {
    id: "appreciative",
    title: "Appreciative Interviews",
    badge: "Liberating Structure",
    kind: "ls",
    icon: "ls-ai",
    typeLabel: "Reflection",
    shortDescription: "Invite pairs to explore what already works at its best.",
    description:
      "This block deepens trust and turns earlier fragments into richer stories, but the invitation could be slightly less long and more emotionally direct.",
    review:
      "Purpose fit is good because the pair format creates safety. Invitation quality is medium because the current text asks several things at once.",
    notes:
      "Invite people to listen for conditions, not just a nice story. Keep the debrief grounded in what can be recreated by the team.",
    output:
      "Concrete conditions and behaviors that support safety and better communication.",
    fitCues: ["pair safety", "depth", "story richness"],
    suggestions: [
      "Shorten the invitation by removing one descriptive clause.",
      "Add a closing line that helps pairs listen for repeatable conditions.",
    ],
    reviewSummary: {
      label: "Promising fit",
      score: "3.9 / 5",
      tone: "info",
    },
    libraryMeta: "1 hr • Reveal / Share • Official",
    libraryDuration: "1 hr",
    libraryGroupSize: "Solo / group",
    libraryCategoryLabel: "Reveal / Share",
    libraryDescription: "Use this when you want more depth after the safe opening.",
    matchmakerCategory: "reveal",
    sourceStatus: "official",
    relatedEntryIds: ["reflection", "winfy"],
    alternativeEntryIds: ["124all"],
    steps: [
      {
        title: "1. Set up pairs",
        role: "Facilitator move",
        prompt:
          "You'll interview each other about a time when communication felt candid, respectful, and useful.",
        facilitatorCue:
          "Frame this as story gathering, not evaluation. Give a clear timebox for each round.",
      },
      {
        title: "2. Interview round A",
        role: "Prompt moment",
        prompt:
          "Tell your partner about a specific moment when communication in the team worked especially well. What conditions made that possible?",
        facilitatorCue:
          "Encourage interviewers to listen for conditions, behaviors, and small details, not only the headline story.",
      },
      {
        title: "3. Switch roles",
        role: "Facilitator move",
        prompt:
          "Switch roles and repeat the same interview from the other person's experience.",
        facilitatorCue:
          "Mark the switch cleanly and keep the energy warm and curious.",
      },
      {
        title: "4. Distill patterns",
        role: "Prompt moment",
        prompt:
          "Together, identify the conditions that made these moments possible and that your team could intentionally recreate.",
        facilitatorCue:
          "Move from story detail to actionable conditions. Ask for patterns, not generic lessons.",
      },
      {
        title: "5. Harvest",
        role: "Facilitator move",
        facilitatorCue:
          "Harvest repeatable team conditions and language worth carrying into reflection or agreement work.",
      },
    ],
  },
  triz: {
    id: "triz",
    title: "TRIZ",
    badge: "Liberating Structure",
    kind: "ls",
    icon: "ls-triz",
    typeLabel: "Sense-making",
    shortDescription: "Expose behaviors that guarantee failure and remove them on purpose.",
    description:
      "Strong for exposing damaging communication patterns, but it may need careful framing depending on the emotional state of the group.",
    review:
      "The structure is powerful for surfacing anti-patterns. The main risk is that the room may become cynical if the transition into action is weak.",
    notes:
      "Frame it clearly as a way to externalize harmful patterns without blame. Keep enough time for the conversion back into useful commitments.",
    output:
      "A visible list of self-defeating communication patterns and candidate behaviors to stop.",
    fitCues: ["sharp mirror", "pattern exposure", "needs care"],
    suggestions: [
      "Use a softer bridge from reflection into TRIZ if the room still feels guarded.",
      "Consider a short input block first to lower emotional ambiguity.",
    ],
    reviewSummary: {
      label: "Use with care",
      score: "3.5 / 5",
      tone: "warning",
    },
    libraryMeta: "35 min • Reveal • Official",
    libraryDuration: "35 min",
    libraryGroupSize: "Solo / group",
    libraryCategoryLabel: "Reveal",
    libraryDescription: "A sharper mirror for habits that quietly undermine collaboration.",
    matchmakerCategory: "reveal",
    sourceStatus: "official",
    relatedEntryIds: ["input", "winfy"],
    alternativeEntryIds: ["124all"],
    steps: [
      {
        title: "1. Frame the paradox",
        role: "Facilitator move",
        prompt:
          "If we wanted to make collaboration and communication in this team fail completely, what would we do?",
        facilitatorCue:
          "Externalize the patterns. Make it playful but not cynical, and clearly remove blame from individuals.",
      },
      {
        title: "2. Generate destructive behaviors",
        role: "Prompt moment",
        prompt:
          "List all the behaviors, habits, and moves that would guarantee failure.",
        facilitatorCue:
          "Push for specificity. Name actual meeting behaviors, response patterns, and omissions.",
      },
      {
        title: "3. Find what we already do",
        role: "Prompt moment",
        prompt:
          "Which of these destructive patterns do we already see in small or subtle ways today?",
        facilitatorCue:
          "Slow the room down here. This is where defensiveness can rise if the framing is too sharp.",
      },
      {
        title: "4. Decide what to stop",
        role: "Prompt moment",
        prompt:
          "What are the first patterns we want to stop, interrupt, or replace?",
        facilitatorCue:
          "Convert critique into choice. Keep the conversation specific and behavior-based.",
      },
      {
        title: "5. Harvest",
        role: "Facilitator move",
        facilitatorCue:
          "Capture the stop-doing list and the strongest replacements so the next structure can turn them into commitments.",
      },
    ],
  },
  winfy: {
    id: "winfy",
    title: "What I Need From You",
    badge: "Liberating Structure",
    kind: "ls",
    icon: "ls-winfy",
    typeLabel: "Help",
    shortDescription: "Surface cross-functional needs and answer with clear commitments.",
    description:
      "This structure is strong when the workshop needs explicit requests across roles or functions instead of more vague hopes for collaboration.",
    review:
      "Purpose fit is strong for the second section because it converts friction into explicit requests and responses. The main facilitation risk is keeping the process crisp and free of side discussions.",
    notes:
      "Hold the response discipline firmly. The value comes from clarity, not from negotiating every request in the moment.",
    output:
      "A visible set of explicit requests, committed responses, clear boundaries, and sharper cross-functional understanding.",
    fitCues: ["cross-functional", "clear asks", "strong boundaries"],
    suggestions: [
      "Keep the request format concrete enough to earn a clear yes or no.",
      "Protect the no-discussion rule until the response round is complete.",
    ],
    reviewSummary: {
      label: "High-value fit",
      score: "4.3 / 5",
      tone: "success",
    },
    libraryMeta: "55-70 min • Help • Official",
    libraryDuration: "55-70 min",
    libraryGroupSize: "Group",
    libraryCategoryLabel: "Help",
    libraryDescription: "Turn friction into explicit requests and disciplined responses.",
    matchmakerCategory: "help",
    sourceStatus: "official",
    relatedEntryIds: ["input", "reflection"],
    alternativeEntryIds: ["appreciative"],
    steps: [
      {
        title: "1. Frame the challenge and rules",
        role: "Facilitator move",
        prompt:
          "We are going to make the most important cross-functional needs explicit. Requests should be clear enough to receive only yes, no, I will try, or whatever.",
        facilitatorCue:
          "State the challenge, the response options, and the no-discussion rule very clearly before people begin.",
      },
      {
        title: "2. Cluster needs by function or role",
        role: "Prompt moment",
        prompt:
          "In your cluster, identify the top needs you have from the other functions or roles in the room. Reduce these to your two most important requests.",
        facilitatorCue:
          "Push for concrete requests, not complaints. Use a short internal synthesis if the room needs help converging.",
      },
      {
        title: "3. State requests around the circle",
        role: "Prompt moment",
        prompt:
          "One by one, state your requests to each of the other spokespersons. Everyone only captures requests at this stage.",
        facilitatorCue:
          "Stop anyone who begins responding too early. The first round is only for clear expression and listening.",
      },
      {
        title: "4. Prepare responses",
        role: "Facilitator move",
        prompt:
          "Take a few minutes to decide your response to each request: yes, no, I will try, or whatever.",
        facilitatorCue:
          "Let people confer briefly with their functional cluster if needed, but keep the response language tight.",
      },
      {
        title: "5. Respond with discipline",
        role: "Prompt moment",
        prompt:
          "Repeat the request you received, then respond with yes, no, I will try, or whatever. No elaboration.",
        facilitatorCue:
          "Protect the crispness of the round. The strength of WINFY comes from the discipline of simple responses.",
      },
      {
        title: "6. Debrief and convert",
        role: "Facilitator move",
        prompt:
          "What became clearer about what different functions really need from one another, and what should happen next?",
        facilitatorCue:
          "Debrief only after the response round. Convert the most useful needs and boundaries into next actions or agreements.",
      },
    ],
  },
  input: {
    id: "input",
    title: "Input block",
    badge: "Neutral block",
    kind: "neutral",
    icon: "input",
    typeLabel: "Neutral block",
    shortDescription: "Use a short framing impulse before the next structure opens up.",
    description:
      "A short framing input helps sequence difficult structures without overloading the canvas with custom facilitation detail.",
    review:
      "Useful when a group needs a short conceptual bridge. Keep it brief so it supports, rather than dominates, the LS flow.",
    notes: "Use a single principle or observation, not a mini lecture.",
    output: "Shared framing language that helps the next block land more clearly.",
    fitCues: ["bridge", "framing", "supporting role"],
    suggestions: [
      "Keep neutral blocks visually distinct from LS cards.",
      "Use them sparingly so the LS chain remains primary.",
    ],
    reviewSummary: {
      label: "Useful support",
      score: "4.0 / 5",
      tone: "success",
    },
    libraryMeta: "10 min • Neutral • Framing",
    libraryDuration: "10 min",
    libraryGroupSize: "Whole group",
    libraryCategoryLabel: "Input",
    libraryDescription: "A short impulse before the next structure gets more demanding.",
    relatedEntryIds: ["triz", "winfy"],
    alternativeEntryIds: ["intro"],
  },
  reflection: {
    id: "reflection",
    title: "Reflection",
    badge: "Neutral block",
    kind: "neutral",
    icon: "reflection",
    typeLabel: "Closing move",
    shortDescription: "A gentle way to crystallize patterns before moving to the next module.",
    description:
      "This block gives the section a gentle way to crystallize patterns before moving to the next module.",
    review:
      "The reflection works well because it helps carry insights forward and creates a clean handoff into later sections.",
    notes: "Ask for patterns worth protecting, not just generic learnings.",
    output: "A concise set of conditions or behaviors the group wants to preserve.",
    fitCues: ["crystallize", "slow down", "carry forward"],
    suggestions: [
      "Keep the reflection question single-focus.",
      "Link the output explicitly to the next section's starting point.",
    ],
    reviewSummary: {
      label: "Good fit",
      score: "4.2 / 5",
      tone: "success",
    },
    libraryMeta: "8 min • Neutral • Closing move",
    libraryDuration: "8 min",
    libraryGroupSize: "Solo / group",
    libraryCategoryLabel: "Reflection",
    libraryDescription: "Slow the room down and extract what is worth carrying forward.",
    relatedEntryIds: ["124all", "appreciative"],
    alternativeEntryIds: ["input"],
  },
  "transition-one": {
    id: "transition-one",
    title: "Transition: Intro -> 1-2-4-All",
    badge: "Transition",
    kind: "transition",
    icon: "intro",
    typeLabel: "Transition",
    shortDescription: "Move from shared framing into rapid individual reflection.",
    description:
      "The handoff is short and emotionally coherent: it moves from framing into individual reflection without pressure.",
    review:
      "Transition fit is strong because the opening prepares people emotionally, and the next structure begins privately before widening out.",
    notes:
      "Signal that people can start quietly on their own and that there is no need to share a perfect story.",
    output: "A softer emotional step into the first participatory structure.",
    fitCues: ["soft handoff", "safe start", "clear next step"],
    suggestions: [
      "Keep the bridge sentence warm and brief.",
      "Name the move from shared frame to personal reflection explicitly.",
    ],
    reviewSummary: {
      label: "Clean handoff",
      score: "4.5 / 5",
      tone: "success",
    },
  },
  "transition-two": {
    id: "transition-two",
    title: "Transition: 1-2-4-All -> Appreciative Interviews",
    badge: "Transition",
    kind: "transition",
    icon: "intro",
    typeLabel: "Transition",
    shortDescription: "Carry the strongest examples into paired story-sharing.",
    description:
      "This transition carries the energy of small-group discovery into a more personal pair conversation.",
    review:
      "The bridge works because the group already surfaced positive examples. It could be even stronger if it named what to listen for in the interviews.",
    notes:
      "Invite pairs to deepen one strong example rather than starting from zero again.",
    output: "Continuity between group insight and pair storytelling.",
    fitCues: ["builds momentum", "deepens", "story bridge"],
    suggestions: [
      "Call out that the pair conversation builds on what already emerged.",
      "Mention that partners should listen for conditions, not only the story itself.",
    ],
    reviewSummary: {
      label: "Solid bridge",
      score: "4.1 / 5",
      tone: "success",
    },
  },
  "transition-three": {
    id: "transition-three",
    title: "Transition: Appreciative Interviews -> Reflection",
    badge: "Transition",
    kind: "transition",
    icon: "intro",
    typeLabel: "Transition",
    shortDescription: "Extract concrete conditions that can be reused by the whole team.",
    description:
      "The transition is workable, but it would benefit from a clearer cue about how stories become reusable team conditions.",
    review:
      "The bridge is logical, but the synthesis move is still a little implied. One stronger line could make the reflection more precise.",
    notes: "Help participants shift from story mode to pattern extraction mode.",
    output: "A cleaner move from narrative detail to reusable team-level insight.",
    fitCues: ["synthesis move", "needs cue", "pattern focus"],
    suggestions: [
      "Explicitly ask what conditions showed up across several stories.",
      "Use one sentence that names the move from examples to patterns.",
    ],
    reviewSummary: {
      label: "Needs one stronger cue",
      score: "3.6 / 5",
      tone: "warning",
    },
  },
  "transition-generic": {
    id: "transition-generic",
    title: "Transition",
    badge: "Transition",
    kind: "transition",
    icon: "intro",
    typeLabel: "Transition",
    shortDescription: "A short facilitation bridge that keeps the flow coherent.",
    description:
      "Use this transition to carry the room from one move into the next without dropping context or energy.",
    review:
      "Transitions are strongest when they make the next move feel inevitable and help participants understand why the sequence continues this way.",
    notes:
      "Name the output you are carrying forward and the focus of the next move in one short sentence.",
    output: "A smoother handoff into the next structure or neutral workshop block.",
    fitCues: ["bridge", "carry forward", "sequence clarity"],
    suggestions: [
      "Keep the bridge sentence short and specific.",
      "Name what participants should carry into the next move.",
    ],
    reviewSummary: {
      label: "Helpful bridge",
      score: "4.0 / 5",
      tone: "info",
    },
  },
};

export const demoProject: WorkshopProject = {
  id: demoProjectId,
  title: "Team Collaboration Reset",
  globalPurpose:
    "Improve collaboration and communication in the team through stronger psychological safety, clearer communication patterns, and practical agreements for daily work.",
  context:
    "The team is working under pressure, communication feels transactional, and feedback often comes too late. The workshop should feel safe, practical, and grounded.",
  targetAudience: "Cross-functional product team",
  durationLabel: "2.5 hrs",
  participantsLabel: "9 participants",
  format: "Onsite",
  language: "English",
  aiEnabled: true,
  desiredFeel: "Safe, practical, honest, energizing.",
  energyLevel: "Medium",
  trustLevel: "Growing",
  conflictLevel: "Moderate",
  decisionNeed: "Practical agreements",
  moodTags: [
    "psychological safety",
    "clearer communication",
    "practical agreements",
    "shared ownership",
  ],
  feelTags: ["grounded", "participatory", "candid"],
  designIngredients: [
    "more safety to speak honestly",
    "shared language for friction",
    "a few concrete agreements",
  ],
  projectPulse: [
    "2 structures already have step-level facilitation detail.",
    "Section 02 is the only module that needs deeper choreography.",
    "Section 03 still needs a final closing move before export.",
    "English primary, German supported across UI, content, and export.",
  ],
  setupHotspots: [
    {
      sectionId: "section-1",
      title: "Section 01",
      detail: "Keep the opening warm and tighten the Appreciative Interviews invitation.",
      prepLevel: "Medium",
    },
    {
      sectionId: "section-2",
      title: "Section 02",
      detail: "TRIZ needs careful framing and WINFY benefits from step-by-step run-sheet detail.",
      prepLevel: "Deep",
    },
    {
      sectionId: "section-3",
      title: "Section 03",
      detail: "The arc is clear, but the final closing block is still a draft decision.",
      prepLevel: "Light",
    },
  ],
  previewWarnings: [
    "Section 2 has one transition note still missing detail.",
    "Invitation in Appreciative Interviews could be shortened.",
    "Section 3 does not yet have a final closing block.",
  ],
  previewFocus: [
    {
      title: "TRIZ",
      detail: "Frame it playfully enough to externalize patterns, not blame people.",
    },
    {
      title: "What I Need From You",
      detail: "Protect the response discipline so the structure stays crisp and useful.",
    },
    {
      title: "Section 03",
      detail: "Choose the closing move before exporting the final manual.",
    },
  ],
  sections: [
    {
      id: "section-1",
      indexLabel: "01",
      title: "Increase psychological safety",
      subgoal:
        "Create enough emotional safety for open participation and more honest signal-sharing.",
      dayLabel: "Day 1",
      timeRange: "09:30 - 11:00",
      totalLabel: "55 min chain",
      prepNote: "Keep the ramp gentle, concrete, and safe.",
      prepLevel: "Medium",
      storyMeta: "Medium prep · One invitation still wants sharpening.",
      reviewSummary:
        "Strong sequence for psychological safety. The only weak point is the invitation length in Appreciative Interviews.",
      collapsedSummary:
        "Intro -> 1-2-4-All -> Appreciative Interviews -> Reflection",
      miniPreviewEntryIds: ["intro", "124all", "appreciative", "reflection"],
      suggestedEntryIds: ["124all", "appreciative"],
      status: "ready",
      items: [
        {
          id: "section-1-intro",
          kind: "block",
          entryId: "intro",
          durationLabel: "8 min",
          invitation:
            "Let's ground ourselves in why this conversation matters before we step into the team experience more directly.",
        },
        {
          id: "section-1-transition-1",
          kind: "transition",
          entryId: "transition-one",
          durationLabel: "2 min",
          note: "Move from shared framing into rapid individual reflection.",
        },
        {
          id: "section-1-124all",
          kind: "block",
          entryId: "124all",
          durationLabel: "12 min",
          invitation:
            "Think about one moment when collaboration felt easy and energizing. What made that possible?",
          flowSummary:
            "Solo reflection -> Pairs -> Foursomes -> Whole-group share -> Harvest",
          facilitatorCue:
            "Harvest only the strongest conditions so the pair work starts from patterns, not from scratch.",
        },
        {
          id: "section-1-transition-2",
          kind: "transition",
          entryId: "transition-two",
          durationLabel: "3 min",
          note: "Carry the strongest examples into paired story-sharing.",
        },
        {
          id: "section-1-appreciative",
          kind: "block",
          entryId: "appreciative",
          durationLabel: "20 min",
          invitation:
            "Interview your partner about a time when communication in the team felt candid, respectful, and useful. What conditions made that possible?",
          warning: "Invitation could sharpen",
          accent: true,
        },
        {
          id: "section-1-transition-3",
          kind: "transition",
          entryId: "transition-three",
          durationLabel: "2 min",
          note: "Extract concrete conditions that can be reused by the whole team.",
        },
        {
          id: "section-1-reflection",
          kind: "block",
          entryId: "reflection",
          durationLabel: "8 min",
          invitation:
            "What patterns do we want to protect because they help people feel safe enough to contribute?",
        },
      ],
    },
    {
      id: "section-2",
      indexLabel: "02",
      title: "Surface communication patterns",
      subgoal: "Make invisible habits visible without tipping the room into defensiveness.",
      dayLabel: "Day 1",
      timeRange: "11:15 - 12:30",
      totalLabel: "61 min chain",
      prepNote: "Keep critique externalized, then convert it into explicit requests.",
      prepLevel: "Deep",
      storyMeta: "High prep · TRIZ framing + WINFY response discipline.",
      reviewSummary:
        "Powerful section, but emotionally sharper. Consider a softer bridge into TRIZ if the group still feels guarded.",
      collapsedSummary: "Input -> TRIZ -> What I Need From You -> Reflection",
      miniPreviewEntryIds: ["input", "triz", "winfy", "reflection"],
      suggestedEntryIds: ["triz", "winfy"],
      status: "ready",
      items: [
        {
          id: "section-2-input",
          kind: "block",
          entryId: "input",
          durationLabel: "6 min",
          invitation:
            "Before we go sharper, let's briefly name what keeps difficult conversations productive instead of personal.",
        },
        {
          id: "section-2-triz",
          kind: "block",
          entryId: "triz",
          durationLabel: "25 min",
          invitation:
            "If we wanted to make collaboration and communication fail completely, what would we do?",
          flowSummary:
            "Frame the paradox -> list destructive patterns -> notice current reality -> decide what to stop",
          facilitatorCue:
            "Keep it playful enough to create distance from blame, then slow down when the group notices what already happens today.",
        },
        {
          id: "section-2-transition-1",
          kind: "transition",
          entryId: "transition-two",
          durationLabel: "4 min",
          note: "Shift from exposing damaging patterns into naming what different functions now need from one another.",
        },
        {
          id: "section-2-winfy",
          kind: "block",
          entryId: "winfy",
          durationLabel: "60 min",
          invitation:
            "Clusters state concrete requests to one another, capture them without discussion, then answer only with yes, no, I will try, or whatever.",
          facilitatorCue:
            "The value comes from clarity and response discipline, not from negotiating every request live.",
          showDetailedSteps: true,
        },
      ],
    },
    {
      id: "section-3",
      indexLabel: "03",
      title: "Turn insights into agreements",
      subgoal:
        "Convert reflection into a few concrete behavioral agreements the team can actually carry into daily work.",
      dayLabel: "Day 2",
      totalLabel: "Draft",
      prepNote: "Choose the final closing move before export.",
      prepLevel: "Light",
      storyMeta: "Light prep · Closing move still open.",
      collapsedSummary: "Input -> Agreement move -> Closing reflection",
      suggestedEntryIds: ["reflection", "input"],
      status: "draft",
      items: [],
    },
  ],
};

export function getInspectableEntry(entryId: string): InspectableEntry {
  return inspectableEntries[entryId];
}

export function createDemoProject(): WorkshopProject {
  return JSON.parse(JSON.stringify(demoProject)) as WorkshopProject;
}
