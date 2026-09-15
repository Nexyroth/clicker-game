# ⚔️ NEXYROTH CLICKER RPG (v8.2)

![Version](https://img.shields.io/badge/version-8.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-orange.svg)
![Architecture](https://img.shields.io/badge/architecture-JS%20Modular-yellow.svg)

> **Nexyroth Clicker RPG** là một tựa game Clicker/Idle cày cấp thế hệ mới được xây dựng hoàn toàn bằng HTML5, CSS3 và Vanilla JavaScript (33 ES6 Modules), đóng gói được thành app Android qua Capacitor với kiến trúc Hybrid Online/Offline.

🌐 **Trải nghiệm ngay tại:** [https://nexyroth.github.io/clicker-game/](https://nexyroth.github.io/clicker-game/)

---

## 📁 CẤU TRÚC DỰ ÁN (từ v8.2)

```
/
├── index.html              → GitHub Pages entry, redirect sang www/game.html (giữ link cũ không gãy)
├── package.json            → dependency Capacitor
├── capacitor.config.json   → cấu hình app Android
├── .gitignore              → loại /android/, /node_modules/ khỏi Git
└── www/                    → TOÀN BỘ code web tĩnh (webDir của Capacitor)
    ├── index.html          → Hybrid launcher (chỉ dùng trong app Android)
    ├── game.html           → game thật sự
    ├── style.css
    ├── js/                 → 33 ES6 modules
    └── images/
```

## 📱 BUILD APK ANDROID

```bash
npm install                 # cài Capacitor
npx cap add android         # tạo khung project Android (thư mục /android/, không commit)
npx cap sync android        # copy www/ vào app
npx cap open android        # mở Android Studio để build APK
```

Nén project gửi đi build (loại rác build, đúng nội dung cần thiết):
```bash
zip -r nexyroth-clicker.zip . -x "node_modules/*" "android/*" ".git/*" "*.zip" ".DS_Store"
```

---

## 🚀 TỔNG HỢP TÍNH NĂNG VÀ CÁC BẢN CẬP NHẬT (v7.1 - v8.2)

### 📱 Bản Patch v8.2: Kiến Trúc Hybrid Android + Visual Juice + UX
* **Tái cấu trúc dự án cho Capacitor:** toàn bộ code web chuyển vào `www/`, thêm `package.json`, `capacitor.config.json` (appId `com.nexyroth.clicker`, webDir `www`), `.gitignore` loại hẳn `/android/` và `/node_modules/`. Thêm `index.html` ở gốc redirect sang `www/game.html` để **link GitHub Pages cũ không bị gãy**.
* **Hybrid launcher (`www/index.html`):** kiểm tra `navigator.onLine` rồi `fetch` GitHub Pages với **timeout 3 giây qua AbortController** (fetch không có option timeout sẵn — thiếu cái này thì mạng chập chờn sẽ treo launcher vô hạn). Online → tải bản mới nhất từ GitHub Pages; Offline/timeout → chạy bản local, kèm nút cho người chơi tự chọn.
* **⚠️ Xuất/Nhập Save (tính năng BẮT BUỘC của kiến trúc Hybrid):** bản Online (`nexyroth.github.io`) và bản Offline trong app (`capacitor://localhost`) là **2 origin khác nhau**, mà trình duyệt **cô lập localStorage theo origin** → 2 bản có **2 save hoàn toàn riêng biệt, không thể tự đồng bộ**. Đây là giới hạn bảo mật của trình duyệt, không phải bug sửa được bằng code. Giải pháp: thêm nút **Xuất/Nhập Save** (mã base64) trong Cài Đặt để người chơi mang tiến trình qua lại thủ công.
* **Merge State chống mất dữ liệu 2 chiều:** `loadGame()` giờ **giữ lại field lạ** không có trong phiên bản hiện tại, nên bản CŨ đọc save của bản MỚI rồi lưu lại vẫn **không xoá mất dữ liệu tính năng mới**. Object lồng nhau (`dailyProgress`, `weeklyProgress`, `skillTree`...) được merge sâu 1 tầng để key mới không bị save cũ ghi đè mất.
* **Visual Juice:** nút click nảy mạnh hơn khi Chí Mạng (`animate-click-crit`), thêm **vòng sóng lan toả** từ nút click (CSS thuần chạy GPU, không dùng gsap để chịu được Thuốc Auto Click 20 lần/giây), số bay Chí Mạng bay cao hơn + xoay nhẹ + đổ bóng neon, nút click **phát sáng neon nhấp nháy khi có buff đang chạy**.
* **UX mới:** phím **Space** để click (chặn cuộn trang, không tính 2 lần khi đang focus nút), phím **1-4** mở nhanh Cây Kỹ Năng / Balo / Shop / Sự Kiện (song song với T/B/H/E), nút **⚡ Tự Trang Bị** trong Bộ Sưu Tập tự chọn 4 món mạnh nhất (có chuẩn hoá thang đo giữa các loại hiệu ứng — nếu không thì món tăng thời lượng buff luôn thắng áp đảo một cách vô lý).

### 🌍 Bản Patch v8.1: Mở Rộng Nội Dung + 4 Hệ Số Mới
* **Thế Giới thứ 4 - "⛩️ Thiên Giới Vĩnh Hằng"** (mở khoá ở lần Thăng Thiên thứ 6), tiền tệ riêng "Ánh Sáng Thần Thánh", kèm 3 Pet riêng.
* **Thêm Pet mới cho cả 3 Thế Giới cũ** - mỗi Thế Giới từ 3 lên 5 Pet (tổng 18 Pet).
* **Thần Thú Gacha thứ 5 - "Cú Đêm Vĩnh Cửu"** (+5% Hiệu Suất Offline mỗi cấp) - loại buff hoàn toàn mới, không trùng 4 con cũ.
* **Thêm 3 Cổ Vật/Di Vật mới** (27 món tổng cộng): Búa Chiến Người Khổng Lồ (+Sát Thương Boss), Đồng Xu May Mắn (+Tỉ Lệ Rơi Kim Cương), Radar Dò Kho Báu (+Tỉ Lệ Rơi Item).
* **Nhánh Cây Kỹ Năng thứ 5 - "🍀 Vận May"** (6 node, node cuối mua vô hạn): Sát Thương Boss, Tỉ Lệ Rơi Item, Tỉ Lệ Rơi Kim Cương, Hiệu Suất Offline.
* **4 HỆ SỐ MỚI** (trước chỉ có Tỉ Lệ Chí Mạng / Sát Thương Chí Mạng): **Sát Thương Boss** (nhân dồn sát thương lên Boss), **Tỉ Lệ Rơi Item**, **Tỉ Lệ Rơi Kim Cương**, **Hiệu Suất Offline Earnings** (cộng thêm vào mức gốc 50%, chặn trần 100% để offline không bao giờ lời hơn chơi trực tiếp). Tất cả được tổng hợp tại 1 module mới `bonuses.js` - các module gameplay chỉ gọi vào đây thay vì tự cộng dồn từng nguồn, tránh lệch công thức giữa các chỗ.
* **Boss Trùm theo mốc** - mỗi 10 Cấp Boss xuất hiện 1 Boss Trùm tên riêng (Đại Chúa Tể Dữ Liệu / Ác Ma Nexyroth Nguyên Thuỷ / Tận Thế Click), thưởng nhân thêm x1.5, có icon 🔱 riêng.
* **Hỗ trợ ảnh Boss** - thanh Boss giờ có khung ảnh, đọc từ `images/boss/`. Chưa có ảnh vẫn chạy bình thường (tự ẩn khung ảnh, dùng icon 💀 mặc định). Xem `images/boss/README.txt` để biết tên file cần đặt.
* **Save cũ tương thích hoàn toàn** - save chưa có nhánh "Vận May" được merge tay từng nhánh khi load (merge nông tầng ngoài không tự thêm key mới vào object lồng nhau), không mất tiến trình Cây Kỹ Năng cũ.

### 🌟 Bản Patch v8.0: Thành Tựu Có Buff + Kỷ Lục Cá Nhân + Cây Kỹ Năng Trực Quan + Offline Hiệu Suất + Boss Thứ Hạng
* **Thành Tựu cộng buff thật:** mỗi Thành Tựu mở khoá (trong 35 cái hiện có) cộng thêm +0.5% Hệ Số Nhân VÀ Nexyroth/giây, nhân dồn theo số Thành Tựu đã mở (35/35 = +17.5%). Không còn chỉ để "ngắm" - hiện % buff hiện tại ngay trong Bảng Thống Kê.
* **Kỷ Lục Cá Nhân (so với chính mình, không cần server):** thêm mục mới trong Bảng Thống Kê theo dõi 3 kỷ lục - Nexyroth/giây cao nhất từng đạt, giá trị 1 cú click (kể cả Chí Mạng) lớn nhất, và số lần bấm Click Ngay! nhiều nhất trong 1 cửa sổ 10 giây bất kỳ. Tự cập nhật liên tục, không reset khi Tái Sinh/Thăng Thiên/Niết Bàn.
* **Cây Kỹ Năng trực quan hơn:** thêm đường nối dọc giữa các node trong mỗi nhánh (xanh nếu nhánh đã "chảy" qua, xám nếu còn khoá) - nhìn rõ hình dáng 1 chuỗi tiến trình hơn thay vì danh sách phẳng.
* **Offline Earnings chỉ đạt 50% hiệu suất:** đi vắng giờ chỉ kiếm được 50% Nexyroth/giây so với chơi trực tiếp (trước đây 100%) - tạo lý do quay lại chơi tay thay vì để idle mãi mãi. Popup Offline Earnings hiện rõ dòng ghi chú % hiệu suất.
* **Boss có thứ hạng:** mỗi lần Boss xuất hiện roll ngẫu nhiên 1 trong 3 thứ hạng - **Thường** (85%, mặc định), **✨ Hiếm** (12%, HP x1.5, thưởng x2, thanh máu màu tím), **👑 Boss Ngày** (3%, HP x3, thưởng x5, thanh máu màu vàng kim, **chỉ rơi trúng tối đa 1 lần/ngày thật** - đã hạ 1 Boss Ngày rồi thì cả ngày hôm đó không rơi trúng lần nữa). Không đổi cách Boss tăng cấp hay công thức HP BigNum gốc, không giảm thưởng cũ - thứ hạng chỉ nhân thêm hệ số.
* **Thêm 16 tầng Nâng Cấp mới + mua hàng loạt x1/x10/x25/xMax** *(đã làm ở bản v7.10, xem bên dưới)*.

### 🛒 Bản Patch v7.10: Mua Hàng Loạt x1/x10/x25/xMax + 16 Nâng Cấp Mới
* **Mua hàng loạt:** thêm 4 nút chọn chế độ mua ngay trên khu Nâng Cấp - `x1` / `x10` / `x25` / `xMax`. Chọn `x10` thì mọi nút "Mua" sẽ mua liền 10 cái (tính đúng tổng giá cấp số nhân, không phải giá x10 đơn giản); `xMax` tự tính số lượng NHIỀU NHẤT có thể mua ngay với Nexyroth hiện có, kể cả khi số dư đã ở mức BigNum khổng lồ (dùng `numeric.js` mới có thêm hàm `log10` để giải ngược phương trình cấp số nhân một cách an toàn, không lặp brute-force). Đã test khớp chính xác với cách tính brute-force (sai số ~10⁻¹⁶, tức bằng 0 trong thực tế) và hoạt động đúng cả khi Nexyroth đã lên tới 10³⁰⁰.
* **Thêm 16 tầng Nâng Cấp mới** (từ 24 lên 41 tổng cộng, đề xuất theo góp ý "24 cái hiện tại quá ít"): tiếp nối đúng đường cong giá/hệ số hiện có, từ mốc 1.5 tỷ (nâng cấp cuối cũ) mở rộng lên tới hơn 1,29 triệu tỷ (1.297 × 10¹⁵) Nexyroth cho tầng cuối "Nexyroth Nguyên Thể" - đủ dài hơi cho những người chơi idle rất lâu nhờ hệ BigNum đã có sẵn từ trước.

### 🛡️ Bản Patch v7.9: Sự Kiện Nhóm + Hành Trình Tân Thủ 7 Ngày + Anti-Cheat
* **Sự Kiện tổ chức lại thành NHÓM, điều hướng 3 cấp:** mở Sự Kiện giờ hiện **danh sách nhóm** (mỗi nhóm 1 dòng, không lộ chi tiết) → bấm vào 1 nhóm mới thấy **giới thiệu + cách chơi** → bấm "Xem Nhiệm Vụ"/"Xem Lịch Nhận Quà" mới thấy **nhiệm vụ/mốc thật**. Có nút "‹ Quay lại" ở mỗi bước.
* **Nhóm "🖱️ Vũ Điệu Ngón Tay":** đổi tên gọi ngoài cho gọn (trước đây mỗi mốc hiện riêng lẻ ở màn danh sách), bên trong vẫn giữ nguyên 7 mốc click thật đã có.
* **Sự kiện mới - "🎁 Hành Trình Tân Thủ 7 Ngày":** đăng nhập liên tục, mỗi 24 giờ (từ lần đầu vào game) mở thêm 1 ngày, tối đa Ngày 7. Ô ngày chưa tới hiện khoá mờ, ô đã tới mà chưa nhận có nút "Nhận Quà" nhấp nháy thu hút, ô đã nhận hiện dấu tick xanh. Bỏ lỡ ngày nào vẫn giữ nguyên, quay lại nhận sau không mất. Thưởng: Ngày 1: 100💎+2x Thuốc Auto Click · Ngày 2: 200💎+50 Đá Quý · Ngày 3: 3x Thuốc x2+300💎 · Ngày 4: 500💎+100 Đá Quý · Ngày 5: 5 Tinh Thể+500💎 · Ngày 6: 1.000💎+3 Xá Lợi · **Ngày 7: 2.000💎+10 Xá Lợi+1 cấp Thần Thú Phượng Hoàng Bất Tử**. Có popup nhận quà kèm hiệu ứng pháo hoa emoji.
  * *Quyết định thiết kế:* dùng cửa sổ trượt đúng 24 giờ (như yêu cầu) thay vì reset cứng lúc 00:00, để công bằng bất kể chơi giờ nào trong ngày, tránh rắc rối múi giờ.
  * Save cũ (trước v7.9, chưa có field này) khi cập nhật lên sẽ tính từ hôm nay như người chơi mới (Ngày 1) — không có cách nào suy ngược lại đã chơi bao lâu trước đó.
* **Module `anti-cheat.js` mới (chặn nhẹ, KHÔNG phải bảo mật thật sự):** chặn phím `F12`/`Ctrl+Shift+I/J/C`/`Ctrl+U` và menu chuột phải; dùng bẫy `debugger` trong vòng lặp để phát hiện khi Console/Debugger đang mở (chỉ gây tạm dừng thật khi DevTools mở, không ảnh hưởng gì khi đóng); nếu phát hiện đủ 3 lần bất thường LIÊN TIẾP mới xoá `localStorage` và hiện màn hình đỏ "PHÁT HIỆN GIAN LẬN!". Đã tự thêm 2 lớp chống báo nhầm không có trong yêu cầu gốc: (1) bỏ qua hoàn toàn nếu tab vừa chuyển nền/ẩn (tránh xoá oan khi người chơi chuyển tab), (2) chỉ tính gap trong khoảng 2.5-30 giây là khả nghi (gap quá lớn = máy sleep/wake, không phải debugger) - nếu không có 2 lớp này, chỉ cần đổi tab hoặc gập laptop là mất sạch save.
  * *Lưu ý khi phát triển tiếp:* có cờ `ANTI_CHEAT_ENABLED` ở đầu file `anti-cheat.js`, tắt về `false` trước khi tự mở DevTools để code/debug, nếu không sẽ tự bị coi là gian lận và mất save.
  * Đây vẫn chỉ là hàng rào ngăn cản phía client (game không có server) - người chơi thật sự muốn gian lận vẫn có cách khác vượt qua (sửa file, tắt JS...). Biến `state` vốn đã an toàn trước việc gõ Console (không gắn lên `window`), không cần thêm bảo vệ nhân tạo có thể làm hỏng gameplay.

### 🧭 Bản Patch v7.8: Thanh Hành Động Cố Định + Shop Tách Riêng + Chuỗi Sự Kiện + UI Sự Kiện 2 Bước
* **Sửa lỗi nút Balo không hiện được trên một số màn hình (đặc biệt mobile):** bỏ hẳn cách đặt nhiều nút `fixed` rời rạc từng góc màn hình (dễ lệch/che khuất nhau). Thay bằng **1 thanh hành động cố định ở đáy màn hình, cuộn ngang nếu chật** — dùng đúng cơ chế `.tab-bar` đã ổn định từ trước, gom đủ 5 nút: 🌳 Cây Kỹ Năng, 🎒 Balo `[B]`, 🛒 Shop `[H]`, 🎪 Sự Kiện `[E]`, ⚙️ Cài Đặt. Đảm bảo luôn bấm được trên mọi kích thước màn hình.
* **Shop tách thành modal riêng:** không còn là tab trong hub Cây Kỹ Năng nữa (giống Balo/Sự Kiện đã tách ở bản trước) — có nút + phím tắt `H` riêng.
* **Mở rộng chuỗi Sự Kiện "Cơn Lốc Ngón Tay":** *(đổi tên thành "Vũ Điệu Ngón Tay" và tổ chức lại thành nhóm ở bản v7.9, xem phía trên)* — 7 mốc tăng dần 100/500/1.000/5.000/10.000/50.000/100.000 lần click thật, thưởng 5/20/40/150/300/1.000/2.500 💎.
* **UI Sự Kiện 2 bước** *(nay là 3 bước, xem bản v7.9 phía trên)*.

### 💎 Bản Patch v7.7: Kim Cương + Tách Balo/Sự Kiện + Buff Cộng Dồn + Sự Kiện Đầu Tiên
* **Kim Cương (tiền tệ mới, BigNum):** NX Item Shop giờ mua bằng Kim Cương thay vì Đá Quý (giá đã cân bằng lại: x2=10💎, x5=25💎, x10=60💎, Auto Click=40💎). Kim Cương chủ yếu kiếm qua rơi từ Boss.
* **Boss rơi Kim Cương:** thêm 1 roll độc lập mỗi lần hạ Boss (tách biệt với roll rơi item cũ) — 10% cơ hội, rơi ngẫu nhiên 5-50 Kim Cương.
* **Balo và Sự Kiện tách thành modal riêng** *(bản v7.8 tách thêm cả Shop, xem phía trên).*
* **Thuốc Bội Tăng cộng dồn thời gian:** dùng thuốc mới trong lúc buff cùng dòng đang hiệu lực sẽ **cộng thêm thời gian** vào hạn hiện có (không reset/ghi đè). Hệ số nhân áp dụng là hệ số MẠNH NHẤT trong số các thuốc đã dùng còn hiệu lực (dùng x2 khi đang x10 sẽ KHÔNG hạ xuống x2, nhưng vẫn cộng thêm thời gian) — tránh vừa mất cân bằng (không nhân chồng x2×x5×x10) vừa đúng yêu cầu "cộng dồn".
* **Thời lượng thuốc mặc định tăng lên 5 phút** (từ 30-60s cũ, quá ngắn) cho cả 4 loại thuốc.
* **Thuốc Auto Click nhanh hơn:** tách khỏi nhịp CPS 1 giây cũ (quá chậm), giờ có nhịp riêng 50 mili-giây/lần bấm, chạy qua 1 `setInterval` cố định duy nhất (tự no-op khi buff hết hạn, không tạo timer trùng).
* **Save/Load:** thêm `diamonds`, `totalDiamondsEarned` (BigNum) và `claimedEvents` vào state, save cũ (mọi bản trước v7.7) không có các field này vẫn load bình thường.

### 🎒 Bản Patch v7.6: Redeem Code + Balo/Item + Shop Đặc Biệt + Boss Drop + Sự Kiện
* **NX Code Vault (Redeem Code offline):** khu vực nhập mã mới trong Cài Đặt, đối chiếu offline với danh sách mã hợp lệ (không server, không `eval`). Trim khoảng trắng, không phân biệt hoa/thường, chống nhập lại mã đã dùng, tự `saveGame()` khi thành công. 2 mã thử nghiệm: `NXWELCOME` → 50 Đá Quý; `NXITEMDROP` → 2x Thuốc Bội Tăng x2 + 1x Thuốc Auto Click.
* **Balo/Inventory (`items.js`):** hệ item tiêu hao độc lập, mở rộng được. 4 item khởi điểm: Thuốc Bội Tăng x2/x5/x10 (buff Hệ Số Nhân tạm thời) và Thuốc Auto Click (tự động bấm Click Ngay!). *(Xem bản v7.7 phía trên để biết cơ chế buff/thời lượng/giá mới nhất.)*
* **NX Item Shop:** shop riêng biệt hoàn toàn với Cửa Hàng Đá Quý/Chí Mạng/Pet/Gacha. *(Giá và tiền tệ đã đổi ở bản v7.7.)*
* **Boss Item Drop:** sau khi hạ Boss, có thêm 1 lần roll rơi item (không đổi cách Boss tăng cấp, không đổi công thức HP BigNum, không giảm thưởng cũ). Tỉ lệ: Thuốc x2 5%, Thuốc x5 2%, Thuốc x10 0.5%, Auto Click 1% — cộng lại rơi thứ gì đó ~8.5% mỗi lần hạ Boss, phần còn lại không rơi gì. Chỉ 1 lần `Math.random()` cho toàn bộ bảng rơi mỗi lần Boss chết.
* **Trang Sự Kiện (`events.js`, tab mới `[E]`):** nền tảng UI + cấu trúc dữ liệu cho sự kiện tương lai, hiện hiển thị empty state (chưa có sự kiện cụ thể nào theo yêu cầu).
* **Phím tắt PC:** `B` mở Balo, `H` mở Shop đặc biệt, `E` mở Sự Kiện — giữ nguyên `T` mở Cây Kỹ Năng. Không kích hoạt khi đang gõ trong input/textarea/select/contenteditable (đã kiểm tra, không xung đột với phím tắt cũ).
* **Save/Load:** thêm `inventory`, `activeBuffs`, `redeemedCodes` vào state, save cũ (kể cả trước v7.6) không có 3 field này vẫn load bình thường, nhận default. Field sai kiểu (dữ liệu save bị hỏng) được chuẩn hoá về giá trị an toàn thay vì crash.

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
* **Architecture:** Modular Vanilla JavaScript (31 ES6 Modules, no heavy frameworks)
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
