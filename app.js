import OBR, { buildImage, buildShape, buildText } from "https://esm.sh/@owlbear-rodeo/sdk@3";

const EXT_ID = "com.mencius.combat.status";
const META_KEY = `${EXT_ID}/badge`;
const STRESS_DATA_KEY = `${EXT_ID}/stress`;
const STRESS_PART_KEY = `${EXT_ID}/stressPart`;
const LAYOUT_STORAGE_KEY = `${EXT_ID}/layoutMode`;
const BASE_URL = new URL("./", window.location.href).href;

const GROUPS = [
  { id: "core",   title: "高频核心状态" },
  { id: "stress", title: "压力档位与高台" },
  { id: "body",   title: "生理与感官战损" },
  { id: "mind",   title: "精神与恐惧三阶" },
  { id: "form",   title: "特殊形态" },
];

const STATUS_LIST = [
  {
    "key": "bleeding",
    "label": "出血",
    "group": "core",
    "file": "bleeding.png"
  },
  {
    "key": "prone",
    "label": "俯卧",
    "group": "core",
    "file": "prone.png"
  },
  {
    "key": "dying",
    "label": "0HP濒死",
    "group": "core",
    "file": "dying.png"
  },
  {
    "key": "flatfooted",
    "label": "措手",
    "group": "core",
    "file": "flatfooted.png"
  },
  {
    "key": "stunned",
    "label": "晕眩",
    "group": "core",
    "file": "stunned.png"
  },
  {
    "key": "entangled",
    "label": "纠缠",
    "group": "core",
    "file": "entangled.png"
  },
  {
    "key": "grappled",
    "label": "擒抱",
    "group": "core",
    "file": "grappled.png"
  },
  {
    "key": "pinned",
    "label": "压制",
    "group": "core",
    "file": "pinned.png"
  },
  {
    "key": "helpless",
    "label": "无助",
    "group": "core",
    "file": "helpless.png"
  },
  {
    "key": "burning",
    "label": "着火",
    "group": "core",
    "file": "burning.png"
  },
  {
    "key": "stress50",
    "label": "50%临界",
    "group": "stress",
    "file": "stress50.png"
  },
  {
    "key": "overload100",
    "label": "100%过载",
    "group": "stress",
    "file": "overload100.png"
  },
  {
    "key": "elev_1f",
    "label": "高台",
    "group": "stress",
    "file": "elev_1f.png"
  },
  {
    "key": "elev_2f",
    "label": "+20双层",
    "group": "stress",
    "file": "elev_2f.png"
  },
  {
    "key": "blinded",
    "label": "目盲",
    "group": "body",
    "file": "blinded.png"
  },
  {
    "key": "dazzled",
    "label": "目眩",
    "group": "body",
    "file": "dazzled.png"
  },
  {
    "key": "deafened",
    "label": "耳聋",
    "group": "body",
    "file": "deafened.png"
  },
  {
    "key": "sickened",
    "label": "恶心",
    "group": "body",
    "file": "sickened.png"
  },
  {
    "key": "nauseated",
    "label": "反胃",
    "group": "body",
    "file": "nauseated.png"
  },
  {
    "key": "fatigued",
    "label": "疲乏",
    "group": "body",
    "file": "fatigued.png"
  },
  {
    "key": "exhausted",
    "label": "力竭",
    "group": "body",
    "file": "exhausted.png"
  },
  {
    "key": "paralyzed",
    "label": "瘫痪",
    "group": "body",
    "file": "paralyzed.png"
  },
  {
    "key": "broken",
    "label": "破损",
    "group": "body",
    "file": "broken.png"
  },
  {
    "key": "confused",
    "label": "困惑",
    "group": "mind",
    "file": "confused.png"
  },
  {
    "key": "fascinated",
    "label": "迷魂",
    "group": "mind",
    "file": "fascinated.png"
  },
  {
    "key": "cowering",
    "label": "畏缩",
    "group": "mind",
    "file": "cowering.png"
  },
  {
    "key": "shaken",
    "label": "战栗",
    "group": "mind",
    "file": "shaken.png"
  },
  {
    "key": "frightened",
    "label": "惊惧",
    "group": "mind",
    "file": "frightened.png"
  },
  {
    "key": "panicked",
    "label": "恐慌",
    "group": "mind",
    "file": "panicked.png"
  },
  {
    "key": "invisible",
    "label": "隐形",
    "group": "form",
    "file": "invisible.png"
  },
  {
    "key": "incorporeal",
    "label": "虚体",
    "group": "form",
    "file": "incorporeal.png"
  }
];
const STATUS_BY_KEY = Object.fromEntries(STATUS_LIST.map((s) => [s.key, s]));

