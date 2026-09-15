import * as Big from "./numeric.js";

// Hằng số dùng để tính reward/xp khi lên level
export const REWARD_RATE = 1.1;
export const XP_RATE = 1.7;

// Hằng số tính giá tăng dần mỗi lần mua (cost = baseCost * rate^số lượng đã mua)
// Nâng cấp thường mua bằng Nexyroth -> tăng chậm (1.15 là chuẩn phổ biến của game idle)
export const UPGRADE_COST_RATE = 1.15;
// Cửa Hàng Đá Quý & Cửa Hàng Chí Mạng hiếm hơn, mạnh hơn (buff %) -> giá tăng dốc hơn theo cấp độ
export const GEM_UPGRADE_COST_RATE = 1.8;
export const CRIT_UPGRADE_COST_RATE = 1.6;

// Càng chia PRESTIGE_DIVISOR Nexyroth đã kiếm được (lifetime) thì được 1 Đá Quý
// gems = floor(sqrt(totalBucksEarned / PRESTIGE_DIVISOR) * hệ số Prestige Power)
export const PRESTIGE_DIVISOR = 20000;

// Critical Click: % cơ hội mỗi click ra số nhân "khủng"
export const BASE_CRIT_CHANCE = 0.08; // 8% cơ bản
export const CRIT_MIN_MULT = 2;
export const CRIT_MAX_MULT = 10;
export const MAX_CRIT_CHANCE = 0.75; // trần cơ hội crit, không cho vượt quá 75%

// --- Hệ số buff của Cửa Hàng Đá Quý (nhân %, dồn theo cấp độ đã mua) ---
export const GEM_MULT_BONUS_PER_LEVEL = 0.1; // +10% Hệ Số Nhân / cấp
export const GEM_CPS_BONUS_PER_LEVEL = 0.1; // +10% Nexyroth/giây / cấp
export const PRESTIGE_POWER_BONUS_PER_LEVEL = 0.05; // +5% Đá Quý nhận khi Tái Sinh / cấp
export const HEAD_START_BONUS_PER_LEVEL = 500; // +500 Nexyroth khởi điểm / cấp
export const BASE_STARTING_BUCKS = 1000;

// --- Hệ số buff của Cửa Hàng Chí Mạng ---
export const CRIT_CHANCE_BONUS_PER_LEVEL = 0.01; // +1% cơ hội chí mạng / cấp
export const CRIT_DAMAGE_BONUS_PER_LEVEL = 0.15; // +15% sát thương chí mạng / cấp

// --- Offline Earnings ---
export const MAX_OFFLINE_SECONDS = 8 * 60 * 60; // tối đa tính 8 tiếng đi vắng
export const MIN_OFFLINE_SECONDS_FOR_POPUP = 10; // dưới 10s (F5 nhanh) thì bỏ qua, không hiện popup
export const OFFLINE_EARNINGS_EFFICIENCY = 0.5; // offline chỉ đạt 50% hiệu suất so với chơi trực tiếp

// --- Thành Tựu cộng buff thật (không chỉ để ngắm) ---
export const ACHIEVEMENT_BONUS_PER_UNLOCK = 0.005; // mỗi Thành Tựu mở khoá +0.5% Hệ Số Nhân VÀ Nexyroth/giây

// --- Combo / Streak ---
export const COMBO_WINDOW_MS = 1000; // phải click trong vòng 1s kể từ lần trước để combo không bị reset
export const COMBO_BONUS_PER_STEP = 0.02; // +2% mỗi bậc combo
export const COMBO_MAX_STEPS = 30; // tối đa +60%

// --- Hộp Quà Vàng (random event) ---
export const GOLDEN_GIFT_MIN_INTERVAL_MS = 30000; // 30s
export const GOLDEN_GIFT_MAX_INTERVAL_MS = 90000; // 90s
export const GOLDEN_GIFT_LIFETIME_MS = 8000; // bay ngang màn hình trong 8s, không bấm kịp sẽ biến mất
export const GOLDEN_GIFT_BUFF_MULTIPLIER = 5; // Cuồng Nhiệt x5
export const GOLDEN_GIFT_BUFF_DURATION_MS = 15000; // buff kéo dài 15s

// --- Boss Click ---
export const BOSS_MIN_INTERVAL_MS = 5 * 60 * 1000; // 5 phút
export const BOSS_MAX_INTERVAL_MS = 10 * 60 * 1000; // 10 phút
export const BOSS_FIGHT_DURATION_MS = 20000; // 20 giây để hạ boss, hết giờ boss bỏ chạy
export const BASE_BOSS_HP = 8000;
export const BOSS_HP_GROWTH = 1.35; // mỗi Cấp Boss máu nhân lên theo tỉ lệ này
export const BOSS_REWARD_BUCKS_MULTIPLIER = 2; // thưởng Nexyroth = máu tối đa boss x hệ số này
export const AUTO_BOSS_DAMAGE_PER_LEVEL = 1; // hệ số Nexyroth/giây áp thành damage tự động mỗi cấp "Bot Săn Boss"

// Thứ hạng Boss - roll 1 lần khi spawn theo weight (tổng 100). "daily" chỉ được rơi trúng TỐI ĐA
// 1 lần/ngày thật (chặn ở boss.js bằng state.lastDailyBossDate) để giữ đúng nghĩa "Boss Ngày".
export const BOSS_TIERS = [
  {
    id: "normal",
    weight: 85,
    namePrefix: "",
    hpMultiplier: 1,
    rewardMultiplier: 1,
    barColorClass: "bg-red-600",
    hpFillColorClass: "bg-yellow-400",
  },
  {
    id: "rare",
    weight: 12,
    namePrefix: "✨ [Hiếm] ",
    hpMultiplier: 1.5,
    rewardMultiplier: 2,
    barColorClass: "bg-purple-600",
    hpFillColorClass: "bg-pink-300",
  },
  {
    id: "daily",
    weight: 3,
    namePrefix: "👑 [Boss Ngày] ",
    hpMultiplier: 3,
    rewardMultiplier: 5,
    barColorClass: "bg-yellow-600",
    hpFillColorClass: "bg-yellow-200",
    oncePerRealDay: true,
  },
];
export const BOSS_NAMES = [
  { name: "Chuột Máy Tính Nổi Loạn", image: "images/boss/boss1.png" },
  { name: "Robot Lỗi Thời", image: "images/boss/boss2.png" },
  { name: "AI Phản Chủ", image: "images/boss/boss3.png" },
  { name: "Virus Click Cổ Đại", image: "images/boss/boss4.png" },
  { name: "Trùm Cuối Tuần", image: "images/boss/boss5.png" },
  { name: "Bóng Ma Server", image: "images/boss/boss6.png" },
  { name: "Quái Vật Dữ Liệu", image: "images/boss/boss7.png" },
  { name: "Kẻ Đánh Cắp Nexyroth", image: "images/boss/boss8.png" },
];

// "Boss Trùm" xuất hiện mỗi khi Cấp Boss vừa chạm mốc chia hết cho BOSS_MILESTONE_INTERVAL (10, 20, 30...),
// thay thế hoàn toàn 1 trong 8 tên/ảnh thường ở trên cho lần xuất hiện đó, thưởng nhân thêm hệ số riêng.
export const BOSS_MILESTONE_INTERVAL = 10;
export const BOSS_MILESTONE_REWARD_MULTIPLIER = 1.5;
export const BOSS_MILESTONE_NAMES = [
  { name: "Đại Chúa Tể Dữ Liệu", image: "images/boss/milestone1.png" },
  { name: "Ác Ma Nexyroth Nguyên Thuỷ", image: "images/boss/milestone2.png" },
  { name: "Tận Thế Click", image: "images/boss/milestone3.png" },
];

