import { elements } from "./dom.js";
import { state } from "./state.js";
import { formatNumber } from "./ui.js";
import {
  getQuestProgress,
  claimQuestReward,
  getWeeklyQuestProgress,
  claimWeeklyQuestReward,
  isQuestDone,
  questProgressPercent,
  questProgressDisplay,
} from "./quests.js";

// rewardUnit: "Đá Quý" (ngày) hoặc "Tinh Thể" (tuần) - buttonClass để phân biệt event listener của 2 loại
function renderQuestItem(quest, index, getProgressFn, rewardUnit, buttonClass) {
  const progress = getProgressFn(quest);
  const percent = questProgressPercent(progress, quest.target);
  const done = isQuestDone(progress, quest.target);
  const label = quest.label.replace("{target}", formatNumber(quest.target));

  const el = document.createElement("div");
  el.className = `rounded-lg p-3 border-2 ${
    quest.claimed
      ? "bg-gray-100 border-gray-200"
      : done
      ? "bg-green-50 border-green-400"
      : "bg-white border-gray-200"
  }`;

  el.innerHTML = `
    <div class="flex items-center justify-between mb-1">
      <p class="text-sm font-semibold ${quest.claimed ? "text-gray-400" : "text-gray-800"}">${label}</p>
      <span class="text-xs font-semibold text-pink-500">+${quest.reward} ${rewardUnit}</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
      <div class="bg-blue-500 h-2 rounded-full" style="width: ${percent}%"></div>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-xs text-gray-500">${formatNumber(questProgressDisplay(progress, quest.target))} / ${formatNumber(quest.target)}</span>
      ${
        quest.claimed
          ? `<span class="text-xs font-semibold text-gray-400">✓ Đã nhận</span>`
          : `<button class="${buttonClass} text-xs font-bold py-1 px-3 rounded transition duration-300 ease-in-out ${
              done
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }" data-index="${index}" ${done ? "" : "disabled"}>
              Nhận thưởng
            </button>`
      }
    </div>
  `;
  return el;
}

// Vẽ lại danh sách Nhiệm Vụ Hàng Ngày - gọi khi mở modal và sau khi nhận thưởng
export function renderDailyQuests() {
  elements.questsList.innerHTML = "";
  state.dailyQuests.forEach((quest, index) => {
    elements.questsList.appendChild(
      renderQuestItem(quest, index, getQuestProgress, "Đá Quý", "quest-claim-button")
    );
  });

  document.querySelectorAll(".quest-claim-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (claimQuestReward(Number(button.dataset.index))) {
        renderDailyQuests();
      }
    });
  });
}

// Vẽ lại danh sách Nhiệm Vụ Hàng Tuần - gọi khi mở modal và sau khi nhận thưởng
export function renderWeeklyQuests() {
  elements.weeklyQuestsList.innerHTML = "";
  state.weeklyQuests.forEach((quest, index) => {
    elements.weeklyQuestsList.appendChild(
      renderQuestItem(
        quest,
        index,
        getWeeklyQuestProgress,
        "Tinh Thể",
        "weekly-quest-claim-button"
      )
    );
  });

  document.querySelectorAll(".weekly-quest-claim-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (claimWeeklyQuestReward(Number(button.dataset.index))) {
        renderWeeklyQuests();
      }
    });
  });
}
