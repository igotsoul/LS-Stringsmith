# LS Recommendation Profile Enrichment: Batch 2: activation, reflection, divergence

You are receiving this file as an executable prompt. Follow the instructions below and create the requested downloadable JSON file.

## Output Requirement

Create a downloadable file named `ls-profiles-batch-2-output.json`.

The downloadable file must contain valid JSON only, using this exact top-level shape:

```json
{
  "profiles": []
}
```

If your interface cannot create downloadable files, return the raw JSON only without Markdown fences, comments, or explanatory text.

## Task

You are helping create static recommendation metadata for a Liberating Structures workshop design app.

The app will not call AI at runtime for these recommendations. Your output will be reviewed and converted into deterministic product data.

For every entry in `entriesToProfile`, return exactly one recommendation profile using the required JSON shape.

## Product Meaning

- `Pairs well with` means a structure complements the current structure before or after it in a workshop flow.
- `Use instead` means a structure can replace the current structure for a similar workshop need, with a clear tradeoff.
- Recommendations should support workshop design decisions, not just list vaguely related structures.

## Important Lessons From Prior Review

- Do not recommend very large structures such as `purpose-to-practice-p2p`, `open-space-technology`, `design-storyboards-advanced`, or `critical-uncertainties` as casual direct pairings. They are major workshop formats and should only appear when the reason is very strong.
- Risky, vulnerable, personal, or emotionally sharp structures must have realistic `trustRequirement` and `riskLevel`.
- `Use instead` must be a true substitute for a similar job, not merely an adjacent follow-up.
- Prefer fewer, higher-quality recommendations over filling every array.
- Keep neutral support blocks such as `intro`, `input`, and `reflection` available as pairings when they genuinely help the flow.

## Rules

- Output JSON only in the downloadable file.
- Include exactly one profile per entry in `entriesToProfile`.
- Use only entry IDs from `allowedEntryIds` for pairings and substitutes.
- Use `referenceEntries` to choose pairings and substitutes, but do not create profiles for entries outside `entriesToProfile`.
- Never reference the same entry as its own pairing or substitute.
- Use only the controlled vocabulary values listed below.
- If uncertain, prefer fewer recommendations with lower confidence over invented certainty.
- `pairsWellAfter` means: structures that work well immediately before the current structure.
- `pairsWellBefore` means: structures that work well immediately after the current structure.
- `useInstead` means: structures that can replace the current structure for a similar workshop need, with a clear tradeoff.
- Keep each `reason` under 160 characters.
- Keep `bestWhen` and `avoidWhen` practical and facilitation-oriented.
- Prefer official Liberating Structures knowledge when you know it, but do not invent specific claims when the supplied data is too thin.

## Controlled Vocabularies

purposeTags:
safety, connection, inclusion, divergence, idea-generation, sensemaking, pattern-detection, reflection, debrief, decision, prioritization, commitment, action-planning, strategy, systems-thinking, help, knowledge-sharing, relationship-mapping, conflict-surfacing, constraints, experimentation, innovation, purpose-clarity

sequenceRoles:
opener, warm-up, discover, diverge, deepen, analyze, synthesize, decide, plan, commit, close, bridge, expert-input

outputTypes:
shared-context, questions, stories, ideas, options, patterns, insights, priorities, decisions, requests, agreements, actions, prototypes, principles, maps, constraints

inputNeeds:
clear-purpose, challenge-question, personal-experience, existing-data, stakeholder-roles, prior-output, examples, problem-list, options-list, decision-context, high-trust, physical-space, expertise, none

energyLevel, trustRequirement, facilitationComplexity:
low, medium, high

riskLevel:
gentle, moderate, sharp

formatFit:
onsite, remote, hybrid

substitute tradeoffs:
shorter, safer, deeper, broader-participation, more-structured, more-energetic, more-reflective, more-action-oriented, better-for-large-groups, better-for-low-trust

confidence:
low, medium, high

## Required Profile Shape

