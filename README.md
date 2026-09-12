# ⚔️ NEXYROTH CLICKER RPG (v7.5)

![Version](https://img.shields.io/badge/version-7.5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Web%20Browser-orange.svg)
![Architecture](https://img.shields.io/badge/architecture-JS%20Modular-yellow.svg)

> **Nexyroth Clicker RPG** là một tựa game Clicker/Idle cày cấp thế hệ mới được xây dựng hoàn toàn bằng HTML5, CSS3 và Vanilla JavaScript (25 ES6 Modules). Game sở hữu hệ thống chiều sâu chiến thuật với 3 tầng Reset, săn Boss ngẫu nhiên, hệ thống Đa Thế Giới, Pet đồng hành và Gacha Thần Thú, khoác lên giao diện Dark Cyberpunk & Glassmorphism cùng hệ thống âm thanh tổng hợp.

🌐 **Trải nghiệm ngay tại:** [https://nexyroth.github.io/clicker-game/](https://nexyroth.github.io/clicker-game/)

---

## 🚀 TỔNG HỢP TÍNH NĂNG VÀ CÁC BẢN CẬP NHẬT (v7.1 - v7.5)

### 🔢 Bản Patch v7.5: Hệ Thống Số Cực Lớn (BigNum)
* **Module `numeric.js` mới:** Toàn bộ currency không giới hạn (Nexyroth, Đá Quý, Tinh Thể, Xá Lợi, tiền tệ Thế Giới, Hệ Số Nhân, CPS, giá nâng cấp, HP Boss...) giờ dùng 1 hệ biểu diễn `mantissa × 10^exponent` dùng chung toàn game thay vì kiểu `Number` gốc của JavaScript, để không còn giới hạn ở khoảng ±1.8 × 10³⁰⁸.
* **Không còn rủi ro `Infinity`/`NaN`:** Mọi phép tính lớn (đặc biệt là giá nâng cấp và độ khó Boss, vốn dùng luỹ thừa) giờ tính trong không gian logarit thay vì gọi `Math.pow` trực tiếp, nên không bao giờ tràn số dù chơi idle rất lâu.
* **Cấp Độ Boss không còn giới hạn trần:** Trước đây HP Boss có nguy cơ tràn số ở mức cấp độ rất cao; giờ Boss có thể tăng cấp vô hạn mà HP vẫn hiển thị chính xác.
* **Hậu tố hiển thị mở rộng:** Ngoài K/M/B/T quen thuộc, số lớn hơn hiển thị theo hệ Latin chuẩn Qa/Qi/Sx/Sp/Oc/No/Dc/Ud/Dd/Td/Qad/Qid/Sxd/Spd/Ocd/Nod/Vg... và tự sinh tiếp các bậc cao hơn theo đúng quy tắc đặt tên, thay vì dừng lại ở Q (Quadrillion) như bản cũ. Chỉ khi vượt quá bảng hậu tố hỗ trợ (~10³⁰⁰⁰) mới rơi về dạng khoa học có kiểm soát (`1.25e+3500`), không bao giờ hiện số thô kiểu `1e+128`.
* **Hệ Số Nhân/CPS giữ đúng phần thập phân:** Sửa lỗi hiển thị số lẻ (2.5x không còn bị làm tròn thành 3x) trong lúc vẫn dùng chung hệ BigNum với currency.
* **Save/Load có version + migration:** Save thêm trường `saveVersion`. Save cũ (v7.1-v7.4, số dạng `Number` thô) khi load lần đầu sẽ tự động chuyển đổi sang định dạng BigNum mới, không mất tiến trình. Save hỏng hoặc field sai kiểu sẽ được bắt lỗi và dùng giá trị mặc định cho riêng field đó thay vì làm crash toàn bộ game.
* **Không đổi cân bằng gameplay:** Toàn bộ công thức giá/thưởng giữ nguyên hành vi như trước, chỉ đổi cách biểu diễn số bên dưới.

---

### 🎨 Bản Patch v7.4: UI/UX Pro Max & Audio System
* **Giao Diện Dark Cyberpunk & Glassmorphism (mặc định):** Đại tu toàn bộ bảng màu sang nền tối kèm lưới neon mờ, card kính mờ (`backdrop-blur`) viền phát sáng cyan, nút bấm có glow theo màu chức năng. Tiêu đề chính và các mục lớn dùng font hiển thị **Orbitron** cho không khí công nghệ. Người chơi mới mặc định vào thẳng giao diện tối; ai thích giao diện sáng vẫn bật lại được trong Cài Đặt như cũ.
* **Hệ Thống Âm Thanh (SFX):** Tự tổng hợp bằng Web Audio API (không cần file âm thanh ngoài, tải trang nhanh, chạy offline được) — tiếng click thường khác tiếng Chí Mạng, tiếng "ting" khi mua đồ, tiếng chuông khi lên cấp, dàn nhạc ngắn cho Thành Tựu/Hộp Quà Vàng/hạ Boss, và 3 đoạn nhạc "trọng lượng" tăng dần cho Tái Sinh → Thăng Thiên → Niết Bàn. Có nút bật/tắt riêng trong Cài Đặt.
* **Chỉ Báo "Có Việc Cần Làm" (Notification Badges):** Chấm đỏ tự động hiện trên từng tab (Cây Kỹ Năng, Nhiệm Vụ, Thế Giới, Niết Bàn) và trên nút nổi 🌳 khi có nâng cấp đủ tiền mua, nhiệm vụ chờ nhận thưởng, hoặc Niết Bàn/Gacha sẵn sàng — không cần mở từng tab để dò nữa.
* **Tối Ưu Di Động:** Thanh tab trong modal cuộn ngang mượt thay vì vỡ dòng, thanh máu Boss thu gọn không tràn màn hình nhỏ, toàn bộ nút bấm có `touch-action: manipulation` chống zoom ngoài ý muốn khi chạm nhanh.
* **Accessibility:** Trạng thái focus rõ ràng khi điều hướng bằng bàn phím, tôn trọng `prefers-reduced-motion` cho người nhạy cảm với hiệu ứng chuyển động, con trỏ `pointer` nhất quán trên mọi phần tử bấm được.

---

### 🕉️ Bản Patch v7.3: Tầng Tái Sinh Thứ 3 - Niết Bàn (Nirvana)
* **Cơ Chế Niết Bàn:** Mở khóa sau 5 lần Thăng Thiên trọn đời. Reset toàn bộ Cây Kỹ Năng, Cổ Vật, Tinh Thể, Đá Quý, Pet và tiền tệ Thế Giới về xuất phát điểm để đổi lấy tiền tệ tối cao: **Xá Lợi**.
* **Nâng Cấp Vĩnh Hằng (Không bao giờ mất qua mọi lần Niết Bàn):**
  * ✨ **Vĩnh Hằng Bội Tăng:** +10%/cấp cho cả Hệ Số Nhân (Mult) và CPS vĩnh viễn.
  * 🎰 **Gacha Thần Thú (Tứ Linh):** Quay ngẫu nhiên nhận 4 Thần Thú cực xịn (*Phượng Hoàng Bất Tử, Thần Long Nguyên Thủy, Kỳ Lân Thánh Thể, Thần Quy Vĩnh Cửu*).
* **Cập Nhật Cân Bằng (sau bản gốc):**
  * **Pet & Thần Thú có CẤP ĐỘ:** Thay vì chỉ "có/chưa có", Pet Thế Giới giờ nâng cấp lặp lại được bằng đúng tiền tệ Thế Giới đó (giá tăng dần mỗi cấp); Gacha Thần Thú quay trúng trùng sẽ tự lên cấp thay vì hoàn tiền, không còn lãng phí lượt quay.
  * **Offline Earnings đa Thế Giới:** Nexyroth kiếm được trong lúc rời trang giờ quy đổi tiền tệ cho **cả 3 Thế Giới cùng lúc** thay vì chỉ Thế Giới đang chọn.
* **Thành Tựu Mới:** *Đại Giác Ngộ*, *Chủ Nhân Tứ Linh*.

---

### 🗺️ Bản Patch v7.2: Đa Thế Giới & Thuần Hóa Pet
* **3 Thế Giới Mới (Mở khoá theo Thăng Thiên):**
  * 🌲 **Rừng Nguyên Sinh:** Tiền tệ *Nhựa Cây* (Mặc định).
  * 🏙️ **Thành Phố Nexyroth:** Tiền tệ *Mảnh Chip* (Yêu cầu 1 lần Thăng Thiên).
  * 🌌 **Vực Thẳm Vũ Trụ:** Tiền tệ *Bụi Sao* (Yêu cầu 3 lần Thăng Thiên).
  * **Cơ chế:** Trích 10% tổng lượng Nexyroth kiếm được quy đổi thành tiền tệ của Thế Giới đang kích hoạt. Mỗi Thế Giới giữ số dư hoàn toàn riêng biệt, không trộn lẫn khi đổi qua lại.
* **Hệ Thống 9 Pet (3 Pet / Thế Giới):** Dùng tiền tệ Thế Giới tương ứng để thuần hóa. Pet không giới hạn slot, cộng dồn chỉ số vĩnh viễn (Mult, CPS, Crit...) và KHÔNG MẤT khi Tái Sinh/Thăng Thiên.
* **Thành Tựu Mới:** *Nhà Thám Hiểm Đa Thế Giới*, *Người Bạn Của Muôn Loài*.

---

### 🛡️ Bản Patch v7.1: Boss Click & Cân Bằng Trang Bị
* **Trang Bị Giới Hạn Slot (4 Slots):** Cho phép sở hữu vô số Cổ Vật/Di Vật nhưng chỉ được trang bị tối đa 4 món cùng lúc. Tăng mạnh hệ số mỗi món lên 2.5x (Ví dụ: +2% Mult → +5% Mult) buộc người chơi phải tính toán phối đồ tối ưu.
* **Hệ Thống Boss Click (Event Ngẫu Nhiên):** Boss xuất hiện ngẫu nhiên mỗi 5–10 phút với thanh máu đỏ và 20 giây đếm ngược. Mọi cú click đều gây sát thương song song lên Boss. Hạ gục Boss nhận thưởng Nexyroth khổng lồ (=2x máu Boss) và tỉ lệ rớt Cổ Vật/Di Vật tức thì.
* **Bot Săn Boss:** Nâng cấp tự động hóa trong Gem Shop, tự động gây sát thương lên Boss theo % DPS mỗi giây mà không cần click tay.
* **Thành Tựu Mới:** *Diệt Boss Đầu Tiên*, *Sát Thủ Boss* (Diệt 20 Boss).

---

## 🔮 BẢN CẬP NHẬT SẮP TỚI

* 🎵 **BGM:** Nhạc nền loop theo Dark/Light Mode, có thể đổi tông theo Thế Giới đang chọn.
* 🧭 **Onboarding:** Chuỗi hướng dẫn từng bước cho người chơi mới, tránh ngợp trước quá nhiều hệ thống lồng nhau.
* 🗂️ **Phân tầng lại điều hướng:** Nhóm 6 tab hiện tại theo cấp độ tiến trình (Tái Sinh / Thăng Thiên / Niết Bàn) thay vì xếp ngang hàng.
* 🌍 **Thế Giới mới + Pet mới**, mở rộng thêm nội dung Gacha.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG
* **Frontend:** HTML5, CSS3 (Glassmorphism, Animations, Dark Cyberpunk theme)
* **Audio:** Web Audio API (âm thanh tổng hợp, không cần file ngoài)
* **Architecture:** Modular Vanilla JavaScript (25 ES6 Modules, no heavy frameworks)
* **Numeric System:** Custom BigNum (`numeric.js`) cho currency/chỉ số không giới hạn
* **Data Storage:** LocalStorage Auto-Save (có version + migration cho save cũ)
* **Deployment:** GitHub Pages

---

## 💻 HƯỚNG DẪN CHẠY TRÊN MÁY CỤC BỘ (LOCAL)

1. **Clone dự án:**
   ```bash
   git clone https://github.com/Nexyroth/clicker-game.git
   cd clicker-game
   ```

2. **Chạy qua local server** (bắt buộc vì game dùng ES Modules, không mở trực tiếp bằng `file://` được):
   ```bash
   # Cách 1: dùng Python có sẵn
   python -m http.server 8000

   # Cách 2: dùng extension "Live Server" trong VSCode
   ```

3. **Mở trình duyệt** tại `http://localhost:8000` và bắt đầu chơi. Tiến trình tự lưu vào `localStorage` của trình duyệt.

---

## 📄 GIẤY PHÉP

Phát hành theo giấy phép [MIT](LICENSE).
