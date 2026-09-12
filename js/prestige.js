import { state, saveGame } from "./state.js";
import * as Big from "./numeric.js";
import { getComboMultiplier, getGoldenBuffMultiplier } from "./effects.js";
import {
  gemUpgrades,
  critUpgrades,
  GEM_UPGRADE_COST_RATE,
  CRIT_UPGRADE_COST_RATE,
  PRESTIGE_DIVISOR,
  BASE_CRIT_CHANCE,
  MAX_CRIT_CHANCE,
  GEM_MULT_BONUS_PER_LEVEL,
  GEM_CPS_BONUS_PER_LEVEL,
  PRESTIGE_POWER_BONUS_PER_LEVEL,
  HEAD_START_BONUS_PER_LEVEL,
  BASE_STARTING_BUCKS,
  CRIT_CHANCE_BONUS_PER_LEVEL,
  ASCENSION_PRESTIGE_DIVISOR,
  BASE_MAX_REBIRTHS,
  REBIRTH_CAP_BONUS_PER_LEVEL,
  REBIRTH_BULK_DIVISOR,
  REBIRTH_BULK_MULTIPLIER,
  REBIRTH_GEM_SYNERGY_PER_REBIRTH,
  REBIRTH_BOOST_PER_LEVEL,
  CRYSTAL_PER_HELD_REBIRTH,
} from "./data.js";
import {
  getAscensionMultBonus,
  getAscensionCpsBonus,
  getAscensionCritChanceBonus,
  getAscensionCrystalBonus,
  getAscensionStartBonus,
  getAscensionHeldBonusMultiplier,
  getEffectiveAscensionUnlockCount,
} from "./skilltree.js";
import {
  getCollectionMultBonus,
  getCollectionCpsBonus,
  getCollectionCritChanceBonus,
  getCollectionPrestigeGemBonus,
} from "./collection.js";
import {
  getPetMultBonus,
  getPetCpsBonus,
  getPetCritChanceBonus,
} from "./worlds.js";
import {
  getEternalMultBonus,
  getDivineBeastMultBonus,
  getDivineBeastCpsBonus,
  getDivineBeastPrestigeGemBonus,
} from "./nirvana.js";
import { updateDisplay, formatNumber } from "./ui.js";
import { updateGemUpgradeElement, updateCritUpgradeElement } from "./ui-prestige.js";
import { showUpgradeAnimation } from "./animations.js";
import { playPurchaseSound, playPrestigeSound, playAscendSound } from "./sounds.js";

// ---------------- Buff hiệu lực (Gem Shop / Cây Kỹ Năng / Bộ Sưu Tập / Combo / Cuồng Nhiệt) ----------------

// Hệ Số Nhân gốc x buff Cửa Hàng Đá Quý x Cây Kỹ Năng x Bộ Sưu Tập x Combo x Cuồng Nhiệt
export function getEffectiveMult() {
  const gemLevel = state.gemUpgrades.permMult || 0;
  const gemBonus = 1 + gemLevel * GEM_MULT_BONUS_PER_LEVEL;
  const totalBonus =
    gemBonus *
    getAscensionMultBonus() *
    getCollectionMultBonus() *
    getPetMultBonus() *
    getEternalMultBonus() *
    getDivineBeastMultBonus() *
    getComboMultiplier() *
    getGoldenBuffMultiplier();
  return Big.scale(state.mult, totalBonus);
}

// Nexyroth/giây gốc x buff Cửa Hàng Đá Quý x Cây Kỹ Năng x Bộ Sưu Tập x Cuồng Nhiệt
export function getEffectiveCps() {
  const gemLevel = state.gemUpgrades.permCps || 0;
  const gemBonus = 1 + gemLevel * GEM_CPS_BONUS_PER_LEVEL;
  const totalBonus =
    gemBonus *
    getAscensionCpsBonus() *
    getCollectionCpsBonus() *
    getPetCpsBonus() *
    getEternalMultBonus() *
    getDivineBeastCpsBonus() *
    getGoldenBuffMultiplier();
  return Big.scale(state.cps, totalBonus);
}

// Cơ hội Chí Mạng hiện tại (cơ bản + Cửa Hàng Chí Mạng + Cây Kỹ Năng + Bộ Sưu Tập, giới hạn trần)
export function getEffectiveCritChance() {
  const level = state.critUpgrades.critChance || 0;
  return Math.min(
    MAX_CRIT_CHANCE,
    BASE_CRIT_CHANCE +
      level * CRIT_CHANCE_BONUS_PER_LEVEL +
      getAscensionCritChanceBonus() +
      getCollectionCritChanceBonus() +
      getPetCritChanceBonus()
  );
}