const RIM_SLOTS = [
  [-0.37, -0.34],
  [-0.45, -0.02],
  [-0.37,  0.30],
  [ 0.37,  0.30],
  [ 0.45, -0.02],
  [-0.15,  0.49],
  [ 0.15,  0.49],
];

let layoutMode = localStorage.getItem(LAYOUT_STORAGE_KEY) || "rim";
let fixedTargetIds = [];
let currentTargetIds = [];
let activeKeyCounts = new Map();
let currentStress = { current: 0, max: 10, visible: false, pos: "under_name" };
let busy = false;

const elTargetInfo = document.getElementById("target-info");
const elContainer = document.getElementById("status-container");
const elSearch = document.getElementById("search-input");
const elBtnClear = document.getElementById("btn-clear");
const elBtnLayout = document.getElementById("btn-layout");

const elStressCur = document.getElementById("stress-cur");
const elStressMax = document.getElementById("stress-max");
const elStressStage = document.getElementById("stress-stage");
const elStressPreview = document.getElementById("stress-fill-preview");
const elBtnStressPos = document.getElementById("btn-stress-pos");
const elBtnStressVis = document.getElementById("btn-stress-vis");
const stepButtons = Array.from(document.querySelectorAll(".btn-step"));

function getStressPalette(cur, max) {
  const ratio = max > 0 ? cur / max : 0;
  if (ratio >= 1) {
    return { fill: "#d91432", border: "#ff4769", stage: "100%过载", cls: "over" };
  }
  if (ratio >= 0.5) {
    return { fill: "#d4820a", border: "#ffd23f", stage: "50%临界", cls: "warn" };
  }
  return { fill: "#169cc2", border: "#ffffff", stage: "正常", cls: "" };
}

function getSlotOffset(index, tokenSize) {
  if (layoutMode === "bottom") {
    const col = index % 4;
    const row = Math.floor(index / 4);
    return {
      x: (-0.42 + col * 0.28) * tokenSize,
      y: (0.42 + row * 0.28) * tokenSize,
    };
  }
  if (index < RIM_SLOTS.length) {
    return {
      x: RIM_SLOTS[index][0] * tokenSize,
      y: RIM_SLOTS[index][1] * tokenSize,
    };
  }
  const extra = index - RIM_SLOTS.length;
  return {
    x: (-0.42 + (extra % 4) * 0.28) * tokenSize,
    y: (0.76 + Math.floor(extra / 4) * 0.28) * tokenSize,
  };
}

function getTokenWorldSize(token, bounds, sceneDpi) {
  if (token.image?.width && token.grid?.dpi && token.scale) {
    const w = (token.image.width / token.grid.dpi) * sceneDpi * Math.abs(token.scale.x ?? 1);
    const h = (token.image.height / token.grid.dpi) * sceneDpi * Math.abs(token.scale.y ?? 1);
    if (w > 10 && h > 10) return Math.min(w, h);
  }
  return Math.min(bounds.width, bounds.height) || sceneDpi;
}

function normalizeStress(raw) {
  const cur = Math.max(0, Number.isFinite(Number(raw?.current)) ? Math.round(Number(raw.current)) : 0);
  const max = Math.max(1, Number.isFinite(Number(raw?.max)) ? Math.round(Number(raw.max)) : 10);
  const visible = Boolean(raw?.visible);
  const pos = raw?.pos === "tight" ? "tight" : "under_name";
  return { current: cur, max, visible, pos };
}

function renderStressUI(enabled) {
  elStressCur.disabled = !enabled;
  elStressMax.disabled = !enabled;
  elBtnStressPos.disabled = !enabled;
  elBtnStressVis.disabled = !enabled;
  for (const b of stepButtons) b.disabled = !enabled;

  const { current, max, visible, pos } = currentStress;
  if (document.activeElement !== elStressCur) elStressCur.value = String(current);
  if (document.activeElement !== elStressMax) elStressMax.value = String(max);

  const pal = getStressPalette(current, max);
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  elStressPreview.style.width = `${pct}%`;
  elStressPreview.style.background = pal.fill;

  elStressStage.textContent = pal.stage;
  elStressStage.className = `stress-stage ${pal.cls}`.trim();

  elBtnStressPos.textContent = pos === "tight" ? "贴底" : "名牌下";
  elBtnStressVis.textContent = visible ? "隐藏槽" : "显示槽";
  elBtnStressVis.classList.toggle("on", visible);
}

