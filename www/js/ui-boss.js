import { elements } from "./dom.js";
import { bossFight } from "./effects.js";
import * as Big from "./numeric.js";
import { formatNumber } from "./ui.js";

const ALL_TIER_BAR_COLORS = ["bg-red-600", "bg-purple-600", "bg-yellow-600"];
const ALL_TIER_FILL_COLORS = ["bg-yellow-400", "bg-pink-300", "bg-yellow-200"];

// Cập nhật thanh máu Boss + đồng hồ đếm ngược - gọi định kỳ (giống Combo/Cuồng Nhiệt)
export function updateBossBar() {
  if (!bossFight.active) {
    elements.bossBar.classList.add("hidden");
    return;
  }

  elements.bossBar.classList.remove("hidden");
  elements.bossName.textContent = bossFight.name;

  // Ảnh Boss theo tên - nếu file ảnh chưa có/không load được thì onerror trong HTML tự ẩn đi,
  // thanh Boss vẫn hiển thị bình thường với icon 💀 mặc định.
  if (bossFight.image) {
    elements.bossImage.src = bossFight.image;
    elements.bossImage.classList.remove("hidden");
  } else {
    elements.bossImage.classList.add("hidden");
  }

  const tier = bossFight.tier;
  if (tier) {
    elements.bossBar.classList.remove(...ALL_TIER_BAR_COLORS);
    elements.bossBar.classList.add(tier.barColorClass);
    elements.bossHpBar.classList.remove(...ALL_TIER_FILL_COLORS);
    elements.bossHpBar.classList.add(tier.hpFillColorClass);
  }

  const hpPercent = Math.max(
    0,
    Math.min(100, Big.toNumber(Big.div(bossFight.hp, bossFight.maxHp)) * 100)
  );
  elements.bossHpBar.style.width = `${hpPercent}%`;
  elements.bossHpText.textContent = `${formatNumber(bossFight.hp)} / ${formatNumber(
    bossFight.maxHp
  )}`;

  const secondsLeft = Math.max(0, Math.ceil((bossFight.endTime - Date.now()) / 1000));
  elements.bossTimerText.textContent = `⏱️ ${secondsLeft}s`;
}
