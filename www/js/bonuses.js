import { OFFLINE_EARNINGS_EFFICIENCY } from "./data.js";
import { getLuckBossDamageBonus, getLuckItemDropBonus, getLuckDiamondDropBonus, getLuckOfflineEfficiencyBonus } from "./skilltree.js";
import { getPetBossDamageBonus, getPetItemDropBonus, getPetDiamondDropBonus, getPetOfflineEfficiencyBonus } from "./worlds.js";
import { getCollectionBossDamageBonus, getCollectionItemDropBonus, getCollectionDiamondDropBonus } from "./collection.js";
import { getDivineBeastOfflineEfficiencyBonus } from "./nirvana.js";

// Nơi DUY NHẤT tổng hợp 4 hệ số mới (Sát Thương Boss, Tỉ Lệ Rơi Item, Tỉ Lệ Rơi Kim Cương, Hiệu Suất
// Offline) từ mọi nguồn: Cây Kỹ Năng nhánh Vận May, Pet, Cổ Vật/Di Vật, Thần Thú. Các module gameplay
// chỉ gọi vào đây thay vì tự cộng dồn từng nguồn, tránh lệch công thức giữa các chỗ.

// Nhân dồn (nhánh Vận May nhân dồn) x cộng thêm phần từ Pet/Cổ Vật
export function getTotalBossDamageMultiplier() {
  return getLuckBossDamageBonus() * (1 + getPetBossDamageBonus() + getCollectionBossDamageBonus());
}

// Cộng thẳng vào tỉ lệ rơi gốc của từng item (vd gốc 5% + 0.05 = 10%)
export function getTotalItemDropBonus() {
  return getLuckItemDropBonus() + getPetItemDropBonus() + getCollectionItemDropBonus();
}

export function getTotalDiamondDropBonus() {
  return getLuckDiamondDropBonus() + getPetDiamondDropBonus() + getCollectionDiamondDropBonus();
}

// Hiệu suất offline = mức gốc (50%) + các bonus cộng thêm, chặn trần 100% để offline không bao giờ
// lời hơn chơi trực tiếp (đúng mục đích ban đầu của cơ chế giảm hiệu suất).
export function getEffectiveOfflineEfficiency() {
  const bonus =
    getLuckOfflineEfficiencyBonus() +
    getPetOfflineEfficiencyBonus() +
    getDivineBeastOfflineEfficiencyBonus();
  return Math.min(1, OFFLINE_EARNINGS_EFFICIENCY + bonus);
}