// Hệ số nhân Đá Quý nhận được khi Tái Sinh (Sức Mạnh Tái Sinh + Bộ Sưu Tập + hiệp lực từ số Lượt Tái Sinh đang giữ)
export function getPrestigeGemMultiplier() {
  const level = state.gemUpgrades.prestigePower || 0;
  const rebirthSynergy = 1 + state.prestigeCount * REBIRTH_GEM_SYNERGY_PER_REBIRTH;
  return (
    (1 + level * PRESTIGE_POWER_BONUS_PER_LEVEL) *
    getCollectionPrestigeGemBonus() *
    getDivineBeastPrestigeGemBonus() *
    rebirthSynergy
  );
}

// Số Nexyroth khởi điểm sau mỗi lần Tái Sinh (buff Khởi Đầu Thuận Lợi)
export function getStartingBucks() {
  const level = state.gemUpgrades.headStart || 0;
  return BASE_STARTING_BUCKS + level * HEAD_START_BONUS_PER_LEVEL;
}

// ---------------- Lượt Tái Sinh (tiền tệ) ----------------

// Giới hạn tối đa Lượt Tái Sinh có thể giữ cùng lúc (buff "Mở Rộng Giới Hạn Tái Sinh" trong Gem Shop)
export function getMaxRebirths() {
  const level = state.gemUpgrades.rebirthCap || 0;
  return BASE_MAX_REBIRTHS + level * REBIRTH_CAP_BONUS_PER_LEVEL;
}

// Số Lượt Tái Sinh (chưa bị giới hạn trần) sẽ nhận được nếu Tái Sinh ngay bây giờ - nhận theo CỤM, không phải +1
// Trả về BigNum vì totalBucksEarned không giới hạn nên rebirthsRaw (trước khi bị giới hạn trần) cũng vậy.
export function calculateRebirthsGain() {
  const boostLevel = state.gemUpgrades.rebirthBoost || 0;
  const boostMultiplier = 1 + boostLevel * REBIRTH_BOOST_PER_LEVEL;
  const base = Big.sqrt(Big.div(state.totalBucksEarned, Big.fromNumber(REBIRTH_BULK_DIVISOR)));
  return Big.max(Big.fromNumber(0), Big.floor(Big.scale(base, REBIRTH_BULK_MULTIPLIER * boostMultiplier)));
}

// ---------------- Prestige / Đá Quý ----------------

// Số Đá Quý sẽ nhận được nếu Tái Sinh ngay bây giờ
export function calculatePrestigeGems() {
  const base = Big.sqrt(Big.div(state.totalBucksEarned, Big.fromNumber(PRESTIGE_DIVISOR)));
  return Big.floor(Big.scale(base, getPrestigeGemMultiplier()));
}

// Tính giá hiện tại của 1 item Cửa Hàng Đá Quý hoặc Cửa Hàng Chí Mạng, dựa theo số lượng đã mua
function getShopUpgradeCost(upgrade, countStore, rate) {
  const count = countStore[upgrade.id] || 0;
  return Big.scale(Big.pow(Big.fromNumber(rate), count), upgrade.baseCost);
}

export function getGemUpgradeCost(gemUpgrade) {
  return getShopUpgradeCost(gemUpgrade, state.gemUpgrades, GEM_UPGRADE_COST_RATE);
}

export function getCritUpgradeCost(critUpgrade) {
  return getShopUpgradeCost(critUpgrade, state.critUpgrades, CRIT_UPGRADE_COST_RATE);
}

// Mua 1 item trong Cửa Hàng Đá Quý (buff % vĩnh viễn, không mất khi Tái Sinh)
export function purchaseGemUpgrade(id) {
  const gemUpgrade = gemUpgrades.find((g) => g.id === id);
  const cost = getGemUpgradeCost(gemUpgrade);
  if (Big.gte(state.gems, cost)) {
    state.gems = Big.sub(state.gems, cost);
    state.gemUpgrades[id] = (state.gemUpgrades[id] || 0) + 1;
    updateDisplay();
    updateGemUpgradeElement(gemUpgrade);
    showUpgradeAnimation(gemUpgrade.name);
    playPurchaseSound();
  }
}

