import { state, saveGame } from "./state.js";
import * as Big from "./numeric.js";
import { bossFight } from "./effects.js";
import {
  BASE_BOSS_HP,
  BOSS_HP_GROWTH,
  BOSS_NAMES,
  BOSS_FIGHT_DURATION_MS,
  BOSS_REWARD_BUCKS_MULTIPLIER,
  AUTO_BOSS_DAMAGE_PER_LEVEL,
  BOSS_TIERS,
  BOSS_MILESTONE_INTERVAL,
  BOSS_MILESTONE_REWARD_MULTIPLIER,
  BOSS_MILESTONE_NAMES,
} from "./data.js";
import { earnBucks } from "./game.js";
import { getEffectiveCps } from "./prestige.js";
import { rollForCollectionDrop } from "./collection.js";
import { rollBossItemDrop, addItem } from "./items.js";
import { getTotalBossDamageMultiplier, getTotalDiamondDropBonus, getTotalItemDropBonus } from "./bonuses.js";
import { updateDisplay, formatNumber } from "./ui.js";
import { showBossVictoryAnimation, showBossFleeAnimation, showToast } from "./animations.js";
import { playBossVictorySound, playBossFleeSound, playItemDropSound } from "./sounds.js";

const DIAMOND_DROP_CHANCE = 0.1; // 10% - tỉ lệ nhỏ, độc lập với bảng rơi item
const DIAMOND_DROP_MIN = 5;
const DIAMOND_DROP_MAX = 50;

// Roll rơi Kim Cương khi hạ Boss - CHỈ 1 lần random cho việc "có rơi hay không", cộng thêm 1 lần
// random khác CHỈ khi đã xác định có rơi (để chọn số lượng trong khoảng) - không roll lặp lại vô ích.
function rollBossDiamondDrop() {
  const chance = Math.min(1, DIAMOND_DROP_CHANCE + getTotalDiamondDropBonus());
  if (Math.random() >= chance) return 0;
  return Math.floor(Math.random() * (DIAMOND_DROP_MAX - DIAMOND_DROP_MIN + 1)) + DIAMOND_DROP_MIN;
}

// Roll thứ hạng Boss - CHỈ 1 lần random theo weight. Tier đánh dấu oncePerRealDay (Boss Ngày) bị
// loại khỏi bảng roll nếu hôm nay đã từng ra rồi, tránh rơi trúng nhiều lần "Boss Ngày" cùng 1 ngày.
function rollBossTier() {
  const today = new Date().toDateString();
  const dailyUsedToday = state.lastDailyBossDate === today;
  const pool = BOSS_TIERS.filter((tier) => !(tier.oncePerRealDay && dailyUsedToday));
  const totalWeight = pool.reduce((sum, tier) => sum + tier.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const tier of pool) {
    roll -= tier.weight;
    if (roll < 0) return tier;
  }
  return pool[pool.length - 1];
}

// Cấp Boss sắp tới có rơi đúng mốc "Boss Trùm" không (mỗi BOSS_MILESTONE_INTERVAL cấp 1 lần)
function isMilestoneBossLevel(level) {
  return level > 0 && level % BOSS_MILESTONE_INTERVAL === 0;
}

// Boss có đang xuất hiện/đang đánh dở không
export function isBossActive() {
  return bossFight.active;
}

// Cho 1 Boss mới xuất hiện (bỏ qua nếu đang có trận đánh dở)
// bossLevel KHÔNG bị giới hạn trần - dùng Big.pow (tính trong không gian log) nên HP không bao giờ
// tràn thành Infinity dù bossLevel tăng vô hạn theo thời gian chơi.
export function spawnBoss() {
  if (bossFight.active) return;

  const tier = rollBossTier();
  if (tier.oncePerRealDay) {
    state.lastDailyBossDate = new Date().toDateString();
  }

  const isMilestone = isMilestoneBossLevel(state.bossLevel);
  const milestoneRewardMultiplier = isMilestone ? BOSS_MILESTONE_REWARD_MULTIPLIER : 1;
  const nameEntry = isMilestone
    ? BOSS_MILESTONE_NAMES[(state.bossLevel / BOSS_MILESTONE_INTERVAL - 1) % BOSS_MILESTONE_NAMES.length]
    : BOSS_NAMES[state.bossLevel % BOSS_NAMES.length];

  const maxHp = Big.floor(
    Big.scale(Big.scale(Big.pow(Big.fromNumber(BOSS_HP_GROWTH), state.bossLevel), BASE_BOSS_HP), tier.hpMultiplier)
  );
  bossFight.active = true;
  bossFight.hp = maxHp;
  bossFight.maxHp = maxHp;
  bossFight.tier = tier;
  bossFight.image = nameEntry.image;
  bossFight.isMilestone = isMilestone;
  bossFight.milestoneRewardMultiplier = milestoneRewardMultiplier;
  bossFight.endTime = Date.now() + BOSS_FIGHT_DURATION_MS;
  bossFight.name = `${isMilestone ? "🔱 " : ""}${tier.namePrefix}${nameEntry.name} (Cấp ${
    state.bossLevel + 1
  })`;
  updateDisplay();
}