function renderGrid() {
  const q = elSearch.value.trim().toLowerCase();
  elContainer.innerHTML = "";

  for (const grp of GROUPS) {
    const items = STATUS_LIST.filter(
      (s) => s.group === grp.id && (!q || s.label.toLowerCase().includes(q) || s.key.includes(q))
    );
    if (items.length === 0) continue;

    const block = document.createElement("section");
    block.className = "group-block";

    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = grp.title;
    block.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid";

    for (const s of items) {
      const btn = document.createElement("button");
      btn.className = "status-btn";
      if ((activeKeyCounts.get(s.key) || 0) > 0) {
        btn.classList.add("active");
      }
      btn.dataset.key = s.key;
      btn.innerHTML = `<img src="./icons/${s.file}" alt="${s.label}" /><span>${s.label}</span>`;
      btn.addEventListener("click", () => toggleStatus(s.key));
      grid.appendChild(btn);
    }

    block.appendChild(grid);
    elContainer.appendChild(block);
  }
}

async function resolveTargetTokens() {
  let ids = fixedTargetIds;
  if (ids.length === 0) {
    const sel = await OBR.player.getSelection();
    ids = sel || [];
  }
  if (ids.length === 0) return [];
  const items = await OBR.scene.items.getItems(ids);
  return items.filter((it) => it.layer === "CHARACTER" && it.type === "IMAGE");
}