// --- Niết Bàn (Nirvana) - tầng tái sinh thứ 3, nằm trên cả Thăng Thiên, reset TOÀN BỘ Cây Kỹ Năng + Thế Giới/Pet ---
export const NIRVANA_UNLOCK_ASCENSION_COUNT = 5; // phải Thăng Thiên đủ 5 lần (trọn đời) mới mở khoá Niết Bàn
export const NIRVANA_DIVISOR = 3; // xaLoi = floor(sqrt(ascensionCount / NIRVANA_DIVISOR))

// Vĩnh Hằng Bội Tăng - KHÔNG BAO GIỜ reset, kể cả Niết Bàn tiếp theo
export const ETERNAL_MULT_BONUS_PER_LEVEL = 0.1; // +10% Hệ Số Nhân VÀ Nexyroth/giây mỗi cấp
export const ETERNAL_MULT_BASE_COST = 3; // giá bằng Xá Lợi
export const ETERNAL_MULT_COST_RATE = 1.8;

// Gacha Thần Thú - random 1 con CHƯA có, dùng Xá Lợi
export const GACHA_COST_XA_LOI = 5;
export const divineBeasts = [
  { id: "divineBeastPhoenix", name: "Phượng Hoàng Bất Tử", effectType: "multBoost", amount: 0.15, description: "+15% Hệ Số Nhân vĩnh viễn" },
  { id: "divineBeastDragon", name: "Thần Long Nguyên Thuỷ", effectType: "cpsBoost", amount: 0.15, description: "+15% Nexyroth/giây vĩnh viễn" },
  { id: "divineBeastKirin", name: "Kỳ Lân Thánh Thể", effectType: "critDamageBoost", amount: 0.2, description: "+20% Sát Thương Chí Mạng vĩnh viễn" },
  { id: "divineBeastTurtle", name: "Thần Quy Vĩnh Cửu", effectType: "prestigeGemBoost", amount: 0.15, description: "+15% Đá Quý nhận khi Tái Sinh" },
  { id: "divineBeastOwl", name: "Cú Đêm Vĩnh Cửu", effectType: "offlineEfficiencyBoost", amount: 0.05, description: "+5% Hiệu Suất Offline Earnings vĩnh viễn" },
];

// --- Thăng Thiên (Ascension) - lớp tái sinh thứ 2, nằm trên cả Tái Sinh thường ---
export const ASCENSION_UNLOCK_PRESTIGE_COUNT = 5; // phải Tái Sinh đủ 5 lần (trong chu kỳ hiện tại) mới mở khoá Thăng Thiên
// Công thức mới: cứ tích đủ ASCENSION_PRESTIGE_DIVISOR lần Tái Sinh TRỌN ĐỜI (cộng dồn, không mất khi Thăng Thiên)
// là được thêm Tinh Thể, theo đường cong căn bậc 2 cho dễ đọc số: crystals = floor(sqrt(totalPrestigesEver / ASCENSION_PRESTIGE_DIVISOR))
// Lưu ý: totalPrestigesEver giờ tăng theo CỤM (nhiều chục/trăm mỗi lần Tái Sinh, xem REBIRTH_BULK_MULTIPLIER bên dưới)
// nên chia số này lớn hơn nhiều so với thiết kế cũ (Tái Sinh chỉ +1 mỗi lần) để tốc độ nhận Tinh Thể không bị quá nhanh.
export const ASCENSION_PRESTIGE_DIVISOR = 500;

// --- Lượt Tái Sinh = 1 loại "tiền tệ" riêng (giống game simulator Roblox) ---
// Mỗi lần Tái Sinh không chỉ +1 mà nhận CẢ CỤM Lượt Tái Sinh cùng lúc, nhưng bị giới hạn bởi 1 mức trần.
export const BASE_MAX_REBIRTHS = 10; // giới hạn tối đa Lượt Tái Sinh có thể giữ cùng lúc, khi chưa nâng cấp gì
export const REBIRTH_CAP_BONUS_PER_LEVEL = 5; // mỗi cấp mua trong Gem Shop tăng thêm 5 giới hạn
export const REBIRTH_BULK_DIVISOR = 20000; // dùng chung công thức dạng căn bậc 2 với Đá Quý
export const REBIRTH_BULK_MULTIPLIER = 6; // nhân lên cho số Lượt Tái Sinh nhận được "cụm" hẳn (chục -> trăm -> nghìn)
export const REBIRTH_GEM_SYNERGY_PER_REBIRTH = 0.02; // +2% Đá Quý nhận mỗi lần Tái Sinh / mỗi Lượt Tái Sinh đang giữ trong người

// Càng giữ nhiều Lượt Tái Sinh lúc bấm Thăng Thiên thì càng được nhiều Tinh Thể (cộng thêm vào phần tính theo lifetime)
export const CRYSTAL_PER_HELD_REBIRTH = 0.5;

// Gem Shop: tăng thẳng % số Lượt Tái Sinh nhận được mỗi lần Tái Sinh (khác với tăng giới hạn trần)
export const REBIRTH_BOOST_PER_LEVEL = 0.15;

