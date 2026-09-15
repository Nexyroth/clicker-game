import { state } from "./state.js";

const DEFAULT_POTION_DURATION_MS = 5 * 60_000; // 5 phút - mặc định cho tất cả thuốc (thay cho 30-60s cũ, quá ngắn)

// Danh sách item tập trung - metadata thuần, không chứa logic UI. Category "potion" hiện là loại
// duy nhất; để category ở đây từ đầu cho dễ mở rộng (item trang bị, vật liệu...) sau này.
// Giá (price) tính bằng Kim Cương - tiền tệ riêng của NX Item Shop, KHÔNG phải Đá Quý.
export const ITEMS = [
  {
    id: "multiplier_x2",
    name: "Thuốc Bội Tăng x2",
    description: "Nhân Hệ Số Nhân x2. Dùng lại khi đang có hiệu lực sẽ CỘNG THÊM thời gian.",
    icon: "🧪",
    category: "potion",
    effectType: "multiplierBuff",
    multiplier: 2,
    durationMs: DEFAULT_POTION_DURATION_MS,
    price: 10,
    dropChance: 0.05,
  },
  {
    id: "multiplier_x5",
    name: "Thuốc Bội Tăng x5",
    description: "Nhân Hệ Số Nhân x5. Dùng lại khi đang có hiệu lực sẽ CỘNG THÊM thời gian.",
    icon: "⚗️",
    category: "potion",
    effectType: "multiplierBuff",
    multiplier: 5,
    durationMs: DEFAULT_POTION_DURATION_MS,
    price: 25,
    dropChance: 0.02,
  },
  {
    id: "multiplier_x10",
    name: "Thuốc Bội Tăng x10",
    description: "Nhân Hệ Số Nhân x10. Hiếm và mạnh nhất trong dòng Bội Tăng. Dùng lại khi đang có hiệu lực sẽ CỘNG THÊM thời gian.",
    icon: "🌟",
    category: "potion",
    effectType: "multiplierBuff",
    multiplier: 10,
    durationMs: DEFAULT_POTION_DURATION_MS,
    price: 60,
    dropChance: 0.005,
  },
  {
    id: "auto_clicker_potion",
    name: "Thuốc Auto Click",
    description: "Tự động bấm Click Ngay! liên tục (20 lần/giây). Dùng lại khi đang có hiệu lực sẽ CỘNG THÊM thời gian.",
    icon: "🤖",
    category: "potion",
    effectType: "autoClicker",
    durationMs: DEFAULT_POTION_DURATION_MS,
    price: 40,
    dropChance: 0.01,
  },
];

// Nhịp gọi clickActions() khi Thuốc Auto Click đang hiệu lực - KHÔNG dùng chung nhịp 1s của CPS
// nữa (quá chậm theo yêu cầu), có 1 setInterval riêng ở main.js chạy với nhịp này.
export const AUTO_CLICKER_TICK_MS = 50;

export function getItemById(id) {
  return ITEMS.find((item) => item.id === id) || null;
}

// Chỉ những item mua/dùng được trong Shop đặc biệt (hiện tại là toàn bộ ITEMS, nhưng tách riêng
// để sau này có item chỉ rơi từ Boss mà không bán, hoặc ngược lại)
export function getShopItems() {
  return ITEMS.filter((item) => typeof item.price === "number");
}

// ---------------- Inventory (Balo) ----------------

export function getItemQuantity(itemId) {
  return state.inventory.items[itemId] || 0;
}

export function hasItem(itemId, quantity = 1) {
  return getItemQuantity(itemId) >= quantity;
}

export function addItem(itemId, quantity = 1) {
  if (quantity <= 0) return;
  const current = getItemQuantity(itemId);
  state.inventory.items[itemId] = current + Math.floor(quantity);
}

export function removeItem(itemId, quantity = 1) {
  if (quantity <= 0) return false;
  const current = getItemQuantity(itemId);
  if (current < quantity) return false;
  const next = current - quantity;
  if (next > 0) {
    state.inventory.items[itemId] = next;
  } else {
    delete state.inventory.items[itemId];
  }
  return true;
}

// ---------------- Buff (multiplierBuff dùng chung 1 slot cho x2/x5/x10 - lấy hệ số MẠNH NHẤT,
// CỘNG DỒN thời gian khi dùng thêm; autoClicker slot riêng, cũng cộng dồn thời gian) ----------------