// Mua 1 item trong Cửa Hàng Chí Mạng (buff % vĩnh viễn, không mất khi Tái Sinh)
export function purchaseCritUpgrade(id) {
  const critUpgrade = critUpgrades.find((c) => c.id === id);
  const cost = getCritUpgradeCost(critUpgrade);
  if (Big.gte(state.gems, cost)) {
    state.gems = Big.sub(state.gems, cost);
    state.critUpgrades[id] = (state.critUpgrades[id] || 0) + 1;
    updateDisplay();
    updateCritUpgradeElement(critUpgrade);
    showUpgradeAnimation(critUpgrade.name);
    playPurchaseSound();
  }
}

// Tái Sinh: reset tiến trình hiện tại để đổi lấy Đá Quý + 1 CỤM Lượt Tái Sinh (có giới hạn trần)
export function prestige() {
  const gemsToGain = calculatePrestigeGems();
  const rebirthsRaw = calculateRebirthsGain();

  if (Big.lt(gemsToGain, Big.fromNumber(1)) && Big.lt(rebirthsRaw, Big.fromNumber(1))) {
    alert(
      "Bạn cần kiếm thêm Nexyroth trước khi Tái Sinh được (chưa đủ để đổi Đá Quý/Lượt Tái Sinh)."
    );
    return;
  }

  const maxRebirths = getMaxRebirths();
  const rebirthsRoom = Math.max(0, maxRebirths - state.prestigeCount);
  const rebirthsActuallyGained = Big.toNumber(Big.min(rebirthsRaw, Big.fromNumber(rebirthsRoom)));
  const wasted = Big.sub(rebirthsRaw, Big.fromNumber(rebirthsActuallyGained));

  const confirmed = confirm(
    `Tái Sinh sẽ reset Nexyroth, Hệ Số Nhân, CPS, Cấp Độ và Nâng Cấp về ban đầu.\n` +
      `Đổi lại bạn nhận được ${formatNumber(gemsToGain)} Đá Quý và ${rebirthsActuallyGained} Lượt Tái Sinh` +
      (Big.gt(wasted, Big.fromNumber(0))
        ? ` (tính ra được ${formatNumber(rebirthsRaw)} nhưng "ngân hàng" Lượt Tái Sinh chỉ chứa tối đa ${maxRebirths}, dư ${formatNumber(wasted)} lượt bị lãng phí - hãy Thăng Thiên hoặc mua thêm "Mở Rộng Giới Hạn Tái Sinh" trong Cửa Hàng Đá Quý!)`
        : ".") +
      `\nĐá Quý, Thành Tựu, Tổng Số Click, Cửa Hàng Đá Quý và Cửa Hàng Chí Mạng sẽ được giữ nguyên.\n\n` +
      `Bạn chắc chắn muốn Tái Sinh chứ?`
  );
  if (!confirmed) return;

  state.gems = Big.add(state.gems, gemsToGain);
  state.totalGemsEarned = Big.add(state.totalGemsEarned, gemsToGain);
  state.prestigeCount = Math.min(maxRebirths, state.prestigeCount + rebirthsActuallyGained);
  state.totalPrestigesEver = Big.add(state.totalPrestigesEver, Big.fromNumber(rebirthsActuallyGained));
  state.weeklyProgress.prestiges += rebirthsActuallyGained;

  // Reset về giá trị GỐC (base) - buff % của Cửa Hàng Đá Quý/Chí Mạng áp dụng động, không cần cộng lại ở đây
  state.bucks = Big.fromNumber(getStartingBucks());
  state.mult = Big.fromNumber(1);
  state.cps = Big.fromNumber(0);
  state.level = 1;
  state.xp = Big.fromNumber(0);
  state.neededXP = Big.fromNumber(100);
  state.nextLevelReward = Big.fromNumber(200);
  state.upgrades = {};
  state.totalBucksEarned = Big.fromNumber(0);

  playPrestigeSound();
  saveGame();
  setTimeout(() => location.reload(), 700); // chờ dứt tiếng nhạc rồi mới reload
}

// ---------------- Thăng Thiên (Ascension) ----------------

// Thăng Thiên đã mở khoá chưa (dựa theo số lần Tái Sinh trong chu kỳ hiện tại)
export function isAscensionUnlocked() {
  return state.prestigeCount >= getEffectiveAscensionUnlockCount();
}