async function refreshState() {
  const tokens = await resolveTargetTokens();
  currentTargetIds = tokens.map((t) => t.id);

  if (tokens.length === 0) {
    elTargetInfo.textContent = "请在地图上选中或右键一个角色棋子";
    elTargetInfo.classList.add("empty");
    elBtnClear.disabled = true;
    activeKeyCounts = new Map();
    currentStress = { current: 0, max: 10, visible: false, pos: "under_name" };
    renderStressUI(false);
    renderGrid();
    return;
  }

  const names = tokens.map((t) => t.text?.plainText?.trim() || t.name || "未命名棋子");
  elTargetInfo.textContent =
    names.length === 1 ? `当前棋子：${names[0]}` : `已选 ${names.length} 个棋子：${names.slice(0, 3).join("、")}`;
  elTargetInfo.classList.remove("empty");
  elBtnClear.disabled = false;

  // 读取首个选中棋子的压力槽状态
  currentStress = normalizeStress(tokens[0].metadata?.[STRESS_DATA_KEY]);
  renderStressUI(true);

  const targetSet = new Set(currentTargetIds);
  const allBadges = await OBR.scene.items.getItems(
    (it) => it.layer === "ATTACHMENT" && targetSet.has(it.attachedTo) && Boolean(it.metadata?.[META_KEY])
  );

  const counts = new Map();
  for (const b of allBadges) {
    const k = b.metadata[META_KEY].key;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  activeKeyCounts = counts;
  renderGrid();
}

function buildStressBarItems(token, bounds, tokenSize, stress) {
  const { current, max, pos } = stress;
  const pal = getStressPalette(current, max);
  const ratio = Math.max(0, Math.min(1, current / Math.max(1, max)));

  const barW = tokenSize * 0.94;
  const barH = tokenSize * 0.19;
  const strokeW = Math.max(2, tokenSize * 0.018);
  const pad = Math.max(2, strokeW * 0.9);
  const innerW = Math.max(2, barW - pad * 2);
  const innerH = Math.max(2, barH - pad * 2);

  const barLeft = bounds.center.x - barW / 2;
  // "under_name" 自动避开枭熊默认底部名牌；"tight" 紧贴棋子底缘
  const barTop = bounds.center.y + tokenSize * (pos === "tight" ? 0.51 : 0.72);

  const attachCommon = (builder, partName) => {
    builder
      .layer("ATTACHMENT")
      .attachedTo(token.id)
      .locked(true)
      .disableHit(true)
      .name(`压力槽:${partName}`)
      .metadata({ [STRESS_PART_KEY]: partName });
    if (typeof builder.disableAttachmentBehavior === "function") {
      builder.disableAttachmentBehavior(["ROTATION"]);
    }
    return builder.build();
  };

  const items = [];

  // 1. 暗色像素风底槽 + 状态联动描边
  const bg = buildShape()
    .shapeType("RECTANGLE")
    .width(barW)
    .height(barH)
    .position({ x: barLeft, y: barTop })
    .fillColor("#171226")
    .fillOpacity(0.95)
    .strokeColor(pal.border)
    .strokeOpacity(1)
    .strokeWidth(strokeW);
  items.push(attachCommon(bg, "bg"));

  // 2. 动态彩色进度填充条
  if (ratio > 0) {
    const fill = buildShape()
      .shapeType("RECTANGLE")
      .width(Math.max(2, innerW * ratio))
      .height(innerH)
      .position({ x: barLeft + pad, y: barTop + pad })
      .fillColor(pal.fill)
      .fillOpacity(1)
      .strokeOpacity(0)
      .strokeWidth(0);
    items.push(attachCommon(fill, "fill"));
  }

  // 3. 50% 临界点亮黄中线刻度
  const tickW = Math.max(2, tokenSize * 0.016);
  const tick = buildShape()
    .shapeType("RECTANGLE")
    .width(tickW)
    .height(barH)
    .position({ x: bounds.center.x - tickW / 2, y: barTop })
    .fillColor("#fff275")
    .fillOpacity(0.92)
    .strokeOpacity(0)
    .strokeWidth(0);
  items.push(attachCommon(tick, "tick"));

  // 4. 居中清晰数值文字（如：压力 5/10）
  const tb = buildText()
    .textType("PLAIN")
    .plainText(`压力 ${current}/${max}`)
    .width(barW)
    .height(barH)
    .position({ x: barLeft, y: barTop })
    .fontSize(Math.max(10, Math.round(barH * 0.62)))
    .fontWeight(700)
    .fontFamily("monospace")
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
    .fillColor("#ffffff");
  if (typeof tb.padding === "function") tb.padding(0);
  if (typeof tb.lineHeight === "function") tb.lineHeight(1);
  items.push(attachCommon(tb, "label"));

  return items;
}

async function applyStressUpdate(patch) {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const sceneDpi = await OBR.scene.grid.getDpi();
    const targetIds = tokens.map((t) => t.id);
    const targetSet = new Set(targetIds);

    // 计算每个棋子的新压力状态
    const nextById = new Map();
    for (const token of tokens) {
      const prev = normalizeStress(token.metadata?.[STRESS_DATA_KEY]);
      const next = normalizeStress({
        current: patch.delta !== undefined ? prev.current + patch.delta : (patch.current ?? prev.current),
        max: patch.max ?? prev.max,
        visible: patch.visible !== undefined ? patch.visible : prev.visible,
        pos: patch.pos ?? prev.pos,
      });
      nextById.set(token.id, next);
    }

    // 1. 将最新数值写回棋子 metadata
    await OBR.scene.items.updateItems(targetIds, (drafts) => {
      for (const item of drafts) {
        const next = nextById.get(item.id);
        if (next) {
          item.metadata[STRESS_DATA_KEY] = next;
        }
      }
    });

    // 2. 删除旧的压力槽图形并按最新数值重绘
    const oldParts = await OBR.scene.items.getItems(
      (it) => it.layer === "ATTACHMENT" && targetSet.has(it.attachedTo) && Boolean(it.metadata?.[STRESS_PART_KEY])
    );
    if (oldParts.length > 0) {
      await OBR.scene.items.deleteItems(oldParts.map((p) => p.id));
    }

    const toAdd = [];
    for (const token of tokens) {
      const next = nextById.get(token.id);
      if (!next?.visible) continue;
      const bounds = await OBR.scene.items.getItemBounds([token.id]);
      const tokenSize = getTokenWorldSize(token, bounds, sceneDpi);
      toAdd.push(...buildStressBarItems(token, bounds, tokenSize, next));
    }
    if (toAdd.length > 0) {
      await OBR.scene.items.addItems(toAdd);
    }

    currentStress = nextById.get(tokens[0].id) || currentStress;
    renderStressUI(true);
  } finally {
    busy = false;
  }
}

