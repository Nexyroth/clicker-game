import { state } from "./state.js";
import * as Big from "./numeric.js";
import { skillTree } from "./data.js";
import { getMaxRebirths } from "./prestige.js";
import { updateDisplay } from "./ui.js";
import { playPurchaseSound } from "./sounds.js";

// Trả về danh sách { node, times } cho các node ĐÃ SỞ HỮU trong 1 nhánh.
// Node cuối cùng của nhánh (nếu đánh dấu repeatable: true) có thể được mua nhiều lần,
// nên "times" của nó có thể > 1; các node khác luôn là 1 (mua 1 lần duy nhất).
function getOwnedNodesWithTimes(branch) {
  const nodes = skillTree[branch];
  const owned = state.skillTree[branch] || 0;
  const lastIndex = nodes.length - 1;
  const result = [];

  for (let i = 0; i < lastIndex; i++) {
    if (owned > i) result.push({ node: nodes[i], times: 1 });
  }

  const lastTimes = Math.max(0, owned - lastIndex);
  if (lastTimes > 0) result.push({ node: nodes[lastIndex], times: lastTimes });

  return result;
}

// ---------------- Buff từ các node đã mở trong Cây Kỹ Năng ----------------

export function getAscensionMultBonus() {
  let bonus = 1;
  getOwnedNodesWithTimes("power").forEach(({ node, times }) => {
    bonus *= Math.pow(1 + node.amount, times);
  });
  return bonus;
}

export function getAscensionCpsBonus() {
  let bonus = 1;
  getOwnedNodesWithTimes("speed").forEach(({ node, times }) => {
    bonus *= Math.pow(1 + node.amount, times);
  });
  return bonus;
}

export function getAscensionCritChanceBonus() {
  let bonus = 0;
  getOwnedNodesWithTimes("crit").forEach(({ node, times }) => {
    if (node.type === "critChance") bonus += node.amount * times;
  });
  return bonus;
}

export function getAscensionCritDamageBonus() {
  let bonus = 1;
  getOwnedNodesWithTimes("crit").forEach(({ node, times }) => {
    if (node.type === "critDamage") bonus *= Math.pow(1 + node.amount, times);
  });
  return bonus;
}

// Hệ số nhân Tinh Thể nhận được mỗi lần Thăng Thiên (nhánh "ascension")
export function getAscensionCrystalBonus() {
  let bonus = 1;
  getOwnedNodesWithTimes("ascension").forEach(({ node, times }) => {
    if (node.type === "crystalBonus") bonus *= Math.pow(1 + node.amount, times);
  });
  return bonus;
}

// Nexyroth khởi điểm CỘNG THÊM riêng ngay sau khi Thăng Thiên (nhánh "ascension")
export function getAscensionStartBonus() {
  let bonus = 0;
  getOwnedNodesWithTimes("ascension").forEach(({ node, times }) => {
    if (node.type === "startBonus") bonus += node.amount * times;
  });
  return bonus;
}

// Hệ số nhân riêng cho phần Tinh Thể thưởng theo số Lượt Tái Sinh đang giữ lúc Thăng Thiên
export function getAscensionHeldBonusMultiplier() {
  let bonus = 1;
  getOwnedNodesWithTimes("ascension").forEach(({ node, times }) => {
    if (node.type === "heldBonus") bonus *= Math.pow(1 + node.amount, times);
  });
  return bonus;
}

// Số lần Tái Sinh cần để mở khoá Thăng Thiên = giới hạn tối đa hiện tại, trừ buff "Rút Ngắn Chu Kỳ" (tối thiểu 2)
export function getEffectiveAscensionUnlockCount() {
  let reduction = 0;
  getOwnedNodesWithTimes("ascension").forEach(({ node, times }) => {
    if (node.type === "unlockReduction") reduction += node.amount * times;
  });
  return Math.max(2, getMaxRebirths() - reduction);
}

// ---------------- Mua node ----------------

// Giá của lần mua TIẾP THEO trong 1 nhánh (node thường: giá cố định; node cuối repeatable: giá tăng dần mỗi lần)
export function getSkillNodeCost(branch) {
  const nodes = skillTree[branch];
  const owned = state.skillTree[branch] || 0;
  const lastIndex = nodes.length - 1;
  const lastNode = nodes[lastIndex];

  if (owned <= lastIndex) {
    return Big.fromNumber(nodes[owned].cost);
  }
  // owned > lastIndex: chỉ xảy ra khi node cuối repeatable và đã mua thêm
  const extra = owned - lastIndex;
  return Big.floor(Big.scale(Big.pow(Big.fromNumber(lastNode.costGrowth || 1.5), extra), lastNode.cost));
}

// Nhánh này còn mua thêm được không (false khi đã mua hết mà node cuối KHÔNG repeatable)
export function canBuyMoreInBranch(branch) {
  const nodes = skillTree[branch];
  const owned = state.skillTree[branch] || 0;
  const lastIndex = nodes.length - 1;
  if (owned <= lastIndex) return true;
  return !!nodes[lastIndex].repeatable;
}

// Mua node/lượt tiếp theo trong 1 nhánh Cây Kỹ Năng (phải mua theo thứ tự; node cuối repeatable mua được vô hạn)
export function purchaseSkillNode(branch) {
  if (!canBuyMoreInBranch(branch)) return false;

  const cost = getSkillNodeCost(branch);
  if (Big.gte(state.crystals, cost)) {
    state.crystals = Big.sub(state.crystals, cost);
    state.skillTree[branch] = (state.skillTree[branch] || 0) + 1;
    updateDisplay();
    playPurchaseSound();
    return true;
  }
  return false;
}
