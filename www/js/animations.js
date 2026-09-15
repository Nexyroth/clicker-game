import { elements } from "./dom.js";
import { RARITIES } from "./data.js";

// Hiệu ứng nút click
export function animateClickButton(isCrit) {
  const cls = isCrit ? "animate-click-crit" : "animate-click";
  // Gỡ class cũ trước khi thêm lại để animation luôn chạy từ đầu khi click liên tục rất nhanh
  elements.clickButton.classList.remove("animate-click", "animate-click-crit");
  void elements.clickButton.offsetWidth; // ép trình duyệt tính lại layout -> reset animation
  elements.clickButton.classList.add(cls);
  setTimeout(() => elements.clickButton.classList.remove(cls), isCrit ? 300 : 140);

  showClickRipple(isCrit);
}

// Vòng sóng lan từ tâm nút click. Dùng CSS animation thuần (GPU) thay vì gsap để không tốn tài
// nguyên khi người chơi spam click hoặc bật Thuốc Auto Click (20 lần/giây).
function showClickRipple(isCrit) {
  const rect = elements.clickButton.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  const ripple = document.createElement("div");
  ripple.className = isCrit ? "click-ripple crit" : "click-ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${rect.left + rect.width / 2}px`;
  ripple.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(ripple);

  setTimeout(() => ripple.remove(), 520);
}

// Số bay lên khi click, to/màu khác hẳn nếu là Chí Mạng
export function showClickFloatingNumber(amount, isCrit) {
  const rect = elements.clickButton.getBoundingClientRect();
  const offsetX = (Math.random() - 0.5) * 80; // lệch trái/phải ngẫu nhiên cho vui mắt

  const floatingNumber = document.createElement("div");
  floatingNumber.className = isCrit
    ? "fixed select-none font-extrabold text-orange-400 pointer-events-none z-50"
    : "fixed select-none font-bold text-cyan-400 pointer-events-none z-50";
  floatingNumber.style.textShadow = isCrit
    ? "0 0 12px rgba(251,146,60,0.9), 0 2px 4px rgba(0,0,0,0.6)"
    : "0 0 8px rgba(34,211,238,0.7), 0 1px 3px rgba(0,0,0,0.5)";
  floatingNumber.style.left = `${rect.left + rect.width / 2 + offsetX}px`;
  floatingNumber.style.top = `${rect.top}px`;
  floatingNumber.style.fontSize = isCrit ? "2rem" : "1.1rem";
  floatingNumber.style.transform = "translate(-50%, 0)";
  floatingNumber.textContent = isCrit ? `CHÍ MẠNG! +${amount}` : `+${amount}`;
  document.body.appendChild(floatingNumber);

  gsap.fromTo(
    floatingNumber,
    { y: 0, opacity: 1, scale: isCrit ? 0.4 : 0.85, rotation: isCrit ? -8 : 0 },
    {
      y: isCrit ? -110 : -70,
      opacity: 0,
      scale: isCrit ? 1.45 : 1,
      rotation: isCrit ? 6 : 0,
      duration: isCrit ? 0.95 : 0.6,
      ease: isCrit ? "back.out(2)" : "power1.out",
      onComplete: () => floatingNumber.remove(),
    }
  );
}

// Hiệu ứng lên level
export function showLevelUpAnimation() {
  const levelUpMessage = document.createElement("div");
  levelUpMessage.className =
    "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none text-4xl font-bold transition duration-300 text-yellow-500 animate-level-up";
  levelUpMessage.textContent = "Lên Cấp!";
  document.body.appendChild(levelUpMessage);
  setTimeout(() => {
    document.body.removeChild(levelUpMessage);
  }, 2000);
}

