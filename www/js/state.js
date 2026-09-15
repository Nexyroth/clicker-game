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
  "diamonds",
  "totalDiamondsEarned",
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
    skillTree: { power: 0, speed: 0, crit: 0, ascension: 0, luck: 0 }, // số node đã mở mỗi nhánh, vĩnh viễn
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
    // --- Balo / Item / Buff / Redeem Code ---
    inventory: { items: {} }, // { items: { [itemId]: quantity(Number) } } - số lượng nhỏ, không cần BigNum
    activeBuffs: {}, // { multiplierBuff: {itemId, multiplier, expiresAt}, autoClicker: {expiresAt} } - dựa theo timestamp thật
    redeemedCodes: {}, // { [code]: true } - chống nhập lại mã đã dùng
    diamonds: Big.fromNumber(0), // Kim Cương - tiền tệ mới cho NX Item Shop, chủ yếu kiếm qua rơi từ Boss
    totalDiamondsEarned: Big.fromNumber(0),
    claimedEvents: {}, // { [eventId]: true } - chống nhận thưởng sự kiện 2 lần
    firstLoginTime: Date.now(), // mốc thời gian lần đầu vào game - dùng tính Ngày cho Hành Trình Tân Thủ 7 Ngày
    claimed7DayRewards: {}, // { [day]: true } - chống nhận quà 7 Ngày Tân Thủ 2 lần cùng 1 ngày
    // --- Kỷ Lục Cá Nhân (Personal Bests) ---
    personalBests: {
      maxEffectiveCps: Big.fromNumber(0), // Nexyroth/giây hiệu lực cao nhất từng đạt
      maxClickValue: Big.fromNumber(0), // giá trị 1 cú click (kể cả Chí Mạng) lớn nhất từng đạt
      maxClicksIn10s: 0, // số lần bấm Click Ngay! nhiều nhất trong 1 cửa sổ 10 giây bất kỳ
    },
    // --- Boss Ngày (chỉ rơi trúng tối đa 1 lần/ngày thật) ---
    lastDailyBossDate: null, // ngày (toDateString) lần cuối 1 Boss Ngày xuất hiện
  };
}

// Trạng thái (state) hiện tại của game
export let state = getDefaultState();

// Giữ lại field LẠ (không có trong getDefaultState) khi load, để bản CŨ đọc save của bản MỚI rồi
// lưu lại vẫn không xoá mất dữ liệu của tính năng mới. Đây là mấu chốt để người chơi chuyển qua lại
// giữa bản Online (mới) và bản Offline (cũ) mà không mất tiến trình.
let unknownSavedFields = {};

function collectUnknownFields(parsed, defaults) {
  const unknown = {};
  Object.keys(parsed).forEach((key) => {
    if (!(key in defaults)) unknown[key] = parsed[key];
  });
  return unknown;
}

// Merge sâu 1 tầng cho các object lồng nhau: giữ mọi key của default (tính năng mới) VÀ mọi key đã
// có trong save (tính năng cũ/lạ). Merge nông thuần (Object.assign tầng ngoài) sẽ thay nguyên cả
// object con, làm mất key mới mỗi khi save cũ có sẵn object đó.
function mergeNested(defaultObj, savedObj) {
  if (!isPlainObject(savedObj)) return { ...defaultObj };
  return { ...defaultObj, ...savedObj };
}

function serializeState(rawState) {
  const out = { ...unknownSavedFields, ...rawState };
  BIG_FIELDS.forEach((key) => {
    out[key] = Big.serialize(rawState[key]);
  });
  out.dailyProgress = { ...rawState.dailyProgress, [BIG_PROGRESS_FIELD]: Big.serialize(rawState.dailyProgress[BIG_PROGRESS_FIELD]) };
  out.weeklyProgress = { ...rawState.weeklyProgress, [BIG_PROGRESS_FIELD]: Big.serialize(rawState.weeklyProgress[BIG_PROGRESS_FIELD]) };
  out.worldCurrencies = {};
  Object.keys(rawState.worldCurrencies || {}).forEach((worldId) => {
    out.worldCurrencies[worldId] = Big.serialize(rawState.worldCurrencies[worldId]);
  });
  out.personalBests = {
    maxEffectiveCps: Big.serialize(rawState.personalBests.maxEffectiveCps),
    maxClickValue: Big.serialize(rawState.personalBests.maxClickValue),
    maxClicksIn10s: rawState.personalBests.maxClicksIn10s,
  };
  return out;
}

