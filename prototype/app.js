const inspectorContent = {
  intro: {
    title: "Intro / Context",
    badge: "Neutral block",
    state: "Good fit",
    stateClass: "green-state",
    score: "4.4 / 5",
    fitChips: ["safe entry", "warm tone", "gentle framing"],
    description:
      "A short, warm opening creates enough safety before the room moves into more revealing conversation.",
    review:
      "This opening gives the section emotional grounding before participants are invited to share more vulnerable experiences.",
    notes:
      "Keep the tone warm and concrete. Name the intention of the section without suggesting that anyone must disclose more than they want to.",
    output:
      "Shared readiness, emotional orientation, and a clear sense of why the upcoming dialogue matters.",
    suggestions: [
      "Keep the invitation warmer and shorter.",
      "Name participation as an invitation, not an obligation.",
    ],
  },
  "124all": {
    title: "1-2-4-All",
    badge: "Liberating Structure",
    state: "Strong fit",
    stateClass: "green-state",
    score: "4.7 / 5",
    fitChips: ["participation ramp", "many voices", "low pressure"],
    description:
      "This structure fits the section because it lowers the threshold for participation while still building collective pattern recognition.",
    review:
      "Purpose fit is strong: it lets people start safely on their own, then widen participation in small steps. Transition fit is also strong because the intro creates a clear emotional frame.",
    notes:
      "Emphasize concrete moments rather than general opinions. Invite short examples first, then pull themes to the whole group.",
    output:
      "Examples of what healthy collaboration already looks like and a first shared pattern map.",
    suggestions: [
      "Trim the invitation to one crisp sentence before the reflective prompt.",
      "Consider adding one explicit phrase that signals there are no perfect answers.",
    ],
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
        prompt: "",
        facilitatorCue:
          "Capture visible themes, key phrases, and tensions so the next structure can build directly on them.",
      },
    ],
  },
  appreciative: {
    title: "Appreciative Interviews",
    badge: "Liberating Structure",
    state: "Promising fit",
    stateClass: "review-state",
    score: "3.9 / 5",
    fitChips: ["pair safety", "depth", "story richness"],
    description:
      "This block deepens trust and turns earlier fragments into richer stories, but the invitation could be slightly less long and more emotionally direct.",
    review:
      "Purpose fit is good because the pair format creates safety. Invitation quality is medium because the current text asks several things at once.",
    notes:
      "Invite people to listen for conditions, not just a nice story. Keep the debrief grounded in what can be recreated by the team.",
    output:
      "Concrete conditions and behaviors that support safety and better communication.",
    suggestions: [
      "Shorten the invitation by removing one descriptive clause.",
      "Add a closing line that helps pairs listen for repeatable conditions.",
    ],
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
        prompt: "",
        facilitatorCue:
          "Harvest repeatable team conditions and language worth carrying into reflection or agreement work.",
      },
    ],
  },
  triz: {
    title: "TRIZ",
    badge: "LS in development",
    state: "Use with care",
    stateClass: "review-state warning-badge",
    score: "3.5 / 5",
    fitChips: ["sharp mirror", "pattern exposure", "needs care"],
    description:
      "Strong for exposing damaging communication patterns, but it may need careful framing depending on the emotional state of the group.",
    review:
      "The structure is powerful for surfacing anti-patterns. The main risk is that the room may become cynical if the transition into action is weak.",
    notes:
      "Frame it clearly as a way to externalize harmful patterns without blame. Keep enough time for the conversion back into useful commitments.",
    output:
      "A visible list of self-defeating communication patterns and candidate behaviors to stop.",
    suggestions: [
      "Use a softer bridge from reflection into TRIZ if the room still feels guarded.",
      "Consider a short input block first to lower emotional ambiguity.",
    ],
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
        prompt: "",
        facilitatorCue:
          "Capture the stop-doing list and the strongest replacements so the next structure can turn them into commitments.",
      },
    ],
  },
  winfy: {
    title: "What I Need From You",
    badge: "Liberating Structure",
    state: "High-value fit",
    stateClass: "green-state",
    score: "4.3 / 5",
    fitChips: ["cross-functional", "clear asks", "strong boundaries"],
    description:
      "This structure is strong when the workshop needs explicit requests across roles or functions instead of more vague hopes for collaboration.",
    review:
      "Purpose fit is strong for the second section because it converts friction into explicit requests and responses. The main facilitation risk is keeping the process crisp and free of side discussions.",
    notes:
      "Hold the response discipline firmly. The value comes from clarity, not from negotiating every request in the moment.",
    output:
      "A visible set of explicit requests, committed responses, clear boundaries, and sharper cross-functional understanding.",
    suggestions: [
      "Keep the request format concrete enough to earn a clear yes or no.",
      "Protect the no-discussion rule until the response round is complete.",
    ],
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
          "Use a short internal synthesis such as 1-2-4-All if needed. Push for concrete requests, not complaints.",
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
    title: "Input block",
    badge: "Neutral block",
    state: "Useful support",
    stateClass: "green-state",
    score: "4.0 / 5",
    fitChips: ["bridge", "framing", "supporting role"],
    description:
      "A short framing input helps sequence difficult structures without overloading the canvas with custom facilitation detail.",
    review:
      "Useful when a group needs a short conceptual bridge. Keep it brief so it supports, rather than dominates, the LS flow.",
    notes:
      "Use a single principle or observation, not a mini lecture.",
    output: "Shared framing language that helps the next block land more clearly.",
    suggestions: [
      "Keep neutral blocks visually distinct from LS cards.",
      "Use them sparingly so the LS chain remains primary.",
    ],
  },
  reflection: {
    title: "Reflection",
    badge: "Neutral block",
    state: "Good fit",
    stateClass: "green-state",
    score: "4.2 / 5",
    fitChips: ["crystallize", "slow down", "carry forward"],
    description:
      "This block gives the section a gentle way to crystallize patterns before moving to the next module.",
    review:
      "The reflection works well because it helps carry insights forward and creates a clean handoff into later sections.",
    notes:
      "Ask for patterns worth protecting, not just generic learnings.",
    output: "A concise set of conditions or behaviors the group wants to preserve.",
    suggestions: [
      "Keep the reflection question single-focus.",
      "Link the output explicitly to the next section's starting point.",
    ],
  },
  "transition-one": {
    title: "Transition: Intro -> 1-2-4-All",
    badge: "Transition",
    state: "Clean handoff",
    stateClass: "green-state",
    score: "4.5 / 5",
    fitChips: ["soft handoff", "safe start", "clear next step"],
    description:
      "The handoff is short and emotionally coherent: it moves from framing into individual reflection without pressure.",
    review:
      "Transition fit is strong because the opening prepares people emotionally, and the next structure begins privately before widening out.",
    notes:
      "Signal that people can start quietly on their own and that there is no need to share a perfect story.",
    output: "A softer emotional step into the first participatory structure.",
    suggestions: [
      "Keep the bridge sentence warm and brief.",
      "Name the move from shared frame to personal reflection explicitly.",
    ],
  },
  "transition-two": {
    title: "Transition: 1-2-4-All -> Appreciative Interviews",
    badge: "Transition",
    state: "Solid bridge",
    stateClass: "green-state",
    score: "4.1 / 5",
    fitChips: ["builds momentum", "deepens", "story bridge"],
    description:
      "This transition carries the energy of small-group discovery into a more personal pair conversation.",
    review:
      "The bridge works because the group already surfaced positive examples. It could be even stronger if it named what to listen for in the interviews.",
    notes:
      "Invite pairs to deepen one strong example rather than starting from zero again.",
    output: "Continuity between group insight and pair storytelling.",
    suggestions: [
      "Call out that the pair conversation builds on what already emerged.",
      "Mention that partners should listen for conditions, not only the story itself.",
    ],
  },
  "transition-three": {
    title: "Transition: Appreciative Interviews -> Reflection",
    badge: "Transition",
    state: "Needs one stronger cue",
    stateClass: "warning-badge",
    score: "3.6 / 5",
    fitChips: ["synthesis move", "needs cue", "pattern focus"],
    description:
      "The transition is workable, but it would benefit from a clearer cue about how stories become reusable team conditions.",
    review:
      "The bridge is logical, but the synthesis move is still a little implied. One stronger line could make the reflection more precise.",
    notes:
      "Help participants shift from story mode to pattern extraction mode.",
    output: "A cleaner move from narrative detail to reusable team-level insight.",
    suggestions: [
      "Explicitly ask what conditions showed up across several stories.",
      "Use one sentence that names the move from examples to patterns.",
    ],
  },
};