async function reflowTokens(tokens, toggleKey = null, clearAll = false) {
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const sceneDpi = await OBR.scene.grid.getDpi();
    const targetIds = tokens.map((t) => t.id);
    const targetSet = new Set(targetIds);

    const existingBadges = await OBR.scene.items.getItems(
      (it) => it.layer === "ATTACHMENT" && targetSet.has(it.attachedTo) && Boolean(it.metadata?.[META_KEY])
    );

    const badgesByToken = new Map(targetIds.map((id) => [id, []]));
    for (const b of existingBadges) {
      badgesByToken.get(b.attachedTo)?.push(b);
    }

    const toDelete = [];
    const toAdd = [];
    const positionUpdates = new Map();

    for (const token of tokens) {
      const list = (badgesByToken.get(token.id) || []).sort(
        (a, b) => (a.metadata[META_KEY].order || 0) - (b.metadata[META_KEY].order || 0)
      );

      if (clearAll) {
        for (const b of list) toDelete.push(b.id);
        continue;
      }

      const bounds = await OBR.scene.items.getItemBounds([token.id]);
      const tokenSize = getTokenWorldSize(token, bounds, sceneDpi);
      const badgeScale = (tokenSize * 0.27) / sceneDpi;

      let kept = [...list];
      let newMeta = null;

      if (toggleKey) {
        const hitIdx = kept.findIndex((b) => b.metadata[META_KEY].key === toggleKey);
        if (hitIdx >= 0) {
          toDelete.push(kept[hitIdx].id);
          kept.splice(hitIdx, 1);
        } else {
          newMeta = STATUS_BY_KEY[toggleKey];
        }
      }

      kept.forEach((badge, idx) => {
        const off = getSlotOffset(idx, tokenSize);
        positionUpdates.set(badge.id, {
          position: { x: bounds.center.x + off.x, y: bounds.center.y + off.y },
          scale: { x: badgeScale, y: badgeScale },
        });
      });

      if (newMeta) {
        const idx = kept.length;
        const off = getSlotOffset(idx, tokenSize);
        const iconUrl = new URL(`./icons/${newMeta.file}`, BASE_URL).href;
        const builder = buildImage(
          { height: 256, width: 256, mime: "image/png", url: iconUrl },
          { dpi: 256, offset: { x: 128, y: 128 } }
        )
          .position({ x: bounds.center.x + off.x, y: bounds.center.y + off.y })
          .scale({ x: badgeScale, y: badgeScale })
          .layer("ATTACHMENT")
          .attachedTo(token.id)
          .locked(true)
          .disableHit(true)
          .name(`状态:${newMeta.label}`)
          .metadata({ [META_KEY]: { key: newMeta.key, order: Date.now() } });

        if (typeof builder.disableAttachmentBehavior === "function") {
          builder.disableAttachmentBehavior(["ROTATION"]);
        }
        toAdd.push(builder.build());
      }
    }

    if (toDelete.length > 0) {
      await OBR.scene.items.deleteItems(toDelete);
    }
    if (positionUpdates.size > 0) {
      await OBR.scene.items.updateItems(Array.from(positionUpdates.keys()), (drafts) => {
        for (const item of drafts) {
          const u = positionUpdates.get(item.id);
          if (u) {
            item.position = u.position;
            item.scale = u.scale;
          }
        }
      });
    }
    if (toAdd.length > 0) {
      await OBR.scene.items.addItems(toAdd);
    }

    await refreshState();
  } finally {
    busy = false;
  }
}

async function toggleStatus(key) {
  const tokens = await resolveTargetTokens();
  if (tokens.length === 0) return;
  await reflowTokens(tokens, key, false);
}

// 绑定压力槽事件（点加减号会自动显示压力槽）
for (const btn of stepButtons) {
  btn.addEventListener("click", () => {
    const delta = Number(btn.dataset.delta || 0);
    applyStressUpdate({ delta, visible: true });
  });
}

elStressCur.addEventListener("change", () => {
  applyStressUpdate({ current: Number(elStressCur.value || 0), visible: true });
});

elStressMax.addEventListener("change", () => {
  applyStressUpdate({ max: Math.max(1, Number(elStressMax.value || 10)), visible: true });
});

elBtnStressVis.addEventListener("click", () => {
  applyStressUpdate({ visible: !currentStress.visible });
});

elBtnStressPos.addEventListener("click", () => {
  const nextPos = currentStress.pos === "tight" ? "under_name" : "tight";
  applyStressUpdate({ pos: nextPos, visible: true });
});

elBtnClear.addEventListener("click", async () => {
  const tokens = await resolveTargetTokens();
  if (tokens.length === 0) return;
  await reflowTokens(tokens, null, true);
});

elBtnLayout.addEventListener("click", async () => {
  layoutMode = layoutMode === "rim" ? "bottom" : "rim";
  localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode);
  elBtnLayout.textContent = layoutMode === "rim" ? "绕边排队" : "底边横排";
  const tokens = await resolveTargetTokens();
  if (tokens.length > 0) {
    await reflowTokens(tokens, null, false);
  }
});

elSearch.addEventListener("input", renderGrid);

OBR.onReady(async () => {
  elBtnLayout.textContent = layoutMode === "rim" ? "绕边排队" : "底边横排";
  const params = new URLSearchParams(window.location.search);
  const rawTargets = params.get("targets");
  if (rawTargets) {
    fixedTargetIds = rawTargets.split(",").filter(Boolean);
  }

  await refreshState();

  if (fixedTargetIds.length === 0) {
    OBR.player.onChange(() => refreshState());
  }
  OBR.scene.items.onChange(() => {
    if (!busy) refreshState();
  });
});
