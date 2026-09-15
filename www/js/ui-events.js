import { elements } from "./dom.js";
import { formatNumber } from "./ui.js";
import {
  EVENT_GROUPS,
  getEventGroupById,
  getMilestoneProgress,
  isMilestoneComplete,
  isMilestoneClaimed,
  claimMilestoneReward,
  isAnyMilestoneClaimable,
  getCurrentLoginDay,
  isDayUnlocked,
  isDayClaimed,
  claim7DayReward,
  isAny7DayRewardClaimable,
  describeRewardItem,
} from "./events.js";
import { showToast, showRewardPopup } from "./animations.js";
import { playPurchaseSound } from "./sounds.js";

// Điều hướng 3 cấp - trạng thái UI thuần tuý (không phải dữ liệu gameplay nên không lưu vào state):
// "list" (danh sách nhóm sự kiện) -> "intro" (giới thiệu + cách chơi của 1 nhóm) -> "tasks" (nhiệm
// vụ/lịch nhận quà thật của nhóm đó).
let viewState = "list";
let selectedGroupId = null;

function isGroupClaimable(group) {
  return group.type === "milestoneLadder" ? isAnyMilestoneClaimable() : isAny7DayRewardClaimable();
}

function renderList() {
  EVENT_GROUPS.forEach((group) => {
    const claimable = isGroupClaimable(group);
    const card = document.createElement("button");
    card.className =
      "event-group-card w-full text-left bg-white border-2 rounded-lg p-3 mb-3 transition duration-300 ease-in-out hover:border-orange-300 " +
      (claimable ? "border-green-400" : "border-gray-200");
    card.dataset.id = group.id;
    card.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <p class="text-sm font-semibold text-gray-800">${group.icon} ${group.title}</p>
        ${claimable ? `<span class="text-xs font-semibold text-green-600 animate-pulse">Có quà mới!</span>` : `<span class="text-xs text-gray-400">Xem chi tiết ›</span>`}
      </div>
      <p class="text-xs text-gray-500">${group.shortDescription}</p>
    `;
    elements.eventsList.appendChild(card);
  });
}

function renderBackButton(id, label) {
  const back = document.createElement("button");
  back.id = id;
  back.className = "text-sm text-gray-500 hover:text-gray-700 mb-3";
  back.textContent = label;
  elements.eventsList.appendChild(back);
}

function renderIntro(group) {
  renderBackButton("event-back-to-list", "‹ Quay lại danh sách");

  const box = document.createElement("div");
  box.className = "bg-white border-2 border-gray-200 rounded-lg p-4";
  box.innerHTML = `
    <p class="text-base font-semibold text-gray-800 mb-2">${group.icon} ${group.title}</p>
    <p class="text-sm text-gray-600 mb-4">${group.howToPlay}</p>
    <button id="event-view-tasks" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
      ${group.type === "sevenDayLogin" ? "Xem Lịch Nhận Quà" : "Xem Nhiệm Vụ"}
    </button>
  `;
  elements.eventsList.appendChild(box);
}

function renderMilestoneTasks(group) {
  renderBackButton("event-back-to-intro", "‹ Quay lại giới thiệu");

  const progress = getMilestoneProgress();
  group.milestones.forEach((milestone) => {
    const complete = isMilestoneComplete(milestone);
    const claimed = isMilestoneClaimed(milestone.id);
    const percent = Math.min(100, Math.round((progress / milestone.target) * 100));

    const card = document.createElement("div");
    card.className = `bg-white border-2 rounded-lg p-3 mb-3 ${claimed ? "border-gray-200" : complete ? "border-green-400" : "border-gray-200"}`;
    card.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <p class="text-sm font-semibold text-gray-800">${milestone.label} - ${formatNumber(milestone.target)} lần click</p>
        <span class="text-xs font-semibold text-cyan-600">${milestone.reward} 💎</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
        <div class="bg-orange-500 h-2 rounded-full" style="width: ${percent}%"></div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">${formatNumber(Math.min(progress, milestone.target))} / ${formatNumber(milestone.target)}</span>
        ${
          claimed
            ? `<span class="text-xs font-semibold text-gray-400">✓ Đã nhận</span>`
            : `<button class="claim-milestone-button text-xs font-bold py-1 px-3 rounded transition duration-300 ease-in-out ${
                complete ? "bg-green-500 hover:bg-green-600 text-white animate-pulse" : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }" data-id="${milestone.id}" ${complete ? "" : "disabled"}>
                Nhận thưởng
              </button>`
        }
      </div>
    `;
    elements.eventsList.appendChild(card);
  });
}

