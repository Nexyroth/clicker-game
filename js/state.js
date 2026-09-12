import * as Big from "./numeric.js";

// Field nào là BigNum (currency/chỉ số không giới hạn) - dùng cho save/load/migration.
// Xem numeric.js để biết vì sao các field này cần BigNum thay vì Number thường.
const BIG_FIELDS = [
  "allTimeClicks",
  "bucks",
  "mult",
  "cps",
  "nextLevelReward",
  "xp",
  "neededXP",
  "totalBucksEarned",
  "gems",
  "totalGemsEarned",
  "crystals",
  "totalPrestigesEver",
  "crystalsClaimedFromPrestiges",
  "totalCrystalsEarned",
  "xaLoi",
  "totalXaLoiEarned",
];
const BIG_PROGRESS_FIELD = "bucksEarned"; // trong dailyProgress/weeklyProgress
const SAVE_VERSION = 1;

// Trả về 1 state mặc định (dùng khi khởi tạo lần đầu, khi load save cũ thiếu field, và khi Tái Sinh)
function getDefaultState() {
  return {
    saveVersion: SAVE_VERSION,
    allTimeClicks: Big.fromNumber(0),
    bucks: Big.fromNumber(1000),
    mult: Big.fromNumber(1),
    cps: Big.fromNumber(0),
    level: 1,
    nextLevelReward: Big.fromNumber(200),
    xp: Big.fromNumber(0),
    neededXP: Big.fromNumber(100),
    showAllUpgrades: true,
    darkMode: true, // Dark Cyberpunk là giao diện mặc định từ giờ
    sfxEnabled: true,
    achievements: {},
    upgrades: {},
    // --- Tái Sinh / Đá Quý ---
    totalBucksEarned: Big.fromNumber(0), // tổng Nexyroth kiếm được kể từ lần Tái Sinh gần nhất, dùng để tính Đá Quý
    gems: Big.fromNumber(0),
    gemUpgrades: {},
    critUpgrades: {},
    prestigeCount: 0,
    totalGemsEarned: Big.fromNumber(0), // tổng Đá Quý kiếm được trọn đời (KHÔNG reset khi Thăng Thiên) - chỉ để xem thống kê
    // --- Thăng Thiên (Ascension) ---
    crystals: Big.fromNumber(0), // Tinh Thể - dùng nâng cấp Cây Kỹ Năng, KHÔNG mất khi Thăng Thiên
    ascensionCount: 0,
    totalPrestigesEver: Big.fromNumber(0), // tổng số lần Tái Sinh TRỌN ĐỜI, KHÔNG reset kể cả khi Thăng Thiên - dùng tính Tinh Thể
    crystalsClaimedFromPrestiges: Big.fromNumber(0), // đã "quy đổi" bao nhiêu Tinh Thể từ totalPrestigesEver rồi, để không nhận trùng
    totalCrystalsEarned: Big.fromNumber(0), // tổng Tinh Thể kiếm được trọn đời - chỉ để xem thống kê
    skillTree: { power: 0, speed: 0, crit: 0, ascension: 0 }, // số node đã mở mỗi nhánh, vĩnh viễn
    // --- Cổ Vật / Di Vật ---
    collection: {}, // { [itemId]: true } - vĩnh viễn, chỉ mất khi Reset Toàn Bộ Game
    equippedItems: [], // tối đa EQUIP_SLOT_COUNT id, chỉ những món này mới có hiệu lực
    // --- Boss Click ---
    bossLevel: 0, // tăng dần sau mỗi lần thắng, không reset - quyết định máu/thưởng Boss tiếp theo
    bossesDefeated: 0,
    // --- Thế Giới / Pet ---
    activeWorldId: "forest", // Thế Giới đang chọn để nhận tiền tệ khi kiếm Nexyroth
    worldCurrencies: {}, // { [worldId]: BigNum } - vĩnh viễn, không mất khi Tái Sinh/Thăng Thiên, MẤT khi Niết Bàn
    tamedPets: {}, // { [petId]: true } - vĩnh viễn, MẤT khi Niết Bàn (chỉ giữ khi Reset Toàn Bộ Game chưa xảy ra)
    // --- Niết Bàn (Nirvana) ---
    xaLoi: Big.fromNumber(0), // Xá Lợi - dùng mua Vĩnh Hằng Bội Tăng + Gacha Thần Thú, KHÔNG mất khi Niết Bàn tiếp theo
    totalXaLoiEarned: Big.fromNumber(0),
    nirvanaCount: 0,
    eternalMultLevel: 0, // Vĩnh Hằng Bội Tăng - KHÔNG BAO GIỜ reset, kể cả Niết Bàn
    divineBeastsTamed: {}, // Thần Thú có được qua Gacha - KHÔNG BAO GIỜ reset, kể cả Niết Bàn
    // --- Nhiệm Vụ Hàng Ngày ---
    dailyQuestsDate: null, // ngày (toDateString) lần cuối random nhiệm vụ, để biết khi nào cần đổi mới
    dailyQuests: [], // [{ type, label, target, reward, claimed }]
    dailyProgress: {
      clicks: 0,
      bucksEarned: Big.fromNumber(0),
      upgradesBought: 0,
      crits: 0,
      goldenGifts: 0,
      maxCombo: 0,
    },
    // --- Nhiệm Vụ Hàng Tuần ---
    weeklyQuestsDate: null, // ngày đầu tuần (Thứ 2, toDateString) lần cuối random nhiệm vụ
    weeklyQuests: [], // [{ type, label, target, reward, claimed }]
    weeklyProgress: {
      clicks: 0,
      bucksEarned: Big.fromNumber(0),
      upgradesBought: 0,
      crits: 0,
      goldenGifts: 0,
      maxCombo: 0,
      prestiges: 0,
      ascensions: 0,
    },
    // --- Thống kê (Stats) ---
    totalPlaytimeMs: 0,
    totalClickActions: 0, // số LẦN bấm nút Click (khác allTimeClicks - đó là tổng GIÁ TRỊ click)
    totalCrits: 0,
    // --- Offline Earnings ---
    lastSaveTime: Date.now(),
    // --- Thống kê cho Achievements mới ---
    goldenGiftsClicked: 0,
    maxCombo: 0,
  };
}

