import OBR, { buildImage, buildShape } from "https://esm.sh/@owlbear-rodeo/sdk@3";

const EXT_ID = "com.mencius.combat.status";
const ASSET_VER = "230";
const META_KEY = `${EXT_ID}/badge`;
const BARS_DATA_KEY = `${EXT_ID}/bars`;
const TRACKER_DATA_KEY = `${EXT_ID}/tracker`;
const OLD_STRESS_DATA_KEY = `${EXT_ID}/stress`;
const BAR_PART_KEY = `${EXT_ID}/barPart`;
const OLD_STRESS_PART_KEY = `${EXT_ID}/stressPart`;
const LAYOUT_STORAGE_KEY = `${EXT_ID}/layoutMode`;
const AUTOLINK_STORAGE_KEY = `${EXT_ID}/autoLink`;
const BASE_URL = new URL("./", window.location.href).href;

const GROUPS = [
  { id: "madness", title: "疯狂分支（01-100 · 全 15 种怪核异化标）" },
  { id: "feats",   title: "专长状态与达摩克里斯" },
  { id: "tactics", title: "团队战术与计数标" },
  { id: "core",    title: "高频核心状态" },
  { id: "stress",  title: "压力档位与高台" },
  { id: "body",    title: "生理与感官战损" },
  { id: "mind",    title: "精神与恐惧三阶" },
  { id: "form",    title: "特殊形态" },
];

const MADNESS_LIST = [
  {
    "key": "mad_flee",
    "label": "惊逃",
    "group": "madness",
    "file": "mad_flee.png",
    "calmFile": "mad_flee_calm.png",
    "min": 1,
    "max": 7,
    "tip": "冲向掩体/暗影潜行藏匿；无处可藏则战栗+措手不及"
  },
  {
    "key": "mad_illusion",
    "label": "幻象",
    "group": "madness",
    "file": "mad_illusion.png",
    "calmFile": "mad_illusion_calm.png",
    "min": 8,
    "max": 14,
    "tip": "优先朝幻影移动/攻击/防备；标准动作INT/POW看穿"
  },
  {
    "key": "mad_obsession",
    "label": "执念",
    "group": "madness",
    "file": "mad_obsession.png",
    "calmFile": "mad_obsession_calm.png",
    "min": 15,
    "max": 21,
    "tip": "每轮优先靠近执念目标并保持5尺邻接；无法靠近则战栗"
  },
  {
    "key": "mad_paranoia",
    "label": "猜疑",
    "group": "madness",
    "file": "mad_paranoia.png",
    "calmFile": "mad_paranoia_calm.png",
    "min": 22,
    "max": 28,
    "tip": "回合末距所有同伴≥2格，不享/供邻接协作；无法远离则力竭+措手"
  },
  {
    "key": "mad_outburst",
    "label": "失控",
    "group": "madness",
    "file": "mad_outburst.png",
    "calmFile": "mad_outburst_calm.png",
    "min": 29,
    "max": 35,
    "tip": "最高声源仇恨，炸5尺潜行/聆听，拒援助/共享，精神/现实+1惩"
  },
  {
    "key": "mad_berserk",
    "label": "爆了!",
    "group": "madness",
    "file": "mad_berserk.png",
    "calmFile": "mad_berserk_calm.png",
    "min": 36,
    "max": 42,
    "tip": "优先全力猛攻最近威胁/道具(多耗1弹/耐久)；失自行闪避与掩护"
  },
  {
    "key": "mad_compulsion",
    "label": "强迫",
    "group": "madness",
    "file": "mad_compulsion.png",
    "calmFile": "mad_compulsion_calm.png",
    "min": 43,
    "max": 49,
    "tip": "每轮须用移动动作做强迫仪式；违抗则回合末受1d3伤+战栗1轮"
  },
  {
    "key": "mad_light",
    "label": "趋光",
    "group": "madness",
    "file": "mad_light.png",
    "calmFile": "mad_light_calm.png",
    "min": 50,
    "max": 56,
    "tip": "回合末须处常光/强光或持光源，拒入暗潜行；无法到达则战栗+措手"
  },
  {
    "key": "mad_dissociation",
    "label": "解离",
    "group": "madness",
    "file": "mad_dissociation.png",
    "calmFile": "mad_dissociation_calm.png",
    "min": 57,
    "max": 63,
    "tip": "拒语言协同/援助/共享，禁用撤离路线与主动翻滚，无法对自己急救"
  },
  {
    "key": "mad_hoarding",
    "label": "囤积",
    "group": "madness",
    "file": "mad_hoarding.png",
    "calmFile": "mad_hoarding_calm.png",
    "min": 64,
    "max": 70,
    "tip": "优先拾取3格内武器或缴械，拒绝丢弃/碎裂投掷；移动强制半速标尺"
  },
  {
    "key": "mad_altruism",
    "label": "利他",
    "group": "madness",
    "file": "mad_altruism.png",
    "calmFile": "mad_altruism_calm.png",
    "min": 71,
    "max": 76,
    "tip": "优先奔向出血/重伤/濒死/无助/红圈同伴急救掩护，拒入掩体且不攻无关敌"
  },
  {
    "key": "mad_mimicry",
    "label": "模仿",
    "group": "madness",
    "file": "mad_mimicry.png",
    "calmFile": "mad_mimicry_calm.png",
    "min": 77,
    "max": 82,
    "tip": "须复刻上一行动者动作结构(无论敌我)；无法复刻则标准动作尖叫+措手"
  },
  {
    "key": "mad_hyper",
    "label": "亢奋",
    "group": "madness",
    "file": "mad_hyper.png",
    "calmFile": "mad_hyper_calm.png",
    "min": 83,
    "max": 88,
    "tip": "前2轮移动后附半速+免首借机但全检定+1惩；第3轮起永久力竭且禁额外反应"
  },
  {
    "key": "mad_startle",
    "label": "应激",
    "group": "madness",
    "file": "mad_startle.png",
    "calmFile": "mad_startle_calm.png",
    "min": 89,
    "max": 94,
    "tip": "回合末若2格内有生物/门/易碎道具须失控前冲推撞，并自受1点反震伤"
  },
  {
    "key": "mad_sensory",
    "label": "过载",
    "group": "madness",
    "file": "mad_sensory.png",
    "calmFile": "mad_sensory_calm.png",
    "min": 95,
    "max": 100,
    "tip": "回合初须过POW否则本轮战栗+1d6压力；即便成功亦无法主动潜行"
  }
];
const MADNESS_BY_KEY = Object.fromEntries(MADNESS_LIST.map((m) => [m.key, m]));
const MADNESS_KEYS = MADNESS_LIST.map((m) => m.key);

