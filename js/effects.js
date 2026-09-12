import * as Big from "./numeric.js";

// Trạng thái buff TẠM THỜI - KHÔNG lưu vào localStorage (mất khi F5, đúng theo thiết kế)
// Bao gồm: Combo/Streak khi click liên tục, buff Cuồng Nhiệt từ Hộp Quà Vàng, và trận đấu Boss đang diễn ra
export const effects = {
  comboCount: 0,
  comboMultiplier: 1,
  lastClickTime: 0,
  goldenBuffMultiplier: 1,
  goldenBuffEndTime: 0,
};

// Trận đấu Boss hiện tại (nếu có) - tạm thời, KHÔNG lưu, mất khi F5 (boss sẽ bỏ chạy)
export const bossFight = {
  active: false,
  hp: Big.fromNumber(0),
  maxHp: Big.fromNumber(0),
  endTime: 0,
  name: "",
};

// Hệ số nhân hiện tại từ Combo (chỉ áp dụng cho click chủ động, không áp dụng cho CPS)
export function getComboMultiplier() {
  return effects.comboMultiplier;
}

// Hệ số nhân hiện tại từ buff Cuồng Nhiệt (Hộp Quà Vàng), áp dụng cho cả click và CPS
export function getGoldenBuffMultiplier() {
  return Date.now() < effects.goldenBuffEndTime
    ? effects.goldenBuffMultiplier
    : 1;
}

// Buff Cuồng Nhiệt có đang hoạt động không
export function isGoldenBuffActive() {
  return Date.now() < effects.goldenBuffEndTime;
}
