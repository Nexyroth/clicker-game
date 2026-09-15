import { state, saveGame } from "./state.js";
import * as Big from "./numeric.js";
import { addItem, getItemById } from "./items.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------- Nhóm "Vũ Điệu Ngón Tay" - chuỗi mốc click thật (không tính Hệ Số Nhân/CPS) ----------------

const CLICK_RALLY_MILESTONES = [
  { id: "click_rally_100", label: "Mốc I", target: 100, reward: 5 },
  { id: "click_rally_500", label: "Mốc II", target: 500, reward: 20 },
  { id: "click_rally_1000", label: "Mốc III", target: 1000, reward: 40 },
  { id: "click_rally_5000", label: "Mốc IV", target: 5000, reward: 150 },
  { id: "click_rally_10000", label: "Mốc V", target: 10000, reward: 300 },
  { id: "click_rally_50000", label: "Mốc VI", target: 50000, reward: 1000 },
  { id: "click_rally_100000", label: "Mốc VII", target: 100000, reward: 2500 },
];

// ---------------- Nhóm "Hành Trình Tân Thủ 7 Ngày" - đăng nhập, mỗi ngày 1 phần quà ----------------

const NEWBIE_7DAY_REWARDS = [
  { day: 1, items: [{ type: "diamonds", amount: 100 }, { type: "item", id: "auto_clicker_potion", amount: 2 }] },
  { day: 2, items: [{ type: "diamonds", amount: 200 }, { type: "gems", amount: 50 }] },
  { day: 3, items: [{ type: "item", id: "multiplier_x2", amount: 3 }, { type: "diamonds", amount: 300 }] },
  { day: 4, items: [{ type: "diamonds", amount: 500 }, { type: "gems", amount: 100 }] },
  { day: 5, items: [{ type: "crystals", amount: 5 }, { type: "diamonds", amount: 500 }] },
  { day: 6, items: [{ type: "diamonds", amount: 1000 }, { type: "xaLoi", amount: 3 }] },
  {
    day: 7,
    items: [
      { type: "diamonds", amount: 2000 },
      { type: "xaLoi", amount: 10 },
      { type: "divineBeast", id: "divineBeastPhoenix", name: "Phượng Hoàng Bất Tử" },
    ],
  },
];

// Nhóm sự kiện hiển thị ở màn danh sách. type quyết định UI Level 3 (ui-events.js) sẽ vẽ gì:
// "milestoneLadder" (thanh tiến trình + nhận theo từng mốc) hay "sevenDayLogin" (lịch 7 ô theo ngày).
export const EVENT_GROUPS = [
  {
    id: "click_rally_group",
    title: "🖱️ Vũ Điệu Ngón Tay",
    icon: "🖱️",
    shortDescription: "Chuỗi thử thách Click - càng click thật nhiều, thưởng Kim Cương càng lớn.",
    howToPlay: "Bấm nút Click Ngay! càng nhiều càng tốt - tính THẬT từng cú bấm, KHÔNG nhân Hệ Số Nhân, KHÔNG tính Nexyroth/giây. Mỗi mốc số lần click là 1 phần thưởng Kim Cương riêng, đạt mốc nào nhận mốc đó, không cần theo thứ tự và không có hạn thời gian.",
    type: "milestoneLadder",
    milestones: CLICK_RALLY_MILESTONES,
  },
  {
    id: "newbie_7day",
    title: "🎁 Hành Trình Tân Thủ 7 Ngày",
    icon: "🎁",
    shortDescription: "Quay lại mỗi ngày trong 7 ngày đầu để nhận quà tân thủ, Ngày 7 có Thần Thú Cực Phẩm.",
    howToPlay: "Kể từ lần đầu vào game, cứ đủ 24 giờ lại mở thêm 1 ngày mới (tối đa Ngày 7). Mỗi ngày nhận 1 lần, bấm \"Nhận Quà\" khi ô sáng lên. Lỡ chưa nhận ngày nào vẫn giữ nguyên, quay lại nhận sau không mất.",
    type: "sevenDayLogin",
    days: NEWBIE_7DAY_REWARDS,
  },
];

export function getEventGroupById(id) {
  return EVENT_GROUPS.find((g) => g.id === id) || null;
}

// ---------------- Milestone Ladder (Vũ Điệu Ngón Tay) ----------------

export function getMilestoneProgress() {
  return state.totalClickActions;
}

export function isMilestoneComplete(milestone) {
  return getMilestoneProgress() >= milestone.target;
}

export function isMilestoneClaimed(milestoneId) {
  return !!state.claimedEvents[milestoneId];
}