// Gây sát thương lên Boss đang xuất hiện (gọi từ clickActions và từ Bot Săn Boss).
// Sát thương được nhân thêm bởi hệ số Sát Thương Boss từ nhánh Vận May / Pet / Cổ Vật.
export function damageBoss(amount) {
  if (!bossFight.active || Big.lte(amount, Big.fromNumber(0))) return;
  const finalDamage = Big.scale(amount, getTotalBossDamageMultiplier());
  bossFight.hp = Big.max(Big.fromNumber(0), Big.sub(bossFight.hp, finalDamage));
  if (Big.lte(bossFight.hp, Big.fromNumber(0))) {
    winBossFight();
  }
}

// Thắng trận: thưởng Nexyroth + có cơ hội rơi Cổ Vật/Di Vật + Item + Kim Cương (nhân theo rewardMultiplier
// của thứ hạng Boss), tăng Cấp Boss cho lần sau
function winBossFight() {
  const bossName = bossFight.name;
  const tier = bossFight.tier;
  const bonusBucks = Big.floor(
    Big.scale(bossFight.maxHp, BOSS_REWARD_BUCKS_MULTIPLIER * tier.rewardMultiplier * bossFight.milestoneRewardMultiplier)
  );

  bossFight.active = false;
  state.bossLevel += 1;
  state.bossesDefeated += 1;

  earnBucks(bonusBucks);
  rollForCollectionDrop(); // tự hiện animation riêng bên trong nếu rơi trúng item mới

  const droppedItem = rollBossItemDrop(getTotalItemDropBonus()); // CHỈ 1 lần random cho cả bảng rơi, xử lý đúng 1 lần/lần Boss chết
  if (droppedItem) {
    addItem(droppedItem.id, 1);
    showToast(`🎁 Boss đã đánh rơi: ${droppedItem.name} ×1`, "success");
    playItemDropSound();
    saveGame();
  }

  const diamondAmount = rollBossDiamondDrop() * tier.rewardMultiplier;
  if (diamondAmount > 0) {
    state.diamonds = Big.add(state.diamonds, Big.fromNumber(diamondAmount));
    state.totalDiamondsEarned = Big.add(state.totalDiamondsEarned, Big.fromNumber(diamondAmount));
    showToast(`💎 Boss đã đánh rơi: ${diamondAmount} Kim Cương`, "success");
    playItemDropSound();
    saveGame();
  }

  showBossVictoryAnimation(bossName, formatNumber(bonusBucks));
  updateDisplay();
  playBossVictorySound();
}

// Kiểm tra hết giờ chưa (gọi định kỳ, giống Combo) - Boss bỏ chạy nếu không hạ kịp
export function checkBossTimeout() {
  if (bossFight.active && Date.now() > bossFight.endTime) {
    const bossName = bossFight.name;
    bossFight.active = false;
    showBossFleeAnimation(bossName);
    updateDisplay();
    playBossFleeSound();
  }
}

// Tự động gây sát thương lên Boss theo Nexyroth/giây, nếu đã mua "Bot Săn Boss" (gọi mỗi giây)
export function autoBossDamageTick() {
  if (!bossFight.active) return;
  const level = state.gemUpgrades.bossBot || 0;
  if (level < 1) return;

  const damage = Big.scale(getEffectiveCps(), AUTO_BOSS_DAMAGE_PER_LEVEL * level);
  damageBoss(Big.floor(damage));
}
