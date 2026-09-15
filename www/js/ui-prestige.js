import { elements } from "./dom.js";
import { state } from "./state.js";
import * as Big from "./numeric.js";
import { gemUpgrades, critUpgrades } from "./data.js";
import { formatNumber } from "./ui.js";
import {
  purchaseGemUpgrade,
  getGemUpgradeCost,
  purchaseCritUpgrade,
  getCritUpgradeCost,
  isAscensionUnlocked,
  calculateAscensionCrystals,
  getMaxRebirths,
} from "./prestige.js";
import { getEffectiveAscensionUnlockCount } from "./skilltree.js";

// ---------------- Cửa Hàng Đá Quý ----------------

export function updateGemShopAvailability() {
  gemUpgrades.forEach((gemUpgrade) => {
    const button = document.querySelector(
      `.gem-upgrade-button[data-id="${gemUpgrade.id}"]`
    );
    if (button) {
      const gemUpgradeElement = button.closest("div");
      if (Big.gte(state.gems, getGemUpgradeCost(gemUpgrade))) {
        button.disabled = false;
        gemUpgradeElement.classList.remove("opacity-50");
      } else {
        button.disabled = true;
        gemUpgradeElement.classList.add("opacity-50");
      }
    }
  });
}

export function createGemShop() {
  gemUpgrades.forEach((gemUpgrade) => {
    const count = state.gemUpgrades[gemUpgrade.id] || 0;
    const gemUpgradeElement = document.createElement("div");
    gemUpgradeElement.className =
      "gem-upgrade-item bg-pink-50 rounded p-4 transition-all duration-300 ease-in-out transform hover:scale-105";
    gemUpgradeElement.innerHTML = `
            <h3 class="text-lg font-semibold text-pink-600">${
              gemUpgrade.name
            } <span class="text-xs text-gray-500 font-normal level-badge">(cấp ${count})</span></h3>
            <p class="text-sm text-gray-600 mb-2">Giá: <span class="text-pink-500">${formatNumber(
              getGemUpgradeCost(gemUpgrade)
            )}</span> Đá Quý</p>
            <p class="text-xs text-gray-500 mt-1">${gemUpgrade.description}</p>
            <button class="gem-upgrade-button mt-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300 ease-in-out" data-id="${
              gemUpgrade.id
            }">
                Mua
            </button>
        `;
    elements.gemShopList.appendChild(gemUpgradeElement);
  });

  document.querySelectorAll(".gem-upgrade-button").forEach((button) => {
    button.addEventListener("click", () => purchaseGemUpgrade(button.dataset.id));
  });
}

export function updateGemUpgradeElement(gemUpgrade) {
  const count = state.gemUpgrades[gemUpgrade.id] || 0;
  const gemUpgradeElement = document
    .querySelector(`.gem-upgrade-button[data-id="${gemUpgrade.id}"]`)
    .closest("div");
  gemUpgradeElement.querySelector(".level-badge").textContent = `(cấp ${count})`;
  gemUpgradeElement.querySelector(
    "p"
  ).innerHTML = `Giá: <span class="text-pink-500">${formatNumber(
    getGemUpgradeCost(gemUpgrade)
  )}</span> Đá Quý`;
}

// ---------------- Cửa Hàng Chí Mạng ----------------

export function updateCritShopAvailability() {
  critUpgrades.forEach((critUpgrade) => {
    const button = document.querySelector(
      `.crit-upgrade-button[data-id="${critUpgrade.id}"]`
    );
    if (button) {
      const critUpgradeElement = button.closest("div");
      if (Big.gte(state.gems, getCritUpgradeCost(critUpgrade))) {
        button.disabled = false;
        critUpgradeElement.classList.remove("opacity-50");
      } else {
        button.disabled = true;
        critUpgradeElement.classList.add("opacity-50");
      }
    }
  });
}

