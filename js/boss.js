import { state } from "./state.js";
import * as Big from "./numeric.js";
import { bossFight } from "./effects.js";
import {
  BASE_BOSS_HP,
  BOSS_HP_GROWTH,
  BOSS_NAMES,
  BOSS_FIGHT_DURATION_MS,
  BOSS_REWARD_BUCKS_MULTIPLIER,
  AUTO_BOSS_DAMAGE_PER_LEVEL,
} from "./data.js";
import { earnBucks } from "./game.js";
import { getEffectiveCps } from "./prestige.js";
import { rollForCollectionDrop } from "./collection.js";
import { updateDisplay, formatNumber } from "./ui.js";
import { showBossVictoryAnimation, showBossFleeAnimation } from "./animations.js";
import { playBossVictorySound, playBossFleeSound } from "./sounds.js";

// Boss có đang xuất hiện/đang đánh dở không
export function isBossActive() {
  return bossFight.active;
}

// Cho 1 Boss mới xuất hiện (bỏ qua nếu đang có trận đánh dở)
// bossLevel KHÔNG bị giới hạn trần - dùng Big.pow (tính trong không gian log) nên HP không bao giờ
// tràn thành Infinity dù bossLevel tăng vô hạn theo thời gian chơi.
export function spawnBoss() {
  if (bossFight.active) return;

  const maxHp = Big.floor(
    Big.scale(Big.pow(Big.fromNumber(BOSS_HP_GROWTH), state.bossLevel), BASE_BOSS_HP)
  );
  bossFight.active = true;
  bossFight.hp = maxHp;
  bossFight.maxHp = maxHp;
  bossFight.endTime = Date.now() + BOSS_FIGHT_DURATION_MS;
  bossFight.name = `${BOSS_NAMES[state.bossLevel % BOSS_NAMES.length]} (Cấp ${
    state.bossLevel + 1
  })`;
  updateDisplay();
}

// Gây sát thương lên Boss đang xuất hiện (gọi từ clickActions và từ Bot Săn Boss)
export function damageBoss(amount) {
  if (!bossFight.active || Big.lte(amount, Big.fromNumber(0))) return;
  bossFight.hp = Big.max(Big.fromNumber(0), Big.sub(bossFight.hp, amount));
  if (Big.lte(bossFight.hp, Big.fromNumber(0))) {
    winBossFight();
  }
}

// Thắng trận: thưởng Nexyroth + có cơ hội rơi Cổ Vật/Di Vật, tăng Cấp Boss cho lần sau
function winBossFight() {
  const bossName = bossFight.name;
  const bonusBucks = Big.floor(Big.scale(bossFight.maxHp, BOSS_REWARD_BUCKS_MULTIPLIER));

  bossFight.active = false;
  state.bossLevel += 1;
  state.bossesDefeated += 1;

  earnBucks(bonusBucks);
  rollForCollectionDrop(); // tự hiện animation riêng bên trong nếu rơi trúng item mới

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
