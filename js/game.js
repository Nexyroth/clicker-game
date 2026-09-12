import { state } from "./state.js";
import { effects } from "./effects.js";
import * as Big from "./numeric.js";
import {
  upgrades,
  achievements,
  REWARD_RATE,
  XP_RATE,
  UPGRADE_COST_RATE,
  CRIT_MIN_MULT,
  CRIT_MAX_MULT,
  CRIT_DAMAGE_BONUS_PER_LEVEL,
  MAX_OFFLINE_SECONDS,
  MIN_OFFLINE_SECONDS_FOR_POPUP,
  COMBO_WINDOW_MS,
  COMBO_BONUS_PER_STEP,
  COMBO_MAX_STEPS,
  GOLDEN_GIFT_BUFF_MULTIPLIER,
  GOLDEN_GIFT_BUFF_DURATION_MS,
} from "./data.js";
import { elements } from "./dom.js";
import {
  updateDisplay,
  updateUpgradeElement,
  updateUpgradesVisibility,
  showOfflineEarningsModal,
  formatNumber,
} from "./ui.js";
import {
  animateClickButton,
  showClickFloatingNumber,
  showLevelUpAnimation,
  showUpgradeAnimation,
  showAchievementAnimation,
  showGoldenBuffAnimation,
} from "./animations.js";
import { getEffectiveMult, getEffectiveCps, getEffectiveCritChance } from "./prestige.js";
import { getAscensionCritDamageBonus } from "./skilltree.js";
import { damageBoss } from "./boss.js";
import {
  getCollectionComboBonusMultiplier,
  getCollectionCritDamageBonus,
  getCollectionGoldenBuffDurationBonusMs,
} from "./collection.js";
import { getPetCritDamageBonus, addWorldCurrencyFromBucks, addWorldCurrencyToAllUnlocked } from "./worlds.js";
import { getDivineBeastCritDamageBonus } from "./nirvana.js";
import {
  playClickSound,
  playPurchaseSound,
  playLevelUpSound,
  playAchievementSound,
  playGoldenGiftSound,
} from "./sounds.js";

// ---------------- Gameplay chính ----------------

// Cộng Nexyroth kiếm được, đồng thời cộng dồn vào tổng đã kiếm (dùng để tính Đá Quý khi Tái Sinh)
export function earnBucks(amount) {
  state.bucks = Big.add(state.bucks, amount);
  state.totalBucksEarned = Big.add(state.totalBucksEarned, amount);
  state.dailyProgress.bucksEarned = Big.add(state.dailyProgress.bucksEarned, amount);
  state.weeklyProgress.bucksEarned = Big.add(state.weeklyProgress.bucksEarned, amount);
  addWorldCurrencyFromBucks(amount);
}

