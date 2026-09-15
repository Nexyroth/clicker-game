import { elements } from "./dom.js";
import { ITEMS, getItemQuantity, useItem } from "./items.js";
import { updateDisplay } from "./ui.js";
import { showToast } from "./animations.js";
import { playPurchaseSound } from "./sounds.js";

// Vẽ toàn bộ Balo - chỉ hiện item đang có số lượng > 0 để đỡ rối mắt
export function renderInventory() {
  elements.inventoryList.innerHTML = "";

  const owned = ITEMS.filter((item) => getItemQuantity(item.id) > 0);

  if (owned.length === 0) {
    const empty = document.createElement("p");
    empty.className = "text-sm text-gray-500 text-center py-6 col-span-2";
    empty.textContent = "Balo đang trống. Mua ở NX Item Shop hoặc săn Boss để kiếm item!";
    elements.inventoryList.appendChild(empty);
    return;
  }

  owned.forEach((item) => {
    const quantity = getItemQuantity(item.id);
    const card = document.createElement("div");
    card.className = "bg-white border-2 border-gray-200 rounded-lg p-3";
    card.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <p class="text-sm font-semibold text-gray-800">${item.icon} ${item.name}</p>
        <span class="text-xs font-bold text-purple-500">x${quantity}</span>
      </div>
      <p class="text-xs text-gray-500 mb-2">${item.description}</p>
      <button class="use-item-button w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-2 rounded text-sm transition duration-300 ease-in-out" data-id="${item.id}">
        Dùng
      </button>
    `;
    elements.inventoryList.appendChild(card);
  });
}

// Gắn 1 listener DUY NHẤT lên container (event delegation) để không bị trùng lặp listener
// mỗi lần renderInventory() vẽ lại danh sách.
elements.inventoryList.addEventListener("click", (e) => {
  const button = e.target.closest(".use-item-button");
  if (!button) return;

  const result = useItem(button.dataset.id);
  showToast(result.message, result.success ? "success" : "error");
  if (result.success) {
    playPurchaseSound();
    updateDisplay();
    renderInventory();
  }
});