const PASSIVE_FLAGS = [
  { id: "hasRedTear",  label: "有红泪(≤1/3自动)" },
  { id: "hasRedBlade", label: "有红刀(受伤叠+1~3)" },
];

const ONCE_FLAGS = [
  { id: "firstAid",   label: "急救拉起" },
  { id: "allyCalm",   label: "同伴减压" },
  { id: "deepBreath", label: "深呼吸" },
  { id: "luckItem",   label: "幸运找物" },
  { id: "gigachad",   label: "GigaChad" },
  { id: "sixthSense", label: "第六感" },
  { id: "humor",      label: "幽你一默" },
  { id: "allIn",      label: "孤注一掷" },
  { id: "goParis",    label: "去巴黎" },
  { id: "selfHarm",   label: "自残" },
];

const MUTEX_GROUPS = [
  ["damocles_safe", "damocles_armed", "damocles_fallen"],
  ["red_blade_1", "red_blade_2", "red_blade_3"],
  ["cnt_1", "cnt_2", "cnt_3"],
  ["stress50", "overload100", ...MADNESS_KEYS],
];

const STATUS_LIST = [
  {
    "key": "mad_flee",
    "label": "惊逃",
    "group": "madness",
    "file": "mad_flee.png",
    "calmFile": "mad_flee_calm.png",
    "tip": "冲向掩体/暗影潜行藏匿；无处可藏则战栗+措手不及"
  },
  {
    "key": "mad_illusion",
    "label": "幻象",
    "group": "madness",
    "file": "mad_illusion.png",
    "calmFile": "mad_illusion_calm.png",
    "tip": "优先朝幻影移动/攻击/防备；标准动作INT/POW看穿"
  },
  {
    "key": "mad_obsession",
    "label": "执念",
    "group": "madness",
    "file": "mad_obsession.png",
    "calmFile": "mad_obsession_calm.png",
    "tip": "每轮优先靠近执念目标并保持5尺邻接；无法靠近则战栗"
  },
  {
    "key": "mad_paranoia",
    "label": "猜疑",
    "group": "madness",
    "file": "mad_paranoia.png",
    "calmFile": "mad_paranoia_calm.png",
    "tip": "回合末距所有同伴≥2格，不享/供邻接协作；无法远离则力竭+措手"
  },
  {
    "key": "mad_outburst",
    "label": "失控",
    "group": "madness",
    "file": "mad_outburst.png",
    "calmFile": "mad_outburst_calm.png",
    "tip": "最高声源仇恨，炸5尺潜行/聆听，拒援助/共享，精神/现实+1惩"
  },
  {
    "key": "mad_berserk",
    "label": "爆了!",
    "group": "madness",
    "file": "mad_berserk.png",
    "calmFile": "mad_berserk_calm.png",
    "tip": "优先全力猛攻最近威胁/道具(多耗1弹/耐久)；失自行闪避与掩护"
  },
  {
    "key": "mad_compulsion",
    "label": "强迫",
    "group": "madness",
    "file": "mad_compulsion.png",
    "calmFile": "mad_compulsion_calm.png",
    "tip": "每轮须用移动动作做强迫仪式；违抗则回合末受1d3伤+战栗1轮"
  },
  {
    "key": "mad_light",
    "label": "趋光",
    "group": "madness",
    "file": "mad_light.png",
    "calmFile": "mad_light_calm.png",
    "tip": "回合末须处常光/强光或持光源，拒入暗潜行；无法到达则战栗+措手"
  },
  {
    "key": "mad_dissociation",
    "label": "解离",
    "group": "madness",
    "file": "mad_dissociation.png",
    "calmFile": "mad_dissociation_calm.png",
    "tip": "拒语言协同/援助/共享，禁用撤离路线与主动翻滚，无法对自己急救"
  },
  {
    "key": "mad_hoarding",
    "label": "囤积",
    "group": "madness",
    "file": "mad_hoarding.png",
    "calmFile": "mad_hoarding_calm.png",
    "tip": "优先拾取3格内武器或缴械，拒绝丢弃/碎裂投掷；移动强制半速标尺"
  },
  {
    "key": "mad_altruism",
    "label": "利他",
    "group": "madness",
    "file": "mad_altruism.png",
    "calmFile": "mad_altruism_calm.png",
    "tip": "优先奔向出血/重伤/濒死/无助/红圈同伴急救掩护，拒入掩体且不攻无关敌"
  },
  {
    "key": "mad_mimicry",
    "label": "模仿",
    "group": "madness",
    "file": "mad_mimicry.png",
    "calmFile": "mad_mimicry_calm.png",
    "tip": "须复刻上一行动者动作结构(无论敌我)；无法复刻则标准动作尖叫+措手"
  },
  {
    "key": "mad_hyper",
    "label": "亢奋",
    "group": "madness",
    "file": "mad_hyper.png",
    "calmFile": "mad_hyper_calm.png",
    "tip": "前2轮移动后附半速+免首借机但全检定+1惩；第3轮起永久力竭且禁额外反应"
  },
  {
    "key": "mad_startle",
    "label": "应激",
    "group": "madness",
    "file": "mad_startle.png",
    "calmFile": "mad_startle_calm.png",
    "tip": "回合末若2格内有生物/门/易碎道具须失控前冲推撞，并自受1点反震伤"
  },
  {
    "key": "mad_sensory",
    "label": "过载",
    "group": "madness",
    "file": "mad_sensory.png",
    "calmFile": "mad_sensory_calm.png",
    "tip": "回合初须过POW否则本轮战栗+1d6压力；即便成功亦无法主动潜行"
  },
  {
    "key": "damocles_safe",
    "label": "达摩悬顶",
    "group": "feats",
    "file": "damocles_safe.png"
  },
  {
    "key": "damocles_armed",
    "label": "达摩判死",
    "group": "feats",
    "file": "damocles_armed.png"
  },
  {
    "key": "damocles_fallen",
    "label": "达摩坠落",
    "group": "feats",
    "file": "damocles_fallen.png"
  },
  {
    "key": "red_tear",
    "label": "红泪",
    "group": "feats",
    "file": "red_tear.png"
  },
  {
    "key": "red_blade_1",
    "label": "红刀+1",
    "group": "feats",
    "file": "red_blade_1.png"
  },
  {
    "key": "red_blade_2",
    "label": "红刀+2",
    "group": "feats",
    "file": "red_blade_2.png"
  },
  {
    "key": "red_blade_3",
    "label": "红刀+3",
    "group": "feats",
    "file": "red_blade_3.png"
  },
  {
    "key": "fixed_madness",
    "label": "固化疯狂",
    "group": "feats",
    "file": "fixed_madness.png"
  },
  {
    "key": "retaliate",
    "label": "Retaliate!",
    "group": "feats",
    "file": "retaliate.png"
  },
  {
    "key": "go_paris",
    "label": "去巴黎",
    "group": "feats",
    "file": "go_paris.png"
  },
  {
    "key": "preempt",
    "label": "克敌机先",
    "group": "feats",
    "file": "preempt.png"
  },
  {
    "key": "barb",
    "label": "倒刺",
    "group": "feats",
    "file": "barb.png"
  },
  {
    "key": "hold_breath",
    "label": "屏息静默",
    "group": "feats",
    "file": "hold_breath.png"
  },
  {
    "key": "play_dead",
    "label": "装死",
    "group": "feats",
    "file": "play_dead.png"
  },
  {
    "key": "suppress_fire",
    "label": "火力压制",
    "group": "tactics",
    "file": "suppress_fire.png"
  },
  {
    "key": "guard",
    "label": "贴身掩护",
    "group": "tactics",
    "file": "guard.png"
  },
  {
    "key": "sentry",
    "label": "哨兵共享",
    "group": "tactics",
    "file": "sentry.png"
  },
  {
    "key": "share_feat",
    "label": "共享专长",
    "group": "tactics",
    "file": "share_feat.png"
  },
  {
    "key": "lit",
    "label": "强光照射",
    "group": "tactics",
    "file": "lit.png"
  },
  {
    "key": "weakspot",
    "label": "破绽/失衡",
    "group": "tactics",
    "file": "weakspot.png"
  },
  {
    "key": "react_used",
    "label": "反应已用",
    "group": "tactics",
    "file": "react_used.png"
  },
  {
    "key": "cnt_1",
    "label": "计数 1",
    "group": "tactics",
    "file": "cnt_1.png"
  },
  {
    "key": "cnt_2",
    "label": "计数 2",
    "group": "tactics",
    "file": "cnt_2.png"
  },
  {
    "key": "cnt_3",
    "label": "计数 3",
    "group": "tactics",
    "file": "cnt_3.png"
  },
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
  [-0.64, -0.18],
  [-0.64,  0.14],
  [ 0.64,  0.14],
  [ 0.64, -0.18],
];

