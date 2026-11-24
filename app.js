import OBR, { buildImage, buildShape } from "https://esm.sh/@owlbear-rodeo/sdk@3";

const EXT_ID = "com.mencius.combat.status";
const META_KEY = `${EXT_ID}/badge`;
const BARS_DATA_KEY = `${EXT_ID}/bars`;
const OLD_STRESS_DATA_KEY = `${EXT_ID}/stress`;
const BAR_PART_KEY = `${EXT_ID}/barPart`;
const OLD_STRESS_PART_KEY = `${EXT_ID}/stressPart`;
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

// 前 5 个精确镶嵌在环边（与你的截图完全一致），第 6+ 个自动溢到左右外翼，绝不遮挡下方 HP/压力条
const RIM_SLOTS = [
  [-0.37, -0.34], // 1: 左上 10:30
  [-0.45, -0.02], // 2: 正左 9:00
  [-0.37,  0.30], // 3: 左下 7:30
  [ 0.37,  0.30], // 4: 右下 4:30
  [ 0.45, -0.02], // 5: 正右 3:00
  [-0.64, -0.18], // 6: 左外上翼
  [-0.64,  0.14], // 7: 左外下翼
  [ 0.64,  0.14], // 8: 右外下翼
  [ 0.64, -0.18], // 9: 右外上翼
];

let layoutMode = localStorage.getItem(LAYOUT_STORAGE_KEY) || "rim";
let fixedTargetIds = [];
let currentTargetIds = [];
let activeKeyCounts = new Map();
let currentBars = {
  hp:     { current: 12, max: 12, visible: false },
  stress: { current: 0,  max: 10, visible: false },
  pos: "tight", // 默认 "tight"：直接坐落在原「比尔」名牌位；可选 "under_name"
};
let busy = false;

const elTargetInfo = document.getElementById("target-info");
const elContainer = document.getElementById("status-container");
const elSearch = document.getElementById("search-input");
const elBtnClear = document.getElementById("btn-clear");
const elBtnLayout = document.getElementById("btn-layout");

const elHpCur = document.getElementById("hp-cur");
const elHpMax = document.getElementById("hp-max");
const elStCur = document.getElementById("st-cur");
const elStMax = document.getElementById("st-max");
const elBtnHpVis = document.getElementById("btn-hp-vis");
const elBtnStVis = document.getElementById("btn-st-vis");
const elBtnBarPos = document.getElementById("btn-bar-pos");
const elStressStage = document.getElementById("stress-stage");
const stepButtons = Array.from(document.querySelectorAll(".btn-step"));

function normalizeBars(token) {
  const raw = token?.metadata?.[BARS_DATA_KEY];
  const old = token?.metadata?.[OLD_STRESS_DATA_KEY];
  const hpRaw = raw?.hp || {};
  const stRaw = raw?.stress || old || {};
  return {
    hp: {
      current: Math.max(0, Number.isFinite(Number(hpRaw.current)) ? Math.round(Number(hpRaw.current)) : 12),
      max: Math.max(1, Number.isFinite(Number(hpRaw.max)) ? Math.round(Number(hpRaw.max)) : 12),
      visible: Boolean(hpRaw.visible),
    },
    stress: {
      current: Math.max(0, Number.isFinite(Number(stRaw.current)) ? Math.round(Number(stRaw.current)) : 0),
      max: Math.max(1, Number.isFinite(Number(stRaw.max)) ? Math.round(Number(stRaw.max)) : 10),
      visible: Boolean(stRaw.visible),
    },
    pos: raw?.pos === "under_name" ? "under_name" : "tight",
  };
}

function getHpVisual(cur, max) {
  const ratio = max > 0 ? cur / max : 0;
  if (ratio <= 0.25) return { bgFile: "bar_hp_low.png",  fill: "#e61938" };
  if (ratio <= 0.50) return { bgFile: "bar_hp_mid.png",  fill: "#e09412" };
  return                    { bgFile: "bar_hp_high.png", fill: "#28c268" };
}