// save cũ (trước saveVersion) lưu các field này dạng Number thô -> convert sang BigNum bằng fromNumber.
// save mới (saveVersion >= 1) lưu dạng chuỗi "mEe" -> parse lại bằng deserialize/fromString.
function reviveBigField(value, isLegacy) {
  return isLegacy ? Big.fromNumber(typeof value === "number" ? value : 0) : Big.deserialize(value);
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deserializeState(parsed) {
  const isLegacy = !parsed.saveVersion;
  const out = { ...parsed };

  BIG_FIELDS.forEach((key) => {
    const revived = reviveBigField(parsed[key], isLegacy);
    out[key] = Big.isFinite(revived) && !Big.isNaN(revived) ? revived : Big.fromNumber(0);
  });

  const defaults = getDefaultState();
  ["dailyProgress", "weeklyProgress"].forEach((section) => {
    const src = parsed[section] || {};
    const revived = reviveBigField(src[BIG_PROGRESS_FIELD], isLegacy);
    out[section] = {
      ...mergeNested(defaults[section], src),
      [BIG_PROGRESS_FIELD]: Big.isFinite(revived) && !Big.isNaN(revived) ? revived : Big.fromNumber(0),
    };
  });

  out.worldCurrencies = {};
  Object.keys(parsed.worldCurrencies || {}).forEach((worldId) => {
    const revived = reviveBigField(parsed.worldCurrencies[worldId], isLegacy);
    out.worldCurrencies[worldId] = Big.isFinite(revived) && !Big.isNaN(revived) ? revived : Big.fromNumber(0);
  });

  const pbSrc = parsed.personalBests || {};
  const revivedCps = reviveBigField(pbSrc.maxEffectiveCps, isLegacy);
  const revivedClickValue = reviveBigField(pbSrc.maxClickValue, isLegacy);
  out.personalBests = {
    maxEffectiveCps: Big.isFinite(revivedCps) && !Big.isNaN(revivedCps) ? revivedCps : Big.fromNumber(0),
    maxClickValue: Big.isFinite(revivedClickValue) && !Big.isNaN(revivedClickValue) ? revivedClickValue : Big.fromNumber(0),
    maxClicksIn10s: Number.isFinite(pbSrc.maxClicksIn10s) ? pbSrc.maxClicksIn10s : 0,
  };

  // Balo/Buff/Redeem Code: field mới (v7.6+), save cũ không có -> merge default ở loadGame() lo.
  // Chỉ cần chống trường hợp field có mặt nhưng SAI KIỂU (ví dụ save bị chỉnh tay/hỏng).
  const items = parsed.inventory && isPlainObject(parsed.inventory.items) ? parsed.inventory.items : {};
  const cleanItems = {};
  Object.keys(items).forEach((itemId) => {
    const qty = Number(items[itemId]);
    if (Number.isFinite(qty) && qty > 0) cleanItems[itemId] = Math.floor(qty);
  });
  out.inventory = { items: cleanItems };
  out.activeBuffs = isPlainObject(parsed.activeBuffs) ? parsed.activeBuffs : {};
  out.redeemedCodes = isPlainObject(parsed.redeemedCodes) ? parsed.redeemedCodes : {};
  out.claimedEvents = isPlainObject(parsed.claimedEvents) ? parsed.claimedEvents : {};
  out.claimed7DayRewards = isPlainObject(parsed.claimed7DayRewards) ? parsed.claimed7DayRewards : {};
  out.firstLoginTime = Number.isFinite(parsed.firstLoginTime) ? parsed.firstLoginTime : Date.now();

  // skillTree là object lồng - merge nông ở tầng ngoài không tự thêm nhánh MỚI (vd "luck") vào save
  // cũ đã có sẵn object skillTree (thiếu key mới). Merge tay từng nhánh để không mất field lồng nhau.
  const savedSkillTree = isPlainObject(parsed.skillTree) ? parsed.skillTree : {};
  out.skillTree = { power: 0, speed: 0, crit: 0, ascension: 0, luck: 0, ...savedSkillTree };

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
    unknownSavedFields = collectUnknownFields(parsed, getDefaultState());
    state = { ...getDefaultState(), ...deserializeState(parsed) };
  } catch (err) {
    console.error("Save có field không hợp lệ, dùng state mặc định.", err);
    unknownSavedFields = {};
    state = getDefaultState();
  }
}

// Reset toàn bộ tiến trình game (khác với Tái Sinh: reset sạch, không nhận Đá Quý)
// ---------------- Chuyển save giữa bản Online và Offline ----------------
// Bản Online (nexyroth.github.io) và bản Offline trong app Android chạy ở 2 origin khác nhau, mà
// trình duyệt cô lập localStorage theo origin -> 2 bản có 2 save RIÊNG BIỆT, không thể tự đồng bộ.
// Export/Import là cách duy nhất để người chơi mang tiến trình qua lại giữa 2 bản.

export function exportSave() {
  const raw = localStorage.getItem("clickerGameState");
  if (!raw) return null;
  return btoa(unescape(encodeURIComponent(raw))); // base64 hoá cho gọn, tránh xuống dòng khi copy
}

export function importSave(encoded) {
  let raw;
  try {
    raw = decodeURIComponent(escape(atob(String(encoded).trim())));
  } catch (err) {
    return { success: false, message: "Mã save không hợp lệ (sai định dạng)." };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { success: false, message: "Mã save không hợp lệ (không đọc được dữ liệu)." };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { success: false, message: "Mã save không hợp lệ (không phải dữ liệu game)." };
  }

  localStorage.setItem("clickerGameState", raw);
  return { success: true, message: "Nhập save thành công! Đang tải lại game..." };
}

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
