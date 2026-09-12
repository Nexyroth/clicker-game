import { elements } from "./dom.js";
import { state } from "./state.js";
import * as Big from "./numeric.js";
import { divineBeasts, GACHA_COST_XA_LOI, NIRVANA_UNLOCK_ASCENSION_COUNT } from "./data.js";
import { formatNumber } from "./ui.js";
import {
  isNirvanaUnlocked,
  calculateXaLoiGain,
  getEternalMultBonus,
  getEternalMultCost,
  getDivineBeastLevel,
} from "./nirvana.js";

// Cập nhật khu vực Xá Lợi + trạng thái Niết Bàn + Vĩnh Hằng Bội Tăng
export function renderNirvanaPanel() {
  elements.userXaLoi.textContent = formatNumber(state.xaLoi);

  if (!isNirvanaUnlocked()) {
    const remaining = NIRVANA_UNLOCK_ASCENSION_COUNT - state.ascensionCount;
    elements.nirvanaStatus.textContent = `🔒 Thăng Thiên thêm ${remaining} lần nữa (trọn đời) để mở khoá Niết Bàn (${state.ascensionCount}/${NIRVANA_UNLOCK_ASCENSION_COUNT})`;
    elements.nirvanaButton.disabled = true;
    elements.nirvanaButton.textContent = "Chưa mở khoá";
  } else {
    const xaLoiToGain = calculateXaLoiGain();
    elements.nirvanaStatus.textContent = `✅ Đã mở khoá! Niết Bàn ngay sẽ nhận ${formatNumber(
      xaLoiToGain
    )} Xá Lợi. Đã Niết Bàn ${formatNumber(state.nirvanaCount)} lần.`;
    elements.nirvanaButton.disabled = xaLoiToGain < 1;
    elements.nirvanaButton.textContent = "Niết Bàn";
  }

  const eternalCost = getEternalMultCost();
  elements.eternalMultLevel.textContent = formatNumber(state.eternalMultLevel);
  elements.eternalMultBonus.textContent = `x${getEternalMultBonus().toFixed(2)}`;
  elements.eternalMultCost.textContent = formatNumber(eternalCost);
  elements.eternalMultButton.disabled = Big.lt(state.xaLoi, eternalCost);

  elements.gachaCost.textContent = formatNumber(GACHA_COST_XA_LOI);
  elements.gachaButton.disabled = Big.lt(state.xaLoi, Big.fromNumber(GACHA_COST_XA_LOI));
}

function renderDivineBeastCard(beast) {
  const level = getDivineBeastLevel(beast.id);
  const tamed = level > 0;
  const el = document.createElement("div");
  el.className = `rounded-lg p-3 border-2 ${
    tamed ? "bg-yellow-50 border-yellow-400" : "bg-gray-100 border-gray-200 opacity-60"
  }`;
  el.innerHTML = tamed
    ? `<p class="text-sm font-bold text-yellow-700">🐉 ${beast.name} <span class="text-xs text-gray-500 font-normal">(cấp ${level})</span></p>
       <p class="text-xs text-gray-500 mt-1">${beast.description} — hiện đang x${level}</p>`
    : `<p class="text-sm font-bold text-gray-400">🔒 ???</p>
       <p class="text-xs text-gray-400 mt-1">Quay Gacha để có cơ hội nhận</p>`;
  return el;
}

export function renderDivineBeasts() {
  elements.divineBeastsList.innerHTML = "";
  divineBeasts.forEach((beast) => {
    elements.divineBeastsList.appendChild(renderDivineBeastCard(beast));
  });
}