function getStressVisual(cur, max) {
  const ratio = max > 0 ? cur / max : 0;
  if (ratio >= 1.0) return { bgFile: "bar_st_over.png", fill: "#d91432", stage: "100%过载", cls: "over" };
  if (ratio >= 0.5) return { bgFile: "bar_st_warn.png", fill: "#d68c0c", stage: "50%临界",  cls: "warn" };
  return                   { bgFile: "bar_st_norm.png", fill: "#1ba3cc", stage: "正常",     cls: "" };
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
    y: (-0.66 - Math.floor(extra / 4) * 0.28) * tokenSize,
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

function renderBarsUI(enabled) {
  for (const el of [elHpCur, elHpMax, elStCur, elStMax, elBtnHpVis, elBtnStVis, elBtnBarPos, ...stepButtons]) {
    el.disabled = !enabled;
  }
  if (document.activeElement !== elHpCur) elHpCur.value = String(currentBars.hp.current);
  if (document.activeElement !== elHpMax) elHpMax.value = String(currentBars.hp.max);
  if (document.activeElement !== elStCur) elStCur.value = String(currentBars.stress.current);
  if (document.activeElement !== elStMax) elStMax.value = String(currentBars.stress.max);

  elBtnHpVis.textContent = currentBars.hp.visible ? "隐" : "显";
  elBtnHpVis.classList.toggle("on", currentBars.hp.visible);
  elBtnStVis.textContent = currentBars.stress.visible ? "隐" : "显";
  elBtnStVis.classList.toggle("on", currentBars.stress.visible);
  elBtnBarPos.textContent = currentBars.pos === "under_name" ? "名牌下" : "贴底(原名牌位)";

  const stVis = getStressVisual(currentBars.stress.current, currentBars.stress.max);
  elStressStage.textContent = stVis.stage;
  elStressStage.className = `stress-stage ${stVis.cls}`.trim();
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
      if ((activeKeyCounts.get(s.key) || 0) > 0) btn.classList.add("active");
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
    currentBars = normalizeBars(null);
    renderBarsUI(false);
    renderGrid();
    return;
  }

  const names = tokens.map((t) => t.text?.plainText?.trim() || t.name || "未命名棋子");
  elTargetInfo.textContent =
    names.length === 1 ? `当前棋子：${names[0]}` : `已选 ${names.length} 个棋子：${names.slice(0, 3).join("、")}`;
  elTargetInfo.classList.remove("empty");
  elBtnClear.disabled = false;

  currentBars = normalizeBars(tokens[0]);
  renderBarsUI(true);

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

function buildPixelBarItems(kind, token, bounds, tokenSize, barState, slotIndex, posMode, sceneDpi) {
  // 与 128x128 像素棋子保持严格 1:1 像素颗粒密度！
  const px = tokenSize / 128;
  const barW = 110 * px;
  const barH = 20 * px;

  const barLeft = bounds.center.x - barW / 2;
  // tight: 直接落在原「比尔」名牌位 (+0.425*S)；under_name: 留出名牌空位 (+0.68*S)
  const baseTop = bounds.center.y + tokenSize * (posMode === "under_name" ? 0.68 : 0.425);
  const barTop = baseTop + slotIndex * (barH + 0.5 * px);

  const { current, max } = barState;
  const ratio = Math.max(0, Math.min(1, current / Math.max(1, max)));
  const vis = kind === "hp" ? getHpVisual(current, max) : getStressVisual(current, max);

  const attachCommon = (builder, partName) => {
    builder
      .layer("ATTACHMENT")
      .attachedTo(token.id)
      .locked(true)
      .disableHit(true)
      .name(`${kind === "hp" ? "HP条" : "压力槽"}:${partName}`)
      .metadata({ [BAR_PART_KEY]: `${kind}_${partName}` });
    if (typeof builder.disableAttachmentBehavior === "function") {
      builder.disableAttachmentBehavior(["ROTATION"]);
    }
    return builder.build();
  };

  const items = [];

  // 1. 像素底框 PNG（440x80 = 110x20 logical px * 4，左上角对齐 barLeft, barTop）
  const bgUrl = new URL(`./bars/${vis.bgFile}`, BASE_URL).href;
  const bgScale = barW / sceneDpi;
  const bgImg = buildImage(
    { width: 440, height: 80, mime: "image/png", url: bgUrl },
    { dpi: 440, offset: { x: 0, y: 0 } }
  )
    .position({ x: barLeft, y: barTop })
    .scale({ x: bgScale, y: bgScale });
  items.push(attachCommon(bgImg, "bg"));

  // 2. 动态彩色像素进度条 + 顶部像素高光条（精确落在右侧槽 x=32..104, y=3..14 内）
  if (ratio > 0) {
    const fillW = Math.max(2 * px, Math.round(73 * ratio) * px);
    const fillShape = buildShape()
      .shapeType("RECTANGLE")
      .width(fillW)
      .height(12 * px)
      .position({ x: barLeft + 32 * px, y: barTop + 3 * px })
      .fillColor(vis.fill)
      .fillOpacity(1)
      .strokeOpacity(0)
      .strokeWidth(0);
    items.push(attachCommon(fillShape, "fill"));

    const hiShape = buildShape()
      .shapeType("RECTANGLE")
      .width(fillW)
      .height(2 * px)
      .position({ x: barLeft + 32 * px, y: barTop + 3 * px })
      .fillColor("#ffffff")
      .fillOpacity(0.28)
      .strokeOpacity(0)
      .strokeWidth(0);
    items.push(attachCommon(hiShape, "hi"));
  }

  // 3. 压力槽专属 50% 临界点亮黄像素中线
  if (kind === "stress") {
    const tick = buildShape()
      .shapeType("RECTANGLE")
      .width(2 * px)
      .height(14 * px)
      .position({ x: barLeft + 68 * px, y: barTop + 2 * px })
      .fillColor("#fff275")
      .fillOpacity(0.95)
      .strokeOpacity(0)
      .strokeWidth(0);
    items.push(attachCommon(tick, "tick"));
  }

  // 4. 像素数字贴图（PressStart2P 1-bit，与 7/3、REC 完全一致）
  const chars = `${current}/${max}`.split("");
  const digitStep = chars.length >= 6 ? 8 * px : 9 * px;
  const totalW = (chars.length - 1) * digitStep;
  const wellCx = barLeft + 68.5 * px;
  const wellCy = barTop + 9.0 * px;
  const digitScale = (12 * px) / sceneDpi;

  chars.forEach((ch, idx) => {
    const fname = ch === "/" ? "d_slash.png" : `d_${ch}.png`;
    const dUrl = new URL(`./bars/${fname}`, BASE_URL).href;
    const dImg = buildImage(
      { width: 48, height: 48, mime: "image/png", url: dUrl },
      { dpi: 48, offset: { x: 24, y: 24 } }
    )
      .position({ x: wellCx - totalW / 2 + idx * digitStep, y: wellCy })
      .scale({ x: digitScale, y: digitScale });
    items.push(attachCommon(dImg, `d${idx}`));
  });

  return items;
}

async function applyBarsUpdate(mutator) {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const sceneDpi = await OBR.scene.grid.getDpi();
    const targetIds = tokens.map((t) => t.id);
    const targetSet = new Set(targetIds);

    const nextById = new Map();
    for (const token of tokens) {
      const prev = normalizeBars(token);
      const next = mutator(prev);
      next.hp.current = Math.max(0, Math.round(next.hp.current));
      next.hp.max = Math.max(1, Math.round(next.hp.max));
      next.stress.current = Math.max(0, Math.round(next.stress.current));
      next.stress.max = Math.max(1, Math.round(next.stress.max));
      nextById.set(token.id, next);
    }

    await OBR.scene.items.updateItems(targetIds, (drafts) => {
      for (const item of drafts) {
        const next = nextById.get(item.id);
        if (next) {
          item.metadata[BARS_DATA_KEY] = next;
          delete item.metadata[OLD_STRESS_DATA_KEY];
        }
      }
    });

    // 同步清理新旧版本的血条/压力条图元
    const oldParts = await OBR.scene.items.getItems(
      (it) =>
        it.layer === "ATTACHMENT" &&
        targetSet.has(it.attachedTo) &&
        Boolean(it.metadata?.[BAR_PART_KEY] || it.metadata?.[OLD_STRESS_PART_KEY])
    );
    if (oldParts.length > 0) {
      await OBR.scene.items.deleteItems(oldParts.map((p) => p.id));
    }

    const toAdd = [];
    for (const token of tokens) {
      const next = nextById.get(token.id);
      if (!next) continue;
      if (!next.hp.visible && !next.stress.visible) continue;
      const bounds = await OBR.scene.items.getItemBounds([token.id]);
      const tokenSize = getTokenWorldSize(token, bounds, sceneDpi);
      let slot = 0;
      if (next.hp.visible) {
        toAdd.push(...buildPixelBarItems("hp", token, bounds, tokenSize, next.hp, slot++, next.pos, sceneDpi));
      }
      if (next.stress.visible) {
        toAdd.push(...buildPixelBarItems("stress", token, bounds, tokenSize, next.stress, slot++, next.pos, sceneDpi));
      }
    }
    if (toAdd.length > 0) {
      await OBR.scene.items.addItems(toAdd);
    }

    currentBars = nextById.get(tokens[0].id) || currentBars;
    renderBarsUI(true);
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

    if (toDelete.length > 0) await OBR.scene.items.deleteItems(toDelete);
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
    if (toAdd.length > 0) await OBR.scene.items.addItems(toAdd);

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

// 绑定 HP & 压力加减、输入与显隐
for (const btn of stepButtons) {
  btn.addEventListener("click", () => {
    const bar = btn.dataset.bar;
    const delta = Number(btn.dataset.delta || 0);
    applyBarsUpdate((prev) => {
      prev[bar].current += delta;
      prev[bar].visible = true;
      return prev;
    });
  });
}

elHpCur.addEventListener("change", () => {
  const v = Number(elHpCur.value || 0);
  applyBarsUpdate((prev) => { prev.hp.current = v; prev.hp.visible = true; return prev; });
});
elHpMax.addEventListener("change", () => {
  const v = Math.max(1, Number(elHpMax.value || 12));
  applyBarsUpdate((prev) => { prev.hp.max = v; prev.hp.visible = true; return prev; });
});
elStCur.addEventListener("change", () => {
  const v = Number(elStCur.value || 0);
  applyBarsUpdate((prev) => { prev.stress.current = v; prev.stress.visible = true; return prev; });
});
elStMax.addEventListener("change", () => {
  const v = Math.max(1, Number(elStMax.value || 10));
  applyBarsUpdate((prev) => { prev.stress.max = v; prev.stress.visible = true; return prev; });
});

elBtnHpVis.addEventListener("click", () => {
  applyBarsUpdate((prev) => { prev.hp.visible = !prev.hp.visible; return prev; });
});
elBtnStVis.addEventListener("click", () => {
  applyBarsUpdate((prev) => { prev.stress.visible = !prev.stress.visible; return prev; });
});
elBtnBarPos.addEventListener("click", () => {
  applyBarsUpdate((prev) => {
    prev.pos = prev.pos === "tight" ? "under_name" : "tight";
    return prev;
  });
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
  if (tokens.length > 0) await reflowTokens(tokens, null, false);
});

elSearch.addEventListener("input", renderGrid);

OBR.onReady(async () => {
  elBtnLayout.textContent = layoutMode === "rim" ? "绕边排队" : "底边横排";
  const params = new URLSearchParams(window.location.search);
  const rawTargets = params.get("targets");
  if (rawTargets) fixedTargetIds = rawTargets.split(",").filter(Boolean);

  await refreshState();

  if (fixedTargetIds.length === 0) {
    OBR.player.onChange(() => refreshState());
  }
  OBR.scene.items.onChange(() => {
    if (!busy) refreshState();
  });
});
