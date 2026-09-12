import { state, saveGame } from "./state.js";
import * as Big from "./numeric.js";
import {
  NIRVANA_UNLOCK_ASCENSION_COUNT,
  NIRVANA_DIVISOR,
  ETERNAL_MULT_BONUS_PER_LEVEL,
  ETERNAL_MULT_BASE_COST,
  ETERNAL_MULT_COST_RATE,
  GACHA_COST_XA_LOI,
  divineBeasts,
} from "./data.js";
import { getStartingBucks } from "./prestige.js";
import { getAscensionStartBonus } from "./skilltree.js";
import { updateDisplay } from "./ui.js";
import { playPurchaseSound, playNirvanaSound, playGachaSound } from "./sounds.js";

// ---------------- Vĩnh Hằng Bội Tăng (KHÔNG BAO GIỜ reset, kể cả Niết Bàn) ----------------

export function getEternalMultBonus() {
  return 1 + state.eternalMultLevel * ETERNAL_MULT_BONUS_PER_LEVEL;
}

export function getEternalMultCost() {
  return Big.scale(
    Big.pow(Big.fromNumber(ETERNAL_MULT_COST_RATE), state.eternalMultLevel),
    ETERNAL_MULT_BASE_COST
  );
}

export function purchaseEternalMult() {
  const cost = getEternalMultCost();
  if (Big.gte(state.xaLoi, cost)) {
    state.xaLoi = Big.sub(state.xaLoi, cost);
    state.eternalMultLevel += 1;
    updateDisplay();
    playPurchaseSound();
    return true;
  }
  return false;
}

// ---------------- Gacha Thần Thú (có CẤP ĐỘ, KHÔNG BAO GIỜ reset kể cả Niết Bàn) ----------------

// Cấp độ hiện tại của 1 Thần Thú (0 = chưa có)
export function getDivineBeastLevel(id) {
  return state.divineBeastsTamed[id] || 0;
}

export function isDivineBeastTamed(id) {
  return getDivineBeastLevel(id) > 0;
}

function getAllTamedDivineBeastsWithLevel() {
  return divineBeasts
    .map((b) => ({ beast: b, level: getDivineBeastLevel(b.id) }))
    .filter((x) => x.level > 0);
}

function getDivineBeastEffectSum(effectType) {
  return getAllTamedDivineBeastsWithLevel()
    .filter((x) => x.beast.effectType === effectType)
    .reduce((sum, x) => sum + x.beast.amount * x.level, 0);
}
function getDivineBeastEffectProduct(effectType) {
  return getAllTamedDivineBeastsWithLevel()
    .filter((x) => x.beast.effectType === effectType)
    .reduce((prod, x) => prod * Math.pow(1 + x.beast.amount, x.level), 1);
}

export function getDivineBeastMultBonus() {
  return getDivineBeastEffectProduct("multBoost");
}
export function getDivineBeastCpsBonus() {
  return getDivineBeastEffectProduct("cpsBoost");
}
export function getDivineBeastCritDamageBonus() {
  return getDivineBeastEffectProduct("critDamageBoost");
}
export function getDivineBeastPrestigeGemBonus() {
  return getDivineBeastEffectProduct("prestigeGemBoost");
}

// Quay Gacha 1 lần bằng Xá Lợi - random đều trong TẤT CẢ Thần Thú (kể cả đã có).
// Trúng con CHƯA có -> có được ở cấp 1. Trúng con ĐÃ có (trùng) -> lên thêm 1 cấp, không lãng phí.
export function rollGacha() {
  if (Big.lt(state.xaLoi, Big.fromNumber(GACHA_COST_XA_LOI))) return null;

  state.xaLoi = Big.sub(state.xaLoi, Big.fromNumber(GACHA_COST_XA_LOI));
  const beast = divineBeasts[Math.floor(Math.random() * divineBeasts.length)];
  const previousLevel = getDivineBeastLevel(beast.id);
  const newLevel = previousLevel + 1;
  state.divineBeastsTamed[beast.id] = newLevel;
  updateDisplay();
  playGachaSound(previousLevel > 0);
  return { beast, newLevel, isDuplicate: previousLevel > 0 };
}

// ---------------- Niết Bàn ----------------

export function isNirvanaUnlocked() {
  return state.ascensionCount >= NIRVANA_UNLOCK_ASCENSION_COUNT;
}

