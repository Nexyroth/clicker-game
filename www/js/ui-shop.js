import { elements } from "./dom.js";
import { state, saveGame } from "./state.js";
import * as Big from "./numeric.js";
import { getShopItems, getItemQuantity, addItem } from "./items.js";
import { updateDisplay, formatNumber } from "./ui.js";
import { showToast } from "./animations.js";
import { playPurchaseSound } from "./sounds.js";

// Vẽ toàn bộ NX Item Shop - mua bằng Kim Cương, tách biệt hoàn toàn với Cửa Hàng Đá Quý/Chí Mạng/Pet/Gacha
export function renderShop() {
  elements.shopList.innerHTML = "";

  getShopItems().forEach((item) => {
    const cost = Big.fromNumber(item.price);
    const affordable = Big.gte(state.diamonds, cost);
    const quantity = getItemQuantity(item.id);

    const card = document.createElement("div");
    card.className = `bg-white border-2 rounded-lg p-3 ${affordable ? "border-purple-300" : "border-gray-200"}`;
    card.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <p class="text-sm font-semibold text-gray-800">${item.icon} ${item.name}</p>
        <span class="text-xs text-gray-500">Đang có: x${quantity}</span>
      </div>
      <p class="text-xs text-gray-500 mb-2">${item.description}</p>
      <button class="buy-item-button w-full font-bold py-1 px-2 rounded text-sm transition duration-300 ease-in-out ${
        affordable
          ? "bg-purple-500 hover:bg-purple-600 text-white"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      }" data-id="${item.id}" ${affordable ? "" : "disabled"}>
        Mua (${formatNumber(item.price)} 💎)
      </button>
    `;
    elements.shopList.appendChild(card);
  });
}

// Có ít nhất 1 item mua được ngay bây giờ không - dùng cho notification badge, không tự ý spam
export function isAnyShopItemAffordable() {
  return getShopItems().some((item) => Big.gte(state.diamonds, Big.fromNumber(item.price)));
}

function purchaseShopItem(itemId) {
  const item = getShopItems().find((i) => i.id === itemId);
  if (!item) return { success: false, message: "Item không hợp lệ." };

  const cost = Big.fromNumber(item.price);
  if (!Big.gte(state.diamonds, cost)) {
    return { success: false, message: "Không đủ Kim Cương." };
  }

  state.diamonds = Big.sub(state.diamonds, cost);
  addItem(item.id, 1);
  return { success: true, message: `Đã mua ${item.name}!` };
}

// Event delegation - 1 listener duy nhất, không tạo lại mỗi lần renderShop()
elements.shopList.addEventListener("click", (e) => {
  const button = e.target.closest(".buy-item-button");
  if (!button) return;

  const result = purchaseShopItem(button.dataset.id);
  showToast(result.message, result.success ? "success" : "error");
  if (result.success) {
    playPurchaseSound();
    updateDisplay();
    renderShop();
    saveGame();
  }
});