export function createCritShop() {
  critUpgrades.forEach((critUpgrade) => {
    const count = state.critUpgrades[critUpgrade.id] || 0;
    const critUpgradeElement = document.createElement("div");
    critUpgradeElement.className =
      "crit-upgrade-item bg-orange-50 rounded p-4 transition-all duration-300 ease-in-out transform hover:scale-105";
    critUpgradeElement.innerHTML = `
            <h3 class="text-lg font-semibold text-orange-600">${
              critUpgrade.name
            } <span class="text-xs text-gray-500 font-normal level-badge">(cấp ${count})</span></h3>
            <p class="text-sm text-gray-600 mb-2">Giá: <span class="text-pink-500">${formatNumber(
              getCritUpgradeCost(critUpgrade)
            )}</span> Đá Quý</p>
            <p class="text-xs text-gray-500 mt-1">${critUpgrade.description}</p>
            <button class="crit-upgrade-button mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded text-sm transition duration-300 ease-in-out" data-id="${
              critUpgrade.id
            }">
                Mua
            </button>
        `;
    elements.critShopList.appendChild(critUpgradeElement);
  });

  document.querySelectorAll(".crit-upgrade-button").forEach((button) => {
    button.addEventListener("click", () => purchaseCritUpgrade(button.dataset.id));
  });
}

export function updateCritUpgradeElement(critUpgrade) {
  const count = state.critUpgrades[critUpgrade.id] || 0;
  const critUpgradeElement = document
    .querySelector(`.crit-upgrade-button[data-id="${critUpgrade.id}"]`)
    .closest("div");
  critUpgradeElement.querySelector(".level-badge").textContent = `(cấp ${count})`;
  critUpgradeElement.querySelector(
    "p"
  ).innerHTML = `Giá: <span class="text-pink-500">${formatNumber(
    getCritUpgradeCost(critUpgrade)
  )}</span> Đá Quý`;
}

// ---------------- Thăng Thiên (Ascension) ----------------

// Cập nhật khu vực Tinh Thể + Lượt Tái Sinh (như 1 loại tiền tệ) + trạng thái Thăng Thiên
export function renderAscensionPanel() {
  elements.userCrystals.textContent = formatNumber(state.crystals);

  const maxRebirths = getMaxRebirths();
  const unlockThreshold = getEffectiveAscensionUnlockCount();
  const thresholdNote =
    unlockThreshold < maxRebirths
      ? ` (cần đạt ${formatNumber(unlockThreshold)} để Thăng Thiên)`
      : "";
  const rebirthsText = `💰 Lượt Tái Sinh: ${formatNumber(
    state.prestigeCount
  )} / ${formatNumber(maxRebirths)}${thresholdNote}`;

  if (!isAscensionUnlocked()) {
    elements.ascensionStatus.textContent = `${rebirthsText} — 🔒 cần đầy (hoặc gần đầy) "ngân hàng" Lượt Tái Sinh mới mở khoá Thăng Thiên. Tái Sinh thêm để tích luỹ, hoặc mua "Mở Rộng Giới Hạn Tái Sinh" trong Cửa Hàng Đá Quý để tăng trần.`;
    elements.ascendButton.disabled = true;
    elements.ascendButton.textContent = "Chưa mở khoá";
  } else {
    const crystalsToGain = calculateAscensionCrystals();
    elements.ascensionStatus.textContent = `${rebirthsText} — ✅ Đã đủ, có thể Thăng Thiên! Thăng Thiên ngay sẽ nhận ${formatNumber(
      crystalsToGain
    )} Tinh Thể. Tổng Lượt Tái Sinh trọn đời: ${formatNumber(
      state.totalPrestigesEver
    )}. Đã Thăng Thiên ${formatNumber(state.ascensionCount)} lần.`;
    elements.ascendButton.disabled = Big.lt(crystalsToGain, Big.fromNumber(1));
    elements.ascendButton.textContent = "Thăng Thiên";
  }
}