const navButtons = document.querySelectorAll("[data-screen-target]");
const screens = document.querySelectorAll(".screen");
const inspectorButtons = document.querySelectorAll("[data-inspector]");
const libraryCards = document.querySelectorAll(".library-card[data-inspector]");
const blockCards = document.querySelectorAll(".block-card[data-inspector]");
const transitionCards = document.querySelectorAll(".transition-card[data-inspector]");
const sectionBoxes = document.querySelectorAll(".section-box");
const menuTriggers = document.querySelectorAll("[data-menu-toggle]");
const menuSurfaces = document.querySelectorAll(".floating-menu");
const surfaceClosers = document.querySelectorAll("[data-menu-close]");
const reviewToggles = document.querySelectorAll("[data-review-toggle]");
const reviewPanels = document.querySelectorAll(".section-review-panel");
const addChoiceButtons = document.querySelectorAll("[data-add-choice]");
const sectionToggleButtons = document.querySelectorAll("[data-section-toggle]");
const printButtons = document.querySelectorAll("[data-print-trigger]");

const inspectorTitle = document.getElementById("inspector-title");
const inspectorBadge = document.getElementById("inspector-badge");
const reviewState = document.getElementById("review-state");
const reviewScore = document.getElementById("review-score");
const reviewCopy = document.getElementById("review-copy");
const inspectorDescription = document.getElementById("inspector-description");
const inspectorNotes = document.getElementById("inspector-notes");
const inspectorOutput = document.getElementById("inspector-output");
const suggestionStack = document.getElementById("suggestion-stack");
const fitChipOne = document.getElementById("fit-chip-one");
const fitChipTwo = document.getElementById("fit-chip-two");
const fitChipThree = document.getElementById("fit-chip-three");
const addSelectionNote = document.getElementById("add-selection-note");
const stepsPanel = document.getElementById("steps-panel");
const stepsSummary = document.getElementById("steps-summary");
const stepsList = document.getElementById("steps-list");
const stepsToggle = document.getElementById("steps-toggle");

