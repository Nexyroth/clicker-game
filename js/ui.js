import { elements } from "./dom.js";
import { state } from "./state.js";
import * as Big from "./numeric.js";
import {
  upgrades,
  achievements,
  CRIT_MIN_MULT,
  CRIT_MAX_MULT,
  CRIT_DAMAGE_BONUS_PER_LEVEL,
} from "./data.js";
import { effects, isGoldenBuffActive } from "./effects.js";
import { purchaseUpgrade, getUpgradeCost } from "./game.js";
import {
  calculatePrestigeGems,
  getEffectiveMult,
  getEffectiveCps,
  getEffectiveCritChance,
} from "./prestige.js";
import { updateGemShopAvailability, updateCritShopAvailability } from "./ui-prestige.js";

// Format số lớn cho dễ đọc (1.2K, 3.4M, ..., rồi Qa/Qi/Sx/.../Vg/... khi cực lớn) - xem numeric.js
export function formatNumber(num) {
  return Big.format(num);
}

// Cập nhật toàn bộ giao diện theo state hiện tại
export function updateDisplay() {
  elements.userClicks.textContent = formatNumber(state.allTimeClicks);
  elements.userBucks.textContent = formatNumber(state.bucks);
  elements.userMult.textContent = Big.formatDecimal(getEffectiveMult()) + "x";
  elements.userCps.textContent = Big.formatDecimal(getEffectiveCps());
  elements.userLevel.textContent = state.level;
  elements.nextLevelReward.textContent = formatNumber(state.nextLevelReward);
  elements.xp.textContent = formatNumber(state.xp);
  elements.neededXp.textContent = formatNumber(state.neededXP);

  const xpPercentage = Big.toNumber(Big.div(state.xp, state.neededXP)) * 100;
  elements.xpBar.style.width = `${xpPercentage}%`;
  elements.xpPercentage.textContent = `${Math.round(xpPercentage)}%`;

  elements.userGems.textContent = formatNumber(state.gems);
  elements.prestigePotential.textContent = formatNumber(calculatePrestigeGems());
  elements.prestigeCount.textContent = formatNumber(state.prestigeCount);

  elements.critChanceDisplay.textContent = `${(getEffectiveCritChance() * 100).toFixed(1)}%`;
  elements.critDamageDisplay.textContent = `x${critMinDisplay()}-${critMaxDisplay()}`;

  updateUpgradeAvailability();
  updateGemShopAvailability();
  updateCritShopAvailability();
  updateEffectsIndicators();
}

// Hiển thị khoảng sát thương chí mạng hiện tại (đã tính buff Sát Thương Chí Mạng)
function critMinDisplay() {
  const level = state.critUpgrades.critDamage || 0;
  return formatNumber(
    Math.round(CRIT_MIN_MULT * (1 + level * CRIT_DAMAGE_BONUS_PER_LEVEL))
  );
}
function critMaxDisplay() {
  const level = state.critUpgrades.critDamage || 0;
  return formatNumber(
    Math.round(CRIT_MAX_MULT * (1 + level * CRIT_DAMAGE_BONUS_PER_LEVEL))
  );
}

// Cập nhật chỉ báo Combo và buff Cuồng Nhiệt (Hộp Quà Vàng)
function updateEffectsIndicators() {
  if (effects.comboCount > 0) {
    const bonusPercent = Math.round((effects.comboMultiplier - 1) * 100);
    elements.comboIndicator.textContent = `🔥 Combo x${effects.comboCount} (+${bonusPercent}%)`;
    elements.comboIndicator.classList.remove("invisible");
  } else {
    elements.comboIndicator.classList.add("invisible");
  }

  if (isGoldenBuffActive()) {
    const secondsLeft = Math.max(
      0,
      Math.ceil((effects.goldenBuffEndTime - Date.now()) / 1000)
    );
    elements.goldenBuffIndicator.textContent = `🎁 Cuồng Nhiệt x${effects.goldenBuffMultiplier} — còn ${secondsLeft}s`;
    elements.goldenBuffIndicator.classList.remove("invisible");
  } else {
    elements.goldenBuffIndicator.classList.add("invisible");
  }
}