// Xử lý khi người chơi bấm nút Click Ngay!
export function clickActions() {
  const now = Date.now();
  if (now - effects.lastClickTime <= COMBO_WINDOW_MS) {
    effects.comboCount = Math.min(effects.comboCount + 1, COMBO_MAX_STEPS);
  } else {
    effects.comboCount = 1;
  }
  effects.lastClickTime = now;
  const effectiveComboStep =
    COMBO_BONUS_PER_STEP * getCollectionComboBonusMultiplier();
  effects.comboMultiplier = 1 + effects.comboCount * effectiveComboStep;
  if (effects.comboCount > state.maxCombo) {
    state.maxCombo = effects.comboCount;
  }
  if (effects.comboCount > state.dailyProgress.maxCombo) {
    state.dailyProgress.maxCombo = effects.comboCount;
  }
  if (effects.comboCount > state.weeklyProgress.maxCombo) {
    state.weeklyProgress.maxCombo = effects.comboCount;
  }

  state.totalClickActions += 1;
  state.dailyProgress.clicks += 1;
  state.weeklyProgress.clicks += 1;

  const effectiveMult = getEffectiveMult();
  const isCrit = Math.random() < getEffectiveCritChance();

  let critMult = 1;
  if (isCrit) {
    state.totalCrits += 1;
    state.dailyProgress.crits += 1;
    state.weeklyProgress.crits += 1;
    const baseCritRoll =
      Math.floor(Math.random() * (CRIT_MAX_MULT - CRIT_MIN_MULT + 1)) +
      CRIT_MIN_MULT;
    const critDamageLevel = state.critUpgrades.critDamage || 0;
    critMult =
      baseCritRoll *
      (1 + critDamageLevel * CRIT_DAMAGE_BONUS_PER_LEVEL) *
      getAscensionCritDamageBonus() *
      getCollectionCritDamageBonus() *
      getPetCritDamageBonus() *
      getDivineBeastCritDamageBonus();
  }

  const clickValue = Big.floor(Big.scale(effectiveMult, critMult));

  state.xp = Big.add(state.xp, clickValue);
  state.allTimeClicks = Big.add(state.allTimeClicks, clickValue);
  earnBucks(clickValue);
  damageBoss(clickValue);
  if (Big.gte(state.xp, state.neededXP)) {
    levelUp();
  }
  updateDisplay();
  animateClickButton();
  showClickFloatingNumber(formatNumber(clickValue), isCrit);
  playClickSound(isCrit);
}

// Kiểm tra combo có bị "nguội" không (không click trong COMBO_WINDOW_MS) - chạy định kỳ
// Đồng thời làm nơi cập nhật giao diện cho Combo/Buff Cuồng Nhiệt theo thời gian thực
export function tickEffects() {
  if (
    effects.comboCount > 0 &&
    Date.now() - effects.lastClickTime > COMBO_WINDOW_MS
  ) {
    effects.comboCount = 0;
    effects.comboMultiplier = 1;
  }
  state.totalPlaytimeMs += 300;
  updateDisplay();
}

// Lên level
export function levelUp() {
  state.level++;
  state.xp = Big.fromNumber(0);
  earnBucks(state.nextLevelReward);
  state.nextLevelReward = Big.floor(
    Big.add(state.nextLevelReward, Big.fromNumber(100 * state.level * REWARD_RATE))
  );
  state.neededXP = Big.floor(
    Big.add(state.neededXP, Big.fromNumber(100 * state.level * XP_RATE))
  );
  updateDisplay();
  showLevelUpAnimation();
  playLevelUpSound();
}

// Tự động click theo CPS (chạy mỗi giây)
export function autoClick() {
  const effectiveCps = getEffectiveCps();
  earnBucks(effectiveCps);
  state.xp = Big.add(state.xp, effectiveCps);
  state.allTimeClicks = Big.add(state.allTimeClicks, effectiveCps);
  if (Big.gte(state.xp, state.neededXP)) {
    levelUp();
  }
  updateDisplay();
}

// Tính giá hiện tại của 1 nâng cấp thường, dựa theo số lượng đã mua
export function getUpgradeCost(upgrade) {
  const count = state.upgrades[upgrade.id] || 0;
  return Big.scale(Big.pow(Big.fromNumber(UPGRADE_COST_RATE), count), upgrade.baseCost);
}

// Mua 1 nâng cấp thường
export function purchaseUpgrade(id) {
  const upgrade = upgrades.find((u) => u.id === id);
  const cost = getUpgradeCost(upgrade);
  if (Big.gte(state.bucks, cost)) {
    state.bucks = Big.sub(state.bucks, cost);
    state.mult = Big.add(state.mult, Big.fromNumber(upgrade.mult));
    state.cps = Big.add(state.cps, Big.fromNumber(upgrade.cps));
    state.upgrades[id] = (state.upgrades[id] || 0) + 1;
    state.dailyProgress.upgradesBought += 1;
    state.weeklyProgress.upgradesBought += 1;
    updateDisplay();
    updateUpgradeElement(upgrade);
    showUpgradeAnimation(upgrade.name);
    playPurchaseSound();
  }
}