let layoutMode = localStorage.getItem(LAYOUT_STORAGE_KEY) || "rim";
let autoLink = localStorage.getItem(AUTOLINK_STORAGE_KEY) !== "false";
let fixedTargetIds = [];
let currentTargetIds = [];
let activeKeyCounts = new Map();
let currentActiveMadKey = null;
let currentMadCalmed = false;
let currentBars = {
  hp:     { current: 12, max: 12, visible: false },
  stress: { current: 0,  max: 10, visible: false },
  pos: "tight",
};
let currentTracker = { passives: {}, used: {}, fixedMad: "" };
let lastDamoRollText = "";
let lastMadRollText = "";
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
const elBtnAutoLink = document.getElementById("btn-auto-link");
const elHpStage = document.getElementById("hp-stage");
const elStressStage = document.getElementById("stress-stage");
const elHpMeterFill = document.getElementById("hp-meter-fill");
const elStMeterFill = document.getElementById("st-meter-fill");

const elDamoAlert = document.getElementById("damo-alert");
const elDamoMsg = document.getElementById("damo-msg");
const elBtnDamoRoll = document.getElementById("btn-damo-roll");

const elMadAlert = document.getElementById("mad-alert");
const elMadMsg = document.getElementById("mad-msg");
const elBtnMadRoll = document.getElementById("btn-mad-roll");
const elBtnMadCalm = document.getElementById("btn-mad-calm");

const elPassiveChips = document.getElementById("passive-chips");
const elOnceChips = document.getElementById("once-chips");
const elFixedMadSelect = document.getElementById("fixed-mad-select");
const elTrackerSummary = document.getElementById("tracker-summary");
const stepButtons = Array.from(document.querySelectorAll(".btn-step"));

for (const m of MADNESS_LIST) {
  const opt = document.createElement("option");
  opt.value = m.key;
  opt.textContent = `${m.label}（${String(m.min).padStart(2, "0")}-${String(m.max).padStart(2, "0")}）`;
  elFixedMadSelect.appendChild(opt);
}

function isDamoclesKey(key) {
  return key === "damocles_safe" || key === "damocles_armed" || key === "damocles_fallen";
}

function isMadnessKey(key) {
  return Boolean(MADNESS_BY_KEY[key]);
}

function getMutexPeers(key) {
  for (const grp of MUTEX_GROUPS) {
    if (grp.includes(key)) return grp.filter((k) => k !== key);
  }
  return [];
}

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