function render7DayTasks(group) {
  renderBackButton("event-back-to-intro", "‹ Quay lại giới thiệu");

  const currentDay = getCurrentLoginDay();
  const grid = document.createElement("div");
  grid.className = "grid grid-cols-2 sm:grid-cols-4 gap-2";

  group.days.forEach((dayData) => {
    const unlocked = isDayUnlocked(dayData.day);
    const claimed = isDayClaimed(dayData.day);
    const available = unlocked && !claimed;
    const teaser = dayData.items.map(describeRewardItem).join(", ");

    const cell = document.createElement("div");
    cell.className = `border-2 rounded-lg p-2 text-center ${
      claimed ? "border-green-400 bg-green-50" : available ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-gray-50 opacity-60"
    }`;
    cell.innerHTML = `
      <p class="text-xs font-bold ${dayData.day === 7 ? "text-yellow-600" : "text-gray-700"}">${dayData.day === 7 ? "🏆 Ngày 7" : `Ngày ${dayData.day}`}</p>
      <p class="text-[11px] text-gray-500 my-1 leading-tight">${teaser}</p>
      ${
        claimed
          ? `<span class="text-xs font-semibold text-green-600">✓ Đã Nhận</span>`
          : available
          ? `<button class="claim-day-button w-full text-xs font-bold py-1 px-2 rounded bg-orange-500 hover:bg-orange-600 text-white animate-pulse" data-day="${dayData.day}">Nhận Quà</button>`
          : `<span class="text-xs text-gray-400">🔒 Khoá</span>`
      }
    `;
    grid.appendChild(cell);
  });

  elements.eventsList.appendChild(grid);
  const note = document.createElement("p");
  note.className = "text-xs text-gray-400 mt-3";
  note.textContent = `Hiện đang ở Ngày ${currentDay}/7 kể từ lần đầu vào game.`;
  elements.eventsList.appendChild(note);
}

function renderTasks(group) {
  if (group.type === "milestoneLadder") renderMilestoneTasks(group);
  else if (group.type === "sevenDayLogin") render7DayTasks(group);
}

export function renderEvents() {
  elements.eventsList.innerHTML = "";
  const group = selectedGroupId && getEventGroupById(selectedGroupId);

  if (!group) {
    viewState = "list";
    selectedGroupId = null;
    renderList();
  } else if (viewState === "tasks") {
    renderTasks(group);
  } else {
    viewState = "intro";
    renderIntro(group);
  }
}

export { isAnyEventClaimable } from "./events.js";

// Event delegation - 1 listener duy nhất, không tạo lại mỗi lần renderEvents()
elements.eventsList.addEventListener("click", (e) => {
  if (e.target.closest("#event-back-to-list")) {
    viewState = "list";
    selectedGroupId = null;
    renderEvents();
    return;
  }
  if (e.target.closest("#event-back-to-intro")) {
    viewState = "intro";
    renderEvents();
    return;
  }
  if (e.target.closest("#event-view-tasks")) {
    viewState = "tasks";
    renderEvents();
    return;
  }

  const groupCard = e.target.closest(".event-group-card");
  if (groupCard) {
    selectedGroupId = groupCard.dataset.id;
    viewState = "intro";
    renderEvents();
    return;
  }

  const milestoneButton = e.target.closest(".claim-milestone-button");
  if (milestoneButton) {
    const result = claimMilestoneReward(milestoneButton.dataset.id);
    if (result.success) {
      playPurchaseSound();
      showRewardPopup("🎉 Nhận Thưởng!", [`${result.message}`]);
      renderEvents();
    } else {
      showToast(result.message, "error");
    }
    return;
  }

  const dayButton = e.target.closest(".claim-day-button");
  if (dayButton) {
    const result = claim7DayReward(parseInt(dayButton.dataset.day, 10));
    if (result.success) {
      playPurchaseSound();
      showRewardPopup(`🎉 ${result.message}`, result.rewardLines);
      renderEvents();
    } else {
      showToast(result.message, "error");
    }
  }
});