// Còn hiệu lực không - tự kiểm tra theo timestamp thật mỗi lần gọi (không dựa vào số lần render).
// Tự dọn field đã hết hạn ngay khi phát hiện (self-healing, không cần vòng dọn riêng).
function isBuffActive(slot) {
  const buff = state.activeBuffs[slot];
  if (!buff) return false;
  if (Date.now() >= buff.expiresAt) {
    delete state.activeBuffs[slot];
    return false;
  }
  return true;
}

export function isMultiplierBuffActive() {
  return isBuffActive("multiplierBuff");
}

export function isAutoClickerBuffActive() {
  return isBuffActive("autoClicker");
}

export function getMultiplierBuffRemainingMs() {
  if (!isMultiplierBuffActive()) return 0;
  return Math.max(0, state.activeBuffs.multiplierBuff.expiresAt - Date.now());
}

export function getAutoClickerBuffRemainingMs() {
  if (!isAutoClickerBuffActive()) return 0;
  return Math.max(0, state.activeBuffs.autoClicker.expiresAt - Date.now());
}

// Hệ số nhân từ buff item đang hiệu lực - dùng trực tiếp trong getEffectiveMult(), không có
// buff thì trả về 1 (trung tính), không ảnh hưởng công thức hiện tại.
export function getItemBuffMultiplier() {
  if (!isMultiplierBuffActive()) return 1;
  return state.activeBuffs.multiplierBuff.multiplier;
}

// Roll drop item khi hạ Boss - CHỈ 1 lần random duy nhất cho toàn bộ bảng rơi (không roll riêng
// từng item), chia theo tỉ lệ dropChance của từng item. dropBonus (từ nhánh Vận May/Pet/Cổ Vật) được
// cộng thẳng vào tỉ lệ gốc của từng item. Trả về item rơi được, hoặc null nếu không rơi gì.
export function rollBossItemDrop(dropBonus = 0) {
  const dropTable = ITEMS.filter((item) => typeof item.dropChance === "number" && item.dropChance > 0);
  const roll = Math.random();
  let cumulative = 0;
  for (const item of dropTable) {
    cumulative += item.dropChance + dropBonus;
    if (roll < cumulative) return item;
  }
  return null;
}

// Dùng 1 item consumable. Trả về { success, message } để UI hiển thị luôn, không phải tự suy luận.
// Dùng lại 1 thuốc khi buff CÙNG LOẠI đang hiệu lực sẽ CỘNG DỒN thời gian (không ghi đè, không reset về 0).
// Hệ số nhân áp dụng là hệ số MẠNH NHẤT trong số các thuốc Bội Tăng đã dùng còn hiệu lực (không nhân
// chồng x2 × x5 × x10 để tránh vỡ cân bằng, nhưng thời gian hiệu lực vẫn cộng dồn đầy đủ theo yêu cầu).
export function useItem(itemId) {
  const item = getItemById(itemId);
  if (!item) return { success: false, message: "Item không tồn tại." };
  if (!hasItem(itemId, 1)) return { success: false, message: "Bạn không có item này." };

  if (item.effectType === "multiplierBuff") {
    removeItem(itemId, 1);
    const existing = isMultiplierBuffActive() ? state.activeBuffs.multiplierBuff : null;
    const baseExpiry = existing ? existing.expiresAt : Date.now();
    state.activeBuffs.multiplierBuff = {
      itemId,
      multiplier: Math.max(item.multiplier, existing ? existing.multiplier : 0),
      expiresAt: baseExpiry + item.durationMs,
    };
    const totalSecondsLeft = Math.round((state.activeBuffs.multiplierBuff.expiresAt - Date.now()) / 1000);
    return {
      success: true,
      message: `Đã dùng ${item.name}! Hệ Số Nhân x${state.activeBuffs.multiplierBuff.multiplier}, còn lại ${totalSecondsLeft}s.`,
    };
  }

  if (item.effectType === "autoClicker") {
    removeItem(itemId, 1);
    const existing = isAutoClickerBuffActive() ? state.activeBuffs.autoClicker : null;
    const baseExpiry = existing ? existing.expiresAt : Date.now();
    state.activeBuffs.autoClicker = { expiresAt: baseExpiry + item.durationMs };
    const totalSecondsLeft = Math.round((state.activeBuffs.autoClicker.expiresAt - Date.now()) / 1000);
    return { success: true, message: `Đã dùng ${item.name}! Tự động Click, còn lại ${totalSecondsLeft}s.` };
  }

  return { success: false, message: "Item này chưa hỗ trợ sử dụng." };
}
