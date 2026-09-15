import { elements } from "./dom.js";
import { state } from "./state.js";
import { relics, artifacts, achievements } from "./data.js";
import { formatNumber } from "./ui.js";
import { getMaxRebirths, getAchievementBonus } from "./prestige.js";

function formatPlaytime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  if (minutes > 0) return `${minutes} phút ${seconds} giây`;
  return `${seconds} giây`;
}

function statRow(label, value) {
  return `
    <div class="flex items-center justify-between py-2 border-b border-gray-100">
      <span class="text-sm text-gray-600">${label}</span>
      <span class="text-sm font-bold text-gray-800">${value}</span>
    </div>
  `;
}

function sectionHeader(label) {
  return `<p class="text-xs font-bold text-gray-400 uppercase tracking-wide mt-4 mb-1">${label}</p>`;
}

// Vẽ lại Bảng Thống Kê - gọi khi mở modal
export function renderStats() {
  const collectedCount = [...relics, ...artifacts].filter(
    (item) => state.collection[item.id]
  ).length;
  const totalCollectible = relics.length + artifacts.length;
  const achievementsUnlocked = Object.keys(state.achievements).length;
  const achievementBonusPercent = Math.round((getAchievementBonus() - 1) * 100);

  elements.statsList.innerHTML = [
    statRow("⏱️ Tổng thời gian chơi", formatPlaytime(state.totalPlaytimeMs)),
    statRow("🖱️ Số lần bấm Click", formatNumber(state.totalClickActions)),
    statRow("💥 Tổng giá trị đã click/tự động", formatNumber(state.allTimeClicks)),
    statRow("🎯 Tổng số Chí Mạng", formatNumber(state.totalCrits)),
    statRow("🔥 Combo cao nhất từng đạt", formatNumber(state.maxCombo)),
    statRow("🎁 Hộp Quà Vàng đã bấm trúng", formatNumber(state.goldenGiftsClicked)),
    statRow("♻️ Tổng số lần Tái Sinh trọn đời", formatNumber(state.totalPrestigesEver)),
    statRow("💰 Giới hạn Lượt Tái Sinh hiện tại", formatNumber(getMaxRebirths())),
    statRow("💎 Tổng Đá Quý kiếm được trọn đời", formatNumber(state.totalGemsEarned)),
    statRow("✨ Số lần Thăng Thiên", formatNumber(state.ascensionCount)),
    statRow("🔷 Tổng Tinh Thể kiếm được trọn đời", formatNumber(state.totalCrystalsEarned)),
    statRow("📦 Cổ Vật/Di Vật đã sưu tầm", `${collectedCount}/${totalCollectible}`),
    statRow("🏆 Thành tựu đã mở", `${achievementsUnlocked}/${achievements.length} (+${achievementBonusPercent}% Hệ Số Nhân & Nexyroth/giây)`),
    sectionHeader("🏅 Kỷ Lục Cá Nhân"),
    statRow("⚡ Nexyroth/giây cao nhất từng đạt", formatNumber(state.personalBests.maxEffectiveCps)),
    statRow("💥 Giá trị 1 cú click lớn nhất", formatNumber(state.personalBests.maxClickValue)),
    statRow("🖱️ Số click nhiều nhất trong 10 giây", formatNumber(state.personalBests.maxClicksIn10s)),
  ].join("");
}
