import { elements } from "./dom.js";
import { state, saveGame, loadGame, resetGame, exportSave, importSave } from "./state.js";
import * as Big from "./numeric.js";
import { updateDisplay, createUpgrades, createAchievements, updateUpgradesVisibility } from "./ui.js";
import { createGemShop, createCritShop, renderAscensionPanel } from "./ui-prestige.js";
import { renderSkillTree } from "./ui-skilltree.js";
import { renderCollection } from "./ui-collection.js";
import { renderDailyQuests, renderWeeklyQuests } from "./ui-quests.js";
import { renderStats } from "./ui-stats.js";
import { renderWorlds } from "./ui-worlds.js";
import { renderNirvanaPanel, renderDivineBeasts } from "./ui-nirvana.js";
import { renderInventory } from "./ui-inventory.js";
import { renderShop, isAnyShopItemAffordable } from "./ui-shop.js";
import { renderEvents, isAnyEventClaimable } from "./ui-events.js";
import { redeemCode } from "./codes.js";
import { initAntiCheat } from "./anti-cheat.js";
import {
  initDarkMode,
  initSfxToggle,
  applyDarkMode,
  autoClick,
  autoClickerPotionTick,
  checkAchievements,
  toggleAllUpgrades,
  setBuyQuantityMode,
  clickActions,
  processOfflineEarnings,
  tickEffects,
  activateGoldenBuff,
} from "./game.js";
import { AUTO_CLICKER_TICK_MS } from "./items.js";
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

  elements.badgeShop.classList.toggle("hidden", !isAnyShopItemAffordable());
  elements.badgeEvents.classList.toggle("hidden", !isAnyEventClaimable());
}

// Khởi tạo game
function initGame() {
  loadGame();
  initAntiCheat();
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
  setInterval(autoClickerPotionTick, AUTO_CLICKER_TICK_MS);
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

// Mở modal hub Cây Kỹ Năng (vẽ lại toàn bộ cho mới nhất mỗi lần mở). Phím T / nút 🌳.
function openSkillTreeModal(tabKey = "tabSkillTree") {
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
  showTab(tabKey);
}

function closeSkillTreeModal() {
  elements.skillTreeModal.classList.remove("flex");
  elements.skillTreeModal.classList.add("hidden");
}

// Balo, Shop và Sự Kiện là 3 modal ĐỘC LẬP (không còn là tab trong hub Cây Kỹ Năng) - mỗi cái có
// nút riêng trong thanh hành động cố định dưới cùng (dùng được cả mobile lẫn PC) + phím tắt B/H/E.
function openInventoryModal() {
  renderInventory();
  elements.inventoryModal.classList.remove("hidden");
  elements.inventoryModal.classList.add("flex");
}
function closeInventoryModal() {
  elements.inventoryModal.classList.remove("flex");
  elements.inventoryModal.classList.add("hidden");
}

function openShopModal() {
  renderShop();
  elements.shopModal.classList.remove("hidden");
  elements.shopModal.classList.add("flex");
}
function closeShopModal() {
  elements.shopModal.classList.remove("flex");
  elements.shopModal.classList.add("hidden");
}

function openEventsModal() {
  renderEvents();
  elements.eventsModal.classList.remove("hidden");
  elements.eventsModal.classList.add("flex");
}
function closeEventsModal() {
  elements.eventsModal.classList.remove("flex");
  elements.eventsModal.classList.add("hidden");
}

// Chuyển tab trong modal hub (6 tab: Cây Kỹ Năng / Bộ Sưu Tập / Nhiệm Vụ / Thống Kê / Thế Giới /
// Niết Bàn - Balo/Shop/Sự Kiện đã tách thành modal riêng)
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
elements.buyMode1.addEventListener("click", () => setBuyQuantityMode(1));
elements.buyMode10.addEventListener("click", () => setBuyQuantityMode(10));
elements.buyMode25.addEventListener("click", () => setBuyQuantityMode(25));
elements.buyModeMax.addEventListener("click", () => setBuyQuantityMode("max"));

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

elements.openSkillTree.addEventListener("click", () => openSkillTreeModal("tabSkillTree"));
elements.closeSkillTree.addEventListener("click", closeSkillTreeModal);
elements.tabSkillTree.addEventListener("click", () => showTab("tabSkillTree"));
elements.tabCollection.addEventListener("click", () => showTab("tabCollection"));
elements.tabQuests.addEventListener("click", () => showTab("tabQuests"));
elements.tabStats.addEventListener("click", () => showTab("tabStats"));
elements.tabWorlds.addEventListener("click", () => showTab("tabWorlds"));
elements.tabNirvana.addEventListener("click", () => showTab("tabNirvana"));

elements.openInventory.addEventListener("click", openInventoryModal);
elements.closeInventory.addEventListener("click", closeInventoryModal);
elements.openShop.addEventListener("click", openShopModal);
elements.closeShop.addEventListener("click", closeShopModal);
elements.openEvents.addEventListener("click", openEventsModal);
elements.closeEvents.addEventListener("click", closeEventsModal);

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

// Redeem Code (Cài Đặt) - bấm nút hoặc Enter trong ô nhập
function submitRedeemCode() {
  const result = redeemCode(elements.redeemCodeInput.value);
  elements.redeemCodeMessage.textContent = result.message;
  elements.redeemCodeMessage.className = `text-xs mt-2 min-h-[1rem] ${
    result.success ? "text-green-600" : "text-red-500"
  }`;
  if (result.success) {
    elements.redeemCodeInput.value = "";
    updateDisplay();
    renderInventory();
  }
}
elements.redeemCodeButton.addEventListener("click", submitRedeemCode);
elements.redeemCodeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitRedeemCode();
});