function normalizeTracker(token) {
  const raw = token?.metadata?.[TRACKER_DATA_KEY] || {};
  return {
    passives: { ...(raw.passives || {}) },
    used: { ...(raw.used || {}) },
    fixedMad: typeof raw.fixedMad === "string" ? raw.fixedMad : "",
  };
}

function getHpVisual(cur, max) {
  const ratio = max > 0 ? cur / max : 0;
  if (cur <= 0) {
    return { bgFile: "bar_hp_low.png", fill: "#e61938", stage: "0HP濒死", cls: "hp-dead" };
  }
  if (cur <= Math.floor(max / 3)) {
    return { bgFile: "bar_hp_low.png", fill: "#e61938", stage: "≤1/3红泪线", cls: "hp-low" };
  }
  if (ratio <= 0.5) {
    return { bgFile: "bar_hp_mid.png", fill: "#e09412", stage: "半血以下", cls: "hp-mid" };
  }
  return { bgFile: "bar_hp_high.png", fill: "#28c268", stage: "HP正常", cls: "hp-ok" };
}

function getStressVisual(cur, max) {
  const ratio = max > 0 ? cur / max : 0;
  if (ratio >= 1.0) return { bgFile: "bar_st_over.png", fill: "#d91432", stage: "100%过载", cls: "st-over" };
  if (ratio >= 0.5) return { bgFile: "bar_st_warn.png", fill: "#d68c0c", stage: "50%临界",  cls: "st-warn" };
  return                   { bgFile: "bar_st_norm.png", fill: "#1ba3cc", stage: "压力正常", cls: "st-ok" };
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

function renderTrackerUI(enabled) {
  elPassiveChips.innerHTML = "";
  for (const pf of PASSIVE_FLAGS) {
    const btn = document.createElement("button");
    btn.className = "chip passive" + (currentTracker.passives[pf.id] ? " on" : "");
    btn.textContent = pf.label;
    btn.disabled = !enabled;
    btn.addEventListener("click", () => toggleTrackerFlag("passives", pf.id));
    elPassiveChips.appendChild(btn);
  }

  elOnceChips.innerHTML = "";
  let usedCount = 0;
  for (const uf of ONCE_FLAGS) {
    const isOn = Boolean(currentTracker.used[uf.id]);
    if (isOn) usedCount++;
    const btn = document.createElement("button");
    btn.className = "chip used" + (isOn ? " on" : "");
    btn.textContent = uf.label;
    btn.disabled = !enabled;
    btn.addEventListener("click", () => toggleTrackerFlag("used", uf.id));
    elOnceChips.appendChild(btn);
  }

  elFixedMadSelect.disabled = !enabled;
  elFixedMadSelect.value = currentTracker.fixedMad || "";

  const pTags = PASSIVE_FLAGS.filter((p) => currentTracker.passives[p.id]).map((p) => p.label.slice(0, 3));
  const parts = [];
  if (pTags.length > 0) parts.push(pTags.join("/"));
  if (currentTracker.fixedMad && MADNESS_BY_KEY[currentTracker.fixedMad]) {
    parts.push(`固化:${MADNESS_BY_KEY[currentTracker.fixedMad].label}`);
  }
  if (usedCount > 0) parts.push(`已用 ${usedCount}`);
  elTrackerSummary.textContent = parts.join(" · ");
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
  elBtnBarPos.textContent = currentBars.pos === "under_name" ? "名牌下" : "贴底";
  elBtnAutoLink.textContent = autoLink ? "联动:开" : "联动:关";
  elBtnAutoLink.classList.toggle("on", autoLink);

  const hpVis = getHpVisual(currentBars.hp.current, currentBars.hp.max);
  elHpStage.textContent = hpVis.stage;
  elHpStage.className = `stage-pill ${hpVis.cls}`;
  const hpPct = Math.max(0, Math.min(100, (currentBars.hp.current / Math.max(1, currentBars.hp.max)) * 100));
  elHpMeterFill.style.width = `${hpPct}%`;
  elHpMeterFill.style.background = hpVis.fill;

  const stVis = getStressVisual(currentBars.stress.current, currentBars.stress.max);
  elStressStage.textContent = stVis.stage;
  elStressStage.className = `stage-pill ${stVis.cls}`;
  const stPct = Math.max(0, Math.min(100, (currentBars.stress.current / Math.max(1, currentBars.stress.max)) * 100));
  elStMeterFill.style.width = `${stPct}%`;
  elStMeterFill.style.background = stVis.fill;

  const hasArmed = (activeKeyCounts.get("damocles_armed") || 0) > 0;
  elDamoAlert.classList.toggle("hidden", !enabled || !hasArmed);
  if (hasArmed) {
    elDamoMsg.textContent = lastDamoRollText || "⚔ 达摩克里斯已判死：回合末投 d100（01-05 坠剑濒死）";
  }

  const isOverloaded = currentBars.stress.current >= currentBars.stress.max;
  const showMadBar = enabled && (Boolean(currentActiveMadKey) || isOverloaded || (activeKeyCounts.get("overload100") || 0) > 0);
  elMadAlert.classList.toggle("hidden", !showMadBar);
  if (showMadBar) {
    if (currentActiveMadKey && MADNESS_BY_KEY[currentActiveMadKey]) {
      const m = MADNESS_BY_KEY[currentActiveMadKey];
      elMadAlert.classList.toggle("calmed", currentMadCalmed);
      elMadMsg.textContent = currentMadCalmed
        ? `🧊【${m.label}】已由精神分析压制 1 轮（下轮恢复）`
        : (lastMadRollText || `🌀 疯狂·【${m.label}】：${m.tip}`);
      elBtnMadRoll.textContent = "🎲 重抽";
      elBtnMadCalm.classList.remove("hidden");
      elBtnMadCalm.classList.toggle("on", currentMadCalmed);
      elBtnMadCalm.textContent = currentMadCalmed ? "恢复疯狂" : "压制1轮";
    } else {
      elMadAlert.classList.remove("calmed");
      const lockedM = currentTracker.fixedMad && MADNESS_BY_KEY[currentTracker.fixedMad];
      elMadMsg.textContent = lastMadRollText || (
        lockedM
          ? `⚡ 压力过载！固化疯狂锁定：【${lockedM.label}】`
          : "🌀 压力过载(100%)：投 d100 抽取战时疯狂分支"
      );
      elBtnMadRoll.textContent = lockedM ? `⚡ 进【${lockedM.label}】` : "🎲 抽疯狂d100";
      elBtnMadCalm.classList.add("hidden");
    }
  }

  renderTrackerUI(enabled);
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
    block.className = "group-block" + (grp.id === "madness" ? " madness-group" : "");

    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = grp.title;
    block.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "grid";

    for (const s of items) {
      const btn = document.createElement("button");
      btn.className = "status-btn" + (grp.id === "madness" ? " mad-btn" : "");
      if ((activeKeyCounts.get(s.key) || 0) > 0) btn.classList.add("active");
      btn.dataset.key = s.key;
      if (s.tip) btn.title = `${s.label}：${s.tip}`;
      btn.innerHTML = `<img src="./icons/${s.file}?v=${ASSET_VER}" alt="${s.label}" /><span>${s.label}</span>`;
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
    currentActiveMadKey = null;
    currentMadCalmed = false;
    currentBars = normalizeBars(null);
    currentTracker = normalizeTracker(null);
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
  currentTracker = normalizeTracker(tokens[0]);

  const targetSet = new Set(currentTargetIds);
  const allBadges = await OBR.scene.items.getItems(
    (it) => it.layer === "ATTACHMENT" && targetSet.has(it.attachedTo) && Boolean(it.metadata?.[META_KEY])
  );

  const counts = new Map();
  let foundMadKey = null;
  let foundMadCalmed = false;
  for (const b of allBadges) {
    const meta = b.metadata[META_KEY];
    const k = meta.key;
    counts.set(k, (counts.get(k) || 0) + 1);
    if (b.attachedTo === tokens[0].id && isMadnessKey(k)) {
      foundMadKey = k;
      foundMadCalmed = Boolean(meta.calmed);
    }
  }
  activeKeyCounts = counts;
  currentActiveMadKey = foundMadKey;
  currentMadCalmed = foundMadCalmed;
  renderBarsUI(true);
  renderGrid();
}

function getDamoclesTransform(key, bounds, tokenSize, sceneDpi) {
  const px = tokenSize / 128;
  if (key === "damocles_fallen") {
    const wWorld = 36 * 1.45 * px;
    const scale = wWorld / sceneDpi;
    return {
      url: new URL(`./icons/damocles_fallen_map.png?v=${ASSET_VER}`, BASE_URL).href,
      imgW: 144,
      imgH: 128,
      offset: { x: 72, y: 96 },
      position: { x: bounds.center.x, y: bounds.center.y - 0.08 * tokenSize },
      scale: { x: scale, y: scale },
      zIndex: Date.now() + 5000,
    };
  }
  const mapFile = key === "damocles_armed" ? "damocles_armed_map.png" : "damocles_safe_map.png";
  const wWorld = 36 * 1.28 * px;
  const scale = wWorld / sceneDpi;
  return {
    url: new URL(`./icons/${mapFile}?v=${ASSET_VER}`, BASE_URL).href,
    imgW: 144,
    imgH: 224,
    offset: { x: 72, y: 224 },
    position: { x: bounds.center.x, y: bounds.center.y - 0.465 * tokenSize },
    scale: { x: scale, y: scale },
    zIndex: Date.now() + 4500,
  };
}

function buildStatusBadgeItem(meta, token, bounds, tokenSize, slotIdx, orderTs, sceneDpi, calmed = false) {
  if (isDamoclesKey(meta.key)) {
    const tf = getDamoclesTransform(meta.key, bounds, tokenSize, sceneDpi);
    const builder = buildImage(
      { height: tf.imgH, width: tf.imgW, mime: "image/png", url: tf.url },
      { dpi: tf.imgW, offset: tf.offset }
    )
      .position(tf.position)
      .scale(tf.scale)
      .zIndex(tf.zIndex)
      .layer("ATTACHMENT")
      .attachedTo(token.id)
      .locked(true)
      .disableHit(true)
      .name(`专长:${meta.label}`)
      .metadata({ [META_KEY]: { key: meta.key, order: orderTs, overhead: true } });
    if (typeof builder.disableAttachmentBehavior === "function") {
      builder.disableAttachmentBehavior(["ROTATION"]);
    }
    return builder.build();
  }

  const off = getSlotOffset(slotIdx, tokenSize);
  const badgeScale = (tokenSize * 0.27) / sceneDpi;
  const fname = calmed && meta.calmFile ? meta.calmFile : meta.file;
  const iconUrl = new URL(`./icons/${fname}?v=${ASSET_VER}`, BASE_URL).href;
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
    .name(`${isMadnessKey(meta.key) ? "疯狂" : "状态"}:${meta.label}${calmed ? "(压制)" : ""}`)
    .metadata({ [META_KEY]: { key: meta.key, order: orderTs, calmed: Boolean(calmed) } });

  if (typeof builder.disableAttachmentBehavior === "function") {
    builder.disableAttachmentBehavior(["ROTATION"]);
  }
  return builder.build();
}

function buildPixelBarItems(kind, token, bounds, tokenSize, barState, slotIndex, posMode, sceneDpi) {
  const px = tokenSize / 128;
  const barW = 110 * px;
  const barH = 20 * px;

  const barLeft = bounds.center.x - barW / 2;
  const baseTop = bounds.center.y + tokenSize * (posMode === "under_name" ? 0.68 : 0.425);
  const barTop = baseTop + slotIndex * (barH + 0.5 * px);

  const { current, max } = barState;
  const ratio = Math.max(0, Math.min(1, current / Math.max(1, max)));
  const vis = kind === "hp" ? getHpVisual(current, max) : getStressVisual(current, max);

  const baseZ = Date.now() + 2000 + slotIndex * 100;

  const attachCommon = (builder, partName, zOffset) => {
    builder
      .layer("ATTACHMENT")
      .attachedTo(token.id)
      .zIndex(baseZ + zOffset)
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

  const bgUrl = new URL(`./bars/${vis.bgFile}?v=${ASSET_VER}`, BASE_URL).href;
  const bgScale = barW / sceneDpi;
  const bgImg = buildImage(
    { width: 440, height: 80, mime: "image/png", url: bgUrl },
    { dpi: 440, offset: { x: 0, y: 0 } }
  )
    .position({ x: barLeft, y: barTop })
    .scale({ x: bgScale, y: bgScale });
  items.push(attachCommon(bgImg, "bg", 10));

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
    items.push(attachCommon(fillShape, "fill", 20));

    const hiShape = buildShape()
      .shapeType("RECTANGLE")
      .width(fillW)
      .height(2 * px)
      .position({ x: barLeft + 32 * px, y: barTop + 3 * px })
      .fillColor("#ffffff")
      .fillOpacity(0.28)
      .strokeOpacity(0)
      .strokeWidth(0);
    items.push(attachCommon(hiShape, "hi", 25));
  }

  const tickX = kind === "hp" ? 55 * px : 68 * px;
  const tick = buildShape()
    .shapeType("RECTANGLE")
    .width(2 * px)
    .height(14 * px)
    .position({ x: barLeft + tickX, y: barTop + 2 * px })
    .fillColor("#fff275")
    .fillOpacity(0.95)
    .strokeOpacity(0)
    .strokeWidth(0);
  items.push(attachCommon(tick, "tick", 30));

  const chars = `${current}/${max}`.split("");
  const digitStep = chars.length >= 6 ? 8 * px : 9 * px;
  const totalW = (chars.length - 1) * digitStep;
  const wellCx = barLeft + 68.5 * px;
  const wellCy = barTop + 9.0 * px;
  const digitScale = (12 * px) / sceneDpi;

  chars.forEach((ch, idx) => {
    const fname = ch === "/" ? "d_slash.png" : `d_${ch}.png`;
    const dUrl = new URL(`./bars/${fname}?v=${ASSET_VER}`, BASE_URL).href;
    const dImg = buildImage(
      { width: 48, height: 48, mime: "image/png", url: dUrl },
      { dpi: 48, offset: { x: 24, y: 24 } }
    )
      .position({ x: wellCx - totalW / 2 + idx * digitStep, y: wellCy })
      .scale({ x: digitScale, y: digitScale });
    items.push(attachCommon(dImg, `d${idx}`, 40 + idx));
  });

  return items;
}

async function applyBadgeMutations(tokens, computeChanges, boundsById, sceneDpi) {
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
    const { wantAdd, wantRemove, forceReflow } = computeChanges(token, list);

    let inheritedOrders = new Map();
    const kept = [];
    let changed = Boolean(forceReflow);

    for (const b of list) {
      const k = b.metadata[META_KEY].key;
      if (wantRemove.has(k)) {
        for (const grp of MUTEX_GROUPS) {
          if (grp.includes(k)) {
            inheritedOrders.set(grp[0], b.metadata[META_KEY].order || Date.now());
          }
        }
        toDelete.push(b.id);
        changed = true;
      } else {
        kept.push({ existing: b, key: k, order: b.metadata[META_KEY].order || 0 });
      }
    }

    const existingKeys = new Set(kept.map((x) => x.key));
    let ts = Date.now();
    for (const key of wantAdd) {
      if (!existingKeys.has(key) && STATUS_BY_KEY[key]) {
        let ord = ts++;
        for (const grp of MUTEX_GROUPS) {
          if (grp.includes(key) && inheritedOrders.has(grp[0])) {
            ord = inheritedOrders.get(grp[0]);
          }
        }
        kept.push({ existing: null, key, order: ord });
        existingKeys.add(key);
        changed = true;
      }
    }

    if (!changed) continue;

    kept.sort((a, b) => a.order - b.order);
    const bounds = boundsById?.get(token.id) || (await OBR.scene.items.getItemBounds([token.id]));
    const tokenSize = getTokenWorldSize(token, bounds, sceneDpi);
    const badgeScale = (tokenSize * 0.27) / sceneDpi;

    let rimIdx = 0;
    for (const entry of kept) {
      if (isDamoclesKey(entry.key)) {
        if (entry.existing) {
          const tf = getDamoclesTransform(entry.key, bounds, tokenSize, sceneDpi);
          positionUpdates.set(entry.existing.id, { position: tf.position, scale: tf.scale });
        } else {
          toAdd.push(buildStatusBadgeItem(STATUS_BY_KEY[entry.key], token, bounds, tokenSize, 0, entry.order, sceneDpi));
        }
      } else {
        const idx = rimIdx++;
        if (entry.existing) {
          const off = getSlotOffset(idx, tokenSize);
          positionUpdates.set(entry.existing.id, {
            position: { x: bounds.center.x + off.x, y: bounds.center.y + off.y },
            scale: { x: badgeScale, y: badgeScale },
          });
        } else {
          toAdd.push(buildStatusBadgeItem(STATUS_BY_KEY[entry.key], token, bounds, tokenSize, idx, entry.order, sceneDpi));
        }
      }
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
}

async function applyBarsUpdate(mutator, changedBar = null, extraBadgeForce = null) {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const sceneDpi = await OBR.scene.grid.getDpi();
    const targetIds = tokens.map((t) => t.id);
    const targetSet = new Set(targetIds);

    const prevById = new Map();
    const nextById = new Map();
    for (const token of tokens) {
      const prev = normalizeBars(token);
      prevById.set(token.id, structuredClone(prev));
      const next = mutator(structuredClone(prev));
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

    const oldParts = await OBR.scene.items.getItems(
      (it) =>
        it.layer === "ATTACHMENT" &&
        targetSet.has(it.attachedTo) &&
        Boolean(it.metadata?.[BAR_PART_KEY] || it.metadata?.[OLD_STRESS_PART_KEY])
    );
    if (oldParts.length > 0) {
      await OBR.scene.items.deleteItems(oldParts.map((p) => p.id));
    }

    const boundsById = new Map();
    const toAdd = [];
    for (const token of tokens) {
      const next = nextById.get(token.id);
      if (!next) continue;
      const bounds = await OBR.scene.items.getItemBounds([token.id]);
      boundsById.set(token.id, bounds);
      if (!next.hp.visible && !next.stress.visible) continue;
      const tokenSize = getTokenWorldSize(token, bounds, sceneDpi);
      let slot = 0;
      if (next.hp.visible) {
        toAdd.push(...buildPixelBarItems("hp", token, bounds, tokenSize, next.hp, slot++, next.pos, sceneDpi));
      }
      if (next.stress.visible) {
        toAdd.push(...buildPixelBarItems("stress", token, bounds, tokenSize, next.stress, slot++, next.pos, sceneDpi));
      }
    }
    if (toAdd.length > 0) await OBR.scene.items.addItems(toAdd);

    if ((autoLink && changedBar) || extraBadgeForce) {
      await applyBadgeMutations(
        tokens,
        (token, list) => {
          const prev = prevById.get(token.id);
          const next = nextById.get(token.id);
          const tracker = normalizeTracker(token);
          const curKeys = new Set(list.map((b) => b.metadata[META_KEY].key));
          const wantAdd = [];
          const wantRemove = new Set();

          if (autoLink && (changedBar === "hp" || changedBar === "all")) {
            const tookDamage = next.hp.current < prev.hp.current;

            if (next.hp.current <= 0) wantAdd.push("dying");
            else wantRemove.add("dying");

            if (tookDamage && curKeys.has("damocles_safe")) {
              wantRemove.add("damocles_safe");
              wantAdd.push("damocles_armed");
              lastDamoRollText = "";
            }

            if (tracker.passives.hasRedTear) {
              if (next.hp.current <= Math.floor(next.hp.max / 3)) wantAdd.push("red_tear");
              else wantRemove.add("red_tear");
            }

            if (tookDamage && tracker.passives.hasRedBlade) {
              if (curKeys.has("red_blade_2")) {
                wantRemove.add("red_blade_2");
                wantAdd.push("red_blade_3");
              } else if (curKeys.has("red_blade_1")) {
                wantRemove.add("red_blade_1");
                wantAdd.push("red_blade_2");
              } else if (!curKeys.has("red_blade_3")) {
                wantAdd.push("red_blade_1");
              }
            }
          }

          if (autoLink && (changedBar === "stress" || changedBar === "all")) {
            const hasMadBranch = Array.from(curKeys).some(isMadnessKey);
            if (!hasMadBranch) {
              const ratio = next.stress.current / Math.max(1, next.stress.max);
              if (ratio >= 1.0) {
                if (tracker.fixedMad && MADNESS_BY_KEY[tracker.fixedMad]) {
                  wantAdd.push(tracker.fixedMad);
                  wantRemove.add("stress50");
                  wantRemove.add("overload100");
                } else {
                  wantAdd.push("overload100");
                  wantRemove.add("stress50");
                }
              } else if (ratio >= 0.5) {
                wantAdd.push("stress50");
                wantRemove.add("overload100");
              } else {
                wantRemove.add("stress50");
                wantRemove.add("overload100");
              }
            }
          }

          if (extraBadgeForce) {
            for (const k of extraBadgeForce.remove || []) wantRemove.add(k);
            for (const k of extraBadgeForce.add || []) wantAdd.push(k);
          }

          return { wantAdd, wantRemove, forceReflow: false };
        },
        boundsById,
        sceneDpi
      );
    }

    await refreshState();
  } finally {
    busy = false;
  }
}

async function toggleStatus(key) {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const sceneDpi = await OBR.scene.grid.getDpi();
    if (key === "damocles_safe" || key === "damocles_armed") lastDamoRollText = "";
    if (isMadnessKey(key)) lastMadRollText = "";

    await applyBadgeMutations(
      tokens,
      (token, list) => {
        const curKeys = new Set(list.map((b) => b.metadata[META_KEY].key));
        const wantAdd = [];
        const wantRemove = new Set();
        if (curKeys.has(key)) {
          wantRemove.add(key);
        } else {
          for (const peer of getMutexPeers(key)) {
            if (curKeys.has(peer)) wantRemove.add(peer);
          }
          wantAdd.push(key);
        }
        return { wantAdd, wantRemove, forceReflow: false };
      },
      null,
      sceneDpi
    );

    await refreshState();
  } finally {
    busy = false;
  }
}

async function toggleTrackerFlag(section, flagId) {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const nextVal = !currentTracker[section][flagId];
    await OBR.scene.items.updateItems(
      tokens.map((t) => t.id),
      (drafts) => {
        for (const item of drafts) {
          const cur = normalizeTracker(item);
          cur[section][flagId] = nextVal;
          item.metadata[TRACKER_DATA_KEY] = cur;
        }
      }
    );
    await refreshState();
  } finally {
    busy = false;
  }
}

elFixedMadSelect.addEventListener("change", async () => {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const val = elFixedMadSelect.value;
    await OBR.scene.items.updateItems(
      tokens.map((t) => t.id),
      (drafts) => {
        for (const item of drafts) {
          const cur = normalizeTracker(item);
          cur.fixedMad = val;
          item.metadata[TRACKER_DATA_KEY] = cur;
        }
      }
    );
    await refreshState();
  } finally {
    busy = false;
  }
});