// Kiểm tra điều kiện mở khoá thành tựu (chạy mỗi giây)
export function checkAchievements() {
  achievements.forEach((achievement) => {
    if (!state.achievements[achievement.id] && achievement.condition(state)) {
      unlockAchievement(achievement);
    }
  });
}

// Mở khoá 1 thành tựu
export function unlockAchievement(achievement) {
  state.achievements[achievement.id] = true;
  const achievementElement = document.querySelector(
    `.achievement:nth-child(${achievements.indexOf(achievement) + 1})`
  );
  achievementElement.classList.add("unlocked");
  achievementElement.querySelector(".bg-gray-300").innerHTML =
    '<span class="text-xl">🏆</span>';
  showAchievementAnimation(achievement.name);
  playAchievementSound();
}

// Bật/tắt hiển thị hết nâng cấp hay chỉ nâng cấp mua được
export function toggleAllUpgrades() {
  state.showAllUpgrades = !state.showAllUpgrades;
  updateUpgradesVisibility();
}

// Bật/tắt dark mode
export function applyDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

// Khởi tạo dark mode dựa theo lựa chọn đã lưu trước đó (mặc định BẬT Dark Cyberpunk cho người chơi mới)
export function initDarkMode() {
  const stored = localStorage.getItem("darkMode");
  const savedDarkMode = stored === null ? true : stored === "true";
  state.darkMode = savedDarkMode;
  elements.darkModeToggle.checked = savedDarkMode;
  applyDarkMode(savedDarkMode);
}

// Khởi tạo trạng thái nút bật/tắt âm thanh theo state đã lưu
export function initSfxToggle() {
  elements.sfxToggle.checked = state.sfxEnabled;
}

// ---------------- Offline Earnings ----------------

// Tính Nexyroth kiếm được trong lúc rời trang, cộng vào state và hiện popup nếu đáng kể
export function processOfflineEarnings() {
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - (state.lastSaveTime || now)) / 1000);
  const cappedSeconds = Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS);
  state.lastSaveTime = now;

  if (cappedSeconds < MIN_OFFLINE_SECONDS_FOR_POPUP) return;

  const earnings = Big.floor(Big.scale(getEffectiveCps(), cappedSeconds));
  if (Big.gt(earnings, Big.fromNumber(0))) {
    // Không dùng earnBucks() ở đây vì earnBucks() chỉ cộng tiền tệ cho 1 Thế Giới đang chọn -
    // lúc offline coi như không "đứng" ở Thế Giới nào cả, nên cộng cho TẤT CẢ Thế Giới đã mở khoá luôn
    state.bucks = Big.add(state.bucks, earnings);
    state.totalBucksEarned = Big.add(state.totalBucksEarned, earnings);
    state.dailyProgress.bucksEarned = Big.add(state.dailyProgress.bucksEarned, earnings);
    state.weeklyProgress.bucksEarned = Big.add(state.weeklyProgress.bucksEarned, earnings);
    addWorldCurrencyToAllUnlocked(earnings);
    showOfflineEarningsModal(earnings, cappedSeconds);
  }
}

// ---------------- Hộp Quà Vàng ----------------

// Kích hoạt buff Cuồng Nhiệt sau khi bấm trúng Hộp Quà Vàng
export function activateGoldenBuff() {
  effects.goldenBuffMultiplier = GOLDEN_GIFT_BUFF_MULTIPLIER;
  effects.goldenBuffEndTime =
    Date.now() + GOLDEN_GIFT_BUFF_DURATION_MS + getCollectionGoldenBuffDurationBonusMs();
  state.goldenGiftsClicked += 1;
  state.dailyProgress.goldenGifts += 1;
  state.weeklyProgress.goldenGifts += 1;
  showGoldenBuffAnimation();
  updateDisplay();
  playGoldenGiftSound();
}