// Xuất/Nhập save - cách duy nhất chuyển tiến trình giữa bản Online và bản Offline (2 origin khác
// nhau nên localStorage tách biệt, không thể tự đồng bộ).
function setSaveCodeMessage(text, ok) {
  elements.saveCodeMessage.textContent = text;
  elements.saveCodeMessage.className = `text-xs mt-2 min-h-[1rem] ${ok ? "text-green-600" : "text-red-500"}`;
}

elements.exportSaveButton.addEventListener("click", () => {
  saveGame();
  const code = exportSave();
  if (!code) {
    setSaveCodeMessage("Chưa có dữ liệu save để xuất.", false);
    return;
  }
  elements.saveCodeBox.value = code;
  elements.saveCodeBox.select();
  setSaveCodeMessage("Đã xuất! Copy toàn bộ mã trong ô trên và lưu lại.", true);
});

elements.importSaveButton.addEventListener("click", () => {
  const code = elements.saveCodeBox.value;
  if (!code.trim()) {
    setSaveCodeMessage("Hãy dán mã save vào ô trên trước.", false);
    return;
  }
  if (!confirm("Nhập save sẽ GHI ĐÈ toàn bộ tiến trình hiện tại. Bạn chắc chứ?")) return;

  const result = importSave(code);
  setSaveCodeMessage(result.message, result.success);
  if (result.success) {
    // Gỡ autosave trước khi reload, nếu không state cũ trong bộ nhớ sẽ ghi đè ngược save vừa nhập
    window.removeEventListener("beforeunload", saveGame);
    setTimeout(() => location.reload(), 600);
  }
});

// Phím tắt PC. Space = click, 1-4 và T/B/H/E = mở nhanh các bảng (bỏ qua khi đang gõ liệu).
document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) {
    return;
  }

  // Space bấm Click Ngay!. preventDefault để trang không bị cuộn xuống, và không xử lý khi đang
  // focus vào 1 nút bất kỳ (trình duyệt đã tự bắn click cho nút đó -> tránh tính 2 lần).
  if (e.code === "Space") {
    e.preventDefault();
    if (tag !== "BUTTON") clickActions();
    return;
  }

  const toggleModal = (modalEl, open, close) => {
    if (modalEl.classList.contains("flex")) close();
    else open();
  };

  const panelByKey = {
    t: () => toggleModal(elements.skillTreeModal, () => openSkillTreeModal("tabSkillTree"), closeSkillTreeModal),
    b: () => toggleModal(elements.inventoryModal, openInventoryModal, closeInventoryModal),
    h: () => toggleModal(elements.shopModal, openShopModal, closeShopModal),
    e: () => toggleModal(elements.eventsModal, openEventsModal, closeEventsModal),
  };
  // 1-4 là phím tắt số, mở đúng 4 bảng như T/B/H/E cho người quen dùng hàng phím số
  const numberAlias = { 1: "t", 2: "b", 3: "h", 4: "e" };

  const key = numberAlias[e.key] || e.key.toLowerCase();
  if (panelByKey[key]) panelByKey[key]();
});

// Chặn chuột phải và bôi đen/copy chữ trong game
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());

// Lưu game ngay trước khi đóng/rời trang để tính Offline Earnings chính xác hơn
window.addEventListener("beforeunload", saveGame);

// Bắt đầu game
initGame();