// Hiệu ứng mua nâng cấp
export function showUpgradeAnimation(upgradeName) {
  const upgradeMessage = document.createElement("div");
  upgradeMessage.className =
    "fixed bottom-4 left-4 bg-blue-500 text-white select-none px-4 py-2 rounded";
  upgradeMessage.textContent = `Đã nâng cấp: ${upgradeName}`;
  document.body.appendChild(upgradeMessage);

  gsap.fromTo(
    upgradeMessage,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
  );

  gsap.to(upgradeMessage, {
    y: -50,
    opacity: 0,
    delay: 2.5,
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => document.body.removeChild(upgradeMessage),
  });
}

// Hiệu ứng mở khoá thành tựu
export function showAchievementAnimation(achievementName) {
  const achievementMessage = document.createElement("div");
  achievementMessage.className =
    "fixed top-4 right-4 bg-yellow-500 text-white select-none px-4 py-2 rounded";
  achievementMessage.textContent = `Mở khóa thành tựu: ${achievementName}`;
  document.body.appendChild(achievementMessage);

  gsap.fromTo(
    achievementMessage,
    { x: 50, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
  );

  gsap.to(achievementMessage, {
    x: 50,
    opacity: 0,
    delay: 2.5,
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => document.body.removeChild(achievementMessage),
  });
}

// Cho 1 Hộp Quà Vàng bay ngang màn hình ở độ cao ngẫu nhiên, tự biến mất nếu không bấm kịp
// lifetimeSeconds: thời gian bay hết màn hình. onClick: callback khi người chơi bấm trúng.
export function spawnGoldenGift(lifetimeSeconds, onClick) {
  const gift = document.createElement("div");
  gift.className =
    "fixed select-none cursor-pointer z-50 text-4xl golden-gift-pulse";
  gift.style.top = `${10 + Math.random() * 70}vh`;
  gift.style.left = "-80px";
  gift.style.filter = "drop-shadow(0 0 10px gold)";
  gift.textContent = "🎁";
  document.body.appendChild(gift);

  const tween = gsap.to(gift, {
    left: "110vw",
    duration: lifetimeSeconds,
    ease: "linear",
    onComplete: () => gift.remove(),
  });

  gift.addEventListener("click", () => {
    tween.kill();
    gift.remove();
    onClick();
  });
}

// Hiệu ứng chữ to giữa màn hình khi kích hoạt buff Cuồng Nhiệt
export function showGoldenBuffAnimation() {
  const message = document.createElement("div");
  message.className =
    "fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none text-3xl font-extrabold text-yellow-400 pointer-events-none z-50 text-center";
  message.textContent = "🎉 CUỒNG NHIỆT! 🎉";
  document.body.appendChild(message);

  gsap.fromTo(
    message,
    { scale: 0.3, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(2)",
      onComplete: () => {
        gsap.to(message, {
          opacity: 0,
          delay: 1,
          duration: 0.6,
          onComplete: () => message.remove(),
        });
      },
    }
  );
}

// Thông báo khi tìm thấy 1 Cổ Vật/Di Vật mới, màu sắc theo độ hiếm
export function showCollectionDropAnimation(item) {
  const rarity = RARITIES[item.rarity];
  const categoryLabel = item.id.startsWith("relic") ? "Di Vật" : "Cổ Vật";

  const box = document.createElement("div");
  box.className = `fixed top-20 left-1/2 transform -translate-x-1/2 select-none z-50 px-6 py-4 rounded-lg shadow-xl border-2 ${rarity.bg} ${rarity.border} text-center`;
  box.innerHTML = `
    <p class="text-xs font-semibold ${rarity.color} uppercase tracking-wide">✨ Tìm thấy ${categoryLabel} - ${rarity.label} ✨</p>
    <p class="text-xl font-bold text-gray-800 mt-1">${item.name}</p>
  `;
  document.body.appendChild(box);

  gsap.fromTo(
    box,
    { y: -30, opacity: 0, scale: 0.8 },
    { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
  );

  gsap.to(box, {
    opacity: 0,
    y: -20,
    delay: 3.5,
    duration: 0.6,
    onComplete: () => box.remove(),
  });
}

// Thông báo dạng toast dùng chung cho các tính năng mới (item rơi, redeem code, mua Shop, buff...)
// variant quyết định màu: "success" xanh lá, "info" xanh dương, "error" đỏ.
export function showToast(message, variant = "info") {
  const colorClass = {
    success: "bg-green-500",
    info: "bg-blue-500",
    error: "bg-red-500",
  }[variant] || "bg-blue-500";

  const toast = document.createElement("div");
  toast.className = `fixed bottom-20 left-1/2 transform -translate-x-1/2 select-none z-50 px-4 py-2 rounded-lg shadow-lg text-white font-semibold text-sm text-center ${colorClass}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  gsap.fromTo(
    toast,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
  );
  gsap.to(toast, {
    opacity: 0,
    y: -10,
    delay: 2.2,
    duration: 0.4,
    onComplete: () => toast.remove(),
  });
}

// Popup nhận thưởng (sự kiện, 7 Ngày Tân Thủ...) - kèm hiệu ứng pháo hoa nhẹ bằng vài emoji bắn ra
// rồi mờ dần, không cần thư viện confetti riêng.
export function showRewardPopup(title, rewardLines = []) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40";

  const box = document.createElement("div");
  box.className = "relative bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full mx-4 text-center overflow-hidden";
  box.innerHTML = `
    <p class="text-lg font-bold text-orange-600 mb-2">${title}</p>
    ${rewardLines.map((line) => `<p class="text-sm text-gray-700">${line}</p>`).join("")}
    <button id="reward-popup-close" class="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
      Tuyệt vời!
    </button>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const confettiEmojis = ["🎉", "✨", "💎", "🎊", "⭐"];
  for (let i = 0; i < 12; i++) {
    const piece = document.createElement("span");
    piece.textContent = confettiEmojis[i % confettiEmojis.length];
    piece.className = "absolute text-2xl pointer-events-none";
    piece.style.left = "50%";
    piece.style.top = "40%";
    box.appendChild(piece);
    const angle = (i / 12) * Math.PI * 2;
    gsap.to(piece, {
      x: Math.cos(angle) * 120,
      y: Math.sin(angle) * 120 - 40,
      opacity: 0,
      rotation: Math.random() * 360,
      duration: 0.9 + Math.random() * 0.4,
      ease: "power1.out",
    });
  }

  gsap.fromTo(box, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.7)" });

  const close = () => overlay.remove();
  overlay.querySelector("#reward-popup-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}
export function showBossVictoryAnimation(bossName, bonusBucks) {
  const box = document.createElement("div");
  box.className =
    "fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none z-50 px-6 py-4 rounded-lg shadow-xl bg-red-50 border-2 border-red-400 text-center";
  box.innerHTML = `
    <p class="text-2xl font-extrabold text-red-600">💥 ĐÃ HẠ GỤC! 💥</p>
    <p class="text-sm font-semibold text-gray-700 mt-1">${bossName}</p>
    <p class="text-lg font-bold text-yellow-500 mt-1">+${bonusBucks} Nexyroth</p>
  `;
  document.body.appendChild(box);

  gsap.fromTo(
    box,
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
  );
  gsap.to(box, {
    opacity: 0,
    delay: 2.5,
    duration: 0.6,
    onComplete: () => box.remove(),
  });
}

// Thông báo khi hết giờ mà chưa hạ được Boss
export function showBossFleeAnimation(bossName) {
  const box = document.createElement("div");
  box.className =
    "fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none z-50 px-6 py-4 rounded-lg shadow-xl bg-gray-100 border-2 border-gray-400 text-center";
  box.innerHTML = `
    <p class="text-xl font-bold text-gray-600">💨 ${bossName} đã bỏ chạy!</p>
    <p class="text-xs text-gray-500 mt-1">Không kịp hạ gục trong thời gian quy định</p>
  `;
  document.body.appendChild(box);

  gsap.fromTo(
    box,
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
  );
  gsap.to(box, {
    opacity: 0,
    delay: 2,
    duration: 0.6,
    onComplete: () => box.remove(),
  });
}
