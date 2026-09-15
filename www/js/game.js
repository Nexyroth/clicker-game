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
  updateUpgradesForNewBuyMode,
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
import { isAutoClickerBuffActive } from "./items.js";
import { getEffectiveOfflineEfficiency } from "./bonuses.js";
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

  if (Big.gt(clickValue, state.personalBests.maxClickValue)) {
    state.personalBests.maxClickValue = clickValue;
  }
  effects.recentClickTimestamps.push(now);
  effects.recentClickTimestamps = effects.recentClickTimestamps.filter((t) => now - t <= 10000);
  if (effects.recentClickTimestamps.length > state.personalBests.maxClicksIn10s) {
    state.personalBests.maxClicksIn10s = effects.recentClickTimestamps.length;
  }

  state.xp = Big.add(state.xp, clickValue);
  state.allTimeClicks = Big.add(state.allTimeClicks, clickValue);
  earnBucks(clickValue);
  damageBoss(clickValue);
  if (Big.gte(state.xp, state.neededXP)) {
    levelUp();
  }
  updateDisplay();
  animateClickButton(isCrit);
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
  const currentCps = getEffectiveCps();
  if (Big.gt(currentCps, state.personalBests.maxEffectiveCps)) {
    state.personalBests.maxEffectiveCps = currentCps;
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

// Giả lập bấm Click Ngay! liên tục khi Thuốc Auto Click đang hiệu lực - chạy ở nhịp riêng
// (AUTO_CLICKER_TICK_MS, xem items.js) NHANH HƠN nhịp CPS 1 giây ở trên, nên KHÔNG dùng chung
// setInterval với autoClick(). Chỉ 1 setInterval duy nhất gọi hàm này (đăng ký ở main.js), tự
// no-op khi buff hết hạn - không tạo thêm timer nào khác.
export function autoClickerPotionTick() {
  if (isAutoClickerBuffActive()) {
    clickActions();
  }
}

// Tính giá hiện tại của 1 nâng cấp thường, dựa theo số lượng đã mua
export function getUpgradeCost(upgrade) {
  const count = state.upgrades[upgrade.id] || 0;
  return Big.scale(Big.pow(Big.fromNumber(UPGRADE_COST_RATE), count), upgrade.baseCost);
}

// Chế độ mua hàng loạt hiện tại: 1 | 10 | 25 | "max" - lựa chọn UI thuần tuý (không phải dữ liệu
// gameplay nên không lưu vào state/save), áp dụng chung cho toàn bộ nâng cấp thường.
export let buyQuantityMode = 1;

export function setBuyQuantityMode(mode) {
  buyQuantityMode = mode;
  updateUpgradesForNewBuyMode();
}

// Tổng giá khi mua liền `qty` cái tiếp theo của 1 nâng cấp - đây là tổng cấp số nhân
// baseCost*rate^count * (rate^qty - 1)/(rate-1), tính bằng BigNum để không tràn số dù giá đã cực lớn.
export function getBulkUpgradeCost(upgrade, qty) {
  if (qty <= 0) return Big.fromNumber(0);
  const firstCost = getUpgradeCost(upgrade);
  if (qty === 1) return firstCost;
  const rate = UPGRADE_COST_RATE;
  const sumFactor = Big.div(
    Big.sub(Big.pow(Big.fromNumber(rate), qty), Big.fromNumber(1)),
    Big.fromNumber(rate - 1)
  );
  return Big.mul(firstCost, sumFactor);
}

// Số lượng TỐI ĐA có thể mua liền của 1 nâng cấp với số Nexyroth hiện có (dùng cho chế độ "xMax").
// Giải ngược phương trình tổng cấp số nhân bằng log10 (an toàn với BigNum cực lớn), rồi tự sửa sai số
// làm tròn dấu phẩy động bằng cách kiểm tra lại 1 bước quanh kết quả ước lượng.
export function getMaxAffordableQuantity(upgrade) {
  const firstCost = getUpgradeCost(upgrade);
  if (Big.lt(state.bucks, firstCost)) return 0;

  const rate = UPGRADE_COST_RATE;
  const ratio = Big.add(
    Big.scale(Big.div(state.bucks, firstCost), rate - 1),
    Big.fromNumber(1)
  );
  let estimate = Math.max(1, Math.floor(Big.log10(ratio) / Math.log10(rate)));

  while (Big.gt(getBulkUpgradeCost(upgrade, estimate), state.bucks)) {
    estimate -= 1;
  }
  while (Big.lte(getBulkUpgradeCost(upgrade, estimate + 1), state.bucks)) {
    estimate += 1;
  }
  return Math.max(0, estimate);
}

// Số lượng THỰC TẾ sẽ mua theo chế độ đang chọn (xMax quy đổi ra 1 số cụ thể ngay lúc này)
export function getEffectiveBuyQuantity(upgrade) {
  return buyQuantityMode === "max" ? getMaxAffordableQuantity(upgrade) : buyQuantityMode;
}

// Mua nâng cấp thường - số lượng theo chế độ mua hàng loạt đang chọn (x1/x10/x25/xMax)
export function purchaseUpgrade(id) {
  const upgrade = upgrades.find((u) => u.id === id);
  const qty = getEffectiveBuyQuantity(upgrade);
  if (qty <= 0) return;

  const cost = getBulkUpgradeCost(upgrade, qty);
  if (Big.gte(state.bucks, cost)) {
    state.bucks = Big.sub(state.bucks, cost);
    state.mult = Big.add(state.mult, Big.fromNumber(upgrade.mult * qty));
    state.cps = Big.add(state.cps, Big.fromNumber(upgrade.cps * qty));
    state.upgrades[id] = (state.upgrades[id] || 0) + qty;
    state.dailyProgress.upgradesBought += qty;
    state.weeklyProgress.upgradesBought += qty;
    updateDisplay();
    updateUpgradeElement(upgrade);
    showUpgradeAnimation(qty > 1 ? `${upgrade.name} x${qty}` : upgrade.name);
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

  const earnings = Big.floor(Big.scale(getEffectiveCps(), cappedSeconds * getEffectiveOfflineEfficiency()));
  if (Big.gt(earnings, Big.fromNumber(0))) {
    // Không dùng earnBucks() ở đây vì earnBucks() chỉ cộng tiền tệ cho 1 Thế Giới đang chọn -
    // lúc offline coi như không "đứng" ở Thế Giới nào cả, nên cộng cho TẤT CẢ Thế Giới đã mở khoá luôn
    state.bucks = Big.add(state.bucks, earnings);
    state.totalBucksEarned = Big.add(state.totalBucksEarned, earnings);
    state.dailyProgress.bucksEarned = Big.add(state.dailyProgress.bucksEarned, earnings);
    state.weeklyProgress.bucksEarned = Big.add(state.weeklyProgress.bucksEarned, earnings);
    addWorldCurrencyToAllUnlocked(earnings);
    showOfflineEarningsModal(earnings, cappedSeconds, getEffectiveOfflineEfficiency());
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