// --- Cây Kỹ Năng (mua bằng Tinh Thể, vĩnh viễn, chỉ mất khi Reset Toàn Bộ Game) ---
// Mỗi nhánh phải mua theo thứ tự (node sau cần node trước đã mua)
export const skillTree = {
  power: [
    { id: "power1", name: "Sức Mạnh I", cost: 1, amount: 0.2, description: "+20% Hệ Số Nhân vĩnh viễn (nhân dồn)" },
    { id: "power2", name: "Sức Mạnh II", cost: 2, amount: 0.2, description: "+20% Hệ Số Nhân vĩnh viễn (nhân dồn)" },
    { id: "power3", name: "Sức Mạnh III", cost: 4, amount: 0.2, description: "+20% Hệ Số Nhân vĩnh viễn (nhân dồn)" },
    { id: "power4", name: "Sức Mạnh IV", cost: 7, amount: 0.2, description: "+20% Hệ Số Nhân vĩnh viễn (nhân dồn)" },
    { id: "power5", name: "Sức Mạnh Tối Thượng", cost: 12, amount: 0.3, description: "+30% Hệ Số Nhân vĩnh viễn (nhân dồn)" },
    { id: "power6", name: "Sức Mạnh Vô Song", cost: 20, costGrowth: 1.6, repeatable: true, amount: 0.08, description: "+8% Hệ Số Nhân vĩnh viễn (nhân dồn) - mua được VÔ HẠN lần, giá tăng dần" },
  ],
  speed: [
    { id: "speed1", name: "Tốc Độ I", cost: 1, amount: 0.2, description: "+20% Nexyroth/giây vĩnh viễn (nhân dồn)" },
    { id: "speed2", name: "Tốc Độ II", cost: 2, amount: 0.2, description: "+20% Nexyroth/giây vĩnh viễn (nhân dồn)" },
    { id: "speed3", name: "Tốc Độ III", cost: 4, amount: 0.2, description: "+20% Nexyroth/giây vĩnh viễn (nhân dồn)" },
    { id: "speed4", name: "Tốc Độ IV", cost: 7, amount: 0.2, description: "+20% Nexyroth/giây vĩnh viễn (nhân dồn)" },
    { id: "speed5", name: "Tốc Độ Tối Thượng", cost: 12, amount: 0.3, description: "+30% Nexyroth/giây vĩnh viễn (nhân dồn)" },
    { id: "speed6", name: "Tốc Độ Ánh Sáng", cost: 20, costGrowth: 1.6, repeatable: true, amount: 0.08, description: "+8% Nexyroth/giây vĩnh viễn (nhân dồn) - mua được VÔ HẠN lần, giá tăng dần" },
  ],
  crit: [
    { id: "crit1", name: "Chí Mạng I", type: "critChance", cost: 1, amount: 0.02, description: "+2% Tỉ Lệ Chí Mạng vĩnh viễn" },
    { id: "crit2", name: "Chí Mạng II", type: "critDamage", cost: 2, amount: 0.2, description: "+20% Sát Thương Chí Mạng vĩnh viễn (nhân dồn)" },
    { id: "crit3", name: "Chí Mạng III", type: "critChance", cost: 4, amount: 0.02, description: "+2% Tỉ Lệ Chí Mạng vĩnh viễn" },
    { id: "crit4", name: "Chí Mạng IV", type: "critDamage", cost: 7, amount: 0.2, description: "+20% Sát Thương Chí Mạng vĩnh viễn (nhân dồn)" },
    { id: "crit5", name: "Chí Mạng Tối Thượng", type: "critChance", cost: 12, amount: 0.03, description: "+3% Tỉ Lệ Chí Mạng vĩnh viễn" },
    { id: "crit6", name: "Chí Mạng Huyền Thoại", type: "critDamage", cost: 20, costGrowth: 1.6, repeatable: true, amount: 0.08, description: "+8% Sát Thương Chí Mạng vĩnh viễn (nhân dồn) - mua được VÔ HẠN lần, giá tăng dần" },
  ],
  ascension: [
    { id: "ascend1", name: "Tinh Thể Dồi Dào I", type: "crystalBonus", cost: 2, amount: 0.1, description: "+10% Tinh Thể nhận mỗi lần Thăng Thiên (nhân dồn)" },
    { id: "ascend2", name: "Khởi Đầu Vượt Trội I", type: "startBonus", cost: 3, amount: 1000, description: "+1.000 Nexyroth khởi điểm ngay sau khi Thăng Thiên" },
    { id: "ascend3", name: "Tinh Thể Dồi Dào II", type: "crystalBonus", cost: 5, amount: 0.1, description: "+10% Tinh Thể nhận mỗi lần Thăng Thiên (nhân dồn)" },
    { id: "ascend4", name: "Rút Ngắn Chu Kỳ", type: "unlockReduction", cost: 8, amount: 1, description: "-1 số lần Tái Sinh cần để mở khoá Thăng Thiên (tối thiểu 2)" },
    { id: "ascend5", name: "Vĩnh Hằng", type: "crystalBonus", cost: 15, amount: 0.25, description: "+25% Tinh Thể nhận mỗi lần Thăng Thiên (nhân dồn)" },
    { id: "ascend6", name: "Cộng Hưởng Tái Sinh I", type: "heldBonus", cost: 6, amount: 0.3, description: "+30% Tinh Thể thưởng theo số Lượt Tái Sinh đang giữ lúc Thăng Thiên (nhân dồn)" },
    { id: "ascend7", name: "Khởi Đầu Vượt Trội II", type: "startBonus", cost: 10, amount: 2000, description: "+2.000 Nexyroth khởi điểm ngay sau khi Thăng Thiên" },
    { id: "ascend8", name: "Cộng Hưởng Tái Sinh II", type: "heldBonus", cost: 12, amount: 0.3, description: "+30% Tinh Thể thưởng theo số Lượt Tái Sinh đang giữ lúc Thăng Thiên (nhân dồn)" },
    { id: "ascend9", name: "Vĩnh Hằng Tối Thượng", type: "crystalBonus", cost: 20, costGrowth: 1.6, repeatable: true, amount: 0.08, description: "+8% Tinh Thể nhận mỗi lần Thăng Thiên (nhân dồn) - mua được VÔ HẠN lần, giá tăng dần" },
  ],
  luck: [
    { id: "luck1", name: "Sát Thương Boss I", type: "bossDamage", cost: 3, amount: 0.1, description: "+10% Sát Thương lên Boss vĩnh viễn (nhân dồn)" },
    { id: "luck2", name: "Thợ Săn Kho Báu I", type: "itemDrop", cost: 4, amount: 0.03, description: "+3% Tỉ Lệ Rơi Item từ Boss vĩnh viễn" },
    { id: "luck3", name: "Thợ Đào Kim Cương I", type: "diamondDrop", cost: 6, amount: 0.03, description: "+3% Tỉ Lệ Rơi Kim Cương từ Boss vĩnh viễn" },
    { id: "luck4", name: "Sát Thương Boss II", type: "bossDamage", cost: 9, amount: 0.15, description: "+15% Sát Thương lên Boss vĩnh viễn (nhân dồn)" },
    { id: "luck5", name: "Tỉnh Táo Khi Vắng Mặt", type: "offlineEfficiency", cost: 14, amount: 0.1, description: "+10% Hiệu Suất Offline Earnings vĩnh viễn" },
    { id: "luck6", name: "Vận May Vô Tận", type: "itemDrop", cost: 22, costGrowth: 1.6, repeatable: true, amount: 0.01, description: "+1% Tỉ Lệ Rơi Item từ Boss vĩnh viễn - mua được VÔ HẠN lần, giá tăng dần" },
  ],
};

