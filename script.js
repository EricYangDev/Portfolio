(() => {
  function initCapabilityMap() {
    const SOURCE = {
      "Programming": {
        "JavaScript, HTML, CSS": [
          "Interactive UI logic",
          "Regex-based development",
          "Editable text-file systems",
          "Custom engine creation"
        ],
        "Python": [
          "Data cleanup",
          "Data visualization",
          "Data analysis"
        ],
        "Rapid prototyping": [
          "Feedback integration",
          "Interactable demos",
          "Fast UI mockups",
          "Experimental mechanics"
        ]
      },

      "Game Creation": {
        "Game design": [
          "Mechanics & gameplay loops",
          "Progression & motivation",
          "Ludology fundamentals"
        ],
        "Level design": [
          "3D level design",
          "2D level design",
          "Spatial flow analysis",
          "Tutorial & onboarding",
          "Difficulty balancing"
        ],
        "Narrative systems": [
          "Branching story writing",
          "Dialogue scripting",
          "Scene & outcome logic"
        ],
        "Systems design": [
          "In-game economies",
          "Player-to-player trading",
          "Progression systems"
        ],
        "Documentation": [
          "Visual documentation",
          "Flowchart creation",
          "Data sheet organization",
          "Manual & guide writing"
        ]
      },

      "AI-Assisted Work": {
        "AI-assisted programming": [
          "Code debugging with AI",
          "Prompt engineering",
          "Vibe coding efficiency"
        ],
        "AI-assisted generation": [
          "Video generation",
          "Image generation",
          "Audio generation",
          "Voice generation"
        ]
      },

      "Creative Media": {
        "Graphic design": [
          "2D image (PNG) creation",
          "Vector art (SVG) creation",
          "Photo editing",
          "Image file handling"
        ],
        "3D Graphic design": [
          "3D Modeling",
          "UV Map editing",
          "3D Printing"
        ],
        "Video editing": [
          "Video editing",
          "Audio editing"
        ],
        "UI/UX": [
          "Visual hierarchy",
          "Brand-aware design",
          "Web development",
          "Web design",
          "Wireframing"
        ],
        "Product design": [
          "Blueprint design",
          "Adobe Illustrator",
          "CNC Cutting files",
          "Laser cutting files",
          "Wood engraving files"
        ]
      },

      "Educational Technology": {
        "Serious games": [
          "Health education games",
          "Palliative care education",
          "Clinical simulation development",
          "Uncertainty-based mechanics",
          "Branching outcome logic creation"
        ],
        "Educational system handling": [
          "Moodle management",
          "Canva management",
          "D2L management",
          "Articulate management",
          "SCORM file development"
        ],
        "Learning experience design": [
          "Usability testing",
          "Accessibility verification",
          "Interface simplification",
          "Student feedback integration"
        ]
      },

      "Academic Research": {
        "Research": [
          "Literature review",
          "Academic synthesis",
          "Experiment design",
          "Gamification theory",
          "Academic writing"
        ],
        "Data & visualization": [
          "Data collection",
          "Data analysis",
          "Visual data programming"
        ],
        "Psychology integration": [
          "Player/user behavior",
          "Motivation analysis",
          "Immersion analysis",
          "Addiction analysis",
          "Well-being framework integration"
        ],
        "Human-centered design": [
          "Human-computer interaction",
          "User research",
          "Accessibility awareness",
          "Designing for non-technical users"
        ]
      },

      "Management & Operations": {
        "Project management": [
          "Task breakdown",
          "Iteration planning",
          "Scope control",
          "Productivity & time awareness"
        ],
        "Stakeholder management": [
          "Working with supervisors",
          "Presenting for non-technical users",
          "Feedback collection",
          "Explaining tradeoffs",
          "Amazing smile during meetings"
        ],
        "Process improvement": [
          "Automation integration",
          "Content pipeline design",
          "Repeatable production systems",
          "Template creation"
        ]
      },

      "Soft Skills": {
        "Problem solving": [
          "Quality assurance testing",
          "Replicating bugs & errors",
          "Solution prioritization"
        ],
        "Creativity": [
          "Interdisciplinary knowledge",
          "Visual brainstorming"
        ],
        "Communication": [
          "Simplifying complex systems",
          "Writing guides for others",
          "Listening & remembering",
          "Understanding constraints"
        ],
        "Leadership": [
          "Leading small projects",
          "Owning prototypes",
          "Coordinating design direction",
          "Decision-making under uncertainty"
        ]
      }
    };

    const colors = [
      "#6d79ff",
      "#43c7ff",
      "#b37cff",
      "#f08ec2",
      "#e9b65b",
      "#58d0a0",
      "#6fd3e9",
      "#8c9cff"
    ];

    const stage = document.getElementById("stage");
    const nodesEl = document.getElementById("nodes");
    const linksEl = document.getElementById("links");
    const panel = document.getElementById("panel");
    const lens = document.getElementById("lens");
    const search = document.getElementById("search");

    const centerMark = document.getElementById("centerMark");
    const centerTitle = document.getElementById("centerTitle");
    const centerHint = document.getElementById("centerHint");

    if (
      !stage ||
      !nodesEl ||
      !linksEl ||
      !panel ||
      !lens ||
      !search ||
      !centerMark ||
      !centerTitle ||
      !centerHint
    ) {
      console.error(
        "The capability-map HTML elements could not be found."
      );

      return;
    }

    const CATEGORY_KEYS = Object.keys(SOURCE);
    const CAT_COUNT = CATEGORY_KEYS.length;

    let nodes = [];
    let edges = [];

    let pointer = {
      x: -9999,
      y: -9999,
      inside: false
    };

    let layout = {
      w: 0,
      h: 0,
      baseCx: 0,
      baseCy: 0,
      cx: 0,
      cy: 0,
      coreR: 0,
      interfaceScale: 1
    };

    let activeCategory = null;
    let activeSkill = null;
    let activeMini = null;
    let activeNode = null;

    let lastPanelKey = "";
    let lockedAttempt = false;

    const escapeHTML = (value) => {
      return String(value).replace(
        /[&<>"']/g,
        (character) => {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
          }[character];
        }
      );
    };

    const clamp = (value, minimum, maximum) => {
      return Math.max(
        minimum,
        Math.min(maximum, value)
      );
    };

    const lerp = (start, end, amount) => {
      return start + ((end - start) * amount);
    };

    function makeNode(
      label,
      type,
      colorIndex,
      metadata = {}
    ) {
      const element = document.createElement("div");

      element.className = `node ${type}`;
      element.style.setProperty(
        "--c",
        colors[colorIndex]
      );

      element.innerHTML =
        `<div class="label">${escapeHTML(label)}</div>`;

      nodesEl.appendChild(element);

      const node = {
        label,
        type,
        colorIndex,
        element,
        el: element,

        px: 0,
        py: 0,
        tx: 0,
        ty: 0,

        hit: false,
        categoryHit: false,
        skillHit: false,

        angle: 0,
        branchAngle: 0,
        displayScale: 1,

        ...metadata
      };

      nodes.push(node);

      return node;
    }

    function makeEdge(
      firstNode,
      secondNode,
      kind = "branch"
    ) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );

      line.classList.add("edge");

      if (kind === "core") {
        line.classList.add("core");
      } else {
        line.classList.add("hidden");
      }

      linksEl.appendChild(line);

      const edge = {
        a: firstNode,
        b: secondNode,
        kind,
        el: line
      };

      edges.push(edge);

      return edge;
    }

    function build() {
      const rectangle = stage.getBoundingClientRect();

      if (
        rectangle.width < 20 ||
        rectangle.height < 20
      ) {
        return;
      }

      const interfaceScale = clamp(
        Math.min(
          rectangle.width / 1120,
          rectangle.height / 690
        ),
        0.82,
        1.18
      );

      const coreRadius = clamp(
        Math.min(
          rectangle.width * 0.235,
          rectangle.height * 0.32
        ),
        170,
        270
      );

      layout = {
        w: rectangle.width,
        h: rectangle.height,

        baseCx: rectangle.width * 0.5,
        baseCy: rectangle.height * 0.52,

        cx: rectangle.width * 0.5,
        cy: rectangle.height * 0.52,

        coreR: coreRadius,
        interfaceScale
      };

      stage.style.setProperty(
        "--interface-scale",
        interfaceScale.toFixed(3)
      );

      nodes = [];
      edges = [];

      nodesEl.innerHTML = "";
      linksEl.innerHTML = "";

      activeCategory = null;
      activeSkill = null;
      activeMini = null;
      activeNode = null;

      lastPanelKey = "";

      const categoryNodes = [];

      CATEGORY_KEYS.forEach((category, index) => {
        const baseAngle =
          -Math.PI / 2 +
          index * Math.PI * 2 / CAT_COUNT;

        const categoryNode = makeNode(
          category,
          "category",
          index,
          {
            category,
            index,
            baseAngle
          }
        );

        categoryNodes.push(categoryNode);
      });

      categoryNodes.forEach(
        (categoryNode, index) => {
          makeEdge(
            categoryNode,
            categoryNodes[
              (index + 1) % CAT_COUNT
            ],
            "core"
          );
        }
      );

      categoryNodes.forEach(
        (categoryNode, colorIndex) => {
          const skills =
            Object.entries(
              SOURCE[categoryNode.category]
            );

          skills.forEach(
            (
              [skillName, miniSkills],
              skillIndex
            ) => {
              const skillNode = makeNode(
                skillName,
                "skill",
                colorIndex,
                {
                  category:
                    categoryNode.category,

                  parent:
                    categoryNode,

                  skill:
                    skillName,

                  minis:
                    miniSkills,

                  skillIndex,
                  skillCount:
                    skills.length,

                  catIndex:
                    colorIndex
                }
              );

              makeEdge(
                categoryNode,
                skillNode
              );

              miniSkills.forEach(
                (
                  miniSkill,
                  miniIndex
                ) => {
                  const miniNode = makeNode(
                    miniSkill,
                    "mini",
                    colorIndex,
                    {
                      category:
                        categoryNode.category,

                      parent:
                        skillNode,

                      skill:
                        skillName,

                      mini:
                        miniSkill,

                      minis:
                        miniSkills,

                      miniIndex,
                      miniCount:
                        miniSkills.length,

                      catIndex:
                        colorIndex
                    }
                  );

                  makeEdge(
                    skillNode,
                    miniNode
                  );
                }
              );
            }
          );
        }
      );

      computeTargets();

      nodes.forEach((node) => {
        node.px = node.tx;
        node.py = node.ty;
      });

      render(true);
      showIntro();
      updateHitState();
    }

    function skillVisible(node) {
      const query = search.value.trim();

      return (
        (
          activeCategory &&
          node.category === activeCategory
        ) ||
        (
          query &&
          (
            node.hit ||
            node.categoryHit
          )
        )
      );
    }

    function miniVisible(node) {
      const query = search.value.trim();

      return (
        (
          activeSkill &&
          node.category === activeCategory &&
          node.skill === activeSkill.skill
        ) ||
        (
          query &&
          (
            node.hit ||
            node.skillHit
          )
        )
      );
    }

    function collisionRadius(node) {
      const scale =
        layout.interfaceScale || 1;

      if (node.type === "skill") {
        return (
          node === activeNode
            ? 50
            : 36
        ) * scale;
      }

      if (node.type === "mini") {
        return (
          node === activeNode
            ? 78
            : 37
        ) * scale;
      }

      return 0;
    }

    function placeCircularGroup(
      group,
      parentX,
      parentY,
      centerAngle,
      radius,
      gap
    ) {
      if (!group.length) {
        return;
      }

      if (group.length === 1) {
        group[0].branchAngle =
          centerAngle;

        group[0].tx =
          parentX +
          Math.cos(centerAngle) *
          radius;

        group[0].ty =
          parentY +
          Math.sin(centerAngle) *
          radius;

        return;
      }

      const angleSteps = [];

      for (
        let index = 0;
        index < group.length - 1;
        index += 1
      ) {
        const requiredDistance =
          collisionRadius(group[index]) +
          collisionRadius(group[index + 1]) +
          gap;

        const ratio = Math.min(
          0.98,
          requiredDistance /
          (2 * radius)
        );

        angleSteps.push(
          2 * Math.asin(ratio)
        );
      }

      const totalAngle =
        angleSteps.reduce(
          (total, step) =>
            total + step,
          0
        );

      let angle =
        centerAngle -
        totalAngle / 2;

      group.forEach(
        (node, index) => {
          if (index > 0) {
            angle +=
              angleSteps[index - 1];
          }

          node.branchAngle = angle;

          node.tx =
            parentX +
            Math.cos(angle) *
            radius;

          node.ty =
            parentY +
            Math.sin(angle) *
            radius;
        }
      );
    }

    function resolveCrossLevelCollisions() {
      const visibleSkills = nodes.filter(
        (node) =>
          node.type === "skill" &&
          skillVisible(node)
      );

      const visibleMinis = nodes.filter(
        (node) =>
          node.type === "mini" &&
          miniVisible(node)
      );

      const scale =
        layout.interfaceScale || 1;

      const margin = 14 * scale;
      const miniMargin = 10 * scale;
      const edgeMargin = 34 * scale;

      for (
        let pass = 0;
        pass < 10;
        pass += 1
      ) {
        let moved = false;

        for (
          const mini of visibleMinis
        ) {
          for (
            const skill of visibleSkills
          ) {
            const deltaX =
              mini.tx - skill.tx;

            const deltaY =
              mini.ty - skill.ty;

            let distance =
              Math.hypot(
                deltaX,
                deltaY
              );

            const requiredDistance =
              collisionRadius(mini) +
              collisionRadius(skill) +
              margin;

            if (
              distance <
              requiredDistance
            ) {
              let unitX;
              let unitY;

              if (distance < 0.001) {
                const angle =
                  mini.branchAngle ??
                  skill.branchAngle ??
                  0;

                unitX = Math.cos(angle);
                unitY = Math.sin(angle);

                distance = 0;
              } else {
                unitX =
                  deltaX / distance;

                unitY =
                  deltaY / distance;
              }

              const push =
                requiredDistance -
                distance +
                1;

              mini.tx += unitX * push;
              mini.ty += unitY * push;

              moved = true;
            }
          }
        }

        for (
          let firstIndex = 0;
          firstIndex < visibleMinis.length;
          firstIndex += 1
        ) {
          for (
            let secondIndex =
              firstIndex + 1;
            secondIndex <
              visibleMinis.length;
            secondIndex += 1
          ) {
            const firstMini =
              visibleMinis[firstIndex];

            const secondMini =
              visibleMinis[secondIndex];

            let deltaX =
              secondMini.tx -
              firstMini.tx;

            let deltaY =
              secondMini.ty -
              firstMini.ty;

            let distance =
              Math.hypot(
                deltaX,
                deltaY
              );

            const requiredDistance =
              collisionRadius(firstMini) +
              collisionRadius(secondMini) +
              miniMargin;

            if (
              distance <
              requiredDistance
            ) {
              let unitX;
              let unitY;

              if (distance < 0.001) {
                unitX = 1;
                unitY = 0;
                distance = 0;
              } else {
                unitX =
                  deltaX / distance;

                unitY =
                  deltaY / distance;
              }

              const push =
                (
                  requiredDistance -
                  distance +
                  1
                ) / 2;

              firstMini.tx -=
                unitX * push;

              firstMini.ty -=
                unitY * push;

              secondMini.tx +=
                unitX * push;

              secondMini.ty +=
                unitY * push;

              moved = true;
            }
          }
        }

        if (!moved) {
          break;
        }
      }

      for (
        const mini of visibleMinis
      ) {
        const radius =
          collisionRadius(mini);

        mini.tx = clamp(
          mini.tx,
          edgeMargin + radius,
          layout.w -
            edgeMargin -
            radius
        );

        mini.ty = clamp(
          mini.ty,
          edgeMargin + radius,
          layout.h -
            edgeMargin -
            radius
        );
      }
    }

    function computeTargets() {
      const scale =
        layout.interfaceScale || 1;

      const activeIndex =
        activeCategory
          ? CATEGORY_KEYS.indexOf(
              activeCategory
            )
          : -1;

      const activeAngle =
        activeIndex >= 0
          ? (
              -Math.PI / 2 +
              activeIndex *
              Math.PI *
              2 /
              CAT_COUNT
            )
          : 0;

      const focusShift =
        activeCategory
          ? Math.min(
              86 * scale,
              layout.h * 0.11
            )
          : 0;

      /*
       * When a branch expands, the map center moves
       * away from that branch. This creates extra room
       * at the edge of the canvas.
       */
      layout.cx =
        layout.baseCx -
        Math.cos(activeAngle) *
        focusShift;

      layout.cy =
        layout.baseCy -
        Math.sin(activeAngle) *
        focusShift;

      /*
       * The default octagon is large. When a branch is
       * active, the core contracts slightly so that its
       * sub-skills and mini-skills have room to expand.
       */
      const effectiveCoreRadius =
        activeCategory
          ? layout.coreR * 0.8
          : layout.coreR;

      centerMark.style.left =
        `${layout.cx}px`;

      centerMark.style.top =
        `${layout.cy}px`;

      const categories = nodes.filter(
        (node) =>
          node.type === "category"
      );

      categories.forEach((node) => {
        node.angle = node.baseAngle;

        node.tx =
          layout.cx +
          Math.cos(node.baseAngle) *
          effectiveCoreRadius;

        node.ty =
          layout.cy +
          Math.sin(node.baseAngle) *
          effectiveCoreRadius;
      });

      const categoryMap =
        Object.fromEntries(
          categories.map(
            (node) => [
              node.category,
              node
            ]
          )
        );

      CATEGORY_KEYS.forEach(
        (category) => {
          const categoryNode =
            categoryMap[category];

          const group = nodes
            .filter(
              (node) =>
                node.type === "skill" &&
                node.category ===
                  category
            )
            .sort(
              (first, second) =>
                first.skillIndex -
                second.skillIndex
            );

          const focused =
            activeCategory === category;

          let radius =
            (
              focused
                ? 132
                : 82
            ) * scale;

          if (
            activeSkill &&
            activeSkill.category ===
              category
          ) {
            radius += 8 * scale;
          }

          placeCircularGroup(
            group,
            categoryNode.tx,
            categoryNode.ty,
            categoryNode.angle,
            radius,
            10 * scale
          );
        }
      );

      const skillMap = {};

      nodes
        .filter(
          (node) =>
            node.type === "skill"
        )
        .forEach((node) => {
          skillMap[
            `${node.category}__${node.skill}`
          ] = node;
        });

      nodes
        .filter(
          (node) =>
            node.type === "skill"
        )
        .forEach((skillNode) => {
          const group = nodes
            .filter(
              (node) =>
                node.type === "mini" &&
                node.category ===
                  skillNode.category &&
                node.skill ===
                  skillNode.skill
            )
            .sort(
              (first, second) =>
                first.miniIndex -
                second.miniIndex
            );

          const focused =
            Boolean(activeSkill) &&
            activeSkill.category ===
              skillNode.category &&
            activeSkill.skill ===
              skillNode.skill;

          const radius =
            (
              focused
                ? 120
                : 42
            ) * scale;

          const centerAngle =
            skillNode.branchAngle ??
            categoryMap[
              skillNode.category
            ].angle;

          placeCircularGroup(
            group,
            skillNode.tx,
            skillNode.ty,
            centerAngle,
            radius,
            8 * scale
          );
        });

      resolveCrossLevelCollisions();
    }

    function updateHitState() {
      const query =
        search.value
          .trim()
          .toLowerCase();

      nodes.forEach((node) => {
        node.hit = false;
        node.categoryHit = false;
        node.skillHit = false;
      });

      if (!query) {
        return;
      }

      nodes.forEach((node) => {
        const searchableText = [
          node.label,
          node.category,
          node.skill,
          node.mini
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (
          searchableText.includes(query)
        ) {
          node.hit = true;
        }
      });

      const miniHits = nodes.filter(
        (node) =>
          node.type === "mini" &&
          node.hit
      );

      miniHits.forEach((miniNode) => {
        nodes.forEach((node) => {
          if (
            node.type === "skill" &&
            node.category ===
              miniNode.category &&
            node.skill ===
              miniNode.skill
          ) {
            node.skillHit = true;
          }

          if (
            node.type === "category" &&
            node.category ===
              miniNode.category
          ) {
            node.categoryHit = true;
          }
        });
      });

      const skillHits = nodes.filter(
        (node) =>
          node.type === "skill" &&
          node.hit
      );

      skillHits.forEach((skillNode) => {
        nodes.forEach((node) => {
          if (
            node.type === "category" &&
            node.category ===
              skillNode.category
          ) {
            node.categoryHit = true;
          }
        });
      });

      nodes
        .filter(
          (node) =>
            node.type === "category" &&
            node.hit
        )
        .forEach((node) => {
          node.categoryHit = true;
        });
    }

    function showIntro() {
      panel.innerHTML = `
        <div class="eyebrow">
          Eight-domain capability model
        </div>

        <h1>
          Dynamic focus reflow
        </h1>

        <p>
          Hover a domain to lock and reveal its branch.
          To explore a different domain, move the cursor
          through the center reset hub first.
        </p>

        <div class="chips">
          <span class="chip">Hover-driven</span>
          <span class="chip">Low clutter</span>
          <span class="chip">Space-aware</span>
        </div>

        <div class="intro">
          The octagon remains stable while the active
          branch receives additional room and visual
          emphasis.
        </div>
      `;
    }

    function setPanel() {
      let key = "intro";

      if (
        activeNode?.type === "mini"
      ) {
        key =
          `mini:${activeNode.category}/` +
          `${activeNode.skill}/` +
          `${activeNode.mini}`;
      } else if (
        activeNode?.type === "skill"
      ) {
        key =
          `skill:${activeNode.category}/` +
          `${activeNode.skill}`;
      } else if (
        activeNode?.type === "category"
      ) {
        key =
          `category:${activeNode.category}`;
      }

      if (key === lastPanelKey) {
        return;
      }

      lastPanelKey = key;

      if (
        activeNode?.type === "mini"
      ) {
        const node = activeNode;

        panel.innerHTML = `
          <div class="eyebrow">
            Supporting capability
          </div>

          <div class="path">
            ${escapeHTML(node.category)}
            /
            ${escapeHTML(node.skill)}
          </div>

          <h1>
            ${escapeHTML(node.mini)}
          </h1>

          <p>
            This capability supports
            ${escapeHTML(node.skill)}
            within
            ${escapeHTML(node.category)}.
            The full branch remains in focus while this
            node is explored.
          </p>

          <div class="chips">
            <span class="chip">
              Level 3 capability
            </span>

            <span class="chip">
              Center reset required
            </span>
          </div>
        `;

        return;
      }

      if (
        activeNode?.type === "skill"
      ) {
        const node = activeNode;

        panel.innerHTML = `
          <div class="eyebrow">
            Primary skill
          </div>

          <div class="path">
            ${escapeHTML(node.category)}
            /
            ${escapeHTML(node.skill)}
          </div>

          <h1>
            ${escapeHTML(node.skill)}
          </h1>

          <p>
            This skill is active within its branch.
            The other seven domains remain dimmed
            while you explore it.
          </p>

          <div class="chips">
            <span class="chip">
              ${node.minis.length}
              supporting capabilities
            </span>

            <span class="chip">
              Branch locked
            </span>
          </div>

          <h2>Mini-skills</h2>

          <div class="mini-list">
            ${node.minis
              .map(
                (mini) => `
                  <div class="mini-row">
                    ${escapeHTML(mini)}
                  </div>
                `
              )
              .join("")}
          </div>
        `;

        return;
      }

      if (
        activeNode?.type === "category"
      ) {
        const node = activeNode;

        const skills =
          Object.keys(
            SOURCE[node.category]
          );

        const capabilityCount =
          Object.values(
            SOURCE[node.category]
          ).reduce(
            (total, items) =>
              total + items.length,
            0
          );

        panel.innerHTML = `
          <div class="eyebrow">
            Capability domain
          </div>

          <div class="path">
            Octagon /
            ${escapeHTML(node.category)}
          </div>

          <h1>
            ${escapeHTML(node.category)}
          </h1>

          <p>
            This branch is locked for exploration.
            Return the cursor to the center hub before
            switching to another domain.
          </p>

          <div class="chips">
            <span class="chip">
              ${skills.length} skills
            </span>

            <span class="chip">
              ${capabilityCount} capabilities
            </span>

            <span class="chip">
              Branch locked
            </span>
          </div>

          <h2>Primary skills</h2>

          <div class="mini-list">
            ${skills
              .map(
                (skill) => `
                  <div class="mini-row">
                    ${escapeHTML(skill)}
                  </div>
                `
              )
              .join("")}
          </div>
        `;

        return;
      }

      showIntro();
    }

    function renderedRadius(node) {
      const interfaceScale =
        layout.interfaceScale || 1;

      const baseRadius =
        (
          node.type === "category"
            ? 64
            : node.type === "skill"
              ? 33
              : 31
        ) * interfaceScale;

      return (
        baseRadius *
        Math.max(
          0.65,
          node.displayScale || 1
        )
      );
    }

    function directHit(list) {
      let bestNode = null;
      let bestRatio = Infinity;

      for (const node of list) {
        const radius =
          renderedRadius(node);

        const distance =
          Math.hypot(
            pointer.x - node.px,
            pointer.y - node.py
          );

        const ratio =
          distance / radius;

        if (
          ratio <= 1 &&
          ratio < bestRatio
        ) {
          bestNode = node;
          bestRatio = ratio;
        }
      }

      return bestNode;
    }

    function updateCenterHub(
      centerDistance = Infinity
    ) {
      const locked =
        Boolean(activeCategory);

      const scale =
        layout.interfaceScale || 1;

      centerMark.classList.toggle(
        "locked",
        locked
      );

      centerMark.classList.toggle(
        "nudge",
        lockedAttempt
      );

      centerMark.classList.toggle(
        "reset-ready",
        locked &&
        centerDistance < 122 * scale
      );

      if (locked) {
        centerTitle.textContent =
          "Return to center";

        centerHint.textContent =
          "to switch branches";
      } else {
        centerTitle.textContent =
          "Choose a domain";

        centerHint.textContent =
          "hover a large bubble";
      }
    }

    function determineFocus() {
      lockedAttempt = false;

      if (!pointer.inside) {
        activeNode = null;
        activeMini = null;

        updateCenterHub();
        setPanel();

        return;
      }

      const centerDistance =
        Math.hypot(
          pointer.x - layout.cx,
          pointer.y - layout.cy
        );

      const resetRadius =
        112 *
        (layout.interfaceScale || 1);

      if (
        centerDistance <
        resetRadius
      ) {
        activeCategory = null;
        activeSkill = null;
        activeMini = null;
        activeNode = null;

        updateCenterHub(
          centerDistance
        );

        setPanel();

        return;
      }

      if (activeCategory) {
        const miniNode = directHit(
          nodes.filter(
            (node) =>
              node.type === "mini" &&
              node.category ===
                activeCategory &&
              miniVisible(node)
          )
        );

        const skillNode = directHit(
          nodes.filter(
            (node) =>
              node.type === "skill" &&
              node.category ===
                activeCategory
          )
        );

        const categoryNode =
          directHit(
            nodes.filter(
              (node) =>
                node.type ===
                  "category" &&
                node.category ===
                  activeCategory
            )
          );

        const blockedCategory =
          directHit(
            nodes.filter(
              (node) =>
                node.type ===
                  "category" &&
                node.category !==
                  activeCategory
            )
          );

        const hit =
          miniNode ||
          skillNode ||
          categoryNode;

        if (
          hit?.type === "mini"
        ) {
          activeSkill = hit.parent;
          activeMini = hit;
          activeNode = hit;
        } else if (
          hit?.type === "skill"
        ) {
          activeSkill = hit;
          activeMini = null;
          activeNode = hit;
        } else if (
          hit?.type === "category"
        ) {
          activeSkill = null;
          activeMini = null;
          activeNode = hit;
        } else {
          activeMini = null;
          activeNode = null;

          if (blockedCategory) {
            lockedAttempt = true;
          }
        }
      } else {
        const categoryNode =
          directHit(
            nodes.filter(
              (node) =>
                node.type ===
                  "category"
            )
          );

        if (categoryNode) {
          activeCategory =
            categoryNode.category;

          activeSkill = null;
          activeMini = null;
          activeNode = categoryNode;
        } else {
          activeNode = null;
        }
      }

      updateCenterHub(
        centerDistance
      );

      setPanel();
    }

    function applyClasses() {
      const query =
        search.value.trim();

      const focusedCategory =
        activeCategory || null;

      nodes.forEach((node) => {
        const focused =
          node === activeNode;

        node.el.classList.toggle(
          "focused",
          focused
        );

        node.el.classList.toggle(
          "visible",
          (
            node.type === "skill" &&
            skillVisible(node)
          ) ||
          (
            node.type === "mini" &&
            miniVisible(node)
          )
        );

        node.el.classList.toggle(
          "near",
          node.type === "mini" &&
          focused
        );

        let dimmed =
          query
            ? !(
                node.hit ||
                node.categoryHit ||
                node.skillHit
              )
            : false;

        if (
          !query &&
          focusedCategory &&
          node.type === "category" &&
          node.category !==
            focusedCategory
        ) {
          dimmed = true;
        }

        node.el.classList.toggle(
          "dim",
          dimmed
        );

        node.el.classList.toggle(
          "match",
          Boolean(query) &&
          (
            node.hit ||
            node.categoryHit ||
            node.skillHit
          )
        );
      });

      edges.forEach((edge) => {
        let visible =
          edge.kind === "core";

        if (edge.kind !== "core") {
          if (
            edge.a.type === "category" &&
            edge.b.type === "skill"
          ) {
            visible =
              skillVisible(edge.b);
          }

          if (
            edge.a.type === "skill" &&
            edge.b.type === "mini"
          ) {
            visible =
              miniVisible(edge.b);
          }
        }

        edge.el.classList.toggle(
          "hidden",
          !visible
        );

        edge.el.classList.toggle(
          "visible",
          visible &&
          edge.kind !== "core"
        );

        const attachedToFocusedCategory =
          Boolean(focusedCategory) &&
          edge.kind === "core" &&
          (
            edge.a.category ===
              focusedCategory ||
            edge.b.category ===
              focusedCategory
          );

        const branchActive =
          Boolean(activeNode) &&
          edge.kind !== "core" &&
          (
            edge.a === activeNode ||
            edge.b === activeNode ||
            (
              activeMini &&
              edge.a ===
                activeMini.parent &&
              edge.b === activeMini
            ) ||
            (
              activeSkill &&
              edge.a ===
                activeSkill.parent &&
              edge.b === activeSkill
            )
          );

        edge.el.classList.toggle(
          "active",
          branchActive
        );

        let dimmed =
          Boolean(query) &&
          !(
            edge.a.hit ||
            edge.a.categoryHit ||
            edge.a.skillHit ||
            edge.b.hit ||
            edge.b.categoryHit ||
            edge.b.skillHit
          );

        if (
          !query &&
          attachedToFocusedCategory
        ) {
          dimmed = true;
        }

        edge.el.classList.toggle(
          "dim",
          dimmed
        );
      });
    }

    function render(initial = false) {
      computeTargets();

      nodes.forEach((node) => {
        node.px = initial
          ? node.tx
          : lerp(
              node.px,
              node.tx,
              0.16
            );

        node.py = initial
          ? node.ty
          : lerp(
              node.py,
              node.ty,
              0.16
            );

        const distance =
          Math.hypot(
            pointer.x - node.px,
            pointer.y - node.py
          );

        const activeBranch =
          activeCategory &&
          node.category ===
            activeCategory;

        let scale =
          node.type === "category"
            ? 0.92
            : node.type === "skill"
              ? 0.86
              : 0.9;

        if (
          node.type === "category" &&
          activeCategory &&
          node.category !==
            activeCategory
        ) {
          scale -= 0.1;
        }

        if (
          node.type === "category" &&
          activeNode === node
        ) {
          scale += 0.26;
        }

        if (
          node.type === "skill" &&
          activeNode === node
        ) {
          scale += 0.2;
        }

        if (
          node.type === "mini" &&
          activeNode === node
        ) {
          scale += 1.02;
        }

        const visible =
          node.type === "category" ||
          skillVisible(node) ||
          miniVisible(node);

        if (visible) {
          const directRange =
            renderedRadius(node) *
            1.08;

          const maximumBoost =
            node.type === "category"
              ? 0.42
              : node.type === "skill"
                ? 0.68
                : 0.18;

          if (
            distance <
            directRange
          ) {
            const amount =
              1 -
              distance /
              directRange;

            scale +=
              amount *
              amount *
              maximumBoost;
          }
        }

        if (
          activeBranch &&
          node.type === "skill" &&
          node.category ===
            activeCategory
        ) {
          scale += 0.06;
        }

        if (
          activeBranch &&
          node.type === "mini" &&
          node.skill ===
            activeSkill?.skill
        ) {
          scale += 0.05;
        }

        node.displayScale = scale;

        node.el.style.left =
          `${node.px}px`;

        node.el.style.top =
          `${node.py}px`;

        node.el.style.setProperty(
          "--s",
          scale.toFixed(3)
        );

        if (
          activeNode === node &&
          node.type === "mini"
        ) {
          node.el.style.zIndex =
            "1000";
        } else {
          node.el.style.zIndex =
            String(
              Math.round(scale * 35) +
              (
                node.type === "category"
                  ? 40
                  : node.type === "skill"
                    ? 20
                    : 0
              )
            );
        }
      });

      edges.forEach((edge) => {
        edge.el.setAttribute(
          "x1",
          edge.a.px
        );

        edge.el.setAttribute(
          "y1",
          edge.a.py
        );

        edge.el.setAttribute(
          "x2",
          edge.b.px
        );

        edge.el.setAttribute(
          "y2",
          edge.b.py
        );
      });

      applyClasses();

      lens.style.left =
        `${pointer.x}px`;

      lens.style.top =
        `${pointer.y}px`;
    }

    function animationLoop() {
      determineFocus();
      render();

      requestAnimationFrame(
        animationLoop
      );
    }

    search.addEventListener(
      "input",
      () => {
        updateHitState();
        setPanel();
      }
    );

    stage.addEventListener(
      "pointermove",
      (event) => {
        const rectangle =
          stage.getBoundingClientRect();

        pointer.x =
          event.clientX -
          rectangle.left;

        pointer.y =
          event.clientY -
          rectangle.top;

        pointer.inside = true;
      }
    );

    stage.addEventListener(
      "pointerleave",
      () => {
        pointer.inside = false;
        pointer.x = -9999;
        pointer.y = -9999;
      }
    );

    let rebuildTimer = 0;

    function scheduleBuild() {
      window.clearTimeout(
        rebuildTimer
      );

      rebuildTimer =
        window.setTimeout(
          build,
          90
        );
    }

    window.addEventListener(
      "resize",
      scheduleBuild
    );

    if (
      "ResizeObserver" in window
    ) {
      const resizeObserver =
        new ResizeObserver(
          scheduleBuild
        );

      resizeObserver.observe(stage);
    }

    build();
    updateHitState();

    requestAnimationFrame(
      animationLoop
    );

    window.SKILL_MAP_READY = true;

    const fallback =
      document.getElementById(
        "skillMapFallback"
      );

    if (fallback) {
      fallback.remove();
    }
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initCapabilityMap,
      {
        once: true
      }
    );
  } else {
    initCapabilityMap();
  }
})();