// Trạng thái (state) hiện tại của game
export let state = getDefaultState();

function serializeState(rawState) {
  const out = { ...rawState };
  BIG_FIELDS.forEach((key) => {
    out[key] = Big.serialize(rawState[key]);
  });
  out.dailyProgress = { ...rawState.dailyProgress, [BIG_PROGRESS_FIELD]: Big.serialize(rawState.dailyProgress[BIG_PROGRESS_FIELD]) };
  out.weeklyProgress = { ...rawState.weeklyProgress, [BIG_PROGRESS_FIELD]: Big.serialize(rawState.weeklyProgress[BIG_PROGRESS_FIELD]) };
  out.worldCurrencies = {};
  Object.keys(rawState.worldCurrencies || {}).forEach((worldId) => {
    out.worldCurrencies[worldId] = Big.serialize(rawState.worldCurrencies[worldId]);
  });
  return out;
}

// save cũ (trước saveVersion) lưu các field này dạng Number thô -> convert sang BigNum bằng fromNumber.
// save mới (saveVersion >= 1) lưu dạng chuỗi "mEe" -> parse lại bằng deserialize/fromString.
function reviveBigField(value, isLegacy) {
  return isLegacy ? Big.fromNumber(typeof value === "number" ? value : 0) : Big.deserialize(value);
}

function deserializeState(parsed) {
  const isLegacy = !parsed.saveVersion;
  const out = { ...parsed };

  BIG_FIELDS.forEach((key) => {
    const revived = reviveBigField(parsed[key], isLegacy);
    out[key] = Big.isFinite(revived) && !Big.isNaN(revived) ? revived : Big.fromNumber(0);
  });

  ["dailyProgress", "weeklyProgress"].forEach((section) => {
    const src = parsed[section] || {};
    const revived = reviveBigField(src[BIG_PROGRESS_FIELD], isLegacy);
    out[section] = {
      ...src,
      [BIG_PROGRESS_FIELD]: Big.isFinite(revived) && !Big.isNaN(revived) ? revived : Big.fromNumber(0),
    };
  });

  out.worldCurrencies = {};
  Object.keys(parsed.worldCurrencies || {}).forEach((worldId) => {
    const revived = reviveBigField(parsed.worldCurrencies[worldId], isLegacy);
    out.worldCurrencies[worldId] = Big.isFinite(revived) && !Big.isNaN(revived) ? revived : Big.fromNumber(0);
  });

  out.saveVersion = SAVE_VERSION;
  return out;
}

// Lưu game vào localStorage
export function saveGame() {
  state.lastSaveTime = Date.now();
  state.saveVersion = SAVE_VERSION;
  localStorage.setItem("clickerGameState", JSON.stringify(serializeState(state)));
}

// Tải game từ localStorage (nếu có). Merge với default để save cũ (thiếu field mới) vẫn chạy được.
// Chịu được JSON hỏng / field sai type - không để game crash, không mất save cũ dùng Number thô.
export function loadGame() {
  const savedState = localStorage.getItem("clickerGameState");
  if (!savedState) return;

  let parsed;
  try {
    parsed = JSON.parse(savedState);
  } catch (err) {
    console.error("Save hỏng, không parse được JSON - giữ nguyên state mặc định.", err);
    return;
  }

  try {
    state = { ...getDefaultState(), ...deserializeState(parsed) };
  } catch (err) {
    console.error("Save có field không hợp lệ, dùng state mặc định.", err);
    state = getDefaultState();
  }
}

// Reset toàn bộ tiến trình game (khác với Tái Sinh: reset sạch, không nhận Đá Quý)
export function resetGame() {
  if (
    confirm(
      "Bạn có chắc muốn Reset Toàn Bộ Game không? Mọi tiến trình sẽ mất vĩnh viễn (khác với Tái Sinh - sẽ KHÔNG nhận được Đá Quý)."
    )
  ) {
    // Gỡ autosave (beforeunload) TRƯỚC khi reload, nếu không nó sẽ lưu ngược
    // state cũ (đang có trong bộ nhớ) vào lại localStorage đúng lúc trang unload,
    // khiến vừa xoá xong lại bị ghi đè trở lại y như cũ.
    window.removeEventListener("beforeunload", saveGame);
    localStorage.removeItem("clickerGameState");
    localStorage.removeItem("darkMode");
    location.reload();
  }
}