// Tổng số Tinh Thể "xứng đáng có" = phần tính theo lifetime (tích luỹ trọn đời) CỘNG phần thưởng
// theo số Lượt Tái Sinh đang giữ NGAY LÚC NÀY (giữ càng nhiều thì Thăng Thiên càng lời)
function totalCrystalsEarnable() {
  const lifetimeComponent = Big.floor(
    Big.sqrt(Big.div(state.totalPrestigesEver, Big.fromNumber(ASCENSION_PRESTIGE_DIVISOR)))
  );
  const heldComponent = Math.floor(
    state.prestigeCount * CRYSTAL_PER_HELD_REBIRTH * getAscensionHeldBonusMultiplier()
  );
  const sum = Big.add(lifetimeComponent, Big.fromNumber(heldComponent));
  return Big.floor(Big.scale(sum, getAscensionCrystalBonus()));
}

// Số Tinh Thể MỚI sẽ nhận được nếu Thăng Thiên ngay bây giờ (đã trừ phần đã nhận ở các lần Thăng Thiên trước)
export function calculateAscensionCrystals() {
  return Big.max(Big.fromNumber(0), Big.sub(totalCrystalsEarnable(), state.crystalsClaimedFromPrestiges));
}

// Thăng Thiên: reset toàn bộ tiến trình Tái Sinh (Đá Quý, Cửa Hàng Đá Quý/Chí Mạng, số lần Tái Sinh)
// để đổi lấy Tinh Thể - dùng nâng cấp Cây Kỹ Năng vĩnh viễn
export function ascend() {
  if (!isAscensionUnlocked()) {
    alert(
      `Bạn cần Tái Sinh ít nhất ${getEffectiveAscensionUnlockCount()} lần mới mở khoá được Thăng Thiên.`
    );
    return;
  }

  const crystalsToGain = calculateAscensionCrystals();
  if (Big.lt(crystalsToGain, Big.fromNumber(1))) {
    alert(
      `Bạn cần tích luỹ thêm số lần Tái Sinh trọn đời trước khi Thăng Thiên nhận thêm Tinh Thể được (cứ đủ ${ASCENSION_PRESTIGE_DIVISOR} lần Tái Sinh trọn đời là được thêm mốc mới).`
    );
    return;
  }

  const confirmed = confirm(
    `Thăng Thiên sẽ reset TOÀN BỘ: Đá Quý, Cửa Hàng Đá Quý, Cửa Hàng Chí Mạng, số lần Tái Sinh, và cả lượt chơi hiện tại (Nexyroth/Hệ Số Nhân/CPS/Cấp Độ/Nâng Cấp) về ban đầu.\n` +
      `Đổi lại bạn nhận được ${formatNumber(crystalsToGain)} Tinh Thể để nâng cấp Cây Kỹ Năng (giữ vĩnh viễn) - đang giữ ${state.prestigeCount} Lượt Tái Sinh nên được thưởng thêm, giữ càng nhiều Lượt Tái Sinh thì Thăng Thiên càng lời!\n` +
      `Tinh Thể, Cây Kỹ Năng, Cổ Vật/Di Vật, Thành Tựu, Tổng Số Click và số lần Tái Sinh TRỌN ĐỜI sẽ được giữ nguyên.\n\n` +
      `Bạn chắc chắn muốn Thăng Thiên chứ?`
  );
  if (!confirmed) return;

  state.crystals = Big.add(state.crystals, crystalsToGain);
  state.totalCrystalsEarned = Big.add(state.totalCrystalsEarned, crystalsToGain);
  state.crystalsClaimedFromPrestiges = Big.add(state.crystalsClaimedFromPrestiges, crystalsToGain);
  state.ascensionCount += 1;
  state.weeklyProgress.ascensions += 1;

  state.gems = Big.fromNumber(0);
  state.gemUpgrades = {};
  state.critUpgrades = {};
  state.prestigeCount = 0;

  state.bucks = Big.fromNumber(getStartingBucks() + getAscensionStartBonus());
  state.mult = Big.fromNumber(1);
  state.cps = Big.fromNumber(0);
  state.level = 1;
  state.xp = Big.fromNumber(0);
  state.neededXP = Big.fromNumber(100);
  state.nextLevelReward = Big.fromNumber(200);
  state.upgrades = {};
  state.totalBucksEarned = Big.fromNumber(0);

  playAscendSound();
  saveGame();
  setTimeout(() => location.reload(), 1000); // chờ dứt tiếng nhạc rồi mới reload
}
