import { state } from "./state.js";
import { relics, artifacts, RARITIES, EQUIP_SLOT_COUNT } from "./data.js";
import { showCollectionDropAnimation } from "./animations.js";
import { updateDisplay } from "./ui.js";

function findCollectionItem(id) {
  return [...relics, ...artifacts].find((item) => item.id === id);
}

// CHỈ những món đã TRANG BỊ (equippedItems) mới có hiệu lực - sở hữu suông không đủ
function getEquippedCollectionItems() {
  return state.equippedItems.map(findCollectionItem).filter(Boolean);
}

// Cộng dồn (VD: +2% + +2% = +4%) - dùng cho hiệu ứng dạng cộng thẳng (crit chance, thời lượng buff)
function getCollectionEffectSum(effectType) {
  return getEquippedCollectionItems()
    .filter((item) => item.effectType === effectType)
    .reduce(
      (sum, item) => sum + item.baseAmount * RARITIES[item.rarity].multiplier,
      0
    );
}

// Nhân dồn (VD: +20% x +20% = x1.44) - dùng cho hiệu ứng dạng nhân %
function getCollectionEffectProduct(effectType) {
  return getEquippedCollectionItems()
    .filter((item) => item.effectType === effectType)
    .reduce(
      (prod, item) =>
        prod * (1 + item.baseAmount * RARITIES[item.rarity].multiplier),
      1
    );
}

export function getCollectionMultBonus() {
  return getCollectionEffectProduct("multBoost");
}
export function getCollectionCpsBonus() {
  return getCollectionEffectProduct("cpsBoost");
}
export function getCollectionCritChanceBonus() {
  return getCollectionEffectSum("critChanceBoost");
}
export function getCollectionCritDamageBonus() {
  return getCollectionEffectProduct("critDamageBoost");
}
export function getCollectionPrestigeGemBonus() {
  return getCollectionEffectProduct("prestigeGemBoost");
}
export function getCollectionGoldenBuffDurationBonusMs() {
  return getCollectionEffectSum("goldenBuffDurationBoost") * 1000;
}
export function getCollectionComboBonusMultiplier() {
  return getCollectionEffectProduct("comboBonusBoost");
}

// ---------------- Trang Bị (Equip) ----------------

export function isEquipped(id) {
  return state.equippedItems.includes(id);
}

// Trang bị 1 món (phải đã sở hữu, và còn trống slot). Trả về true nếu thành công.
export function equipItem(id) {
  if (!state.collection[id]) return false; // chưa sở hữu thì không trang bị được
  if (state.equippedItems.includes(id)) return true; // đã trang bị rồi
  if (state.equippedItems.length >= EQUIP_SLOT_COUNT) return false; // đầy slot

  state.equippedItems.push(id);
  updateDisplay();
  return true;
}

// Tháo 1 món đang trang bị
export function unequipItem(id) {
  state.equippedItems = state.equippedItems.filter((x) => x !== id);
  updateDisplay();
}

// Random 1 Cổ Vật/Di Vật (ưu tiên bậc hiếm theo trọng số, chỉ chọn trong số CHƯA sở hữu)
export function rollForCollectionDrop() {
  const allItems = [...relics, ...artifacts];
  const notOwned = allItems.filter((item) => !state.collection[item.id]);
  if (notOwned.length === 0) return null; // đã sưu tầm hết, không rơi thêm nữa

  const totalWeight = Object.values(RARITIES).reduce(
    (sum, r) => sum + r.weight,
    0
  );
  let roll = Math.random() * totalWeight;
  let targetRarity = "common";
  for (const [key, rarity] of Object.entries(RARITIES)) {
    if (roll < rarity.weight) {
      targetRarity = key;
      break;
    }
    roll -= rarity.weight;
  }

  let pool = notOwned.filter((item) => item.rarity === targetRarity);
  if (pool.length === 0) pool = notOwned; // bậc đó đã sưu tầm hết -> chọn đại trong số còn thiếu

  const item = pool[Math.floor(Math.random() * pool.length)];
  state.collection[item.id] = true;
  showCollectionDropAnimation(item);
  return item;
}