// Bật/tắt nút mua tuỳ theo số Nexyroth hiện có
export function updateUpgradeAvailability() {
  upgrades.forEach((upgrade) => {
    const button = document.querySelector(
      `.upgrade-button[data-id="${upgrade.id}"]`
    );
    if (button) {
      const upgradeElement = button.closest("div");
      if (Big.gte(state.bucks, getUpgradeCost(upgrade))) {
        button.disabled = false;
        upgradeElement.classList.remove("opacity-50");
      } else {
        button.disabled = true;
        upgradeElement.classList.add("opacity-50");
      }
    }
  });
}

// Tạo danh sách nâng cấp trên giao diện
export function createUpgrades() {
  upgrades.forEach((upgrade) => {
    const upgradeElement = document.createElement("div");
    upgradeElement.className =
      "bg-gray-100 rounded p-4 transition-all duration-300 ease-in-out transform hover:scale-105";
    upgradeElement.innerHTML = `
            <h3 class="text-lg font-semibold text-blue-600">${upgrade.name}</h3>
            <p class="text-sm text-gray-600 mb-2">Giá: <span class="text-yellow-500">${formatNumber(
              getUpgradeCost(upgrade)
            )}</span> Nexyroth</p>
            <p class="text-sm">Nhân: <span class="text-green-500">+${
              upgrade.mult
            }</span> | Nexyroth/s: <span class="text-purple-500">+${
      upgrade.cps
    }</span></p>
            <p class="text-xs text-gray-500 mt-1">${upgrade.description}</p>
            <button class="upgrade-button mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300 ease-in-out" data-id="${
              upgrade.id
            }">
                Mua
            </button>
        `;
    elements.upgradesList.appendChild(upgradeElement);
  });

  document.querySelectorAll(".upgrade-button").forEach((button) => {
    button.addEventListener("click", () => purchaseUpgrade(button.dataset.id));
  });
}

// Cập nhật lại giá tiền hiển thị sau khi mua 1 nâng cấp
export function updateUpgradeElement(upgrade) {
  const upgradeElement = document
    .querySelector(`.upgrade-button[data-id="${upgrade.id}"]`)
    .closest("div");
  upgradeElement.querySelector(
    "p"
  ).innerHTML = `Giá: <span class="text-yellow-500">${formatNumber(
    getUpgradeCost(upgrade)
  )}</span> Nexyroth`;
}

// Bật/tắt hiển thị hết nâng cấp hay chỉ nâng cấp mua được (áp dụng class + text nút theo state)
export function updateUpgradesVisibility() {
  if (state.showAllUpgrades) {
    elements.upgradesList.classList.add("show-all");
    elements.toggleUpgrades.textContent = "Ẩn Nâng Cấp Chưa Đủ Tiền";
  } else {
    elements.upgradesList.classList.remove("show-all");
    elements.toggleUpgrades.textContent = "Hiện Tất Cả Nâng Cấp";
  }
}

// Tạo danh sách thành tựu trên giao diện
export function createAchievements() {
  achievements.forEach((achievement) => {
    const achievementElement = document.createElement("div");
    achievementElement.className =
      "achievement bg-gray-100 rounded p-2 flex items-center";
    achievementElement.innerHTML = `
            <div class="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                <span class="text-xl">🔒</span>
            </div>
            <div>
                <h4 class="text-sm font-semibold text-blue-600">${achievement.name}</h4>
                <p class="text-xs text-gray-500">${achievement.description}</p>
            </div>
        `;
    elements.achievementsList.appendChild(achievementElement);
  });
}

// ---------------- Offline Earnings ----------------

// Format thời gian đi vắng cho dễ đọc: "2 giờ 15 phút", "20 phút", "8 giây"
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  if (minutes > 0) return `${minutes} phút`;
  return `${Math.floor(totalSeconds)} giây`;
}

// Hiện popup báo Nexyroth kiếm được trong lúc đi vắng
export function showOfflineEarningsModal(earnings, elapsedSeconds) {
  elements.offlineDuration.textContent = formatDuration(elapsedSeconds);
  elements.offlineEarningsAmount.textContent = formatNumber(earnings);
  elements.offlineEarningsModal.classList.remove("hidden");
  elements.offlineEarningsModal.classList.add("flex");
}
