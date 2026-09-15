import { state, saveGame } from "./state.js";
import * as Big from "./numeric.js";
import { addItem, getItemById } from "./items.js";

// Bảng mã hợp lệ - chỉ đối chiếu chuỗi, KHÔNG thực thi bất kỳ nội dung nào người chơi nhập vào.
// reward là 1 hàm áp dụng phần thưởng vào state và trả về mô tả ngắn để hiển thị cho người chơi.
const CODE_TABLE = {
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
    describe: `2x ${getItemById("multiplier_x2").name}, 1x ${getItemById("auto_clicker_potion").name}`,
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

// Redeem 1 mã. Trả về { success, message, rewardText } để UI hiển thị trực tiếp, không tự suy luận thêm.
export function redeemCode(rawInput) {
  const code = normalizeCode(rawInput);

  if (code === "") {
    return { success: false, message: "Vui lòng nhập mã." };
  }

  const entry = CODE_TABLE[code];
  if (!entry) {
    return { success: false, message: "Mã không hợp lệ." };
  }

  if (state.redeemedCodes[code]) {
    return { success: false, message: "Mã này đã được sử dụng trước đó." };
  }

  entry.apply();
  state.redeemedCodes[code] = true;
  saveGame();

  return {
    success: true,
    message: `Redeem thành công! Nhận được: ${entry.describe}`,
    rewardText: entry.describe,
  };
}