```json
{
  "entryId": "string",
  "purposeTags": ["controlled-value"],
  "sequenceRoles": ["controlled-value"],
  "outputTypes": ["controlled-value"],
  "inputNeeds": ["controlled-value"],
  "energyLevel": "low|medium|high",
  "trustRequirement": "low|medium|high",
  "riskLevel": "gentle|moderate|sharp",
  "facilitationComplexity": "low|medium|high",
  "formatFit": ["onsite|remote|hybrid"],
  "bestWhen": ["short practical sentence"],
  "avoidWhen": ["short practical sentence"],
  "pairsWellAfter": [
    {
      "entryId": "allowed entry id",
      "reason": "under 160 chars",
      "confidence": "low|medium|high"
    }
  ],
  "pairsWellBefore": [
    {
      "entryId": "allowed entry id",
      "reason": "under 160 chars",
      "confidence": "low|medium|high"
    }
  ],
  "useInstead": [
    {
      "entryId": "allowed entry id",
      "tradeoff": "controlled tradeoff",
      "reason": "under 160 chars",
      "confidence": "low|medium|high"
    }
  ],
  "notes": "one concise implementation note",
  "sourceConfidence": "low|medium|high"
}
```

## Input Data

```json
{
  "outputFileName": "ls-profiles-batch-2-output.json",
  "allowedEntryIds": [
    "intro",
    "input",
    "reflection",
    "124all",
    "15percent-solutions",
    "25-10-crowd-sourcing",
    "nine-whys",
    "anxiety-circus",
    "appreciative",
    "agreement-and-certainty-matrix",
    "celebrity-interview",
    "conversation-cafe",
    "critical-uncertainties",
    "design-storyboards",
    "design-storyboards-advanced",
    "discovery-and-action-dialogue-dad",
    "drawing-together",
    "ecocycle-planning",
    "folding-spectogram",
    "gallery-walk",
    "generative-relationships-star",
    "grief-walking",
    "heard-seen-respected",
    "helping-heuristics",
    "impromptu-networking",
    "improv-prototyping",
    "integrated-autonomy",
    "mad-tea-party",
    "min-specs",
    "network-patterning-cards",
    "open-space-technology",
    "panarchy",
    "purpose-to-practice-p2p",
    "shift-and-share",
    "simple-ethnography",
    "social-network-webbing",
    "spiral-journal",
    "talking-with-pixies",
    "tiny-demons",
    "triz",
    "troika-consulting",
    "user-experience-fishbowl",
    "winfy",
    "what-so-what-now-what",
    "wicked-questions",
    "wise-crowds",
    "wise-crowds-fur-grosse-gruppen",
    "xxn-writing"
  ],
  "referenceEntries": [
    {
      "entryId": "intro",
      "title": "Intro / Context",
      "shortDescription": "A short, warm opening creates enough safety before deeper conversation begins.",
      "libraryDuration": "8 min",
      "libraryGroupSize": "Whole group",
      "libraryCategoryLabel": "Opening",
      "matchmakerCategory": "neutral"
    },
    {
      "entryId": "input",
      "title": "Input block",
      "shortDescription": "Use a short framing impulse before the next structure opens up.",
      "libraryDuration": "10 min",
      "libraryGroupSize": "Whole group",
      "libraryCategoryLabel": "Input",
      "matchmakerCategory": "neutral"
    },
    {
      "entryId": "reflection",
      "title": "Reflection",
      "shortDescription": "A gentle way to crystallize patterns before moving to the next module.",
      "libraryDuration": "8 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reflection",
      "matchmakerCategory": "neutral"
    },
    {
      "entryId": "124all",
      "title": "1-2-4-All",
      "shortDescription": "Engage Everyone Simultaneously in Generating Questions, Ideas, and Suggestions",
      "libraryDuration": "12 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "15percent-solutions",
      "title": "15% Solutions",
      "shortDescription": "Discover and Focus on What Each Person Has the Freedom and Resources to Do Now",
      "libraryDuration": "20 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "25-10-crowd-sourcing",
      "title": "25/10 Crowd Sourcing",
      "shortDescription": "Rapidly Generate and Sift a Group's Most Powerful Actionable Ideas",
      "libraryDuration": "30 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "nine-whys",
      "title": "Nine Whys",
      "shortDescription": "Make the Purpose of Your Work Together Clear",
      "libraryDuration": "20 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "anxiety-circus",
      "title": "Anxiety Circus",
      "shortDescription": "Identify the group's biggest worries, fears, and concerns",
      "libraryDuration": "25-30 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "appreciative",
      "title": "Appreciative Interviews",
      "shortDescription": "Discovering and Building on the Root Causes of Success",
      "libraryDuration": "1 hr",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Share / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "agreement-and-certainty-matrix",
      "title": "Agreement & Certainty Matrix",
      "shortDescription": "Sort Challenges into Simple, Complicated, Complex, and Chaotic Domains",
      "libraryDuration": "45 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "celebrity-interview",
      "title": "Celebrity Interview",
      "shortDescription": "Reconnect the Experience of Leaders and Experts with People Closest to the Challenge at Hand",
      "libraryDuration": "35-60 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Share",
      "matchmakerCategory": "share"
    },
    {
      "entryId": "conversation-cafe",
      "title": "Conversation Café",
      "shortDescription": "Engage Everyone in Making Sense of Profound Challenges",
      "libraryDuration": "35-60 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Share",
      "matchmakerCategory": "share"
    },
    {
      "entryId": "critical-uncertainties",
      "title": "Critical Uncertainties",
      "shortDescription": "Develop Strategies for Operating in a Range of Plausible Yet Unpredictable Futures",
      "libraryDuration": "100 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Strategize / Solo",
      "matchmakerCategory": "strategize"
    },
    {
      "entryId": "design-storyboards",
      "title": "Design StoryBoards",
      "shortDescription": "Define Step-by-Step Elements for Bringing Meetings to Productive Endpoints",
      "libraryDuration": "25-70 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Plan / Solo",
      "matchmakerCategory": "plan"
    },
    {
      "entryId": "design-storyboards-advanced",
      "title": "Design StoryBoards Advanced",
      "shortDescription": "Plan productive transformation and innovation projects step by step",
      "libraryDuration": "18 hrs to several days/weeks",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Plan",
      "matchmakerCategory": "plan"
    },
    {
      "entryId": "discovery-and-action-dialogue-dad",
      "title": "Discovery & Action Dialogue (DAD)",
      "shortDescription": "Discover, Invent, and Unleash Local Solutions to Chronic Problems",
      "libraryDuration": "25-70 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "drawing-together",
      "title": "Drawing Together",
      "shortDescription": "Reveal Insights and Paths Forward Through Nonverbal Expression",
      "libraryDuration": "40 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "ecocycle-planning",
      "title": "Ecocycle Planning",
      "shortDescription": "Analyze the Full Portfolio of Activities and Relationships to Identify Obstacles and Opportunities for Progress",
      "libraryDuration": "95 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Strategize / Analyze / Solo",
      "matchmakerCategory": "strategize"
    },
    {
      "entryId": "folding-spectogram",
      "title": "Folding Spectogram",
      "shortDescription": "Invite everyone to take a position on a question with controversial opinions",
      "libraryDuration": "15-20 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "gallery-walk",
      "title": "Gallery Walk",
      "shortDescription": "Deepen shared information and ideas while moving through the room",
      "libraryDuration": "6-25 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Share / Solo",
      "matchmakerCategory": "share"
    },
    {
      "entryId": "generative-relationships-star",
      "title": "Generative Relationships (STAR)",
      "shortDescription": "Reveal Relationship Patterns That Create Surprising Value or Dysfunctions",
      "libraryDuration": "25 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Analyze",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "grief-walking",
      "title": "Grief Walking",
      "shortDescription": "Use social support while living through loss or profound change",
      "libraryDuration": "30-60 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Help",
      "matchmakerCategory": "help"
    },
    {
      "entryId": "heard-seen-respected",
      "title": "Heard, Seen, Respected",
      "shortDescription": "Practice Deeper Listening and Empathy with Colleagues",
      "libraryDuration": "35 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Help",
      "matchmakerCategory": "help"
    },
    {
      "entryId": "helping-heuristics",
      "title": "Helping Heuristics",
      "shortDescription": "Practice Progressive Methods for Helping Others, Receiving Help and Asking for Help",
      "libraryDuration": "15 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Help",
      "matchmakerCategory": "help"
    },
    {
      "entryId": "impromptu-networking",
      "title": "Impromptu Networking",
      "shortDescription": "Rapidly Share Challenges and Expectations, Build New Connections",
      "libraryDuration": "20 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Share",
      "matchmakerCategory": "share"
    },
    {
      "entryId": "improv-prototyping",
      "title": "Improv Prototyping",
      "shortDescription": "Develop Effective Solutions to Chronic Challenges While Having Serious Fun",
      "libraryDuration": "20 min per round",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "integrated-autonomy",
      "title": "Integrated~Autonomy",
      "shortDescription": "Move from Either-or to Robust Both-and Solutions",
      "libraryDuration": "80 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Strategize / Solo",
      "matchmakerCategory": "strategize"
    },
    {
      "entryId": "mad-tea-party",
      "title": "Mad Tea Party",
      "shortDescription": "Rearrange the Context for Taking Action",
      "libraryDuration": "10-20 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "min-specs",
      "title": "Min Specs",
      "shortDescription": "Specify Only the Absolute \"Must dos\" and \"Must not dos\" for Achieving a Purpose",
      "libraryDuration": "35-50 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Strategize / Solo",
      "matchmakerCategory": "strategize"
    },
    {
      "entryId": "network-patterning-cards",
      "title": "Network Patterning Cards",
      "shortDescription": "Identify and design more productive organizational patterns for collaboration",
      "libraryDuration": "25 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "open-space-technology",
      "title": "Open Space Technology",
      "shortDescription": "Liberate Inherent Action and Leadership in Groups of Any Size",
      "libraryDuration": "90 min to 3 days",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "panarchy",
      "title": "Panarchy",
      "shortDescription": "Understand How Embedded Systems Interact, Evolve, Spread Innovation and Transform",
      "libraryDuration": "2 hrs",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Strategize / Analyze",
      "matchmakerCategory": "strategize"
    },
    {
      "entryId": "purpose-to-practice-p2p",
      "title": "Purpose-To-Practice (P2P)",
      "shortDescription": "Design the Five Essential Elements for a Resilient and Enduring Initiative",
      "libraryDuration": "2 hrs",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Plan / Solo",
      "matchmakerCategory": "plan"
    },
    {
      "entryId": "shift-and-share",
      "title": "Shift and Share",
      "shortDescription": "Spread Good Ideas and Make Informal Connections with Innovators",
      "libraryDuration": "90 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Share",
      "matchmakerCategory": "share"
    },
    {
      "entryId": "simple-ethnography",
      "title": "Simple Ethnography",
      "shortDescription": "Observe and Record Actual Behaviors of Users in the Field",
      "libraryDuration": "75 min to 7 hrs",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Analyze / Reveal",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "social-network-webbing",
      "title": "Social Network Webbing",
      "shortDescription": "Map Informal Connections and Decide How to Strengthen the Network to Achieve a Purpose",
      "libraryDuration": "60 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Help / Share / Solo",
      "matchmakerCategory": "help"
    },
    {
      "entryId": "spiral-journal",
      "title": "Spiral Journal",
      "shortDescription": "Deepen insights and discover open questions through self-reflection",
      "libraryDuration": "10-20 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "talking-with-pixies",
      "title": "Talking with Pixies",
      "shortDescription": "Identify and break through beliefs and assumptions that constrain your action",
      "libraryDuration": "30 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Help / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "tiny-demons",
      "title": "Tiny Demons",
      "shortDescription": "Explore personal inner blockers and convert them into insight",
      "libraryDuration": "12-20 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "triz",
      "title": "TRIZ",
      "shortDescription": "Stop Counterproductive Activities and Behaviors to Make Space for Innovation",
      "libraryDuration": "35 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "troika-consulting",
      "title": "Troika Consulting",
      "shortDescription": "Get Practical and Imaginative Help from Colleagues Immediately",
      "libraryDuration": "30 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal / Help",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "user-experience-fishbowl",
      "title": "User Experience Fishbowl",
      "shortDescription": "Share Know-How Gained from Experience with a Larger Community",
      "libraryDuration": "35-70 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Share",
      "matchmakerCategory": "share"
    },
    {
      "entryId": "winfy",
      "title": "What I Need From You",
      "shortDescription": "Surface Essential Needs Across Functions and Accept or Reject Requests for Support",
      "libraryDuration": "55-70 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Help",
      "matchmakerCategory": "help"
    },
    {
      "entryId": "what-so-what-now-what",
      "title": "What, So What, Now What?",
      "shortDescription": "Together, Look Back on Progress to Date and Decide What Adjustments Are Needed",
      "libraryDuration": "45 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "wicked-questions",
      "title": "Wicked Questions",
      "shortDescription": "Articulate the Paradoxical Challenges That a Group Must Confront to Succeed",
      "libraryDuration": "25 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "wise-crowds",
      "title": "Wise Crowds",
      "shortDescription": "Tap the Wisdom of the Whole Group in Rapid Cycles",
      "libraryDuration": "15 min per person",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal / Help",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "wise-crowds-fur-grosse-gruppen",
      "title": "Wise Crowds for Large Groups",
      "shortDescription": "Use the knowledge of individual experts and the whole group",
      "libraryDuration": "60 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal / Help",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "xxn-writing",
      "title": "XxN-Writing",
      "shortDescription": "Sharpen and focus thinking through a sequence of questions or statements",
      "libraryDuration": "10-25 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    }
  ],
  "entriesToProfile": [
    {
      "entryId": "15percent-solutions",
      "title": "15% Solutions",
      "shortDescription": "Discover and Focus on What Each Person Has the Freedom and Resources to Do Now",
      "libraryDuration": "20 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "25-10-crowd-sourcing",
      "title": "25/10 Crowd Sourcing",
      "shortDescription": "Rapidly Generate and Sift a Group's Most Powerful Actionable Ideas",
      "libraryDuration": "30 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "mad-tea-party",
      "title": "Mad Tea Party",
      "shortDescription": "Rearrange the Context for Taking Action",
      "libraryDuration": "10-20 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "spiral-journal",
      "title": "Spiral Journal",
      "shortDescription": "Deepen insights and discover open questions through self-reflection",
      "libraryDuration": "10-20 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "xxn-writing",
      "title": "XxN-Writing",
      "shortDescription": "Sharpen and focus thinking through a sequence of questions or statements",
      "libraryDuration": "10-25 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "drawing-together",
      "title": "Drawing Together",
      "shortDescription": "Reveal Insights and Paths Forward Through Nonverbal Expression",
      "libraryDuration": "40 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "folding-spectogram",
      "title": "Folding Spectogram",
      "shortDescription": "Invite everyone to take a position on a question with controversial opinions",
      "libraryDuration": "15-20 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "wicked-questions",
      "title": "Wicked Questions",
      "shortDescription": "Articulate the Paradoxical Challenges That a Group Must Confront to Succeed",
      "libraryDuration": "25 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "tiny-demons",
      "title": "Tiny Demons",
      "shortDescription": "Explore personal inner blockers and convert them into insight",
      "libraryDuration": "12-20 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "anxiety-circus",
      "title": "Anxiety Circus",
      "shortDescription": "Identify the group's biggest worries, fears, and concerns",
      "libraryDuration": "25-30 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    }
  ]
}
```