elBtnMadRoll.addEventListener("click", async () => {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;

  if (!currentActiveMadKey && currentTracker.fixedMad && MADNESS_BY_KEY[currentTracker.fixedMad]) {
    await toggleStatus(currentTracker.fixedMad);
    return;
  }

  const roll = Math.floor(Math.random() * 100) + 1;
  const rollStr = String(roll).padStart(2, "0");
  const hitImpl = MADNESS_LIST.find((m) => roll >= m.min && roll <= m.max);
  if (!hitImpl) return;

  lastMadRollText = `🎲 d100=${rollStr} →【${hitImpl.label}】：${hitImpl.tip}`;
  busy = true;
  try {
    const sceneDpi = await OBR.scene.grid.getDpi();
    await applyBadgeMutations(
      tokens,
      (token, list) => {
        const curKeys = new Set(list.map((b) => b.metadata[META_KEY].key));
        const wantRemove = new Set();
        for (const peer of getMutexPeers(hitImpl.key)) {
          if (curKeys.has(peer)) wantRemove.add(peer);
        }
        return { wantAdd: [hitImpl.key], wantRemove, forceReflow: false };
      },
      null,
      sceneDpi
    );
    await refreshState();
  } finally {
    busy = false;
  }
});

elBtnMadCalm.addEventListener("click", async () => {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0 || !currentActiveMadKey) return;
  busy = true;
  try {
    const targetSet = new Set(tokens.map((t) => t.id));
    const madBadges = await OBR.scene.items.getItems(
      (it) =>
        it.layer === "ATTACHMENT" &&
        targetSet.has(it.attachedTo) &&
        Boolean(it.metadata?.[META_KEY]) &&
        isMadnessKey(it.metadata[META_KEY].key)
    );
    const nextCalmed = !currentMadCalmed;
    if (madBadges.length > 0) {
      await OBR.scene.items.updateItems(
        madBadges.map((b) => b.id),
        (drafts) => {
          for (const item of drafts) {
            const k = item.metadata[META_KEY].key;
            const m = MADNESS_BY_KEY[k];
            if (!m) continue;
            const fname = nextCalmed ? m.calmFile : m.file;
            item.image.url = new URL(`./icons/${fname}?v=${ASSET_VER}`, BASE_URL).href;
            item.name = `疯狂:${m.label}${nextCalmed ? "(压制)" : ""}`;
            item.metadata[META_KEY] = { ...item.metadata[META_KEY], calmed: nextCalmed };
          }
        }
      );
    }
    await refreshState();
  } finally {
    busy = false;
  }
});

