import { elements } from "./dom.js";
import { state } from "./state.js";
import { relics, artifacts, RARITIES, EQUIP_SLOT_COUNT } from "./data.js";
import { isEquipped, equipItem, unequipItem } from "./collection.js";

function renderCollectionItem(item) {
  const rarity = RARITIES[item.rarity];
  const owned = !!state.collection[item.id];
  const equipped = isEquipped(item.id);
  const categoryLabel = item.id.startsWith("relic") ? "Di Vật" : "Cổ Vật";
  const slotsFull = state.equippedItems.length >= EQUIP_SLOT_COUNT;

  const el = document.createElement("div");
  el.className = `rounded-lg p-3 border-2 ${
    equipped
      ? `${rarity.bg} border-emerald-400 ring-2 ring-emerald-300`
      : owned
      ? `${rarity.bg} ${rarity.border}`
      : "bg-gray-100 border-gray-200 opacity-60"
  }`;

  if (owned) {
    el.innerHTML = `
      <p class="text-xs font-semibold ${rarity.color} uppercase tracking-wide">${categoryLabel} · ${rarity.label}${
      equipped ? " · ⚔️ Đang trang bị" : ""
    }</p>
      <p class="text-sm font-bold text-gray-800 mt-1">${item.name}</p>
      <p class="text-xs text-gray-500 mt-1 mb-2">${item.description}</p>
      <button class="equip-toggle-button w-full text-xs font-bold py-1 px-2 rounded transition duration-300 ease-in-out ${
        equipped
          ? "bg-red-500 hover:bg-red-600 text-white"
          : slotsFull
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-emerald-500 hover:bg-emerald-600 text-white"
      }" data-id="${item.id}" ${!equipped && slotsFull ? "disabled" : ""}>
        ${equipped ? "Tháo Ra" : slotsFull ? "Đã đầy Slot" : "Trang Bị"}
      </button>
    `;
  } else {
    el.innerHTML = `
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">${categoryLabel} · ${rarity.label}</p>
      <p class="text-sm font-bold text-gray-400 mt-1">🔒 Chưa tìm thấy</p>
    `;
  }
  return el;
}

// Vẽ lại toàn bộ Bộ Sưu Tập - gọi khi mở modal và sau mỗi lần trang bị/tháo
export function renderCollection() {
  const allItems = [...relics, ...artifacts];
  const ownedCount = allItems.filter((item) => state.collection[item.id]).length;
  elements.collectionProgress.textContent = `Đã sưu tầm: ${ownedCount}/${allItems.length} — Đã trang bị: ${state.equippedItems.length}/${EQUIP_SLOT_COUNT}`;

  elements.collectionList.innerHTML = "";
  allItems.forEach((item) => {
    elements.collectionList.appendChild(renderCollectionItem(item));
  });

  document.querySelectorAll(".equip-toggle-button").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      if (isEquipped(id)) {
        unequipItem(id);
      } else {
        equipItem(id);
      }
      renderCollection();
    });
  });
}
