import { elements } from "./dom.js";
import { state, saveGame, loadGame, resetGame } from "./state.js";
import * as Big from "./numeric.js";
import { updateDisplay, createUpgrades, createAchievements, updateUpgradesVisibility } from "./ui.js";
import { createGemShop, createCritShop, renderAscensionPanel } from "./ui-prestige.js";
import { renderSkillTree } from "./ui-skilltree.js";
import { renderCollection } from "./ui-collection.js";
import { renderDailyQuests, renderWeeklyQuests } from "./ui-quests.js";
import { renderStats } from "./ui-stats.js";
import { renderWorlds } from "./ui-worlds.js";
import { renderNirvanaPanel, renderDivineBeasts } from "./ui-nirvana.js";
import {
  initDarkMode,
  initSfxToggle,
  applyDarkMode,
  autoClick,
  checkAchievements,
  toggleAllUpgrades,
  clickActions,
  processOfflineEarnings,
  tickEffects,
  activateGoldenBuff,
} from "./game.js";
import { prestige, ascend } from "./prestige.js";
import { performNirvana, purchaseEternalMult, rollGacha, isNirvanaUnlocked, calculateXaLoiGain, getEternalMultCost } from "./nirvana.js";
import { rollForCollectionDrop } from "./collection.js";
import { checkDailyQuestsRefresh, checkWeeklyQuestsRefresh, getQuestProgress, getWeeklyQuestProgress, isQuestDone } from "./quests.js";
import { canBuyMoreInBranch, getSkillNodeCost } from "./skilltree.js";
import { isWorldUnlocked, getWorldCurrency, getPetCost } from "./worlds.js";
import { spawnBoss, checkBossTimeout, autoBossDamageTick } from "./boss.js";
import { updateBossBar } from "./ui-boss.js";
import { spawnGoldenGift } from "./animations.js";
import {
  GOLDEN_GIFT_MIN_INTERVAL_MS,
  GOLDEN_GIFT_MAX_INTERVAL_MS,
  GOLDEN_GIFT_LIFETIME_MS,
  COLLECTION_DROP_MIN_INTERVAL_MS,
  COLLECTION_DROP_MAX_INTERVAL_MS,
  BOSS_MIN_INTERVAL_MS,
  BOSS_MAX_INTERVAL_MS,
  pets,
  worlds,
  GACHA_COST_XA_LOI,
} from "./data.js";

// Kiểm tra mỗi tab có "việc cần làm" không (mua được, nhận thưởng được...) để hiện chấm đỏ
function updateNotificationBadges() {
  const skillTreeReady = ["power", "speed", "crit", "ascension"].some(
    (branch) => canBuyMoreInBranch(branch) && Big.lte(getSkillNodeCost(branch), state.crystals)
  );
  elements.badgeSkillTree.classList.toggle("hidden", !skillTreeReady);
  elements.badgeSkillTreeFloating.classList.toggle("hidden", !skillTreeReady);

  const questsReady =
    state.dailyQuests.some((q) => !q.claimed && isQuestDone(getQuestProgress(q), q.target)) ||
    state.weeklyQuests.some((q) => !q.claimed && isQuestDone(getWeeklyQuestProgress(q), q.target));
  elements.badgeQuests.classList.toggle("hidden", !questsReady);

  const worldsReady = worlds.some((world) => {
    if (!isWorldUnlocked(world)) return false;
    const currency = getWorldCurrency(world.id);
    return (pets[world.id] || []).some((pet) => Big.lte(getPetCost(pet.id, pet), currency));
  });
  elements.badgeWorlds.classList.toggle("hidden", !worldsReady);

  const nirvanaReady =
    (isNirvanaUnlocked() && calculateXaLoiGain() >= 1) ||
    Big.gte(state.xaLoi, getEternalMultCost()) ||
    Big.gte(state.xaLoi, Big.fromNumber(GACHA_COST_XA_LOI));
  elements.badgeNirvana.classList.toggle("hidden", !nirvanaReady);
}

