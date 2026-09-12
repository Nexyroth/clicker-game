import { elements } from "./dom.js";
import { bossFight } from "./effects.js";
import * as Big from "./numeric.js";
import { formatNumber } from "./ui.js";

// Cập nhật thanh máu Boss + đồng hồ đếm ngược - gọi định kỳ (giống Combo/Cuồng Nhiệt)
export function updateBossBar() {
  if (!bossFight.active) {
    elements.bossBar.classList.add("hidden");
    return;
  }

  elements.bossBar.classList.remove("hidden");
  elements.bossName.textContent = bossFight.name;

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
