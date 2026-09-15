import { saveGame } from "./state.js";

// Anti-cheat NHẸ cho game client-side thuần (không có server) - đây là HÀNG RÀO NGĂN CẢN, không phải
// bảo mật thật sự: người chơi vẫn có thể vượt qua bằng cách khác (tắt JS, sửa file, DevTools Protocol
// từ xa...). Mục tiêu chỉ là chặn thao tác phổ biến "mở Console gõ lệnh sửa state/localStorage".
//
// CẢNH BÁO KHI PHÁT TRIỂN: nếu đang code/test bằng DevTools, hãy đặt ANTI_CHEAT_ENABLED = false bên
// dưới trước khi mở Console, nếu không sẽ tự bị coi là gian lận và xoá sạch localStorage.
// Về việc "bảo vệ state khỏi bị ghi đè từ Console": state.js export biến `state` qua ES Module,
// KHÔNG gắn lên `window`, nên Console không thể gõ `state.bucks = 999999999` để sửa trực tiếp (biến
// module-scope không phải biến toàn cục) - đây là lớp bảo vệ có sẵn, không cần thêm code.
// Cân nhắc thêm MutationObserver để phát hiện sửa DOM trực tiếp (ví dụ gõ tay đổi textContent số
// tiền hiển thị) nhưng không cần thiết: updateDisplay() đã tự vẽ lại toàn bộ số liệu từ state mỗi
// giây, nên bất kỳ thay đổi DOM thủ công nào cũng tự bị ghi đè lại trong tối đa 1 giây.
const ANTI_CHEAT_ENABLED = true;

const CHECK_INTERVAL_MS = 1000;
const SUSPICIOUS_GAP_MIN_MS = 2500; // dưới ngưỡng này chỉ là jitter bình thường của trình duyệt/máy chậm
const SUSPICIOUS_GAP_MAX_MS = 30000; // trên ngưỡng này gần như chắc chắn là máy sleep/tab bị đình chỉ lâu, KHÔNG phải debugger
const VIOLATION_THRESHOLD = 3; // cần NHIỀU LẦN liên tiếp mới coi là gian lận thật, tránh xoá oan vì 1 lần giật máy

let consecutiveViolations = 0;
let lastTick = performance.now();
let tabWasHiddenSinceLastTick = document.hidden;

function wipeAndShowBanScreen(reason) {
  // Gỡ đúng listener autosave đã đăng ký bằng addEventListener trong main.js - gán window.onbeforeunload
  // = null KHÔNG có tác dụng gỡ listener kiểu này, phải removeEventListener đúng tham chiếu hàm.
  window.removeEventListener("beforeunload", saveGame);
  try {
    localStorage.clear();
  } catch (err) {
    // localStorage có thể bị chặn (chế độ ẩn danh nghiêm ngặt...) - vẫn tiếp tục hiện màn hình cấm
  }

  document.body.innerHTML = `
    <div style="position:fixed;inset:0;background:#7f1d1d;color:#fff;display:flex;flex-direction:column;
                align-items:center;justify-content:center;text-align:center;padding:24px;font-family:sans-serif;z-index:999999;">
      <div style="font-size:56px;margin-bottom:16px;">⚠️</div>
      <h1 style="font-size:28px;font-weight:800;margin-bottom:12px;">PHÁT HIỆN GIAN LẬN!</h1>
      <p style="font-size:14px;opacity:0.85;margin-bottom:24px;max-width:420px;">Lý do: ${reason}</p>
      <button id="anti-cheat-reload" style="background:#fff;color:#7f1d1d;font-weight:700;padding:10px 24px;
              border-radius:8px;border:none;cursor:pointer;font-size:14px;">
        Chơi Lại Từ Đầu
      </button>
    </div>
  `;
  document.getElementById("anti-cheat-reload").addEventListener("click", () => location.reload());
}

function blockDevtoolsShortcuts(e) {
  const key = e.key.toLowerCase();
  const isDevtoolsCombo =
    key === "f12" ||
    (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
    (e.ctrlKey && key === "u");
  if (isDevtoolsCombo) {
    e.preventDefault();
  }
}

function blockContextMenu(e) {
  e.preventDefault();
}

// Bẫy debugger + đo thời gian: statement "debugger" bên dưới CHỈ thực sự tạm dừng thực thi nếu
// DevTools đang mở (không ảnh hưởng gì khi DevTools đóng) - nhờ vậy khoảng cách giữa 2 lần tick sẽ
// bất thường đúng lúc ai đó mở Console, mà không cần code check xem DevTools có đang mở hay không.
function debuggerCheckTick() {
  const now = performance.now();
  const gap = now - lastTick;
  lastTick = now;

  // Tab vừa bị ẩn/nền trong khoảng vừa rồi -> gap lớn là bình thường (trình duyệt throttle timer khi
  // tab không active, hoặc máy vừa sleep/wake), KHÔNG được tính là dấu hiệu gian lận.
  if (tabWasHiddenSinceLastTick) {
    tabWasHiddenSinceLastTick = document.hidden;
    consecutiveViolations = 0;
    return;
  }

  if (gap > SUSPICIOUS_GAP_MIN_MS && gap < SUSPICIOUS_GAP_MAX_MS) {
    consecutiveViolations += 1;
    if (consecutiveViolations >= VIOLATION_THRESHOLD) {
      wipeAndShowBanScreen("Phát hiện tạm dừng bất thường (nghi vấn mở Debugger/Console can thiệp game).");
    }
  } else {
    consecutiveViolations = 0;
  }

  // eslint-disable-next-line no-debugger
  debugger;
}

export function initAntiCheat() {
  if (!ANTI_CHEAT_ENABLED) return;

  document.addEventListener("keydown", blockDevtoolsShortcuts);
  document.addEventListener("contextmenu", blockContextMenu);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) tabWasHiddenSinceLastTick = true;
  });

  setInterval(debuggerCheckTick, CHECK_INTERVAL_MS);
}
