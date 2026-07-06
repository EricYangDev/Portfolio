(function () {
  "use strict";

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const STORAGE_KEY = "ericYangPortfolioProgress";

  const demoMeta = {
    care: { label: "Care Conversation Simulator", badge: "Conversation Designer" },
    quiz: { label: "Scenario-to-Quiz Builder", badge: "Activity Architect" },
    quest: { label: "Outdoor Quest Generator", badge: "Quest Designer" },
    qa: { label: "QA Bug Triage Arena", badge: "Bug Triage Analyst" },
    level: { label: "Level Flow Designer", badge: "Flow Designer" },
    vector: { label: "Vector Product Configurator", badge: "Production Planner" }
  };

  function safeStorage(action, fallback) {
    try {
      return action();
    } catch (error) {
      return fallback;
    }
  }

  function getProgress() {
    return safeStorage(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return { completed: [], badges: [], interactions: 0, lastDemo: "" };
      const parsed = JSON.parse(saved);
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        interactions: Number(parsed.interactions) || 0,
        lastDemo: parsed.lastDemo || ""
      };
    }, { completed: [], badges: [], interactions: 0, lastDemo: "" });
  }

  function saveProgress(progress) {
    safeStorage(() => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)), null);
    updateProgressUI();
  }

  function completeDemo(id) {
    const meta = demoMeta[id];
    if (!meta) return;
    const progress = getProgress();
    progress.interactions += 1;
    progress.lastDemo = meta.label;
    if (!progress.completed.includes(id)) progress.completed.push(id);
    if (!progress.badges.includes(meta.badge)) progress.badges.push(meta.badge);
    saveProgress(progress);
    showToast(`Badge unlocked: ${meta.badge}`);
  }

  function updateProgressUI() {
    const progress = getProgress();
    $$('[data-stat="completed"]').forEach((node) => { node.textContent = progress.completed.length; });
    $$('[data-stat="badges"]').forEach((node) => { node.textContent = progress.badges.length; });

    const heroBadges = $("#hero-badges");
    if (heroBadges) {
      heroBadges.innerHTML = "";
      if (progress.badges.length === 0) {
        const empty = document.createElement("span");
        empty.className = "badge muted-badge";
        empty.textContent = "Try a demo to earn badges";
        heroBadges.appendChild(empty);
      } else {
        progress.badges.slice(-4).forEach((badge) => {
          const badgeNode = document.createElement("span");
          badgeNode.className = "badge";
          badgeNode.textContent = badge;
          heroBadges.appendChild(badgeNode);
        });
      }
    }

    const analyticsGrid = $("#analytics-grid");
    if (analyticsGrid) {
      analyticsGrid.innerHTML = "";
      Object.entries(demoMeta).forEach(([id, meta]) => {
        const card = document.createElement("article");
        card.className = "analytics-card";
        const isDone = progress.completed.includes(id);
        card.innerHTML = `
          <span class="analytics-status ${isDone ? "done" : "todo"}">${isDone ? "Complete" : "Not tried"}</span>
          <h4>${meta.label}</h4>
          <p>${isDone ? `Badge earned: ${meta.badge}` : "Try this demo to unlock a badge."}</p>
        `;
        analyticsGrid.appendChild(card);
      });

      const summary = document.createElement("article");
      summary.className = "analytics-card summary";
      summary.innerHTML = `
        <span class="analytics-status done">Local data</span>
        <h4>${progress.completed.length}/${Object.keys(demoMeta).length} demos completed</h4>
        <p>Total interactions: ${progress.interactions}. Last demo: ${progress.lastDemo || "none yet"}.</p>
      `;
      analyticsGrid.appendChild(summary);
    }
  }

  function showToast(message) {
    let toast = $("#site-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "site-toast";
      toast.className = "site-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setupTheme() {
    const root = document.documentElement;
    const saved = safeStorage(() => window.localStorage.getItem("theme"), null);
    const preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    root.dataset.theme = saved || root.dataset.theme || preferred;

    $$(".theme-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = nextTheme;
        safeStorage(() => window.localStorage.setItem("theme", nextTheme), null);
        showToast(`${nextTheme === "dark" ? "Dark" : "Light"} theme enabled`);
      });
    });
  }

  function setupNavigation() {
    const toggle = $(".nav-toggle");
    const menu = $("#nav-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        menu.classList.toggle("open", !expanded);
      });

      $$("a", menu).forEach((link) => {
        link.addEventListener("click", () => {
          toggle.setAttribute("aria-expanded", "false");
          menu.classList.remove("open");
        });
      });
    }

    $$('[data-launch]').forEach((button) => {
      button.addEventListener("click", () => {
        const target = $(button.dataset.launch);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function setupViewModes() {
    const buttons = $$(".mode-button");
    if (!buttons.length) return;
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        document.body.dataset.viewMode = button.dataset.mode;
        const label = button.textContent.trim();
        showToast(`${label} mode selected`);
      });
    });
  }

  function setupRevealAnimations() {
    const revealNodes = $$(".reveal");
    if (!revealNodes.length) return;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealNodes.forEach((node) => node.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealNodes.forEach((node) => observer.observe(node));
  }

  function setupCareSimulator() {
    const optionsContainer = $("#care-options");
    if (!optionsContainer) return;

    const stage = $("#care-stage");
    const title = $("#care-title");
    const text = $("#care-text");
    const feedbackTitle = $("#care-feedback-title");
    const feedback = $("#care-feedback");
    const resetButton = $("#care-reset");

    const meterIds = {
      empathy: { bar: $("#care-empathy-meter"), value: $("#care-empathy-value") },
      clarity: { bar: $("#care-clarity-meter"), value: $("#care-clarity-value") },
      safety: { bar: $("#care-safety-meter"), value: $("#care-safety-value") }
    };

    const scenarios = [
      {
        title: "Family learning conversation",
        text: "A family caregiver says: “I understand the handout, but I still feel overwhelmed. What should I focus on first?”",
        options: [
          {
            label: "Validate the feeling, then offer one clear next step.",
            feedback: "Strong choice. You reduce cognitive load, acknowledge emotion, and turn the lesson into one achievable action.",
            scores: { empathy: 95, clarity: 90, safety: 92 }
          },
          {
            label: "Repeat the full teaching script so nothing is missed.",
            feedback: "This is thorough but may overwhelm the learner. A better response would prioritize one or two decisions first.",
            scores: { empathy: 55, clarity: 62, safety: 58 }
          },
          {
            label: "Tell them they should already know this from the handout.",
            feedback: "This reduces psychological safety. The learner needs reassurance and a practical way to continue.",
            scores: { empathy: 18, clarity: 28, safety: 12 }
          }
        ]
      },
      {
        title: "Checking understanding",
        text: "The learner nods but gives short answers. You are not sure whether they understand the next step.",
        options: [
          {
            label: "Ask them to explain the next step in their own words.",
            feedback: "Strong choice. This checks understanding without turning the moment into a test.",
            scores: { empathy: 82, clarity: 94, safety: 86 }
          },
          {
            label: "Ask, “Do you understand?” and move on if they say yes.",
            feedback: "This is efficient but weak for assessment. Many learners say yes even when they are uncertain.",
            scores: { empathy: 50, clarity: 48, safety: 55 }
          },
          {
            label: "Correct them before they have a chance to answer.",
            feedback: "This can damage confidence and limits useful feedback. Let the learner show what they understand first.",
            scores: { empathy: 25, clarity: 36, safety: 24 }
          }
        ]
      },
      {
        title: "Closing the lesson",
        text: "The learner asks for something they can remember later when they are alone.",
        options: [
          {
            label: "Summarize three points and invite one final question.",
            feedback: "Strong choice. You create a manageable takeaway and leave space for learner agency.",
            scores: { empathy: 88, clarity: 92, safety: 90 }
          },
          {
            label: "Send every resource you have so they can review everything.",
            feedback: "Resources can help, but too many at once can create friction. Curate the next step first.",
            scores: { empathy: 54, clarity: 46, safety: 60 }
          },
          {
            label: "End quickly because the main content has already been covered.",
            feedback: "The lesson may be complete, but the learner still needs closure and a clear point of return.",
            scores: { empathy: 32, clarity: 40, safety: 35 }
          }
        ]
      }
    ];

    let state = {
      index: 0,
      totals: { empathy: 0, clarity: 0, safety: 0 },
      choices: 0
    };

    function getAverage(metric) {
      if (!state.choices) return 0;
      return Math.round(state.totals[metric] / state.choices);
    }

    function updateMeters() {
      ["empathy", "clarity", "safety"].forEach((metric) => {
        const value = getAverage(metric);
        const nodes = meterIds[metric];
        if (nodes.bar) nodes.bar.style.width = `${value}%`;
        if (nodes.value) nodes.value.textContent = String(value);
      });
    }

    function addContinueButton(isFinal) {
      let next = $("#care-next");
      if (!next) {
        next = document.createElement("button");
        next.id = "care-next";
        next.type = "button";
        next.className = "button primary small";
        feedback.parentElement.appendChild(next);
      }
      next.textContent = isFinal ? "View Summary" : "Continue";
      next.hidden = false;
      next.onclick = () => {
        if (state.index < scenarios.length - 1) {
          state.index += 1;
          renderScenario();
        } else {
          showSummary();
        }
      };
    }

    function renderScenario() {
      const scenario = scenarios[state.index];
      if (stage) stage.textContent = `Scenario ${state.index + 1} of ${scenarios.length}`;
      if (title) title.textContent = scenario.title;
      if (text) text.textContent = scenario.text;
      if (feedbackTitle) feedbackTitle.textContent = "Choose a response";
      if (feedback) feedback.textContent = "The simulator will evaluate your response across empathy, clarity, and psychological safety.";
      const next = $("#care-next");
      if (next) next.hidden = true;

      optionsContainer.innerHTML = "";
      scenario.options.forEach((option) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-button";
        button.textContent = option.label;
        button.addEventListener("click", () => chooseOption(option, button));
        optionsContainer.appendChild(button);
      });
      updateMeters();
    }

    function chooseOption(option, selectedButton) {
      $$(".option-button", optionsContainer).forEach((button) => {
        button.disabled = true;
        button.classList.toggle("selected", button === selectedButton);
      });

      ["empathy", "clarity", "safety"].forEach((metric) => {
        state.totals[metric] += option.scores[metric];
      });
      state.choices += 1;
      updateMeters();

      if (feedbackTitle) feedbackTitle.textContent = "Response feedback";
      if (feedback) feedback.textContent = option.feedback;
      addContinueButton(state.index === scenarios.length - 1);
    }

    function showSummary() {
      optionsContainer.innerHTML = "";
      const summary = document.createElement("div");
      summary.className = "summary-box";
      summary.innerHTML = `
        <h4>Reflection summary</h4>
        <p>Your strongest score was <strong>${getTopMetric()}</strong>. In a real learning tool, this summary could be saved as learner analytics or used to recommend practice scenarios.</p>
      `;
      optionsContainer.appendChild(summary);
      if (stage) stage.textContent = "Simulation complete";
      if (title) title.textContent = "Learner-centered communication";
      if (text) text.textContent = "You completed the branching conversation. Restart to test a different path.";
      if (feedbackTitle) feedbackTitle.textContent = "Demo complete";
      if (feedback) feedback.textContent = "This prototype shows how health-education content can become a low-risk practice environment with immediate feedback.";
      const next = $("#care-next");
      if (next) next.hidden = true;
      completeDemo("care");
    }

    function getTopMetric() {
      const averages = {
        empathy: getAverage("empathy"),
        clarity: getAverage("clarity"),
        safety: getAverage("safety")
      };
      return Object.entries(averages).sort((a, b) => b[1] - a[1])[0][0];
    }

    function resetScenario() {
      state = { index: 0, totals: { empathy: 0, clarity: 0, safety: 0 }, choices: 0 };
      renderScenario();
    }

    if (resetButton) resetButton.addEventListener("click", resetScenario);
    renderScenario();
  }

  function setupQuizBuilder() {
    const input = $("#quiz-input");
    const generate = $("#generate-quiz");
    const output = $("#quiz-output");
    const copy = $("#copy-quiz");
    if (!input || !generate || !output) return;

    const stopWords = new Set(["should", "because", "through", "people", "their", "there", "these", "those", "with", "without", "about", "which", "would", "could", "learning", "learners", "interactive"]);

    function extractSentences(text) {
      return text
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 35)
        .slice(0, 5);
    }

    function extractKeywords(text) {
      const words = text.toLowerCase().match(/\b[a-z][a-z-]{5,}\b/g) || [];
      const counts = new Map();
      words.forEach((word) => {
        if (!stopWords.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
      });
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([word]) => word)
        .slice(0, 6);
    }

    function titleCase(text) {
      return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    function buildActivity() {
      const text = input.value.trim();
      if (text.length < 80) {
        output.innerHTML = '<p class="muted">Paste at least 80 characters so the builder has enough content to analyze.</p>';
        return;
      }

      const sentences = extractSentences(text);
      const keywords = extractKeywords(text);
      const mainKeyword = keywords[0] || "practice";
      const supportingKeyword = keywords[1] || "feedback";
      const sourceSentence = sentences[0] || text.slice(0, 140);
      const blankedSentence = sourceSentence.replace(new RegExp(`\\b${mainKeyword}\\b`, "i"), "_____");

      const activity = [
        {
          type: "Multiple choice",
          prompt: `Which idea best supports ${titleCase(mainKeyword)}?`,
          answer: sourceSentence,
          note: "Use this as a quick comprehension check."
        },
        {
          type: "Fill in the blank",
          prompt: blankedSentence.includes("_____") ? blankedSentence : `_____ is one key concept from the lesson.`,
          answer: titleCase(mainKeyword),
          note: "Good for recall and vocabulary reinforcement."
        },
        {
          type: "Reflection prompt",
          prompt: `Describe one situation where ${mainKeyword} and ${supportingKeyword} would change a learner's experience.`,
          answer: "Open response",
          note: "Good for application and transfer."
        },
        {
          type: "Scenario prompt",
          prompt: `A learner is confused about ${mainKeyword}. What is one supportive next step?`,
          answer: "Acknowledge uncertainty, give one clear action, and check understanding.",
          note: "Good for decision practice."
        }
      ];

      output.innerHTML = "";
      const list = document.createElement("ol");
      list.className = "activity-list";
      activity.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${item.type}</strong>
          <p>${item.prompt}</p>
          <details>
            <summary>Suggested answer</summary>
            <p>${item.answer}</p>
            <small>${item.note}</small>
          </details>
        `;
        list.appendChild(li);
      });

      const keywordBlock = document.createElement("div");
      keywordBlock.className = "keyword-row";
      keywords.slice(0, 5).forEach((keyword) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = keyword;
        keywordBlock.appendChild(chip);
      });

      output.appendChild(keywordBlock);
      output.appendChild(list);
      output.dataset.copyText = activity.map((item, index) => `${index + 1}. ${item.type}: ${item.prompt}\nAnswer: ${item.answer}`).join("\n\n");
      completeDemo("quiz");
    }

    generate.addEventListener("click", buildActivity);
    if (copy) {
      copy.addEventListener("click", async () => {
        const textToCopy = output.dataset.copyText || output.textContent.trim();
        if (!textToCopy) return;
        try {
          await navigator.clipboard.writeText(textToCopy);
          showToast("Activity copied to clipboard");
        } catch (error) {
          showToast("Copy failed. Select the output text manually.");
        }
      });
    }
  }

  function setupQuestGenerator() {
    const form = $("#quest-form");
    const output = $("#quest-output");
    if (!form || !output) return;

    const questData = {
      light: {
        title: "Gentle Scout Route",
        action: "Walk at a comfortable pace and find three signs of daily life: sound, movement, and color.",
        risk: "Keep the route familiar and easy to stop."
      },
      explore: {
        title: "Neighborhood Cartographer",
        action: "Choose a nearby block or path and mentally map one landmark, one rest point, and one curiosity.",
        risk: "Stay in public, familiar areas and avoid unsafe crossings."
      },
      reflect: {
        title: "Reflection Loop",
        action: "Walk slowly and use each turn as a prompt: notice, name, breathe, continue.",
        risk: "Keep the activity low intensity and pause whenever needed."
      },
      challenge: {
        title: "Pacing Trial",
        action: "Alternate two minutes of brisk walking with one minute of observation until the timer ends.",
        risk: "Adjust intensity and stop if the challenge feels uncomfortable."
      }
    };

    const lenses = {
      intrinsic: "Intrinsic motivation: the quest encourages curiosity and self-directed exploration rather than pressure.",
      narrative: "Narrative motivation: the walk becomes a short story with a role, goal, and ending.",
      social: "Social motivation: the player can share a reflection or invite someone to compare observations.",
      reward: "Reward motivation: the player earns a badge after completing a safe, realistic action."
    };

    const rewards = ["Trail Note", "Mindful Mapper", "Tiny Expedition", "Observation Badge", "Pacing Token"];

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const goal = $("#quest-goal")?.value || "light";
      const time = $("#quest-time")?.value || "15";
      const motivation = $("#quest-motivation")?.value || "intrinsic";
      const quest = questData[goal];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      output.innerHTML = `
        <h4>${quest.title}</h4>
        <p class="quest-meta">${time}-minute quest • ${reward}</p>
        <ul class="feature-list">
          <li><strong>Action:</strong> ${quest.action}</li>
          <li><strong>Reflection:</strong> What changed between the start and end of the walk?</li>
          <li><strong>Safety constraint:</strong> ${quest.risk}</li>
          <li><strong>Motivation lens:</strong> ${lenses[motivation]}</li>
        </ul>
      `;
      completeDemo("quest");
    });
  }

  function setupQAArena() {
    const bugList = $("#found-bugs-list");
    const form = $("#bug-report-form");
    const scorePanel = $("#bug-score");
    if (!bugList && !form) return;

    const bugDetails = {
      save: "Save Loadout gives success feedback but does not persist changes.",
      slider: "Coin multiplier defaults near the maximum, creating a balance risk before the user reviews values.",
      contrast: "Apply Discount uses a low-contrast danger style that weakens readability.",
      state: "Preview Economy appears clickable but does not show loading, preview state, or confirmation details."
    };
    const found = new Set();

    function renderFoundBugs() {
      if (!bugList) return;
      bugList.innerHTML = "";
      if (found.size === 0) {
        const li = document.createElement("li");
        li.textContent = "Click around the fake interface to discover issues.";
        bugList.appendChild(li);
        return;
      }
      found.forEach((bugKey) => {
        const li = document.createElement("li");
        li.textContent = bugDetails[bugKey];
        bugList.appendChild(li);
      });
    }

    $$('[data-bug]').forEach((node) => {
      const handler = (event) => {
        if (node.tagName === "BUTTON") event.preventDefault();
        const key = node.dataset.bug;
        if (!found.has(key)) {
          found.add(key);
          renderFoundBugs();
          showToast("Bug discovered");
        }
      };
      node.addEventListener("click", handler);
      if (node.tagName === "INPUT") node.addEventListener("input", handler);
    });

    if (form && scorePanel) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const severity = $("#bug-severity")?.value || "minor";
        const steps = $("#bug-steps")?.value.trim() || "";
        const expected = $("#bug-expected")?.value.trim() || "";
        const actual = $("#bug-actual")?.value.trim() || "";

        let score = 0;
        score += Math.min(found.size * 12, 36);
        score += severity === "critical" ? 14 : severity === "major" ? 12 : 7;
        score += steps.split(/\n|\d\./).filter((part) => part.trim().length > 8).length >= 2 ? 22 : steps.length > 20 ? 12 : 0;
        score += expected.length > 12 ? 14 : 0;
        score += actual.length > 12 ? 14 : 0;
        score = Math.min(score, 100);

        const quality = score >= 85 ? "release-ready" : score >= 65 ? "useful" : "needs more detail";
        scorePanel.innerHTML = `
          <h4>Report score: ${score}/100</h4>
          <p>This bug report is <strong>${quality}</strong>.</p>
          <ul class="feature-list">
            <li>Found bugs: ${found.size}/4</li>
            <li>Severity selected: ${severity}</li>
            <li>${steps.length > 20 ? "Reproduction steps included" : "Add clearer reproduction steps"}</li>
            <li>${expected && actual ? "Expected and actual results included" : "Add expected and actual results"}</li>
          </ul>
        `;
        if (score >= 60) completeDemo("qa");
      });
    }

    renderFoundBugs();
  }

  function setupLevelDesigner() {
    const grid = $("#level-grid");
    const analyze = $("#analyze-level");
    const reset = $("#reset-level");
    const output = $("#level-output");
    if (!grid || !analyze || !output) return;

    const width = 7;
    const height = 5;
    const cycle = ["empty", "path", "reward", "hazard", "start", "goal"];
    const startingTiles = [
      "start", "path", "path", "empty", "empty", "empty", "empty",
      "empty", "hazard", "path", "reward", "path", "path", "empty",
      "empty", "empty", "path", "empty", "hazard", "path", "empty",
      "empty", "reward", "path", "path", "path", "path", "goal",
      "empty", "empty", "empty", "hazard", "empty", "empty", "empty"
    ];
    let tiles = [...startingTiles];

    function renderGrid() {
      grid.innerHTML = "";
      tiles.forEach((type, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `tile ${type}`;
        button.textContent = getTileLabel(type);
        button.setAttribute("aria-label", `Tile ${index + 1}: ${type}`);
        button.addEventListener("click", () => {
          const currentIndex = cycle.indexOf(tiles[index]);
          tiles[index] = cycle[(currentIndex + 1) % cycle.length];
          renderGrid();
        });
        grid.appendChild(button);
      });
    }

    function getTileLabel(type) {
      const labels = { empty: "", path: "·", reward: "★", hazard: "!", start: "S", goal: "G" };
      return labels[type] || "";
    }

    function neighbors(index) {
      const row = Math.floor(index / width);
      const col = index % width;
      const points = [];
      if (row > 0) points.push(index - width);
      if (row < height - 1) points.push(index + width);
      if (col > 0) points.push(index - 1);
      if (col < width - 1) points.push(index + 1);
      return points;
    }

    function hasPath(startIndex, goalIndexes) {
      if (startIndex < 0 || !goalIndexes.length) return false;
      const walkable = new Set(["start", "path", "reward", "goal"]);
      const queue = [startIndex];
      const visited = new Set([startIndex]);
      while (queue.length) {
        const current = queue.shift();
        if (goalIndexes.includes(current)) return true;
        neighbors(current).forEach((next) => {
          if (!visited.has(next) && walkable.has(tiles[next])) {
            visited.add(next);
            queue.push(next);
          }
        });
      }
      return false;
    }

    function analyzeGrid() {
      const counts = tiles.reduce((acc, tile) => {
        acc[tile] = (acc[tile] || 0) + 1;
        return acc;
      }, {});
      const startIndexes = tiles.map((tile, index) => tile === "start" ? index : -1).filter((index) => index >= 0);
      const goalIndexes = tiles.map((tile, index) => tile === "goal" ? index : -1).filter((index) => index >= 0);
      const connected = hasPath(startIndexes[0] ?? -1, goalIndexes);
      const hazardRatio = Math.round(((counts.hazard || 0) / tiles.length) * 100);
      const rewardCount = counts.reward || 0;

      const notes = [];
      if (startIndexes.length !== 1) notes.push("Use exactly one start tile so the player entry point is clear.");
      if (goalIndexes.length !== 1) notes.push("Use exactly one goal tile so the level has a clear endpoint.");
      if (!connected) notes.push("The start does not connect to the goal through walkable tiles.");
      if (hazardRatio > 18) notes.push("Hazards may be too dense for a tutorial-style level.");
      if (rewardCount === 0) notes.push("Add at least one reward to create a positive pacing beat.");
      if (rewardCount > 3) notes.push("Too many rewards may reduce tension. Consider spacing them out.");
      if (!notes.length) notes.push("Strong flow: readable route, clear objective, and balanced reward pressure.");

      output.innerHTML = `
        <h4>Design analysis</h4>
        <p><strong>${connected ? "Playable path found" : "Path issue detected"}</strong> • Hazards: ${hazardRatio}% • Rewards: ${rewardCount}</p>
        <ul class="feature-list">${notes.map((note) => `<li>${note}</li>`).join("")}</ul>
      `;
      completeDemo("level");
    }

    analyze.addEventListener("click", analyzeGrid);
    if (reset) {
      reset.addEventListener("click", () => {
        tiles = [...startingTiles];
        renderGrid();
        output.innerHTML = '<h4>Design notes</h4><p class="muted">Create a path from start to goal, add rewards and hazards, then analyze the player flow.</p>';
      });
    }
    renderGrid();
  }

  function setupVectorConfigurator() {
    const form = $("#vector-form");
    const preview = $("#vector-preview");
    const notes = $("#vector-notes");
    if (!form || !preview || !notes) return;

    const colors = {
      blue: { fill: "#2563eb", soft: "#dbeafe", label: "blue acrylic" },
      teal: { fill: "#14b8a6", soft: "#ccfbf1", label: "teal acrylic" },
      amber: { fill: "#f59e0b", soft: "#fef3c7", label: "amber acrylic" }
    };

    function getValue(id, fallback) {
      return $(`#${id}`)?.value || fallback;
    }

    function shapeMarkup(shape, fill, soft) {
      if (shape === "star") {
        return `<polygon points="100,20 119,75 178,75 130,110 148,168 100,132 52,168 70,110 22,75 81,75" fill="${fill}" stroke="${soft}" stroke-width="8" />`;
      }
      if (shape === "gem") {
        return `<polygon points="100,18 170,70 144,168 56,168 30,70" fill="${fill}" stroke="${soft}" stroke-width="8" />`;
      }
      return `<path d="M100 18 L166 45 V92 C166 128 140 154 100 176 C60 154 34 128 34 92 V45 Z" fill="${fill}" stroke="${soft}" stroke-width="8" />`;
    }

    function finishMarkup(finish) {
      if (finish === "dense") {
        return `
          <path d="M60 90 H140 M70 112 H130 M82 134 H118" stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.9" />
          <circle cx="100" cy="72" r="16" fill="none" stroke="white" stroke-width="6" opacity="0.9" />
        `;
      }
      if (finish === "minimal") {
        return `<circle cx="100" cy="100" r="26" fill="none" stroke="white" stroke-width="8" opacity="0.95" />`;
      }
      return `<path d="M70 105 L92 127 L135 77" fill="none" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" />`;
    }

    function hardwareMarkup(hardware) {
      if (hardware === "pin") return `<rect x="72" y="28" width="56" height="12" rx="6" fill="#111827" opacity="0.35" />`;
      if (hardware === "magnet") return `<circle cx="100" cy="38" r="13" fill="#111827" opacity="0.35" />`;
      return `<circle cx="100" cy="26" r="16" fill="none" stroke="#111827" stroke-width="8" opacity="0.45" />`;
    }

    function render(generateSpec) {
      const shape = getValue("product-shape", "shield");
      const layer = getValue("product-layer", "blue");
      const finish = getValue("product-finish", "clean");
      const hardware = getValue("product-hardware", "keychain");
      const color = colors[layer];

      preview.innerHTML = `
        <svg viewBox="0 0 200 200" role="img" aria-label="Product charm preview">
          <defs>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" flood-opacity="0.25" />
            </filter>
          </defs>
          <g filter="url(#softShadow)">
            ${hardwareMarkup(hardware)}
            ${shapeMarkup(shape, color.fill, color.soft)}
            ${finishMarkup(finish)}
          </g>
        </svg>
      `;

      if (generateSpec) {
        notes.innerHTML = `
          <h4>Production note</h4>
          <ul class="feature-list">
            <li><strong>Material:</strong> 3 mm ${color.label}; separate cut and engrave layers.</li>
            <li><strong>Shape:</strong> ${shape}; keep outer stroke as closed vector path.</li>
            <li><strong>Engraving:</strong> ${finish}; test small details before production run.</li>
            <li><strong>Hardware:</strong> ${hardware}; reserve attachment clearance in the top layer.</li>
          </ul>
        `;
        completeDemo("vector");
      }
    }

    form.addEventListener("change", () => render(false));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render(true);
    });
    render(false);
  }

  function setupAnalyticsReset() {
    const reset = $("#reset-analytics");
    if (!reset) return;
    reset.addEventListener("click", () => {
      saveProgress({ completed: [], badges: [], interactions: 0, lastDemo: "" });
      showToast("Local progress reset");
    });
  }

  function setupCopyEmail() {
    const copyEmail = $("#copy-email");
    if (!copyEmail) return;
    copyEmail.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("ericyang.yang@mail.utoronto.ca");
        showToast("Email copied to clipboard");
      } catch (error) {
        showToast("Copy failed. Email: ericyang.yang@mail.utoronto.ca");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    setupNavigation();
    setupViewModes();
    setupRevealAnimations();
    setupCareSimulator();
    setupQuizBuilder();
    setupQuestGenerator();
    setupQAArena();
    setupLevelDesigner();
    setupVectorConfigurator();
    setupAnalyticsReset();
    setupCopyEmail();
    updateProgressUI();
  });
})();