elBtnDamoRoll.addEventListener("click", async () => {
  const roll = Math.floor(Math.random() * 100) + 1;
  const rollStr = String(roll).padStart(2, "0");
  if (roll <= 5) {
    lastDamoRollText = `💀 d100 = ${rollStr}（01-05 坠剑！HP归零濒死）`;
    await applyBarsUpdate(
      (prev) => {
        prev.hp.current = 0;
        prev.hp.visible = true;
        return prev;
      },
      "hp",
      { remove: ["damocles_safe", "damocles_armed"], add: ["damocles_fallen", "dying"] }
    );
  } else {
    lastDamoRollText = `🎲 判死 d100 = ${rollStr}（>05 幸存，悬剑仍在）`;
    elDamoMsg.textContent = lastDamoRollText;
  }
});

for (const btn of stepButtons) {
  btn.addEventListener("click", () => {
    const bar = btn.dataset.bar;
    const delta = Number(btn.dataset.delta || 0);
    applyBarsUpdate((prev) => {
      prev[bar].current += delta;
      prev[bar].visible = true;
      return prev;
    }, bar);
  });
}

elHpCur.addEventListener("change", () => {
  const v = Number(elHpCur.value || 0);
  applyBarsUpdate((prev) => { prev.hp.current = v; prev.hp.visible = true; return prev; }, "hp");
});
elHpMax.addEventListener("change", () => {
  const v = Math.max(1, Number(elHpMax.value || 12));
  applyBarsUpdate((prev) => { prev.hp.max = v; prev.hp.visible = true; return prev; }, "hp");
});
elStCur.addEventListener("change", () => {
  const v = Number(elStCur.value || 0);
  applyBarsUpdate((prev) => { prev.stress.current = v; prev.stress.visible = true; return prev; }, "stress");
});
elStMax.addEventListener("change", () => {
  const v = Math.max(1, Number(elStMax.value || 10));
  applyBarsUpdate((prev) => { prev.stress.max = v; prev.stress.visible = true; return prev; }, "stress");
});

