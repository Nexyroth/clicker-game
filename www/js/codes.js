import { state, saveGame } from "./state.js";
import * as Big from "./numeric.js";
import { addItem, getItemById, ITEMS } from "./items.js";

// Bảng mã hợp lệ - chỉ đối chiếu chuỗi, KHÔNG thực thi bất kỳ nội dung nào người chơi nhập vào.
// reward là 1 hàm áp dụng phần thưởng vào state và trả về mô tả ngắn để hiển thị cho người chơi.
const CODE_TABLE = {
  // =========================================================================
  // --- MÃ ADMIN BUFF ALL (KHÔNG GIỚI HẠN SỐ LẦN NHẬP) ---
  // Ghi chú: Để xóa mã ADMIN này sau này, bạn chỉ cần XÓA HOÀN TOÀN khối "ADMIN: { ... }" bên dưới.
  // =========================================================================
  ADMIN: {
    describe: "ADMIN BUFF ALL (1SX Tiền tệ + 999 Các Loại Thuốc)",
    isUnlimited: true, // Cờ báo hiệu mã này được nhập vô hạn lần
    apply: () => {
      // 1. Khởi tạo giá trị Buff: 1SX = 1e21 (1 Septillion)
      const BUFF_AMOUNT = Big.fromString("1e21");
      const ITEM_QUANTITY = 999;

      // ---------------------------------------------------------------------
      // [ĐOẠN 1] BUFF TIỀN TỆ / CHỈ SỐ
      // Để xóa buff tiền tệ nào, bạn comment (//) hoặc xóa dòng tương ứng bên dưới:
      // ---------------------------------------------------------------------

      // Buff Nexyroth (Bucks)
      state.bucks = Big.add(state.bucks, BUFF_AMOUNT);
      state.totalBucksEarned = Big.add(state.totalBucksEarned, BUFF_AMOUNT);

      // Buff Đá Quý (Gems)
      state.gems = Big.add(state.gems, BUFF_AMOUNT);
      state.totalGemsEarned = Big.add(state.totalGemsEarned, BUFF_AMOUNT);

      // Buff Tinh Thể (Crystals - Thăng Thiên)
      state.crystals = Big.add(state.crystals, BUFF_AMOUNT);
      state.totalCrystalsEarned = Big.add(state.totalCrystalsEarned, BUFF_AMOUNT);

      // Buff Xá Lợi (XaLoi - Niết Bàn)
      state.xaLoi = Big.add(state.xaLoi, BUFF_AMOUNT);
      state.totalXaLoiEarned = Big.add(state.totalXaLoiEarned, BUFF_AMOUNT);

      // Buff Kim Cương (Diamonds)
      state.diamonds = Big.add(state.diamonds, BUFF_AMOUNT);
      state.totalDiamondsEarned = Big.add(state.totalDiamondsEarned, BUFF_AMOUNT);

      // ---------------------------------------------------------------------
      // [ĐOẠN 2] BUFF THUỐC / ITEM VÀO BALO
      // Thêm 999 cái cho tất cả các item loại "potion" hiện có trong items.js
      // Để xóa buff item, xóa hoặc comment đoạn dưới này:
      // ---------------------------------------------------------------------
      ITEMS.forEach((item) => {
        if (item.category === "potion") {
          addItem(item.id, ITEM_QUANTITY);
        }
      });
    },
  },

  // --- MÃ CỦA BẠN YÊU CẦU ---
  ANHDADENYEUEM: {
    describe: "100 Kim Cương",
    apply: () => {
      state.diamonds = Big.add(state.diamonds, Big.fromNumber(100));
      state.totalDiamondsEarned = Big.add(state.totalDiamondsEarned, Big.fromNumber(100));
    },
  },

  // --- MÃ QUÀ TẶNG BỔ SUNG ---
  NEXY2026: {
    describe: "200 Kim Cương + 100 Đá Quý",
    apply: () => {
      state.diamonds = Big.add(state.diamonds, Big.fromNumber(200));
      state.totalDiamondsEarned = Big.add(state.totalDiamondsEarned, Big.fromNumber(200));
      state.gems = Big.add(state.gems, Big.fromNumber(100));
      state.totalGemsEarned = Big.add(state.totalGemsEarned, Big.fromNumber(100));
    },
  },
  VIPCODE: {
    describe: "500 Kim Cương",
    apply: () => {
      state.diamonds = Big.add(state.diamonds, Big.fromNumber(500));
      state.totalDiamondsEarned = Big.add(state.totalDiamondsEarned, Big.fromNumber(500));
    },
  },
  NIRVANA: {
    describe: "5 Xá Lợi",
    apply: () => {
      state.xaLoi = Big.add(state.xaLoi, Big.fromNumber(5));
      state.totalXaLoiEarned = Big.add(state.totalXaLoiEarned, Big.fromNumber(5));
    },
  },

  // --- MÃ MẶC ĐỊNH CŨ ---
  NXWELCOME: {
    describe: "50 Đá Quý",
    apply: () => {
      state.gems = Big.add(state.gems, Big.fromNumber(50));
      state.totalGemsEarned = Big.add(state.totalGemsEarned, Big.fromNumber(50));
    },
  },
  NXITEMDROP: {
    describe: `2x ${getItemById("multiplier_x2")?.name || "Thuốc x2"}, 1x ${getItemById("auto_clicker_potion")?.name || "Thuốc Auto"}`,
    apply: () => {
      addItem("multiplier_x2", 2);
      addItem("auto_clicker_potion", 1);
    },
  },
};

// Chuẩn hoá mã nhập vào: trim khoảng trắng đầu/cuối + không phân biệt hoa/thường
function normalizeCode(rawInput) {
  return String(rawInput || "").trim().toUpperCase();
}

// Redeem 1 mã. Trả về { success, message, rewardText } để UI hiển thị trực tiếp
export function redeemCode(rawInput) {
  const code = normalizeCode(rawInput);

  if (code === "") {
    return { success: false, message: "Vui lòng nhập mã." };
  }

  const entry = CODE_TABLE[code];
  if (!entry) {
    return { success: false, message: "Mã không hợp lệ." };
  }

  // Nếu KHÔNG PHẢI mã vô hạn (isUnlimited) thì kiểm tra xem đã dùng chưa
  if (!entry.isUnlimited && state.redeemedCodes[code]) {
    return { success: false, message: "Mã này đã được sử dụng trước đó." };
  }

  // Áp dụng phần thưởng
  entry.apply();

  // Chỉ ghi nhận "đã dùng" nếu mã này KHÔNG PHẢI mã vô hạn
  if (!entry.isUnlimited) {
    state.redeemedCodes[code] = true;
  }

  saveGame();

  return {
    success: true,
    message: `Redeem thành công! Nhận được: ${entry.describe}`,
    rewardText: entry.describe,
  };
}