export function claimMilestoneReward(milestoneId) {
  const milestone = CLICK_RALLY_MILESTONES.find((m) => m.id === milestoneId);
  if (!milestone) return { success: false, message: "Mốc không tồn tại." };
  if (isMilestoneClaimed(milestoneId)) return { success: false, message: "Đã nhận thưởng mốc này rồi." };
  if (!isMilestoneComplete(milestone)) return { success: false, message: "Chưa đạt đủ số lần click." };

  state.diamonds = Big.add(state.diamonds, Big.fromNumber(milestone.reward));
  state.totalDiamondsEarned = Big.add(state.totalDiamondsEarned, Big.fromNumber(milestone.reward));
  state.claimedEvents[milestoneId] = true;
  saveGame();

  return { success: true, message: `Nhận ${milestone.reward} Kim Cương từ ${milestone.label}!` };
}

// Có mốc nào trong nhóm đã đạt mà chưa nhận không - dùng cho badge cấp nhóm/toàn Sự Kiện
export function isAnyMilestoneClaimable() {
  return CLICK_RALLY_MILESTONES.some((m) => isMilestoneComplete(m) && !isMilestoneClaimed(m.id));
}

// ---------------- 7-Day Login (Hành Trình Tân Thủ) ----------------

// Ngày hiện tại (1-7) tính từ firstLoginTime, mỗi 24h tròn sang ngày mới - dùng cửa sổ trượt 24h
// thay vì reset cứng lúc 00:00 để công bằng bất kể giờ chơi trong ngày (không ai bị thiệt vì chơi
// muộn/sớm), đơn giản và không phát sinh vấn đề múi giờ.
export function getCurrentLoginDay() {
  if (!state.firstLoginTime) return 1;
  const elapsedDays = Math.floor((Date.now() - state.firstLoginTime) / DAY_MS) + 1;
  return Math.min(7, Math.max(1, elapsedDays));
}

export function isDayUnlocked(day) {
  return day <= getCurrentLoginDay();
}

export function isDayClaimed(day) {
  return !!state.claimed7DayRewards[day];
}

function applyRewardItem(rewardItem) {
  switch (rewardItem.type) {
    case "diamonds":
      state.diamonds = Big.add(state.diamonds, Big.fromNumber(rewardItem.amount));
      state.totalDiamondsEarned = Big.add(state.totalDiamondsEarned, Big.fromNumber(rewardItem.amount));
      break;
    case "gems":
      state.gems = Big.add(state.gems, Big.fromNumber(rewardItem.amount));
      state.totalGemsEarned = Big.add(state.totalGemsEarned, Big.fromNumber(rewardItem.amount));
      break;
    case "crystals":
      state.crystals = Big.add(state.crystals, Big.fromNumber(rewardItem.amount));
      state.totalCrystalsEarned = Big.add(state.totalCrystalsEarned, Big.fromNumber(rewardItem.amount));
      break;
    case "xaLoi":
      state.xaLoi = Big.add(state.xaLoi, Big.fromNumber(rewardItem.amount));
      state.totalXaLoiEarned = Big.add(state.totalXaLoiEarned, Big.fromNumber(rewardItem.amount));
      break;
    case "item":
      addItem(rewardItem.id, rewardItem.amount);
      break;
    case "divineBeast":
      state.divineBeastsTamed[rewardItem.id] = (state.divineBeastsTamed[rewardItem.id] || 0) + 1;
      break;
    default:
      break;
  }
}

// Mô tả ngắn 1 dòng cho từng phần thưởng - dùng để hiển thị UI (ô lịch + popup nhận quà)
export function describeRewardItem(rewardItem) {
  switch (rewardItem.type) {
    case "diamonds":
      return `${rewardItem.amount} 💎`;
    case "gems":
      return `${rewardItem.amount} Đá Quý`;
    case "crystals":
      return `${rewardItem.amount} Tinh Thể`;
    case "xaLoi":
      return `${rewardItem.amount} Xá Lợi`;
    case "item":
      return `${rewardItem.amount}x ${getItemById(rewardItem.id)?.name || rewardItem.id}`;
    case "divineBeast":
      return `Thần Thú: ${rewardItem.name}`;
    default:
      return "";
  }
}

export function claim7DayReward(day) {
  const dayData = NEWBIE_7DAY_REWARDS.find((d) => d.day === day);
  if (!dayData) return { success: false, message: "Ngày không hợp lệ." };
  if (isDayClaimed(day)) return { success: false, message: "Đã nhận quà ngày này rồi." };
  if (!isDayUnlocked(day)) return { success: false, message: "Ngày này chưa mở khoá." };

  dayData.items.forEach(applyRewardItem);
  state.claimed7DayRewards[day] = true;
  saveGame();

  return { success: true, message: `Đã nhận quà Ngày ${day}!`, rewardLines: dayData.items.map(describeRewardItem) };
}

export function isAny7DayRewardClaimable() {
  return NEWBIE_7DAY_REWARDS.some((d) => isDayUnlocked(d.day) && !isDayClaimed(d.day));
}

// ---------------- Trạng thái tổng hợp cho badge Sự Kiện ----------------

export function isAnyEventClaimable() {
  return isAnyMilestoneClaimable() || isAny7DayRewardClaimable();
}