elBtnHpVis.addEventListener("click", () => {
  applyBarsUpdate((prev) => { prev.hp.visible = !prev.hp.visible; return prev; }, null);
});
elBtnStVis.addEventListener("click", () => {
  applyBarsUpdate((prev) => { prev.stress.visible = !prev.stress.visible; return prev; }, null);
});
elBtnBarPos.addEventListener("click", () => {
  applyBarsUpdate((prev) => {
    prev.pos = prev.pos === "tight" ? "under_name" : "tight";
    return prev;
  }, null);
});
elBtnAutoLink.addEventListener("click", () => {
  autoLink = !autoLink;
  localStorage.setItem(AUTOLINK_STORAGE_KEY, String(autoLink));
  renderBarsUI(currentTargetIds.length > 0);
});

elBtnClear.addEventListener("click", async () => {
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const sceneDpi = await OBR.scene.grid.getDpi();
    await applyBadgeMutations(
      tokens,
      (token, list) => ({
        wantAdd: [],
        wantRemove: new Set(list.map((b) => b.metadata[META_KEY].key)),
        forceReflow: false,
      }),
      null,
      sceneDpi
    );
    lastDamoRollText = "";
    lastMadRollText = "";
    await refreshState();
  } finally {
    busy = false;
  }
});

elBtnLayout.addEventListener("click", async () => {
  layoutMode = layoutMode === "rim" ? "bottom" : "rim";
  localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode);
  elBtnLayout.textContent = layoutMode === "rim" ? "绕边排队" : "底边横排";
  const tokens = await resolveTargetTokens();
  if (busy || tokens.length === 0) return;
  busy = true;
  try {
    const sceneDpi = await OBR.scene.grid.getDpi();
    await applyBadgeMutations(
      tokens,
      () => ({ wantAdd: [], wantRemove: new Set(), forceReflow: true }),
      null,
      sceneDpi
    );
    await refreshState();
  } finally {
    busy = false;
  }
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
