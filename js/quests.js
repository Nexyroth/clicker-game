import { state } from "./state.js";
import * as Big from "./numeric.js";
import { questPool, DAILY_QUEST_COUNT, weeklyQuestPool, WEEKLY_QUEST_COUNT } from "./data.js";
import { updateDisplay } from "./ui.js";
import { playQuestClaimSound } from "./sounds.js";

// Tiến trình nhiệm vụ có thể là BigNum (loại "bucksEarned") hoặc Number thường (mọi loại còn lại) -
// 2 hàm dưới đây là nơi DUY NHẤT so sánh/tính % giữa progress và target, để ui-quests.js không phải
// tự phân biệt kiểu dữ liệu.
function toBig(value) {
  return typeof value === "object" ? value : Big.fromNumber(value);
}

export function isQuestDone(progress, target) {
  return Big.gte(toBig(progress), Big.fromNumber(target));
}

export function questProgressPercent(progress, target) {
  return Math.min(100, Math.round(Big.toNumber(Big.div(toBig(progress), Big.fromNumber(target))) * 100));
}

export function questProgressDisplay(progress, target) {
  return Big.min(toBig(progress), Big.fromNumber(target));
}

// ---------------- Nhiệm Vụ Hàng Ngày ----------------

// Kiểm tra đã sang ngày mới chưa, nếu rồi thì random lại bộ nhiệm vụ + reset tiến trình trong ngày
export function checkDailyQuestsRefresh() {
  const today = new Date().toDateString();
  if (state.dailyQuestsDate === today) return; // vẫn cùng ngày, không cần đổi

  state.dailyQuestsDate = today;
  state.dailyProgress = {
    clicks: 0,
    bucksEarned: Big.fromNumber(0),
    upgradesBought: 0,
    crits: 0,
    goldenGifts: 0,
    maxCombo: 0,
  };

  const pool = [...questPool];
  const picked = [];
  for (let i = 0; i < DAILY_QUEST_COUNT && pool.length > 0; i++) {
    const index = Math.floor(Math.random() * pool.length);
    const quest = pool.splice(index, 1)[0];
    picked.push({ ...quest, claimed: false });
  }
  state.dailyQuests = picked;
}

// Tiến trình hiện tại của 1 nhiệm vụ (đọc từ dailyProgress theo type của nhiệm vụ đó)
export function getQuestProgress(quest) {
  return state.dailyProgress[quest.type] || 0;
}

// Nhận thưởng 1 nhiệm vụ đã hoàn thành
export function claimQuestReward(index) {
  const quest = state.dailyQuests[index];
  if (!quest || quest.claimed) return false;
  if (!isQuestDone(getQuestProgress(quest), quest.target)) return false;

  quest.claimed = true;
  state.gems = Big.add(state.gems, Big.fromNumber(quest.reward));
  updateDisplay();
  playQuestClaimSound();
  return true;
}

// ---------------- Nhiệm Vụ Hàng Tuần ----------------

// Lấy ngày Thứ 2 (đầu tuần) của tuần hiện tại, dùng làm "mã tuần" để biết khi nào cần đổi mới
function getCurrentWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0 = Chủ Nhật, 1 = Thứ 2, ...
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toDateString();
}

// Kiểm tra đã sang tuần mới chưa, nếu rồi thì random lại bộ nhiệm vụ tuần + reset tiến trình trong tuần
export function checkWeeklyQuestsRefresh() {
  const weekStart = getCurrentWeekStart();
  if (state.weeklyQuestsDate === weekStart) return; // vẫn cùng tuần, không cần đổi

  state.weeklyQuestsDate = weekStart;
  state.weeklyProgress = {
    clicks: 0,
    bucksEarned: Big.fromNumber(0),
    upgradesBought: 0,
    crits: 0,
    goldenGifts: 0,
    maxCombo: 0,
    prestiges: 0,
    ascensions: 0,
  };

  const pool = [...weeklyQuestPool];
  const picked = [];
  for (let i = 0; i < WEEKLY_QUEST_COUNT && pool.length > 0; i++) {
    const index = Math.floor(Math.random() * pool.length);
    const quest = pool.splice(index, 1)[0];
    picked.push({ ...quest, claimed: false });
  }
  state.weeklyQuests = picked;
}

// Tiến trình hiện tại của 1 nhiệm vụ tuần (đọc từ weeklyProgress theo type của nhiệm vụ đó)
export function getWeeklyQuestProgress(quest) {
  return state.weeklyProgress[quest.type] || 0;
}

// Nhận thưởng 1 nhiệm vụ tuần đã hoàn thành - thưởng Tinh Thể thay vì Đá Quý
export function claimWeeklyQuestReward(index) {
  const quest = state.weeklyQuests[index];
  if (!quest || quest.claimed) return false;
  if (!isQuestDone(getWeeklyQuestProgress(quest), quest.target)) return false;

  quest.claimed = true;
  state.crystals = Big.add(state.crystals, Big.fromNumber(quest.reward));
  state.totalCrystalsEarned = Big.add(state.totalCrystalsEarned, Big.fromNumber(quest.reward));
  updateDisplay();
  playQuestClaimSound();
  return true;
}
