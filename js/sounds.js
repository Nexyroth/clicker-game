import { state } from "./state.js";

// Dùng chung 1 AudioContext cho cả game, khởi tạo LƯỜI (chỉ tạo khi có tương tác đầu tiên -
// trình duyệt chặn tự phát âm thanh trước khi người dùng click/chạm vào trang)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Phát 1 nốt đơn giản (sine/triangle/square) với envelope tăng-giảm âm lượng mượt
function playTone({ freq, duration = 0.12, type = "sine", volume = 0.15, delay = 0 }) {
  if (!state.sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + delay;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  } catch (e) {
    // Im lặng bỏ qua nếu trình duyệt chặn audio - không làm hỏng gameplay
  }
}

// Phát 1 chuỗi nốt liên tiếp (dùng cho các mốc lớn: lên cấp, Tái Sinh, Thăng Thiên...)
function playSequence(notes) {
  notes.forEach((note, i) => playTone({ ...note, delay: (note.delay || 0) + i * 0 }));
}

// ---------------- Các hiệu ứng âm thanh dùng trong game ----------------

export function playClickSound(isCrit) {
  if (isCrit) {
    playTone({ freq: 880, duration: 0.15, type: "square", volume: 0.12 });
    playTone({ freq: 1320, duration: 0.15, type: "square", volume: 0.1, delay: 0.03 });
  } else {
    playTone({ freq: 520, duration: 0.05, type: "sine", volume: 0.06 });
  }
}

export function playPurchaseSound() {
  playTone({ freq: 660, duration: 0.08, type: "triangle", volume: 0.1 });
  playTone({ freq: 990, duration: 0.1, type: "triangle", volume: 0.08, delay: 0.05 });
}

export function playLevelUpSound() {
  playSequence([
    { freq: 523, duration: 0.12, type: "triangle", volume: 0.12 },
    { freq: 659, duration: 0.12, type: "triangle", volume: 0.12, delay: 0.1 },
    { freq: 784, duration: 0.2, type: "triangle", volume: 0.14, delay: 0.2 },
  ]);
}

export function playAchievementSound() {
  playSequence([
    { freq: 659, duration: 0.1, type: "sine", volume: 0.12 },
    { freq: 784, duration: 0.1, type: "sine", volume: 0.12, delay: 0.1 },
    { freq: 988, duration: 0.1, type: "sine", volume: 0.12, delay: 0.2 },
    { freq: 1318, duration: 0.25, type: "sine", volume: 0.14, delay: 0.3 },
  ]);
}

export function playGoldenGiftSound() {
  playSequence([
    { freq: 784, duration: 0.08, type: "square", volume: 0.1 },
    { freq: 988, duration: 0.08, type: "square", volume: 0.1, delay: 0.08 },
    { freq: 1175, duration: 0.08, type: "square", volume: 0.1, delay: 0.16 },
    { freq: 1568, duration: 0.3, type: "square", volume: 0.12, delay: 0.24 },
  ]);
}

export function playBossVictorySound() {
  playSequence([
    { freq: 392, duration: 0.15, type: "sawtooth", volume: 0.1 },
    { freq: 494, duration: 0.15, type: "sawtooth", volume: 0.1, delay: 0.12 },
    { freq: 587, duration: 0.15, type: "sawtooth", volume: 0.1, delay: 0.24 },
    { freq: 784, duration: 0.4, type: "sawtooth", volume: 0.14, delay: 0.36 },
  ]);
}

export function playBossFleeSound() {
  playTone({ freq: 300, duration: 0.3, type: "sine", volume: 0.08 });
  playTone({ freq: 200, duration: 0.3, type: "sine", volume: 0.08, delay: 0.15 });
}

// Âm thanh "trọng lượng" tăng dần theo tầng: Tái Sinh < Thăng Thiên < Niết Bàn
export function playPrestigeSound() {
  playSequence([
    { freq: 440, duration: 0.15, type: "sine", volume: 0.12 },
    { freq: 554, duration: 0.15, type: "sine", volume: 0.12, delay: 0.12 },
    { freq: 659, duration: 0.35, type: "sine", volume: 0.15, delay: 0.24 },
  ]);
}

export function playAscendSound() {
  playSequence([
    { freq: 392, duration: 0.15, type: "triangle", volume: 0.12 },
    { freq: 523, duration: 0.15, type: "triangle", volume: 0.13, delay: 0.13 },
    { freq: 659, duration: 0.15, type: "triangle", volume: 0.14, delay: 0.26 },
    { freq: 880, duration: 0.5, type: "triangle", volume: 0.16, delay: 0.39 },
  ]);
}

export function playNirvanaSound() {
  playSequence([
    { freq: 330, duration: 0.2, type: "sine", volume: 0.12 },
    { freq: 440, duration: 0.2, type: "sine", volume: 0.13, delay: 0.18 },
    { freq: 554, duration: 0.2, type: "sine", volume: 0.14, delay: 0.36 },
    { freq: 659, duration: 0.2, type: "sine", volume: 0.15, delay: 0.54 },
    { freq: 880, duration: 0.7, type: "sine", volume: 0.18, delay: 0.72 },
  ]);
}

export function playQuestClaimSound() {
  playTone({ freq: 740, duration: 0.1, type: "triangle", volume: 0.1 });
  playTone({ freq: 1108, duration: 0.15, type: "triangle", volume: 0.12, delay: 0.08 });
}

export function playGachaSound(isDuplicate) {
  if (isDuplicate) {
    playTone({ freq: 494, duration: 0.12, type: "triangle", volume: 0.1 });
    playTone({ freq: 659, duration: 0.2, type: "triangle", volume: 0.12, delay: 0.1 });
  } else {
    playSequence([
      { freq: 587, duration: 0.1, type: "sine", volume: 0.1 },
      { freq: 740, duration: 0.1, type: "sine", volume: 0.11, delay: 0.09 },
      { freq: 988, duration: 0.35, type: "sine", volume: 0.15, delay: 0.18 },
    ]);
  }
}