// Số Xá Lợi sẽ nhận được nếu Niết Bàn ngay bây giờ (dựa theo tổng số lần Thăng Thiên trọn đời).
// ascensionCount là bộ đếm nhỏ, bị reset về 0 mỗi lần Niết Bàn nên không cần BigNum ở đây.
export function calculateXaLoiGain() {
  return Math.floor(Math.sqrt(state.ascensionCount / NIRVANA_DIVISOR));
}

// Niết Bàn: reset TOÀN BỘ Cây Kỹ Năng, Cổ Vật/Di Vật, Thế Giới/Pet, Thăng Thiên, và lượt chơi hiện tại,
// đổi lấy Xá Lợi - dùng mua Vĩnh Hằng Bội Tăng và Gacha Thần Thú (2 thứ duy nhất KHÔNG BAO GIỜ mất)
export function performNirvana() {
  if (!isNirvanaUnlocked()) {
    alert(
      `Bạn cần Thăng Thiên ít nhất ${NIRVANA_UNLOCK_ASCENSION_COUNT} lần mới mở khoá được Niết Bàn.`
    );
    return;
  }

  const xaLoiToGain = calculateXaLoiGain();
  if (xaLoiToGain < 1) {
    alert("Bạn cần tích luỹ thêm số lần Thăng Thiên trọn đời trước khi Niết Bàn nhận được Xá Lợi.");
    return;
  }

  const confirmed = confirm(
    `Niết Bàn sẽ reset TOÀN BỘ: Cây Kỹ Năng, Cổ Vật/Di Vật đang trang bị lẫn đang sở hữu, tất cả tiền tệ Thế Giới và Pet đã thuần hoá, Đá Quý, Tinh Thể, số lần Tái Sinh/Thăng Thiên, và cả lượt chơi hiện tại — về NGUYÊN BẢN.\n` +
      `Đổi lại bạn nhận được ${xaLoiToGain} Xá Lợi.\n` +
      `Xá Lợi, Vĩnh Hằng Bội Tăng, Thần Thú (Gacha), Thành Tựu và mọi thống kê trọn đời sẽ được giữ nguyên VĨNH VIỄN.\n\n` +
      `Bạn chắc chắn muốn Niết Bàn chứ?`
  );
  if (!confirmed) return;

  // Tính trước khi reset (vì các hàm này đọc gemUpgrades/skillTree hiện tại)
  const startingBucks = getStartingBucks() + getAscensionStartBonus();

  state.xaLoi = Big.add(state.xaLoi, Big.fromNumber(xaLoiToGain));
  state.totalXaLoiEarned = Big.add(state.totalXaLoiEarned, Big.fromNumber(xaLoiToGain));
  state.nirvanaCount += 1;

  // Reset tầng Thăng Thiên
  state.crystals = Big.fromNumber(0);
  state.crystalsClaimedFromPrestiges = Big.fromNumber(0);
  state.totalPrestigesEver = Big.fromNumber(0);
  state.ascensionCount = 0;
  state.skillTree = { power: 0, speed: 0, crit: 0, ascension: 0 };

  // Reset tầng Tái Sinh
  state.gems = Big.fromNumber(0);
  state.gemUpgrades = {};
  state.critUpgrades = {};
  state.prestigeCount = 0;

  // Reset Cổ Vật/Di Vật
  state.collection = {};
  state.equippedItems = [];

  // Reset Thế Giới/Pet ("reset toàn bộ Thế Giới")
  state.worldCurrencies = {};
  state.tamedPets = {};
  state.activeWorldId = "forest";

  // Reset độ khó Boss (để không quá sức so với lượt chơi vừa reset sạch)
  state.bossLevel = 0;

  // Reset lượt chơi hiện tại
  state.bucks = Big.fromNumber(startingBucks);
  state.mult = Big.fromNumber(1);
  state.cps = Big.fromNumber(0);
  state.level = 1;
  state.xp = Big.fromNumber(0);
  state.neededXP = Big.fromNumber(100);
  state.nextLevelReward = Big.fromNumber(200);
  state.upgrades = {};
  state.totalBucksEarned = Big.fromNumber(0);

  playNirvanaSound();
  saveGame();
  setTimeout(() => location.reload(), 1600); // chờ dứt tiếng nhạc rồi mới reload
}