// Khởi tạo game
function initGame() {
  loadGame();
  initDarkMode();
  initSfxToggle();
  processOfflineEarnings();
  checkDailyQuestsRefresh();
  checkWeeklyQuestsRefresh();
  updateUpgradesVisibility();
  updateDisplay();
  createUpgrades();
  createAchievements();
  createGemShop();
  createCritShop();
  setInterval(autoClick, 1000);
  setInterval(saveGame, 5000);
  setInterval(checkAchievements, 1000);
  setInterval(tickEffects, 300);
  setInterval(updateNotificationBadges, 1000);
  updateNotificationBadges();
  setInterval(() => {
    checkBossTimeout();
    updateBossBar();
  }, 300);
  setInterval(autoBossDamageTick, 1000);
  scheduleNextGoldenGift();
  scheduleNextCollectionDrop();
  scheduleNextBoss();
}

// Lên lịch cho Boss xuất hiện sau 1 khoảng thời gian ngẫu nhiên
function scheduleNextBoss() {
  const delay =
    BOSS_MIN_INTERVAL_MS + Math.random() * (BOSS_MAX_INTERVAL_MS - BOSS_MIN_INTERVAL_MS);
  setTimeout(() => {
    spawnBoss();
    scheduleNextBoss();
  }, delay);
}

// Lên lịch cho Hộp Quà Vàng xuất hiện sau 1 khoảng thời gian ngẫu nhiên
function scheduleNextGoldenGift() {
  const delay =
    GOLDEN_GIFT_MIN_INTERVAL_MS +
    Math.random() * (GOLDEN_GIFT_MAX_INTERVAL_MS - GOLDEN_GIFT_MIN_INTERVAL_MS);
  setTimeout(() => {
    spawnGoldenGift(GOLDEN_GIFT_LIFETIME_MS / 1000, () => {
      activateGoldenBuff();
    });
    scheduleNextGoldenGift();
  }, delay);
}

// Lên lịch cho Cổ Vật/Di Vật rơi ngẫu nhiên (tự động, không cần bấm)
function scheduleNextCollectionDrop() {
  const delay =
    COLLECTION_DROP_MIN_INTERVAL_MS +
    Math.random() *
      (COLLECTION_DROP_MAX_INTERVAL_MS - COLLECTION_DROP_MIN_INTERVAL_MS);
  setTimeout(() => {
    rollForCollectionDrop(); // tự hiện animation bên trong nếu có rơi item mới
    scheduleNextCollectionDrop();
  }, delay);
}

// Mở modal Cây Kỹ Năng (vẽ lại toàn bộ cho mới nhất mỗi lần mở)
function openSkillTreeModal() {
  renderAscensionPanel();
  renderSkillTree();
  renderCollection();
  renderDailyQuests();
  renderWeeklyQuests();
  renderStats();
  renderWorlds();
  renderNirvanaPanel();
  renderDivineBeasts();
  elements.skillTreeModal.classList.remove("hidden");
  elements.skillTreeModal.classList.add("flex");
}

function closeSkillTreeModal() {
  elements.skillTreeModal.classList.remove("flex");
  elements.skillTreeModal.classList.add("hidden");
}

// Chuyển tab trong modal Cây Kỹ Năng (6 tab: Cây Kỹ Năng / Bộ Sưu Tập / Nhiệm Vụ / Thống Kê / Thế Giới / Niết Bàn)
const TABS = [
  { button: "tabSkillTree", panel: "skillTreePanel" },
  { button: "tabCollection", panel: "collectionPanel" },
  { button: "tabQuests", panel: "questsPanel" },
  { button: "tabStats", panel: "statsPanel" },
  { button: "tabWorlds", panel: "worldsPanel" },
  { button: "tabNirvana", panel: "nirvanaPanel" },
];

