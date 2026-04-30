import type { StepFlow } from "@/domain/workshop/types";

export const officialLsStepFlows: Record<string, StepFlow[]> = {
  "124all": [
    {
      title: "1. Solo reflection",
      role: "Prompt moment",
      prompt: "What opportunities do you see for making progress on this challenge?",
      facilitatorCue: "Give everyone quiet time before any conversation starts.",
    },
    {
      title: "2. Pair exchange",
      role: "Prompt moment",
      prompt: "Share and build on your ideas with one partner.",
      facilitatorCue: "Keep the pair exchange short and equal.",
    },
    {
      title: "3. Foursome synthesis",
      role: "Prompt moment",
      prompt: "Compare what emerged in your pairs and notice similarities and differences.",
      facilitatorCue: "Ask groups to combine, refine, and sharpen their strongest ideas.",
    },
    {
      title: "4. Whole-group harvest",
      role: "Facilitator move",
      prompt: "What is one idea that stood out in your conversation?",
      facilitatorCue: "Harvest one important idea per group and repeat the cycle if useful.",
    },
  ],
  "15percent-solutions": [
    {
      title: "1. Frame individual freedom",
      role: "Prompt moment",
      prompt: "What is your 15 percent, the action you can take now without more authority or resources?",
      facilitatorCue: "Point people toward action inside their current discretion.",
    },
    {
      title: "2. Solo list",
      role: "Prompt moment",
      prompt: "List concrete actions you can start immediately.",
      facilitatorCue: "Keep the list grounded in what each person controls today.",
    },
    {
      title: "3. Small-group consult",
      role: "Prompt moment",
      prompt: "Share your actions and ask your group for one way to make them bolder or easier to start.",
      facilitatorCue: "Invite practical help without turning this into permission seeking.",
    },
    {
      title: "4. Commit and harvest",
      role: "Facilitator move",
      prompt: "What action will you start first?",
      facilitatorCue: "Close with visible commitments and a short check-in plan.",
    },
  ],
  "25-10-crowd-sourcing": [
    {
      title: "1. Write one bold idea",
      role: "Prompt moment",
      prompt: "What bold first step could help us make progress on this challenge?",
      facilitatorCue: "Ask for one clear idea per card, written so others can understand it quickly.",
    },
    {
      title: "2. Pass cards rapidly",
      role: "Facilitator move",
      facilitatorCue: "Have participants mill around and exchange cards several times without discussion.",
    },
    {
      title: "3. Score anonymously",
      role: "Prompt moment",
      prompt: "Score the idea in your hand from 1 to 5 for promise and usefulness.",
      facilitatorCue: "Repeat passing and scoring for five rounds so each idea receives multiple ratings.",
    },
    {
      title: "4. Find top ideas",
      role: "Facilitator move",
      facilitatorCue: "Add the scores, identify the strongest ideas, and invite brief reflection on what made them promising.",
    },
  ],
  "nine-whys": [
    {
      title: "1. Pair up around the work",
      role: "Prompt moment",
      prompt: "What do you do when you are working on this challenge?",
      facilitatorCue: "Start with concrete work, not abstract mission language.",
    },
    {
      title: "2. Ask why repeatedly",
      role: "Prompt moment",
      prompt: "Why is that important to you?",
      facilitatorCue: "Invite partners to ask why up to nine times, listening for deeper purpose.",
    },
    {
      title: "3. Switch roles",
      role: "Facilitator move",
      facilitatorCue: "Have partners reverse interviewer and interviewee roles with the same disciplined curiosity.",
    },
    {
      title: "4. Share purpose statements",
      role: "Prompt moment",
      prompt: "What deeper purpose did you hear behind the work?",
      facilitatorCue: "Harvest crisp purpose language and look for shared themes.",
    },
  ],
  "anxiety-circus": [
    {
      title: "1. Name the worry field",
      role: "Prompt moment",
      prompt: "What worries, fears, or concerns are present around this situation?",
      facilitatorCue: "Normalize concern as data and make the question safe to answer.",
    },
    {
      title: "2. Sort by influence",
      role: "Prompt moment",
      prompt: "Which concerns can we influence, and which are outside our control?",
      facilitatorCue: "Keep the group from treating every anxiety as equally actionable.",
    },
    {
      title: "3. Find protective action",
      role: "Prompt moment",
      prompt: "What action would reduce risk or increase readiness for the concerns we can influence?",
      facilitatorCue: "Move from rumination toward concrete protective moves.",
    },
    {
      title: "4. Harvest signals",
      role: "Facilitator move",
      facilitatorCue: "Capture the most important concerns, actions, and watchpoints for later decisions.",
    },
  ],
  "appreciative": [
    {
      title: "1. Set up interviews",
      role: "Facilitator move",
      facilitatorCue: "Invite pairs to explore a specific time when the work was at its best.",
    },
    {
      title: "2. Interview round one",
      role: "Prompt moment",
      prompt: "Tell a story about a time when this challenge was handled especially well. What made that possible?",
      facilitatorCue: "Ask interviewers to listen for conditions, behaviors, and repeatable patterns.",
    },
    {
      title: "3. Switch roles",
      role: "Facilitator move",
      facilitatorCue: "Reverse interviewer and storyteller roles with the same question.",
    },
    {
      title: "4. Extract success conditions",
      role: "Prompt moment",
      prompt: "What conditions made success possible, and how could we create more of them?",
      facilitatorCue: "Harvest assets and practical conditions rather than generic positivity.",
    },
  ],
  "agreement-and-certainty-matrix": [
    {
      title: "1. Introduce the matrix",
      role: "Facilitator move",
      facilitatorCue: "Set up agreement and certainty as two axes for making sense of challenges.",
    },
    {
      title: "2. Place challenges",
      role: "Prompt moment",
      prompt: "Where does each challenge sit: simple, complicated, complex, or chaotic?",
      facilitatorCue: "Encourage evidence-based placement instead of quick labeling.",
    },
    {
      title: "3. Compare interpretations",
      role: "Prompt moment",
      prompt: "Where do we disagree about the domain, and what does that tell us?",
      facilitatorCue: "Use differences in placement to surface hidden assumptions.",
    },
    {
      title: "4. Match responses",
      role: "Facilitator move",
      facilitatorCue: "Choose next actions that fit the domain rather than forcing one management approach.",
    },
  ],
  "celebrity-interview": [
    {
      title: "1. Choose the expert and interviewer",
      role: "Facilitator move",
      facilitatorCue: "Select someone with direct experience and a host who can ask useful questions.",
    },
    {
      title: "2. Gather audience questions",
      role: "Prompt moment",
      prompt: "What do you most want to learn from this person's experience?",
      facilitatorCue: "Collect questions that connect expertise to the challenge at hand.",
    },
    {
      title: "3. Conduct the interview",
      role: "Facilitator move",
      facilitatorCue: "Keep the tone conversational and useful, leaving room for surprising stories.",
    },
    {
      title: "4. Reflect and harvest",
      role: "Prompt moment",
      prompt: "What did you hear that changes how we might act?",
      facilitatorCue: "Turn expert insight into practical implications for participants.",
    },
  ],
  "conversation-cafe": [
    {
      title: "1. Set agreements and question",
      role: "Prompt moment",
      prompt: "What does this challenge mean for us now?",
      facilitatorCue: "Introduce the conversation agreements and a talking object if useful.",
    },
    {
      title: "2. First round",
      role: "Prompt moment",
      prompt: "Share what you are thinking, feeling, or noticing about the challenge.",
      facilitatorCue: "Invite each person to speak briefly while others listen.",
    },
    {
      title: "3. Deeper rounds",
      role: "Prompt moment",
      prompt: "What is becoming clearer as you listen to others?",
      facilitatorCue: "Use additional rounds to deepen meaning rather than debate positions.",
    },
    {
      title: "4. Harvest insight",
      role: "Facilitator move",
      facilitatorCue: "Ask groups to name shared hunches, questions, or possibilities for action.",
    },
  ],
  "critical-uncertainties": [
    {
      title: "1. Identify uncertainties",
      role: "Prompt moment",
      prompt: "What uncertainties could dramatically affect our future options?",
      facilitatorCue: "Push beyond obvious risks toward uncertainties with real strategic impact.",
    },
    {
      title: "2. Choose two critical axes",
      role: "Facilitator move",
      facilitatorCue: "Select the two uncertainties that are most important and least predictable.",
    },
    {
      title: "3. Build four scenarios",
      role: "Prompt moment",
      prompt: "What could happen in each combination of these two uncertainties?",
      facilitatorCue: "Make each scenario vivid enough to test strategy.",
    },
    {
      title: "4. Derive robust strategies",
      role: "Prompt moment",
      prompt: "What strategy would work across several futures, and what early signals should we watch?",
      facilitatorCue: "Harvest robust moves, hedges, and monitoring signals.",
    },
  ],
  "design-storyboards": [
    {
      title: "1. Define the purpose",
      role: "Prompt moment",
      prompt: "What must this meeting or workshop make possible?",
      facilitatorCue: "Start from the endpoint and participants, not from favorite activities.",
    },
    {
      title: "2. Select design elements",
      role: "Facilitator move",
      facilitatorCue: "Choose structures, transitions, timing, materials, and group configurations.",
    },
    {
      title: "3. Sequence the flow",
      role: "Prompt moment",
      prompt: "What must happen first, next, and last for the group to reach the endpoint?",
      facilitatorCue: "Make outputs from one step feed the next step.",
    },
    {
      title: "4. Test and refine",
      role: "Facilitator move",
      facilitatorCue: "Walk through the design, check constraints, and adjust the storyboard before facilitating.",
    },
  ],
  "design-storyboards-advanced": [
    {
      title: "1. Frame the initiative",
      role: "Prompt moment",
      prompt: "What transformation or innovation effort needs a designed sequence of work?",
      facilitatorCue: "Clarify purpose, stakeholders, constraints, and desired outcomes.",
    },
    {
      title: "2. Map phases",
      role: "Facilitator move",
      facilitatorCue: "Break the work into phases with clear intermediate outputs.",
    },
    {
      title: "3. Design each gathering",
      role: "Prompt moment",
      prompt: "Which structures and artifacts will move each phase forward?",
      facilitatorCue: "Design the project as a chain of participatory moments.",
    },
    {
      title: "4. Review dependencies",
      role: "Facilitator move",
      facilitatorCue: "Check timing, decisions, handoffs, and ownership before launching the sequence.",
    },
  ],
  "discovery-and-action-dialogue-dad": [
    {
      title: "1. Gather around the challenge",
      role: "Prompt moment",
      prompt: "What makes it hard to solve this chronic problem?",
      facilitatorCue: "Invite people closest to the work and protect local expertise.",
    },
    {
      title: "2. Discover exceptions",
      role: "Prompt moment",
      prompt: "Do you know anyone who is already succeeding against the odds? What do they do?",
      facilitatorCue: "Look for existing positive deviance rather than imported solutions.",
    },
    {
      title: "3. Identify barriers and supports",
      role: "Prompt moment",
      prompt: "What prevents more people from doing this, and what would help?",
      facilitatorCue: "Keep the dialogue grounded in behavior and local conditions.",
    },
    {
      title: "4. Choose action",
      role: "Prompt moment",
      prompt: "What small action can we take now using resources we already have?",
      facilitatorCue: "Close with locally owned experiments.",
    },
  ],
  "drawing-together": [
    {
      title: "1. Introduce drawing symbols",
      role: "Facilitator move",
      facilitatorCue: "Offer a small set of simple symbols so drawing feels accessible.",
    },
    {
      title: "2. Draw the current story",
      role: "Prompt moment",
      prompt: "Draw how you see this challenge without using words.",
      facilitatorCue: "Emphasize meaning over artistic skill.",
    },
    {
      title: "3. Pair interpretation",
      role: "Prompt moment",
      prompt: "What do you see in your partner's drawing before they explain it?",
      facilitatorCue: "Let interpretation reveal new perspectives before the author adds context.",
    },
    {
      title: "4. Harvest paths forward",
      role: "Facilitator move",
      facilitatorCue: "Invite participants to name insights, tensions, and possible next moves.",
    },
  ],
  "ecocycle-planning": [
    {
      title: "1. List activities",
      role: "Prompt moment",
      prompt: "What activities, projects, or relationships are part of this portfolio?",
      facilitatorCue: "Create a broad inventory before evaluating anything.",
    },
    {
      title: "2. Place on the ecocycle",
      role: "Prompt moment",
      prompt: "Where does each activity sit: birth, maturity, creative destruction, or renewal?",
      facilitatorCue: "Invite honest placement and watch for traps of rigidity or scarcity.",
    },
    {
      title: "3. Identify traps and opportunities",
      role: "Prompt moment",
      prompt: "Where are we stuck, and where is energy ready to move?",
      facilitatorCue: "Look for over-investment, under-investment, and renewal possibilities.",
    },
    {
      title: "4. Decide portfolio shifts",
      role: "Facilitator move",
      facilitatorCue: "Harvest stop, start, continue, and invest decisions.",
    },
  ],
  "folding-spectogram": [
    {
      title: "1. Set the continuum",
      role: "Prompt moment",
      prompt: "Where do you stand between these two positions?",
      facilitatorCue: "Make the endpoints clear and physically visible.",
    },
    {
      title: "2. Take positions",
      role: "Facilitator move",
      facilitatorCue: "Ask participants to place themselves along the line without debate.",
    },
    {
      title: "3. Fold into conversations",
      role: "Prompt moment",
      prompt: "Why did you choose this position, and what are you curious about in another position?",
      facilitatorCue: "Pair or cluster people across the spectrum to increase perspective-taking.",
    },
    {
      title: "4. Harvest differences",
      role: "Facilitator move",
      facilitatorCue: "Capture patterns, surprises, and productive tensions.",
    },
  ],
  "gallery-walk": [
    {
      title: "1. Prepare stations",
      role: "Facilitator move",
      facilitatorCue: "Arrange posters, artifacts, or ideas so participants can move among them.",
    },
    {
      title: "2. Walk and observe",
      role: "Prompt moment",
      prompt: "What stands out, raises questions, or suggests a connection?",
      facilitatorCue: "Keep movement quiet enough for noticing before discussion.",
    },
    {
      title: "3. Add comments",
      role: "Prompt moment",
      prompt: "Leave a note, question, or build where it will help others see more.",
      facilitatorCue: "Invite concise written contributions at each station.",
    },
    {
      title: "4. Debrief patterns",
      role: "Facilitator move",
      facilitatorCue: "Harvest repeated themes, gaps, and ideas worth carrying forward.",
    },
  ],
  "generative-relationships-star": [
    {
      title: "1. Introduce relationship dimensions",
      role: "Facilitator move",
      facilitatorCue: "Explain the STAR dimensions as lenses for relationship quality.",
    },
    {
      title: "2. Assess current patterns",
      role: "Prompt moment",
      prompt: "Where do our relationships create value, and where do they limit us?",
      facilitatorCue: "Ask for behavioral evidence rather than personality judgments.",
    },
    {
      title: "3. Compare views",
      role: "Prompt moment",
      prompt: "Where do we see the pattern similarly or differently?",
      facilitatorCue: "Use differences to reveal the system, not to assign blame.",
    },
    {
      title: "4. Choose relationship experiments",
      role: "Facilitator move",
      facilitatorCue: "Identify small experiments that could improve connection, trust, or coordination.",
    },
  ],
  "grief-walking": [
    {
      title: "1. Frame the loss or change",
      role: "Prompt moment",
      prompt: "What loss or profound change are you carrying right now?",
      facilitatorCue: "Create a respectful container and make participation invitational.",
    },
    {
      title: "2. Walk with a listener",
      role: "Prompt moment",
      prompt: "Share what is present while your partner listens without fixing.",
      facilitatorCue: "Protect quiet presence and avoid advice-giving.",
    },
    {
      title: "3. Switch roles",
      role: "Facilitator move",
      facilitatorCue: "Have partners change roles and repeat the listening walk.",
    },
    {
      title: "4. Return with support",
      role: "Prompt moment",
      prompt: "What support or next small step would help you continue?",
      facilitatorCue: "Harvest gently, allowing people to keep private what should remain private.",
    },
  ],
  "heard-seen-respected": [
    {
      title: "1. Pair up",
      role: "Facilitator move",
      facilitatorCue: "Invite pairs and set the expectation of deep listening without interruption.",
    },
    {
      title: "2. Share a story",
      role: "Prompt moment",
      prompt: "Tell a story about a time you did not feel heard, seen, or respected.",
      facilitatorCue: "Give the listener a clear role: presence, curiosity, and no fixing.",
    },
    {
      title: "3. Switch roles",
      role: "Facilitator move",
      facilitatorCue: "Repeat the same listening practice with roles reversed.",
    },
    {
      title: "4. Debrief listening",
      role: "Prompt moment",
      prompt: "What did you notice about what helps people feel heard, seen, and respected?",
      facilitatorCue: "Harvest listening conditions, not personal story details.",
    },
  ],
  "helping-heuristics": [
    {
      title: "1. Introduce helping patterns",
      role: "Facilitator move",
      facilitatorCue: "Name the helping heuristics and the difference between useful and unhelpful help.",
    },
    {
      title: "2. Practice in triads",
      role: "Prompt moment",
      prompt: "Ask for help with a real challenge while others practice a helping stance.",
      facilitatorCue: "Rotate helper, helped person, and observer roles.",
    },
    {
      title: "3. Reflect on the interaction",
      role: "Prompt moment",
      prompt: "What kind of help increased agency, and what reduced it?",
      facilitatorCue: "Keep the reflection concrete and behavioral.",
    },
    {
      title: "4. Extract heuristics",
      role: "Facilitator move",
      facilitatorCue: "Harvest practical helping moves participants want to use more deliberately.",
    },
  ],
  "impromptu-networking": [
    {
      title: "1. Pose the invitation",
      role: "Prompt moment",
      prompt: "What big challenge do you bring, and what do you hope to get from and contribute to this group?",
      facilitatorCue: "Use a question that links personal purpose to the gathering.",
    },
    {
      title: "2. First pairing",
      role: "Prompt moment",
      prompt: "Share your response with a partner.",
      facilitatorCue: "Keep the round energetic and timeboxed.",
    },
    {
      title: "3. Repeat with new partners",
      role: "Facilitator move",
      facilitatorCue: "Run two more rounds with new partners so connections multiply quickly.",
    },
    {
      title: "4. Harvest energy",
      role: "Facilitator move",
      facilitatorCue: "Ask for a few patterns, questions, or opportunities people heard across conversations.",
    },
  ],
  "improv-prototyping": [
    {
      title: "1. Define the chronic challenge",
      role: "Prompt moment",
      prompt: "What recurring situation needs a new response?",
      facilitatorCue: "Choose a real scenario that can be acted out quickly.",
    },
    {
      title: "2. Create a short scene",
      role: "Facilitator move",
      facilitatorCue: "Have participants improvise the current pattern and then a possible alternative.",
    },
    {
      title: "3. Observe what works",
      role: "Prompt moment",
      prompt: "What changed the interaction for the better?",
      facilitatorCue: "Focus on visible behaviors, not performance quality.",
    },
    {
      title: "4. Iterate the prototype",
      role: "Facilitator move",
      facilitatorCue: "Run another quick version and harvest practical moves to test in real life.",
    },
  ],
  "integrated-autonomy": [
    {
      title: "1. Name the polarity",
      role: "Prompt moment",
      prompt: "What either-or tension is limiting our options?",
      facilitatorCue: "Frame both sides as valuable instead of treating one as wrong.",
    },
    {
      title: "2. Explore each side",
      role: "Prompt moment",
      prompt: "What value does each side protect, and what risk appears when it dominates?",
      facilitatorCue: "Make the logic of both positions explicit.",
    },
    {
      title: "3. Generate both-and moves",
      role: "Prompt moment",
      prompt: "What design could give us more of both values at the same time?",
      facilitatorCue: "Push for practical configurations rather than compromise slogans.",
    },
    {
      title: "4. Choose experiments",
      role: "Facilitator move",
      facilitatorCue: "Select experiments that test a more integrated operating pattern.",
    },
  ],
  "mad-tea-party": [
    {
      title: "1. Prepare sentence stems",
      role: "Facilitator move",
      facilitatorCue: "Create provocative sentence starters connected to the topic.",
    },
    {
      title: "2. Rapid paired completions",
      role: "Prompt moment",
      prompt: "Complete the sentence stem with the partner in front of you.",
      facilitatorCue: "Keep the pace lively so participants speak from intuition.",
    },
    {
      title: "3. Rotate repeatedly",
      role: "Facilitator move",
      facilitatorCue: "Move one line or circle after each prompt to create many brief exchanges.",
    },
    {
      title: "4. Notice surprises",
      role: "Prompt moment",
      prompt: "What did you say or hear that surprised you?",
      facilitatorCue: "Harvest reflections, insights, and possible actions.",
    },
  ],
  "min-specs": [
    {
      title: "1. Define the purpose",
      role: "Prompt moment",
      prompt: "What purpose are we trying to make possible?",
      facilitatorCue: "Make the purpose clear enough to test rules against it.",
    },
    {
      title: "2. Generate must-dos and must-not-dos",
      role: "Prompt moment",
      prompt: "What rules are absolutely necessary, and what must we avoid?",
      facilitatorCue: "Invite a broad initial list before narrowing.",
    },
    {
      title: "3. Test for minimum",
      role: "Prompt moment",
      prompt: "If we broke this rule, could we still achieve the purpose?",
      facilitatorCue: "Remove anything that is useful but not essential.",
    },
    {
      title: "4. Publish the min specs",
      role: "Facilitator move",
      facilitatorCue: "Capture the smallest set of enabling constraints and make them actionable.",
    },
  ],
  "network-patterning-cards": [
    {
      title: "1. Choose the network focus",
      role: "Prompt moment",
      prompt: "What collaboration network or relationship pattern do we want to improve?",
      facilitatorCue: "Keep the focus specific enough for people to map real connections.",
    },
    {
      title: "2. Map the current pattern",
      role: "Facilitator move",
      facilitatorCue: "Use cards to make existing roles, flows, bottlenecks, and gaps visible.",
    },
    {
      title: "3. Explore alternative patterns",
      role: "Prompt moment",
      prompt: "What pattern would make collaboration more productive?",
      facilitatorCue: "Invite participants to rearrange cards and test different network shapes.",
    },
    {
      title: "4. Select next shifts",
      role: "Facilitator move",
      facilitatorCue: "Harvest concrete changes to relationships, information flow, or coordination.",
    },
  ],
  "open-space-technology": [
    {
      title: "1. Open the marketplace",
      role: "Prompt moment",
      prompt: "What issue or opportunity do you care enough about to host a conversation?",
      facilitatorCue: "Explain the principles, the law of mobility, and the agenda marketplace.",
    },
    {
      title: "2. Create the agenda",
      role: "Facilitator move",
      facilitatorCue: "Invite participants to post sessions and choose where to contribute.",
    },
    {
      title: "3. Self-organize sessions",
      role: "Prompt moment",
      prompt: "Join the conversation where you can learn or contribute most.",
      facilitatorCue: "Let hosts and participants work with minimal interference.",
    },
    {
      title: "4. Converge and close",
      role: "Facilitator move",
      facilitatorCue: "Collect notes, action proposals, and commitments from across sessions.",
    },
  ],
  "panarchy": [
    {
      title: "1. Identify system levels",
      role: "Prompt moment",
      prompt: "What levels of the system affect this challenge?",
      facilitatorCue: "Include local, organizational, field, and broader contextual levels as relevant.",
    },
    {
      title: "2. Map lifecycle dynamics",
      role: "Prompt moment",
      prompt: "Where is each level in its cycle of birth, maturity, release, or renewal?",
      facilitatorCue: "Help the group see interactions across levels, not isolated parts.",
    },
    {
      title: "3. Find leverage across levels",
      role: "Prompt moment",
      prompt: "Where could a change at one level open possibilities at another?",
      facilitatorCue: "Look for windows of opportunity and constraints that travel across levels.",
    },
    {
      title: "4. Choose multi-level action",
      role: "Facilitator move",
      facilitatorCue: "Harvest actions, experiments, and watchpoints across the system.",
    },
  ],
  "purpose-to-practice-p2p": [
    {
      title: "1. Purpose",
      role: "Prompt moment",
      prompt: "Why is this work important to us and to the wider community?",
      facilitatorCue: "Start with a purpose that can guide choices under pressure.",
    },
    {
      title: "2. Principles",
      role: "Prompt moment",
      prompt: "What rules of thumb will guide our behavior?",
      facilitatorCue: "Translate values into usable design principles.",
    },
    {
      title: "3. Participants and structure",
      role: "Prompt moment",
      prompt: "Who must be included, and how will we organize ourselves?",
      facilitatorCue: "Clarify participation, roles, decision patterns, and boundaries.",
    },
    {
      title: "4. Practices and action",
      role: "Facilitator move",
      facilitatorCue: "Define concrete practices and first actions that bring the purpose to life.",
    },
  ],
  "shift-and-share": [
    {
      title: "1. Set up stations",
      role: "Facilitator move",
      facilitatorCue: "Invite innovators or hosts to prepare short, experience-based stations.",
    },
    {
      title: "2. Rotate small groups",
      role: "Prompt moment",
      prompt: "What can you learn from this practice, story, or prototype?",
      facilitatorCue: "Keep rounds timeboxed and let participants move among stations.",
    },
    {
      title: "3. Ask and connect",
      role: "Prompt moment",
      prompt: "What question or connection would help this idea spread?",
      facilitatorCue: "Encourage informal relationship-building with the hosts.",
    },
    {
      title: "4. Harvest spread signals",
      role: "Facilitator move",
      facilitatorCue: "Collect what people want to try, adapt, or connect after the rotations.",
    },
  ],
  "simple-ethnography": [
    {
      title: "1. Define what to observe",
      role: "Prompt moment",
      prompt: "What behavior or experience do we need to understand in the field?",
      facilitatorCue: "Focus observation on real behavior, not reported preference.",
    },
    {
      title: "2. Observe without fixing",
      role: "Facilitator move",
      facilitatorCue: "Have observers watch and record what people actually do and say.",
    },
    {
      title: "3. Compare observations",
      role: "Prompt moment",
      prompt: "What patterns, workarounds, or surprises did we see?",
      facilitatorCue: "Separate observations from interpretations at first.",
    },
    {
      title: "4. Generate implications",
      role: "Facilitator move",
      facilitatorCue: "Turn field observations into design questions, experiments, or decisions.",
    },
  ],
  "social-network-webbing": [
    {
      title: "1. Name the purpose",
      role: "Prompt moment",
      prompt: "What purpose should this network help us achieve?",
      facilitatorCue: "Tie the network map to a practical purpose.",
    },
    {
      title: "2. Map current connections",
      role: "Facilitator move",
      facilitatorCue: "Have participants make visible who is connected to whom and around what.",
    },
    {
      title: "3. Identify gaps and hubs",
      role: "Prompt moment",
      prompt: "Which connections are missing, overloaded, or ready to strengthen?",
      facilitatorCue: "Look for patterns that affect learning, support, and action.",
    },
    {
      title: "4. Commit to network moves",
      role: "Facilitator move",
      facilitatorCue: "Harvest introductions, bridging moves, and follow-up commitments.",
    },
  ],
  "spiral-journal": [
    {
      title: "1. Prepare a quiet prompt",
      role: "Prompt moment",
      prompt: "What do you need to understand more deeply about this situation?",
      facilitatorCue: "Create quiet conditions for individual reflection.",
    },
    {
      title: "2. Write in rounds",
      role: "Prompt moment",
      prompt: "Keep writing, following what emerges without editing too early.",
      facilitatorCue: "Use timed rounds or spiral prompts to deepen the inquiry.",
    },
    {
      title: "3. Notice patterns",
      role: "Prompt moment",
      prompt: "What words, questions, or insights keep returning?",
      facilitatorCue: "Invite participants to mark what feels important.",
    },
    {
      title: "4. Share selectively",
      role: "Facilitator move",
      facilitatorCue: "Offer optional sharing of insights or next questions while preserving privacy.",
    },
  ],
  "talking-with-pixies": [
    {
      title: "1. Identify limiting assumptions",
      role: "Prompt moment",
      prompt: "What belief or assumption might be constraining your action?",
      facilitatorCue: "Invite self-inquiry without turning it into self-criticism.",
    },
    {
      title: "2. Externalize the voice",
      role: "Prompt moment",
      prompt: "If that assumption could speak, what would it say?",
      facilitatorCue: "Make the belief visible and discussable by giving it distance.",
    },
    {
      title: "3. Question and reframe",
      role: "Prompt moment",
      prompt: "What else could be true, and what action becomes possible from that view?",
      facilitatorCue: "Move from constraint toward a more useful interpretation.",
    },
    {
      title: "4. Choose a test",
      role: "Facilitator move",
      facilitatorCue: "Harvest one small action that tests the new assumption.",
    },
  ],
  "tiny-demons": [
    {
      title: "1. Name the blocker",
      role: "Prompt moment",
      prompt: "What inner blocker shows up when you think about acting?",
      facilitatorCue: "Keep the tone curious and light enough for honest reflection.",
    },
    {
      title: "2. Personify the blocker",
      role: "Prompt moment",
      prompt: "What does this blocker want to protect, and what does it cost you?",
      facilitatorCue: "Help participants see the blocker as information, not identity.",
    },
    {
      title: "3. Negotiate a new role",
      role: "Prompt moment",
      prompt: "How could this energy be redirected to support useful action?",
      facilitatorCue: "Move from resistance toward a constructive function.",
    },
    {
      title: "4. Commit to a next move",
      role: "Facilitator move",
      facilitatorCue: "Invite a small action that honors the insight without being controlled by the blocker.",
    },
  ],
  "triz": [
    {
      title: "1. Design perfect failure",
      role: "Prompt moment",
      prompt: "If we wanted to guarantee the worst possible result, what would we do?",
      facilitatorCue: "Make the reversal playful enough to reduce defensiveness.",
    },
    {
      title: "2. List destructive behaviors",
      role: "Prompt moment",
      prompt: "What behaviors, policies, or habits would reliably create that failure?",
      facilitatorCue: "Push for concrete observable behaviors.",
    },
    {
      title: "3. Find what exists now",
      role: "Prompt moment",
      prompt: "Which of these patterns are we already doing in some form?",
      facilitatorCue: "Slow down and keep the focus on patterns rather than blame.",
    },
    {
      title: "4. Stop and replace",
      role: "Facilitator move",
      facilitatorCue: "Choose what to stop, reduce, or replace so space opens for better action.",
    },
  ],
  "troika-consulting": [
    {
      title: "1. Form triads",
      role: "Facilitator move",
      facilitatorCue: "Set up roles: client, consultants, and then rotate.",
    },
    {
      title: "2. Present a challenge",
      role: "Prompt moment",
      prompt: "What challenge do you want help with, and what kind of help would be useful?",
      facilitatorCue: "Help the client be concrete and brief.",
    },
    {
      title: "3. Consultants confer",
      role: "Prompt moment",
      prompt: "What possibilities, options, or questions could help the client?",
      facilitatorCue: "Have the client turn away and listen silently while consultants talk.",
    },
    {
      title: "4. Client reflects and rotate",
      role: "Facilitator move",
      facilitatorCue: "Let the client name what was useful, then rotate roles for the next person.",
    },
  ],
  "user-experience-fishbowl": [
    {
      title: "1. Invite experience holders",
      role: "Facilitator move",
      facilitatorCue: "Seat people with direct experience in the inner circle.",
    },
    {
      title: "2. Inner circle conversation",
      role: "Prompt moment",
      prompt: "What happened, what mattered, and what should others understand from your experience?",
      facilitatorCue: "Let experience holders talk with one another while others listen.",
    },
    {
      title: "3. Outer circle listens",
      role: "Facilitator move",
      facilitatorCue: "Ask the larger group to listen for insights, questions, and implications.",
    },
    {
      title: "4. Debrief learning",
      role: "Prompt moment",
      prompt: "What did we learn from first-hand experience that should shape our next move?",
      facilitatorCue: "Harvest implications without cross-examining the inner circle.",
    },
  ],
  "winfy": [
    {
      title: "1. Form role or function groups",
      role: "Facilitator move",
      facilitatorCue: "Group participants by function, role, or stakeholder perspective.",
    },
    {
      title: "2. Prepare requests",
      role: "Prompt moment",
      prompt: "What do you need from each other group to succeed?",
      facilitatorCue: "Ask for clear requests that can receive a yes, no, I will try, or whatever.",
    },
    {
      title: "3. State requests without discussion",
      role: "Prompt moment",
      prompt: "State your request clearly to the relevant group.",
      facilitatorCue: "Protect the no-discussion rule during the request round.",
    },
    {
      title: "4. Respond and debrief",
      role: "Facilitator move",
      facilitatorCue: "Have groups answer with discipline, then debrief what became clearer.",
    },
  ],
  "what-so-what-now-what": [
    {
      title: "1. What",
      role: "Prompt moment",
      prompt: "What happened? What facts, observations, or data do we have?",
      facilitatorCue: "Separate observation from interpretation at the start.",
    },
    {
      title: "2. So what",
      role: "Prompt moment",
      prompt: "Why does this matter? What patterns or meaning do we see?",
      facilitatorCue: "Help the group make sense before jumping into action.",
    },
    {
      title: "3. Now what",
      role: "Prompt moment",
      prompt: "What should we do next?",
      facilitatorCue: "Move toward concrete adjustments, experiments, or commitments.",
    },
    {
      title: "4. Confirm action",
      role: "Facilitator move",
      facilitatorCue: "Clarify ownership, timing, and what will be reviewed later.",
    },
  ],
  "wicked-questions": [
    {
      title: "1. Surface opposing truths",
      role: "Prompt moment",
      prompt: "What two opposite things are both true and important for us to address?",
      facilitatorCue: "Look for real tensions, not simple trade-offs.",
    },
    {
      title: "2. Form wicked questions",
      role: "Prompt moment",
      prompt: "How is it that we are both this and that at the same time?",
      facilitatorCue: "Shape questions so neither side is dismissed.",
    },
    {
      title: "3. Refine in groups",
      role: "Prompt moment",
      prompt: "Which wording makes the tension sharper and more useful?",
      facilitatorCue: "Help participants remove blame and keep the paradox alive.",
    },
    {
      title: "4. Harvest strategic tensions",
      role: "Facilitator move",
      facilitatorCue: "Capture questions that can guide exploration, strategy, or design choices.",
    },
  ],
  "wise-crowds": [
    {
      title: "1. Form consulting groups",
      role: "Facilitator move",
      facilitatorCue: "Set up one client with a small group of consultants.",
    },
    {
      title: "2. Client presents challenge",
      role: "Prompt moment",
      prompt: "What challenge do you face, and what help do you need?",
      facilitatorCue: "Keep the presentation short and specific.",
    },
    {
      title: "3. Consultants offer counsel",
      role: "Prompt moment",
      prompt: "What questions, advice, or options could help the client move forward?",
      facilitatorCue: "Have the client listen silently while the group works.",
    },
    {
      title: "4. Client harvests",
      role: "Facilitator move",
      facilitatorCue: "Ask the client to name what was useful and what action they may take.",
    },
  ],
  "wise-crowds-fur-grosse-gruppen": [
    {
      title: "1. Select cases",
      role: "Facilitator move",
      facilitatorCue: "Choose several client cases that can benefit from broad advice.",
    },
    {
      title: "2. Present to the crowd",
      role: "Prompt moment",
      prompt: "What challenge needs the wisdom of this group?",
      facilitatorCue: "Keep each case concise so many people can contribute.",
    },
    {
      title: "3. Gather crowd advice",
      role: "Prompt moment",
      prompt: "What advice, question, or option could help this client?",
      facilitatorCue: "Use quick written or small-group cycles to collect diverse counsel.",
    },
    {
      title: "4. Client selects next steps",
      role: "Facilitator move",
      facilitatorCue: "Have each client identify the most useful counsel and likely next action.",
    },
  ],
  "xxn-writing": [
    {
      title: "1. Prepare the question sequence",
      role: "Facilitator move",
      facilitatorCue: "Create a sequence of prompts that narrows or deepens thinking step by step.",
    },
    {
      title: "2. Write individually",
      role: "Prompt moment",
      prompt: "Respond to the current prompt in writing before discussing it.",
      facilitatorCue: "Give enough quiet time for independent thought.",
    },
    {
      title: "3. Move through prompts",
      role: "Prompt moment",
      prompt: "Use your previous answer to sharpen the next one.",
      facilitatorCue: "Keep the sequence disciplined so thinking becomes clearer.",
    },
    {
      title: "4. Share focused output",
      role: "Facilitator move",
      facilitatorCue: "Harvest the final written outputs, patterns, or decisions.",
    },
  ],
};