function showScreen(targetId) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === targetId);
  });

  document.querySelectorAll(".nav-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.screenTarget === targetId);
  });
}

function setActiveSection(sectionId) {
  sectionBoxes.forEach((section) => {
    section.classList.toggle("active-section", section.dataset.sectionId === sectionId);
  });
}

function closeSurfaceById(surfaceId) {
  const surface = document.getElementById(surfaceId);

  if (!surface) {
    return;
  }

  surface.classList.add("hidden");

  document
    .querySelectorAll(`[data-menu-toggle="${surfaceId}"], [data-review-toggle="${surfaceId}"]`)
    .forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
}

function closeAllMenus(exceptId = "") {
  menuSurfaces.forEach((surface) => {
    surface.classList.toggle("hidden", surface.id !== exceptId);
  });

  menuTriggers.forEach((button) => {
    button.setAttribute("aria-expanded", button.dataset.menuToggle === exceptId ? "true" : "false");
  });
}

function closeAllReviews(exceptId = "") {
  reviewPanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== exceptId);
  });

  reviewToggles.forEach((button) => {
    button.setAttribute("aria-expanded", button.dataset.reviewToggle === exceptId ? "true" : "false");
  });
}

function resolveSelectionSource(button) {
  if (
    button.classList.contains("block-card") ||
    button.classList.contains("transition-card") ||
    button.classList.contains("library-card")
  ) {
    return button;
  }

  const key = button.dataset.inspector;

  return (
    document.querySelector(`.chain-row [data-inspector="${key}"]`) ||
    document.querySelector(`.library-card[data-inspector="${key}"]`) ||
    null
  );
}

function setCanvasSelection(sourceButton) {
  blockCards.forEach((button) => {
    button.classList.remove("selected-card");
  });

  transitionCards.forEach((button) => {
    button.classList.remove("selected-transition");
  });

  libraryCards.forEach((button) => {
    button.classList.remove("selected-library-card");
  });

  if (!sourceButton) {
    return;
  }

  if (sourceButton.classList.contains("block-card")) {
    sourceButton.classList.add("selected-card");
  } else if (sourceButton.classList.contains("transition-card")) {
    sourceButton.classList.add("selected-transition");
  } else if (sourceButton.classList.contains("library-card")) {
    sourceButton.classList.add("selected-library-card");
  }

  const parentSection = sourceButton.closest(".section-box");

  if (parentSection) {
    setActiveSection(parentSection.dataset.sectionId);
  }
}