// --- Cổ Vật & Di Vật (rơi ngẫu nhiên, giữ vĩnh viễn, không mất khi Tái Sinh/Thăng Thiên) ---
export const RARITIES = {
  common: { label: "Phổ Thông", weight: 40, multiplier: 1, color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-300" },
  uncommon: { label: "Không Phổ Biến", weight: 27, multiplier: 1.8, color: "text-green-600", bg: "bg-green-50", border: "border-green-300" },
  rare: { label: "Hiếm", weight: 17, multiplier: 3, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300" },
  epic: { label: "Sử Thi", weight: 10, multiplier: 5, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-300" },
  legendary: { label: "Huyền Thoại", weight: 5, multiplier: 8, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-300" },
  mythic: { label: "Thần Thoại", weight: 1, multiplier: 15, color: "text-red-600", bg: "bg-red-50", border: "border-red-400" },
};

// Khoảng thời gian ngẫu nhiên giữa 2 lần rơi Cổ Vật/Di Vật (tự động, không cần bấm)
export const COLLECTION_DROP_MIN_INTERVAL_MS = 3 * 60 * 1000; // 3 phút
export const COLLECTION_DROP_MAX_INTERVAL_MS = 6 * 60 * 1000; // 6 phút

// --- Nhiệm Vụ Hàng Ngày (đổi mới mỗi ngày, thưởng Đá Quý) ---
export const DAILY_QUEST_COUNT = 3; // số nhiệm vụ hiện diện mỗi ngày

// Kho nhiệm vụ để random chọn ra mỗi ngày. "type" phải khớp với key trong state.dailyProgress
export const questPool = [
  { type: "clicks", label: "Click {target} lần", target: 500, reward: 3 },
  { type: "clicks", label: "Click {target} lần", target: 2000, reward: 8 },
  { type: "clicks", label: "Click {target} lần", target: 5000, reward: 15 },
  { type: "bucksEarned", label: "Kiếm {target} Nexyroth", target: 50000, reward: 5 },
  { type: "bucksEarned", label: "Kiếm {target} Nexyroth", target: 500000, reward: 10 },
  { type: "bucksEarned", label: "Kiếm {target} Nexyroth", target: 5000000, reward: 20 },
  { type: "upgradesBought", label: "Mua {target} lượt nâng cấp", target: 3, reward: 4 },
  { type: "upgradesBought", label: "Mua {target} lượt nâng cấp", target: 8, reward: 9 },
  { type: "crits", label: "Chí Mạng {target} lần", target: 10, reward: 5 },
  { type: "crits", label: "Chí Mạng {target} lần", target: 30, reward: 10 },
  { type: "goldenGifts", label: "Bấm trúng {target} Hộp Quà Vàng", target: 1, reward: 6 },
  { type: "goldenGifts", label: "Bấm trúng {target} Hộp Quà Vàng", target: 3, reward: 12 },
  { type: "maxCombo", label: "Đạt combo {target} click liên tiếp", target: 15, reward: 5 },
  { type: "maxCombo", label: "Đạt combo {target} click liên tiếp", target: 25, reward: 9 },
];

// --- Nhiệm Vụ Hàng Tuần (nặng đô hơn, thưởng Tinh Thể thay vì Đá Quý) ---
export const WEEKLY_QUEST_COUNT = 2; // số nhiệm vụ hiện diện mỗi tuần

export const weeklyQuestPool = [
  { type: "clicks", label: "Click {target} lần trong tuần", target: 30000, reward: 3 },
  { type: "clicks", label: "Click {target} lần trong tuần", target: 100000, reward: 6 },
  { type: "bucksEarned", label: "Kiếm {target} Nexyroth trong tuần", target: 50000000, reward: 4 },
  { type: "bucksEarned", label: "Kiếm {target} Nexyroth trong tuần", target: 500000000, reward: 8 },
  { type: "upgradesBought", label: "Mua {target} lượt nâng cấp trong tuần", target: 30, reward: 4 },
  { type: "crits", label: "Chí Mạng {target} lần trong tuần", target: 150, reward: 5 },
  { type: "goldenGifts", label: "Bấm trúng {target} Hộp Quà Vàng trong tuần", target: 8, reward: 6 },
  { type: "prestiges", label: "Tích luỹ {target} Lượt Tái Sinh trong tuần", target: 50, reward: 6 },
  { type: "ascensions", label: "Thăng Thiên {target} lần trong tuần", target: 1, reward: 15 },
  { type: "ascensions", label: "Thăng Thiên {target} lần trong tuần", target: 3, reward: 35 },
];

// Chỉ được TRANG BỊ tối đa bấy nhiêu Cổ Vật/Di Vật cùng lúc (dù sở hữu bao nhiêu cũng được, chỉ món trang bị mới có hiệu lực)
// Hệ số các món đã tăng lên ~2.5x so với bản trước để bù lại việc giới hạn số lượng dùng cùng lúc
export const EQUIP_SLOT_COUNT = 4;

// --- Thế Giới (Worlds) & Pet ---
// Mỗi Thế Giới có 1 loại tiền tệ riêng, kiếm được bằng % Nexyroth kiếm được (khi Thế Giới đó đang "được chọn")
export const WORLD_CURRENCY_RATE = 0.1; // 10% Nexyroth kiếm được cũng quy đổi thành tiền tệ Thế Giới đang chọn
export const PET_COST_GROWTH_RATE = 1.5; // giá nâng cấp Pet tăng dần mỗi cấp (giống Gem Shop)

export const worlds = [
  {
    id: "forest",
    name: "Rừng Nguyên Sinh",
    icon: "🌲",
    currencyName: "Nhựa Cây",
    unlockAscension: 0, // mở khoá ngay từ đầu
    bg: "from-green-900/40 to-emerald-900/30",
    accent: "text-green-400",
  },
  {
    id: "city",
    name: "Thành Phố Nexyroth",
    icon: "🏙️",
    currencyName: "Mảnh Chip",
    unlockAscension: 1, // mở khoá sau khi Thăng Thiên lần đầu
    bg: "from-blue-900/40 to-slate-800/40",
    accent: "text-blue-400",
  },
  {
    id: "abyss",
    name: "Vực Thẳm Vũ Trụ",
    icon: "🌌",
    currencyName: "Bụi Sao",
    unlockAscension: 3,
    bg: "from-purple-900/40 to-indigo-900/30",
    accent: "text-purple-400",
  },
  {
    id: "heaven",
    name: "Thiên Giới Vĩnh Hằng",
    icon: "⛩️",
    currencyName: "Ánh Sáng Thần Thánh",
    unlockAscension: 6,
    bg: "from-amber-900/40 to-yellow-800/30",
    accent: "text-amber-400",
  },
];

// Pet mỗi Thế Giới - mua (thuần hoá) 1 LẦN DUY NHẤT bằng tiền tệ của đúng Thế Giới đó, hiệu lực vĩnh viễn
// (không giới hạn slot như Cổ Vật/Di Vật - thuần hoá được bao nhiêu con thì cộng dồn hết bấy nhiêu)
export const pets = {
  forest: [
    { id: "forestPetSquirrel", name: "Sóc Con", baseCost: 50, effectType: "multBoost", amount: 0.03, description: "+3% Hệ Số Nhân vĩnh viễn" },
    { id: "forestPetOwl", name: "Cú Mèo Rừng", baseCost: 200, effectType: "cpsBoost", amount: 0.03, description: "+3% Nexyroth/giây vĩnh viễn" },
    { id: "forestPetTreant", name: "Rồng Cây Cổ Thụ", baseCost: 800, effectType: "multBoost", amount: 0.08, description: "+8% Hệ Số Nhân vĩnh viễn" },
    { id: "forestPetFox", name: "Cáo Tinh Ranh", baseCost: 1500, effectType: "multBoost", amount: 0.06, description: "+6% Hệ Số Nhân vĩnh viễn" },
    { id: "forestPetMushroomSpirit", name: "Tinh Linh Nấm", baseCost: 3000, effectType: "itemDropRateBoost", amount: 0.02, description: "+2% Tỉ Lệ Rơi Item từ Boss vĩnh viễn" },
  ],
  city: [
    { id: "cityPetRobot", name: "Robot Mini", baseCost: 50, effectType: "cpsBoost", amount: 0.03, description: "+3% Nexyroth/giây vĩnh viễn" },
    { id: "cityPetDrone", name: "Drone Trinh Sát", baseCost: 200, effectType: "critChanceBoost", amount: 0.01, description: "+1% Tỉ Lệ Chí Mạng vĩnh viễn" },
    { id: "cityPetSupercomputer", name: "Siêu Máy Tính Cưng", baseCost: 800, effectType: "cpsBoost", amount: 0.08, description: "+8% Nexyroth/giây vĩnh viễn" },
    { id: "cityPetHacker", name: "Hacker Mèo Máy", baseCost: 1500, effectType: "cpsBoost", amount: 0.06, description: "+6% Nexyroth/giây vĩnh viễn" },
    { id: "cityPetScanner", name: "Máy Quét Kho Báu", baseCost: 3000, effectType: "diamondDropBoost", amount: 0.02, description: "+2% Tỉ Lệ Rơi Kim Cương từ Boss vĩnh viễn" },
  ],
  abyss: [
    { id: "abyssPetStarSpirit", name: "Tinh Linh Sao", baseCost: 50, effectType: "critChanceBoost", amount: 0.01, description: "+1% Tỉ Lệ Chí Mạng vĩnh viễn" },
    { id: "abyssPetBlackHole", name: "Hố Đen Mini", baseCost: 200, effectType: "critDamageBoost", amount: 0.05, description: "+5% Sát Thương Chí Mạng vĩnh viễn" },
    { id: "abyssPetCosmicBeast", name: "Thần Thú Vũ Trụ", baseCost: 800, effectType: "multBoost", amount: 0.08, description: "+8% Hệ Số Nhân vĩnh viễn" },
    { id: "abyssPetVoidWyrm", name: "Giun Hư Không", baseCost: 1500, effectType: "critDamageBoost", amount: 0.05, description: "+5% Sát Thương Chí Mạng vĩnh viễn" },
    { id: "abyssPetTimeKeeper", name: "Người Giữ Thời Gian", baseCost: 3000, effectType: "offlineEfficiencyBoost", amount: 0.02, description: "+2% Hiệu Suất Offline Earnings vĩnh viễn" },
  ],
  heaven: [
    { id: "heavenPetCloudDeer", name: "Hươu Mây", baseCost: 6000, effectType: "multBoost", amount: 0.1, description: "+10% Hệ Số Nhân vĩnh viễn" },
    { id: "heavenPetLightSprite", name: "Tinh Linh Ánh Sáng", baseCost: 12000, effectType: "cpsBoost", amount: 0.1, description: "+10% Nexyroth/giây vĩnh viễn" },
    { id: "heavenPetGuardianLion", name: "Sư Tử Hộ Pháp", baseCost: 24000, effectType: "bossDamageBoost", amount: 0.05, description: "+5% Sát Thương lên Boss vĩnh viễn" },
  ],
};

// Di Vật (Relic) - phong cách cổ xưa, nghi lễ
export const relics = [
  { id: "relicOldRing", name: "Nhẫn Đồng Cũ", rarity: "common", effectType: "multBoost", baseAmount: 0.05, description: "+% Hệ Số Nhân vĩnh viễn (khi trang bị)" },
  { id: "relicWoodCharm", name: "Bùa Gỗ Khắc Tay", rarity: "common", effectType: "cpsBoost", baseAmount: 0.05, description: "+% Nexyroth/giây vĩnh viễn (khi trang bị)" },
  { id: "relicRitualDagger", name: "Dao Găm Nghi Lễ", rarity: "uncommon", effectType: "critChanceBoost", baseAmount: 0.0125, description: "+% Tỉ Lệ Chí Mạng vĩnh viễn (khi trang bị)" },
  { id: "relicClayVase", name: "Bình Gốm Cổ", rarity: "uncommon", effectType: "prestigeGemBoost", baseAmount: 0.05, description: "+% Đá Quý nhận khi Tái Sinh (khi trang bị)" },
  { id: "relicBrokenCrown", name: "Vương Miện Vỡ", rarity: "rare", effectType: "multBoost", baseAmount: 0.05, description: "+% Hệ Số Nhân vĩnh viễn (khi trang bị)" },
  { id: "relicRitualBeads", name: "Chuỗi Hạt Nghi Thức", rarity: "rare", effectType: "comboBonusBoost", baseAmount: 0.125, description: "+% hiệu quả Combo mỗi bậc (khi trang bị)" },
  { id: "relicBrokenSword", name: "Kiếm Gãy Của Chiến Thần", rarity: "epic", effectType: "critDamageBoost", baseAmount: 0.075, description: "+% Sát Thương Chí Mạng vĩnh viễn (khi trang bị)" },
  { id: "relicStoneIdol", name: "Tượng Thần Đá", rarity: "epic", effectType: "cpsBoost", baseAmount: 0.05, description: "+% Nexyroth/giây vĩnh viễn (khi trang bị)" },
  { id: "relicAncientThrone", name: "Ngai Vàng Vua Cổ", rarity: "legendary", effectType: "prestigeGemBoost", baseAmount: 0.05, description: "+% Đá Quý nhận khi Tái Sinh (khi trang bị)" },
  { id: "relicEternalHourglass", name: "Đồng Hồ Cát Vĩnh Cửu", rarity: "legendary", effectType: "goldenBuffDurationBoost", baseAmount: 2.5, description: "+giây thời lượng buff Cuồng Nhiệt (khi trang bị)" },
  { id: "relicTitanHeart", name: "Trái Tim Titan", rarity: "mythic", effectType: "multBoost", baseAmount: 0.05, description: "+% Hệ Số Nhân vĩnh viễn (khi trang bị)" },
  { id: "relicEyeOfFate", name: "Mắt Của Định Mệnh", rarity: "mythic", effectType: "critChanceBoost", baseAmount: 0.0125, description: "+% Tỉ Lệ Chí Mạng vĩnh viễn (khi trang bị)" },
  { id: "relicWarhammerOfGiants", name: "Búa Chiến Người Khổng Lồ", rarity: "legendary", effectType: "bossDamageBoost", baseAmount: 0.1, description: "+% Sát Thương lên Boss vĩnh viễn (khi trang bị)" },
  { id: "relicLuckyCoin", name: "Đồng Xu May Mắn", rarity: "epic", effectType: "diamondDropBoost", baseAmount: 0.05, description: "+% Tỉ Lệ Rơi Kim Cương từ Boss vĩnh viễn (khi trang bị)" },
];

// Cổ Vật (Artifact) - phong cách vũ trụ, công nghệ
export const artifacts = [
  { id: "artifactMeteorite", name: "Mảnh Vỡ Thiên Thạch", rarity: "common", effectType: "cpsBoost", baseAmount: 0.05, description: "+% Nexyroth/giây vĩnh viễn (khi trang bị)" },
  { id: "artifactStardust", name: "Hạt Bụi Sao", rarity: "common", effectType: "critChanceBoost", baseAmount: 0.0125, description: "+% Tỉ Lệ Chí Mạng vĩnh viễn (khi trang bị)" },
  { id: "artifactEnergyCore", name: "Lõi Pin Năng Lượng", rarity: "uncommon", effectType: "multBoost", baseAmount: 0.05, description: "+% Hệ Số Nhân vĩnh viễn (khi trang bị)" },
  { id: "artifactQuantumChip", name: "Chip Xử Lý Lượng Tử", rarity: "uncommon", effectType: "comboBonusBoost", baseAmount: 0.125, description: "+% hiệu quả Combo mỗi bậc (khi trang bị)" },
  { id: "artifactBrokenClock", name: "Đồng Hồ Thời Gian Gãy", rarity: "rare", effectType: "goldenBuffDurationBoost", baseAmount: 2.5, description: "+giây thời lượng buff Cuồng Nhiệt (khi trang bị)" },
  { id: "artifactLightPrism", name: "Lăng Kính Ánh Sáng", rarity: "rare", effectType: "cpsBoost", baseAmount: 0.05, description: "+% Nexyroth/giây vĩnh viễn (khi trang bị)" },
  { id: "artifactRiftShard", name: "Mảnh Vỡ Chiều Không Gian", rarity: "epic", effectType: "prestigeGemBoost", baseAmount: 0.05, description: "+% Đá Quý nhận khi Tái Sinh (khi trang bị)" },
  { id: "artifactStarGauntlet", name: "Găng Tay Năng Lượng Sao", rarity: "epic", effectType: "multBoost", baseAmount: 0.05, description: "+% Hệ Số Nhân vĩnh viễn (khi trang bị)" },
  { id: "artifactDragonScale", name: "Vảy Rồng Vũ Trụ", rarity: "legendary", effectType: "critDamageBoost", baseAmount: 0.075, description: "+% Sát Thương Chí Mạng vĩnh viễn (khi trang bị)" },
  { id: "artifactAncientAICore", name: "Lõi AI Cổ Đại", rarity: "legendary", effectType: "comboBonusBoost", baseAmount: 0.125, description: "+% hiệu quả Combo mỗi bậc (khi trang bị)" },
  { id: "artifactUniverseHeart", name: "Trái Tim Vũ Trụ", rarity: "mythic", effectType: "cpsBoost", baseAmount: 0.05, description: "+% Nexyroth/giây vĩnh viễn (khi trang bị)" },
  { id: "artifactNeverFadingStar", name: "Ngôi Sao Chưa Bao Giờ Tắt", rarity: "mythic", effectType: "goldenBuffDurationBoost", baseAmount: 2.5, description: "+giây thời lượng buff Cuồng Nhiệt (khi trang bị)" },
  { id: "artifactTreasureRadar", name: "Radar Dò Kho Báu", rarity: "rare", effectType: "itemDropRateBoost", baseAmount: 0.02, description: "+% Tỉ Lệ Rơi Item từ Boss vĩnh viễn (khi trang bị)" },
];

// Danh sách nâng cấp thường (mua bằng Nexyroth) - sắp xếp theo giá tăng dần
export const upgrades = [
  {
    id: "autoClicker",
    name: "Máy Tự Click",
    baseCost: 100,
    mult: 0,
    cps: 1,
    description: "Tự động click giúp bạn",
  },
  {
    id: "fingers",
    name: "Ngón Tay Phụ",
    baseCost: 100,
    mult: 1,
    cps: 0,
    description: "Nhiều ngón tay hơn, click nhiều hơn",
  },
  {
    id: "feet",
    name: "Bàn Chân Click",
    baseCost: 150,
    mult: 3,
    cps: -1,
    description: "Dùng cả chân để click thêm",
  },
  {
    id: "mechKeyboard",
    name: "Bàn Phím Cơ",
    baseCost: 400,
    mult: 2,
    cps: 2,
    description: "Gõ phím nhanh hơn, click đều tay hơn",
  },
  {
    id: "programmer",
    name: "Lập Trình Viên Tập Sự",
    baseCost: 1000,
    mult: 5,
    cps: 5,
    description: "Viết script đơn giản để tự click",
  },
  {
    id: "gamingMouse",
    name: "Chuột Gaming Tốc Độ Cao",
    baseCost: 2500,
    mult: 8,
    cps: 8,
    description: "DPI cao, click mượt như bơ",
  },
  {
    id: "ai",
    name: "Trợ Lý AI",
    baseCost: 5000,
    mult: 10,
    cps: 20,
    description: "Học cách click hiệu quả hơn",
  },
  {
    id: "miniRobot",
    name: "Robot Click Mini",
    baseCost: 12000,
    mult: 15,
    cps: 35,
    description: "Robot nhỏ chuyên click thay bạn",
  },
  {
    id: "homeWorkshop",
    name: "Xưởng Click Gia Đình",
    baseCost: 25000,
    mult: 25,
    cps: 60,
    description: "Cả nhà cùng nhau click kiếm Nexyroth",
  },
  {
    id: "quantumClicker",
    name: "Máy Click Lượng Tử",
    baseCost: 50000,
    mult: 50,
    cps: 100,
    description: "Click ở nhiều vũ trụ song song",
  },
  {
    id: "autoFactory",
    name: "Nhà Máy Click Tự Động",
    baseCost: 90000,
    mult: 80,
    cps: 180,
    description: "Dây chuyền sản xuất click 24/7",
  },
  {
    id: "timeWarp",
    name: "Cỗ Máy Bẻ Cong Thời Gian",
    baseCost: 100000,
    mult: 100,
    cps: 500,
    description: "Bẻ cong thời gian để click nhanh hơn",
  },
  {
    id: "clickPortal",
    name: "Cổng Không Gian Click",
    baseCost: 250000,
    mult: 150,
    cps: 800,
    description: "Mở cổng dịch chuyển đến chiều không gian toàn click",
  },
  {
    id: "robotArmy",
    name: "Đội Quân Robot Click",
    baseCost: 400000,
    mult: 220,
    cps: 1200,
    description: "Hàng ngàn robot cùng nhau click",
  },
  {
    id: "superAutoClicker",
    name: "Siêu Máy Tự Click",
    baseCost: 500000,
    mult: 0,
    cps: 1000,
    description: "Phiên bản mạnh hơn của Máy Tự Click",
  },
  {
    id: "clickverse",
    name: "Vũ Trụ Click",
    baseCost: 1000000,
    mult: 1000,
    cps: 10000,
    description: "Cả một vũ trụ chỉ để click",
  },
  {
    id: "multiverse",
    name: "Đa Vũ Trụ Click",
    baseCost: 2500000,
    mult: 1800,
    cps: 18000,
    description: "Vô số vũ trụ song song đều đang click",
  },
  {
    id: "minorClickGod",
    name: "Thần Click Sơ Cấp",
    baseCost: 6000000,
    mult: 3200,
    cps: 32000,
    description: "Một vị thần nhỏ chuyên quản lý việc click",
  },
  {
    id: "gemFactory",
    name: "Nhà Máy Đá Quý",
    baseCost: 15000000,
    mult: 5500,
    cps: 55000,
    description: "Biến năng lượng Đá Quý thành sức mạnh click",
  },
  {
    id: "eternalMachine",
    name: "Cỗ Máy Vĩnh Cửu",
    baseCost: 35000000,
    mult: 9000,
    cps: 90000,
    description: "Cỗ máy chạy vĩnh viễn, không cần bảo trì",
  },
  {
    id: "clickSanctuary",
    name: "Thánh Địa Click",
    baseCost: 80000000,
    mult: 15000,
    cps: 150000,
    description: "Thánh địa hành hương của các tín đồ click",
  },
  {
    id: "superAI",
    name: "Siêu Trí Tuệ Nhân Tạo",
    baseCost: 180000000,
    mult: 25000,
    cps: 250000,
    description: "Trí tuệ nhân tạo vượt xa loài người, chỉ để click",
  },
  {
    id: "chaosMachine",
    name: "Cỗ Máy Hỗn Mang",
    baseCost: 300000000,
    mult: 35000,
    cps: 350000,
    description: "Hỗn mang hoá mọi quy luật, chỉ để tăng tốc click",
  },
  {
    id: "clickBlackHole",
    name: "Lỗ Đen Click",
    baseCost: 600000000,
    mult: 50000,
    cps: 500000,
    description: "Hút cả vũ trụ vào một cú click duy nhất",
  },
  {
    id: "supremeClickGod",
    name: "Thần Click Tối Thượng",
    baseCost: 1500000000,
    mult: 90000,
    cps: 900000,
    description: "Đấng tối cao của mọi vũ trụ click",
  },
  {
    id: "dimensionBreaker",
    name: "Kẻ Phá Vỡ Chiều Không Gian",
    baseCost: 3525000000,
    mult: 160200,
    cps: 1602000,
    description: "Xé toạc bức tường thực tại để click nhanh hơn",
  },
  {
    id: "cosmicForge",
    name: "Lò Rèn Vũ Trụ",
    baseCost: 8283750000,
    mult: 285156,
    cps: 2851560,
    description: "Rèn từng cú click bằng vật chất tối",
  },
  {
    id: "starDevourer",
    name: "Kẻ Nuốt Sao",
    baseCost: 19466812500,
    mult: 507578,
    cps: 5075777,
    description: "Nuốt trọn 1 ngôi sao mỗi lần click",
  },
  {
    id: "galacticNexus",
    name: "Điểm Giao Ngân Hà",
    baseCost: 45747009375,
    mult: 903488,
    cps: 9034883,
    description: "Kết nối vô số thiên hà chỉ để click",
  },
  {
    id: "realityEngine",
    name: "Cỗ Máy Tạo Thực Tại",
    baseCost: 107505472031,
    mult: 1608209,
    cps: 16082091,
    description: "Tạo ra cả 1 thực tại mới sau mỗi click",
  },
  {
    id: "infiniteLoop",
    name: "Vòng Lặp Vô Cực",
    baseCost: 252637859273,
    mult: 2862612,
    cps: 28626122,
    description: "Click lặp lại xuyên suốt mọi dòng thời gian",
  },
  {
    id: "voidArchitect",
    name: "Kiến Trúc Sư Hư Không",
    baseCost: 593698969293,
    mult: 5095450,
    cps: 50954498,
    description: "Xây thực tại từ hư vô bằng click",
  },
  {
    id: "omniClickCore",
    name: "Lõi Click Toàn Năng",
    baseCost: 1395192577838,
    mult: 9069901,
    cps: 90699006,
    description: "Trung tâm năng lượng click của toàn vũ trụ",
  },
  {
    id: "celestialAscendant",
    name: "Thiên Thể Thăng Hoa",
    baseCost: 3278702557918,
    mult: 16144423,
    cps: 161444231,
    description: "Thăng hoa cùng các vì sao mỗi lần click",
  },
  {
    id: "paradoxEngine",
    name: "Cỗ Máy Nghịch Lý",
    baseCost: 7704951011108,
    mult: 28737073,
    cps: 287370731,
    description: "Click ngược cả nhân quả",
  },
  {
    id: "eternitySingularity",
    name: "Điểm Kỳ Dị Vĩnh Hằng",
    baseCost: 18106634876104,
    mult: 51151990,
    cps: 511519901,
    description: "Nén cả vĩnh hằng vào 1 cú click",
  },
  {
    id: "multiverseSovereign",
    name: "Bá Chủ Đa Vũ Trụ",
    baseCost: 42550591958843,
    mult: 91050542,
    cps: 910505424,
    description: "Cai trị mọi vũ trụ song song bằng click",
  },
  {
    id: "primordialWill",
    name: "Ý Chí Nguyên Thuỷ",
    baseCost: 99993891103282,
    mult: 162069965,
    cps: 1620699654,
    description: "Ý chí có trước cả vũ trụ, giờ dùng để click",
  },
  {
    id: "absoluteZeroPoint",
    name: "Điểm Không Tuyệt Đối",
    baseCost: 234985644092713,
    mult: 288484538,
    cps: 2884845384,
    description: "Đóng băng thời gian để click nhanh hơn ánh sáng",
  },
  {
    id: "godClickTranscendent",
    name: "Thần Click Siêu Việt",
    baseCost: 552216263617876,
    mult: 513502478,
    cps: 5135024784,
    description: "Vượt lên trên cả Thần Click Tối Thượng",
  },
  {
    id: "nexyrothItself",
    name: "Nexyroth Nguyên Thể",
    baseCost: 1297708219502008,
    mult: 914034412,
    cps: 9140344116,
    description: "Chính bản thể Nexyroth hoá thân thành cỗ máy click",
  },
];

// Danh sách item trong Cửa Hàng Đá Quý (mua bằng Đá Quý, buff % vĩnh viễn, không mất khi Tái Sinh)
export const gemUpgrades = [
  {
    id: "permMult",
    name: "Hệ Số Nhân Vĩnh Cửu",
    baseCost: 10,
    description: `+${Math.round(
      GEM_MULT_BONUS_PER_LEVEL * 100
    )}% Hệ Số Nhân vĩnh viễn (nhân dồn với Hệ Số Nhân hiện có)`,
  },
  {
    id: "permCps",
    name: "Tự Động Click Vĩnh Cửu",
    baseCost: 10,
    description: `+${Math.round(
      GEM_CPS_BONUS_PER_LEVEL * 100
    )}% Nexyroth/giây vĩnh viễn (nhân dồn với chỉ số hiện có)`,
  },
  {
    id: "prestigePower",
    name: "Sức Mạnh Tái Sinh",
    baseCost: 15,
    description: `+${Math.round(
      PRESTIGE_POWER_BONUS_PER_LEVEL * 100
    )}% Đá Quý nhận được mỗi lần Tái Sinh`,
  },
  {
    id: "headStart",
    name: "Khởi Đầu Thuận Lợi",
    baseCost: 8,
    description: `+${HEAD_START_BONUS_PER_LEVEL} Nexyroth khởi điểm mỗi khi Tái Sinh`,
  },
  {
    id: "rebirthCap",
    name: "Mở Rộng Giới Hạn Tái Sinh",
    baseCost: 12,
    description: `+${REBIRTH_CAP_BONUS_PER_LEVEL} giới hạn tối đa Lượt Tái Sinh có thể giữ cùng lúc`,
  },
  {
    id: "rebirthBoost",
    name: "Vận May Tái Sinh",
    baseCost: 12,
    description: `+${Math.round(
      REBIRTH_BOOST_PER_LEVEL * 100
    )}% số Lượt Tái Sinh nhận được mỗi lần Tái Sinh (nhân dồn)`,
  },
  {
    id: "bossBot",
    name: "Bot Săn Boss",
    baseCost: 20,
    description: `Tự động gây thêm sát thương lên Boss = ${Math.round(
      AUTO_BOSS_DAMAGE_PER_LEVEL * 100
    )}% Nexyroth/giây mỗi giây (mỗi cấp cộng dồn thêm), không cần bạn tự click`,
  },
];

// Danh sách item trong Cửa Hàng Chí Mạng (mua bằng Đá Quý, buff riêng cho Critical Click)
export const critUpgrades = [
  {
    id: "critChance",
    name: "Tỉ Lệ Chí Mạng",
    baseCost: 10,
    description: `+${Math.round(
      CRIT_CHANCE_BONUS_PER_LEVEL * 100
    )}% cơ hội Chí Mạng khi click (tối đa ${Math.round(
      MAX_CRIT_CHANCE * 100
    )}%)`,
  },
  {
    id: "critDamage",
    name: "Sát Thương Chí Mạng",
    baseCost: 10,
    description: `+${Math.round(
      CRIT_DAMAGE_BONUS_PER_LEVEL * 100
    )}% sát thương Chí Mạng (nhân dồn)`,
  },
];

// Danh sách achievements (thành tựu) trong game
export const achievements = [
  {
    id: "firstClick",
    name: "Cú Click Đầu Tiên",
    description: "Thực hiện cú click đầu tiên",
    condition: (state) => Big.gte(state.allTimeClicks, Big.fromNumber(1)),
  },
  {
    id: "hundredClicks",
    name: "Đam Mê Click",
    description: "Đạt 100 lượt click",
    condition: (state) => Big.gte(state.allTimeClicks, Big.fromNumber(100)),
  },
  {
    id: "thousandClicks",
    name: "Bậc Thầy Click",
    description: "Đạt 1.000 lượt click",
    condition: (state) => Big.gte(state.allTimeClicks, Big.fromNumber(1000)),
  },
  {
    id: "millionClicks",
    name: "Triệu Phú Click",
    description: "Đạt 1.000.000 lượt click",
    condition: (state) => Big.gte(state.allTimeClicks, Big.fromNumber(1000000)),
  },
  {
    id: "billionClicks",
    name: "Tỷ Phú Click",
    description: "Đạt 1.000.000.000 lượt click",
    condition: (state) => Big.gte(state.allTimeClicks, Big.fromNumber(1000000000)),
  },
  {
    id: "firstUpgrade",
    name: "Tập Sự Nâng Cấp",
    description: "Mua nâng cấp đầu tiên",
    condition: (state) =>
      Object.values(state.upgrades).some((count) => count > 0),
  },
  {
    id: "fiveUpgrades",
    name: "Đam Mê Nâng Cấp",
    description: "Mua 5 loại nâng cấp khác nhau",
    condition: (state) =>
      Object.values(state.upgrades).filter((count) => count > 0).length >= 5,
  },
  {
    id: "allUpgrades",
    name: "Bậc Thầy Nâng Cấp",
    description: "Mua tất cả nâng cấp ít nhất 1 lần",
    condition: (state) =>
      Object.values(state.upgrades).every((count) => count > 0),
  },
  {
    id: "level10",
    name: "Lên Cấp",
    description: "Đạt cấp độ 10",
    condition: (state) => state.level >= 10,
  },
  {
    id: "level50",
    name: "Người Xuất Sắc",
    description: "Đạt cấp độ 50",
    condition: (state) => state.level >= 50,
  },
  {
    id: "level100",
    name: "Huyền Thoại Click",
    description: "Đạt cấp độ 100",
    condition: (state) => state.level >= 100,
  },
  {
    id: "level500",
    name: "Thần Click",
    description: "Đạt cấp độ 500",
    condition: (state) => state.level >= 500,
  },
  {
    id: "cps100",
    name: "Chuyên Gia Hiệu Suất",
    description: "Đạt 100 Nexyroth/giây",
    condition: (state) => Big.gte(state.cps, Big.fromNumber(100)),
  },
  {
    id: "cps1000",
    name: "Nhà Máy Nexyroth",
    description: "Đạt 1.000 Nexyroth/giây",
    condition: (state) => Big.gte(state.cps, Big.fromNumber(1000)),
  },
  {
    id: "cps10000",
    name: "Điểm Kỳ Dị Click",
    description: "Đạt 10.000 Nexyroth/giây",
    condition: (state) => Big.gte(state.cps, Big.fromNumber(10000)),
  },
  {
    id: "mult100",
    name: "Bậc Thầy Hệ Số Nhân",
    description: "Đạt Hệ Số Nhân 100x",
    condition: (state) => Big.gte(state.mult, Big.fromNumber(100)),
  },
  {
    id: "mult1000",
    name: "Trùm Hệ Số Nhân",
    description: "Đạt Hệ Số Nhân 1.000x",
    condition: (state) => Big.gte(state.mult, Big.fromNumber(1000)),
  },
  {
    id: "goldenGift1",
    name: "Người May Mắn",
    description: "Bấm trúng Hộp Quà Vàng lần đầu tiên",
    condition: (state) => state.goldenGiftsClicked >= 1,
  },
  {
    id: "goldenGift10",
    name: "Săn Quà Chuyên Nghiệp",
    description: "Bấm trúng Hộp Quà Vàng 10 lần",
    condition: (state) => state.goldenGiftsClicked >= 10,
  },
  {
    id: "combo10",
    name: "Ngón Tay Lửa",
    description: "Đạt combo 10 click liên tiếp",
    condition: (state) => state.maxCombo >= 10,
  },
  {
    id: "comboMax",
    name: "Vua Combo",
    description: `Đạt combo tối đa (${COMBO_MAX_STEPS} click liên tiếp)`,
    condition: (state) => state.maxCombo >= COMBO_MAX_STEPS,
  },
  {
    id: "ascend1",
    name: "Người Được Chọn",
    description: "Thực hiện Thăng Thiên lần đầu tiên",
    condition: (state) => state.ascensionCount >= 1,
  },
  {
    id: "collect1",
    name: "Nhà Sưu Tầm Tập Sự",
    description: "Sở hữu Cổ Vật hoặc Di Vật đầu tiên",
    condition: (state) => Object.keys(state.collection || {}).length >= 1,
  },
  {
    id: "collectAll",
    name: "Bậc Thầy Sưu Tầm",
    description: `Sở hữu toàn bộ ${relics.length + artifacts.length} Cổ Vật và Di Vật`,
    condition: (state) =>
      Object.keys(state.collection || {}).length >= relics.length + artifacts.length,
  },
  {
    id: "skillTreeMax",
    name: "Đại Sư Kỹ Năng",
    description: "Mở khoá toàn bộ Cây Kỹ Năng (cả 4 nhánh)",
    condition: (state) =>
      state.skillTree &&
      state.skillTree.power >= skillTree.power.length &&
      state.skillTree.speed >= skillTree.speed.length &&
      state.skillTree.crit >= skillTree.crit.length &&
      state.skillTree.ascension >= skillTree.ascension.length,
  },
  {
    id: "ascend5",
    name: "Đại Thăng Thiên",
    description: "Thực hiện Thăng Thiên 5 lần",
    condition: (state) => state.ascensionCount >= 5,
  },
  {
    id: "totalPrestiges100",
    name: "Vòng Lặp Vô Tận",
    description: "Tích luỹ 100 Lượt Tái Sinh trọn đời",
    condition: (state) => Big.gte(state.totalPrestigesEver, Big.fromNumber(100)),
  },
  {
    id: "totalPrestiges1000",
    name: "Bậc Thầy Tái Sinh",
    description: "Tích luỹ 1.000 Lượt Tái Sinh trọn đời",
    condition: (state) => Big.gte(state.totalPrestigesEver, Big.fromNumber(1000)),
  },
  {
    id: "ascensionBranchMax",
    name: "Chuyên Gia Thăng Thiên",
    description: "Mở khoá toàn bộ nhánh Thăng Thiên trong Cây Kỹ Năng",
    condition: (state) =>
      state.skillTree && state.skillTree.ascension >= skillTree.ascension.length,
  },
  {
    id: "bossFirst",
    name: "Diệt Boss Đầu Tiên",
    description: "Hạ gục 1 Boss trước khi hết giờ",
    condition: (state) => state.bossesDefeated >= 1,
  },
  {
    id: "bossHunter",
    name: "Sát Thủ Boss",
    description: "Hạ gục 20 Boss",
    condition: (state) => state.bossesDefeated >= 20,
  },
  {
    id: "allWorldsUnlocked",
    name: "Nhà Thám Hiểm Đa Thế Giới",
    description: "Mở khoá tất cả Thế Giới",
    condition: (state) =>
      state.ascensionCount >= Math.max(...worlds.map((w) => w.unlockAscension)),
  },
  {
    id: "allPetsTamed",
    name: "Người Bạn Của Muôn Loài",
    description: "Thuần hoá tất cả Pet ở mọi Thế Giới",
    condition: (state) => {
      const allPetIds = Object.values(pets).flat().map((p) => p.id);
      return allPetIds.every((id) => state.tamedPets && state.tamedPets[id]);
    },
  },
  {
    id: "nirvanaFirst",
    name: "Đại Giác Ngộ",
    description: "Đạt Niết Bàn lần đầu tiên",
    condition: (state) => state.nirvanaCount >= 1,
  },
  {
    id: "allDivineBeasts",
    name: "Chủ Nhân Tứ Linh",
    description: "Sở hữu tất cả Thần Thú qua Gacha",
    condition: (state) =>
      divineBeasts.every((b) => state.divineBeastsTamed && state.divineBeastsTamed[b.id]),
  },
];
