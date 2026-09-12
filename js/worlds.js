import { state } from "./state.js";
import * as Big from "./numeric.js";
import { worlds, pets, WORLD_CURRENCY_RATE, PET_COST_GROWTH_RATE } from "./data.js";
import { updateDisplay } from "./ui.js";
import { playPurchaseSound } from "./sounds.js";

// Thế Giới này đã mở khoá chưa (dựa theo số lần Thăng Thiên)
export function isWorldUnlocked(world) {
  return state.ascensionCount >= (world.unlockAscension || 0);
}

// Số tiền tệ hiện có của 1 Thế Giới
export function getWorldCurrency(worldId) {
  return state.worldCurrencies[worldId] || Big.fromNumber(0);
}

// Chọn Thế Giới nào đang "hoạt động" - Nexyroth kiếm được sẽ quy đổi 1 phần thành tiền tệ Thế Giới này
export function setActiveWorld(worldId) {
  const world = worlds.find((w) => w.id === worldId);
  if (!world || !isWorldUnlocked(world)) return false;
  state.activeWorldId = worldId;
  updateDisplay();
  return true;
}

// Gọi từ earnBucks() mỗi khi kiếm Nexyroth - cộng thêm 1 phần vào tiền tệ Thế Giới ĐANG CHỌN (chỉ 1 Thế Giới)
export function addWorldCurrencyFromBucks(amount) {
  const id = state.activeWorldId;
  const gained = Big.floor(Big.scale(amount, WORLD_CURRENCY_RATE));
  state.worldCurrencies[id] = Big.add(getWorldCurrency(id), gained);
}

// Dùng riêng cho Offline Earnings: cộng tiền tệ cho TẤT CẢ Thế Giới đã mở khoá cùng lúc,
// không chỉ Thế Giới đang chọn (vì lúc offline không "đứng" ở đâu cả, coi như cả 3 Thế Giới đều tích luỹ)
export function addWorldCurrencyToAllUnlocked(amount) {
  const gained = Big.floor(Big.scale(amount, WORLD_CURRENCY_RATE));
  worlds.forEach((world) => {
    if (!isWorldUnlocked(world)) return;
    state.worldCurrencies[world.id] = Big.add(getWorldCurrency(world.id), gained);
  });
}

// ---------------- Pet (có cấp độ, nâng cấp lặp lại bằng tiền tệ Thế Giới đó) ----------------

// Cấp độ hiện tại của 1 Pet (0 = chưa thuần hoá)
export function getPetLevel(petId) {
  return state.tamedPets[petId] || 0;
}

export function isPetTamed(petId) {
  return getPetLevel(petId) > 0;
}

// Giá thuần hoá/nâng cấp lần TIẾP THEO cho 1 Pet, dựa theo cấp hiện tại
export function getPetCost(petId, pet) {
  const level = getPetLevel(petId);
  return Big.scale(Big.pow(Big.fromNumber(PET_COST_GROWTH_RATE), level), pet.baseCost);
}

// Thuần hoá (nếu cấp 0) hoặc nâng cấp thêm 1 cấp (nếu đã có) - cùng 1 thao tác, dùng tiền tệ đúng Thế Giới
export function tamePet(worldId, petId) {
  const pet = (pets[worldId] || []).find((p) => p.id === petId);
  if (!pet) return false;

  const cost = getPetCost(petId, pet);
  const currency = getWorldCurrency(worldId);
  if (Big.lt(currency, cost)) return false;

  state.worldCurrencies[worldId] = Big.sub(currency, cost);
  state.tamedPets[petId] = getPetLevel(petId) + 1;
  updateDisplay();
  playPurchaseSound();
  return true;
}

// ---------------- Buff từ Pet đã thuần hoá (mọi Thế Giới cộng dồn theo CẤP ĐỘ, KHÔNG giới hạn slot) ----------------

function getAllTamedPetsWithLevel() {
  const all = [];
  Object.values(pets).forEach((list) => all.push(...list));
  return all
    .map((pet) => ({ pet, level: getPetLevel(pet.id) }))
    .filter((x) => x.level > 0);
}

function getPetEffectSum(effectType) {
  return getAllTamedPetsWithLevel()
    .filter((x) => x.pet.effectType === effectType)
    .reduce((sum, x) => sum + x.pet.amount * x.level, 0);
}

function getPetEffectProduct(effectType) {
  return getAllTamedPetsWithLevel()
    .filter((x) => x.pet.effectType === effectType)
    .reduce((prod, x) => prod * Math.pow(1 + x.pet.amount, x.level), 1);
}

export function getPetMultBonus() {
  return getPetEffectProduct("multBoost");
}
export function getPetCpsBonus() {
  return getPetEffectProduct("cpsBoost");
}
export function getPetCritChanceBonus() {
  return getPetEffectSum("critChanceBoost");
}
export function getPetCritDamageBonus() {
  return getPetEffectProduct("critDamageBoost");
}