function setInspector(key, sourceButton = null) {
  const content = inspectorContent[key];

  if (!content) {
    return;
  }

  inspectorTitle.textContent = content.title;
  inspectorBadge.textContent = content.badge;
  reviewState.textContent = content.state;
  reviewState.className = `review-state ${content.stateClass}`;
  reviewScore.textContent = content.score;
  reviewCopy.textContent = content.review;
  inspectorDescription.textContent = content.description;
  inspectorNotes.value = content.notes;
  inspectorOutput.textContent = content.output;
  fitChipOne.textContent = content.fitChips?.[0] || "fit cue";
  fitChipTwo.textContent = content.fitChips?.[1] || "fit cue";
  fitChipThree.textContent = content.fitChips?.[2] || "fit cue";

  if (content.steps?.length) {
    const editablePromptCount = content.steps.filter((step) => step.prompt?.trim()).length;
    stepsPanel.classList.remove("hidden");
    stepsList.classList.add("hidden");
    stepsToggle.setAttribute("aria-expanded", "false");
    stepsToggle.textContent = "Open steps";
    stepsSummary.textContent = `${content.steps.length} steps • ${editablePromptCount} editable prompt moments`;
    stepsList.innerHTML = "";

    content.steps.forEach((step) => {
      const card = document.createElement("div");
      card.className = "step-card";

      const promptField = step.prompt?.trim()
        ? `
          <div class="step-input-group">
            <label>Sub-prompt</label>
            <textarea rows="3">${step.prompt}</textarea>
          </div>
        `
        : "";

      card.innerHTML = `
        <div class="step-card-head">
          <strong>${step.title}</strong>
          <span class="step-card-note">${step.role}</span>
        </div>
        ${promptField}
        <div class="step-input-group">
          <label>Facilitator cue</label>
          <textarea rows="3">${step.facilitatorCue}</textarea>
        </div>
      `;

      stepsList.appendChild(card);
    });
  } else {
    stepsPanel.classList.add("hidden");
    stepsList.classList.add("hidden");
    stepsToggle.setAttribute("aria-expanded", "false");
    stepsToggle.textContent = "Open steps";
    stepsList.innerHTML = "";
  }

  suggestionStack.innerHTML = "";
  content.suggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.className = "suggestion-card";
    button.textContent = suggestion;
    suggestionStack.appendChild(button);
  });

  setCanvasSelection(sourceButton);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.screenTarget;
    if (targetId) {
      showScreen(targetId);
    }
  });
});

menuTriggers.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const surfaceId = button.dataset.menuToggle;
    const surface = document.getElementById(surfaceId);

    if (!surface) {
      return;
    }

    const shouldOpen = surface.classList.contains("hidden");

    closeAllMenus();

    if (shouldOpen) {
      surface.classList.remove("hidden");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

menuSurfaces.forEach((surface) => {
  surface.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});

surfaceClosers.forEach((button) => {
  button.addEventListener("click", () => {
    closeSurfaceById(button.dataset.menuClose);
  });
});

reviewToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const panelId = button.dataset.reviewToggle;
    const panel = document.getElementById(panelId);

    if (!panel) {
      return;
    }

    const shouldOpen = panel.classList.contains("hidden");

    closeAllReviews();

    if (shouldOpen) {
      panel.classList.remove("hidden");
      button.setAttribute("aria-expanded", "true");
      setActiveSection(button.closest(".section-box")?.dataset.sectionId || "section-1");
    }
  });
});

inspectorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeAllMenus();

    const sourceButton = resolveSelectionSource(button);
    const clickedSectionId = button.closest(".section-box")?.dataset.sectionId;

    setInspector(button.dataset.inspector, sourceButton);

    if (clickedSectionId) {
      setActiveSection(clickedSectionId);
    }

    showScreen("builder-screen");
  });
});

addChoiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.addChoice;
    const title = inspectorContent[choice]?.title || "Selected block";
    const sourceButton = document.querySelector(`.library-card[data-inspector="${choice}"]`);

    if (addSelectionNote) {
      addSelectionNote.textContent = `Queued next suggestion: ${title}`;
    }

    setInspector(choice, sourceButton);
    setActiveSection("section-1");
  });
});

stepsToggle.addEventListener("click", () => {
  const shouldOpen = stepsList.classList.contains("hidden");

  stepsList.classList.toggle("hidden", !shouldOpen);
  stepsToggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  stepsToggle.textContent = shouldOpen ? "Hide steps" : "Open steps";
});

sectionToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const sectionId = button.dataset.sectionToggle;
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);

    if (!section) {
      return;
    }

    const collapsedFlow = section.querySelector(".section-collapsed-flow");
    const expandedShell = section.querySelector(".section-expanded-shell");

    if (!collapsedFlow || !expandedShell) {
      return;
    }

    const shouldExpand = expandedShell.classList.contains("hidden");

    collapsedFlow.classList.toggle("hidden", shouldExpand);
    expandedShell.classList.toggle("hidden", !shouldExpand);
    button.textContent = shouldExpand ? "Collapse section" : "Expand section";

    setActiveSection(sectionId);
    closeAllMenus();
  });
});

printButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showScreen("preview-screen");
    window.print();
  });
});

document.addEventListener("click", () => {
  closeAllMenus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllMenus();
    closeAllReviews();
  }
});

const initialSelection = document.querySelector(".block-card.selected-card");

setInspector("intro", initialSelection);