function showTab(activeKey) {
  TABS.forEach(({ button, panel }) => {
    const isActive = button === activeKey;
    elements[panel].classList.toggle("hidden", !isActive);
    elements[button].classList.toggle("bg-blue-500", isActive);
    elements[button].classList.toggle("text-white", isActive);
    elements[button].classList.toggle("bg-gray-200", !isActive);
    elements[button].classList.toggle("text-gray-700", !isActive);
  });
}

// ---- Event listeners ----
elements.clickButton.addEventListener("click", clickActions);

elements.openSettings.addEventListener("click", () => {
  elements.settingsModal.classList.remove("hidden");
  elements.settingsModal.classList.add("flex");
  setTimeout(() => {
    elements.settingsContent.classList.remove("scale-0");
    elements.settingsContent.classList.add("scale-100");
  }, 50);
});

elements.closeSettings.addEventListener("click", () => {
  elements.settingsContent.classList.remove("scale-100");
  elements.settingsContent.classList.add("scale-0");
  setTimeout(() => {
    elements.settingsModal.classList.remove("flex");
    elements.settingsModal.classList.add("hidden");
  }, 300);
});

elements.saveGame.addEventListener("click", () => {
  saveGame();
  alert("Đã lưu game!");
});

elements.resetGame.addEventListener("click", resetGame);

elements.toggleUpgrades.addEventListener("click", toggleAllUpgrades);

elements.prestigeButton.addEventListener("click", prestige);

elements.darkModeToggle.addEventListener("change", (e) => {
  state.darkMode = e.target.checked;
  applyDarkMode(state.darkMode);
  localStorage.setItem("darkMode", state.darkMode.toString());
});

elements.sfxToggle.addEventListener("change", (e) => {
  state.sfxEnabled = e.target.checked;
});

elements.offlineEarningsClose.addEventListener("click", () => {
  elements.offlineEarningsModal.classList.remove("flex");
  elements.offlineEarningsModal.classList.add("hidden");
});

elements.openSkillTree.addEventListener("click", openSkillTreeModal);
elements.closeSkillTree.addEventListener("click", closeSkillTreeModal);
elements.tabSkillTree.addEventListener("click", () => showTab("tabSkillTree"));
elements.tabCollection.addEventListener("click", () => showTab("tabCollection"));
elements.tabQuests.addEventListener("click", () => showTab("tabQuests"));
elements.tabStats.addEventListener("click", () => showTab("tabStats"));
elements.tabWorlds.addEventListener("click", () => showTab("tabWorlds"));
elements.tabNirvana.addEventListener("click", () => showTab("tabNirvana"));
elements.ascendButton.addEventListener("click", ascend);
elements.nirvanaButton.addEventListener("click", performNirvana);
elements.eternalMultButton.addEventListener("click", () => {
  if (purchaseEternalMult()) renderNirvanaPanel();
});
elements.gachaButton.addEventListener("click", () => {
  const result = rollGacha();
  if (!result) return;
  if (result.isDuplicate) {
    alert(
      `🔁 Trùng rồi! ${result.beast.name} đã lên cấp ${result.newLevel} (buff mạnh hơn).`
    );
  } else {
    alert(`🎉 Chúc mừng! Bạn nhận được Thần Thú mới: ${result.beast.name}`);
  }
  renderNirvanaPanel();
  renderDivineBeasts();
});

// Phím tắt "T" để mở/đóng Cây Kỹ Năng (bỏ qua khi đang gõ vào ô nhập liệu)
document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.key.toLowerCase() === "t") {
    if (elements.skillTreeModal.classList.contains("flex")) {
      closeSkillTreeModal();
    } else {
      openSkillTreeModal();
    }
  }
});

// Chặn chuột phải và bôi đen/copy chữ trong game
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());

// Lưu game ngay trước khi đóng/rời trang để tính Offline Earnings chính xác hơn
window.addEventListener("beforeunload", saveGame);

// Bắt đầu game
initGame();
