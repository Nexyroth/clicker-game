// Hệ thống số lớn (BigNum) dùng chung cho toàn bộ currency/chỉ số không giới hạn của game.
// Biểu diễn: { m: mantissa (1 <= |m| < 10, hoặc m === 0), e: exponent (số nguyên) }.
// exponent chỉ là log10 của giá trị thật nên luôn rất nhỏ so với giới hạn của Number
// (10^10000 chỉ cần e = 10000) - đây là lý do exponent không bao giờ overflow dù giá trị thật cực lớn.

export const ZERO = { m: 0, e: 0 };
const MAX_ALIGN_GAP = 17; // vượt quá số chữ số có nghĩa của double thì số nhỏ hơn không còn ảnh hưởng kết quả cộng/trừ

// m/e không hữu hạn nghĩa là input gốc đã hỏng (NaN/Infinity) - giữ nguyên trạng thái đó
// để isFinite()/isNaN() phát hiện được ở nơi gọi, thay vì âm thầm quy về 0 tại đây.
function normalize(m, e) {
  if (!Number.isFinite(m) || !Number.isFinite(e)) return { m, e };
  if (m === 0) return { m: 0, e: 0 };
  let mm = m;
  let ee = e;
  while (Math.abs(mm) >= 10) {
    mm /= 10;
    ee += 1;
  }
  while (Math.abs(mm) < 1) {
    mm *= 10;
    ee -= 1;
  }
  return { m: mm, e: ee };
}

export function fromNumber(n) {
  if (Number.isNaN(n)) return { m: NaN, e: NaN };
  if (n === 0) return { m: 0, e: 0 };
  if (!Number.isFinite(n)) return { m: n > 0 ? 1 : -1, e: Infinity };
  const e = Math.floor(Math.log10(Math.abs(n)));
  return normalize(n / Math.pow(10, e), e);
}

export function fromBigInt(n) {
  return fromString(n.toString());
}

const STRING_PATTERN = /^(-?\d+(?:\.\d+)?)(?:[eE]([+-]?\d+))?$/;

// Parse chuỗi số (kể cả dạng "1.234e1000") mà KHÔNG dùng parseFloat/Number trên toàn bộ
// chuỗi chữ số dài, vì làm vậy có thể vượt giới hạn Number - chỉ lấy tối đa 17 chữ số đầu cho mantissa.
export function fromString(str) {
  if (typeof str !== "string") return { ...ZERO };
  const match = STRING_PATTERN.exec(str.trim());
  if (!match) return { ...ZERO };

  const negative = match[1].startsWith("-");
  const body = negative ? match[1].slice(1) : match[1];
  const explicitExp = match[2] ? parseInt(match[2], 10) : 0;
  const [intPart, fracPart = ""] = body.split(".");
  const intTrimmed = intPart.replace(/^0+(?=\d)/, "");

  let digits;
  let pointExponent;
  if (intTrimmed !== "0" && intTrimmed !== "") {
    digits = (intTrimmed + fracPart).replace(/0+$/, "") || "0";
    pointExponent = intTrimmed.length - 1;
  } else {
    const fracTrimmed = fracPart.replace(/^0+/, "");
    if (fracTrimmed === "") return { ...ZERO };
    digits = fracTrimmed.replace(/0+$/, "") || "0";
    pointExponent = -(fracPart.length - fracTrimmed.length) - 1;
  }
  if (digits === "0") return { ...ZERO };

  const mantissaDigits = digits.slice(0, 17);
  const mantissaValue =
    mantissaDigits.length > 1
      ? parseFloat(`${mantissaDigits[0]}.${mantissaDigits.slice(1)}`)
      : parseFloat(mantissaDigits);

  return normalize((negative ? -1 : 1) * mantissaValue, pointExponent + explicitExp);
}

export function serialize(a) {
  return `${a.m}e${a.e}`;
}

export function deserialize(value) {
  if (typeof value === "number") return fromNumber(value); // tương thích ngược cho field lỡ chưa migrate
  return fromString(value);
}

export function toNumber(a) {
  if (a.e > 308) return a.m > 0 ? Infinity : -Infinity;
  if (a.e < -324) return 0;
  return a.m * Math.pow(10, a.e);
}

export function neg(a) {
  return { m: -a.m, e: a.e };
}

export function abs(a) {
  return a.m < 0 ? neg(a) : { ...a };
}

export function isZero(a) {
  return a.m === 0;
}

export function isFinite(a) {
  return Number.isFinite(a.m) && Number.isFinite(a.e);
}

export function isNaN(a) {
  return Number.isNaN(a.m) || Number.isNaN(a.e);
}

function signOf(a) {
  return a.m > 0 ? 1 : a.m < 0 ? -1 : 0;
}

export function mul(a, b) {
  if (isZero(a) || isZero(b)) return { ...ZERO };
  return normalize(a.m * b.m, a.e + b.e);
}

// Nhân với 1 hệ số Number thường (bonus %, hệ số buff...) - dùng thay vì mul(a, fromNumber(x))
// ở những chỗ gọi thường xuyên, cho code gọn hơn.
export function scale(a, factor) {
  if (isZero(a) || factor === 0 || !Number.isFinite(factor)) return { ...ZERO };
  return normalize(a.m * factor, a.e);
}

export function div(a, b) {
  if (isZero(b) || isZero(a)) return { ...ZERO };
  return normalize(a.m / b.m, a.e - b.e);
}

// Cộng 2 BigNum: đưa số có exponent nhỏ hơn về cùng "thang" rồi cộng mantissa.
// Nếu chênh lệch exponent vượt quá độ chính xác của double, số nhỏ hơn không đổi được
// kết quả nên bỏ qua có chủ đích (đúng bản chất số học hữu hạn precision, không phải bug).
export function add(a, b) {
  if (isZero(a)) return { ...b };
  if (isZero(b)) return { ...a };
  const diff = a.e - b.e;
  if (diff > MAX_ALIGN_GAP) return { ...a };
  if (diff < -MAX_ALIGN_GAP) return { ...b };
  if (diff >= 0) return normalize(a.m + b.m / Math.pow(10, diff), a.e);
  return normalize(a.m / Math.pow(10, -diff) + b.m, b.e);
}

export function sub(a, b) {
  return add(a, neg(b));
}

export function compare(a, b) {
  const sa = signOf(a);
  const sb = signOf(b);
  if (sa !== sb) return sa < sb ? -1 : 1;
  if (sa === 0) return 0;
  if (a.e !== b.e) return sa * (a.e < b.e ? -1 : 1);
  if (a.m === b.m) return 0;
  return sa * (a.m < b.m ? -1 : 1);
}

export function eq(a, b) {
  return compare(a, b) === 0;
}
export function lt(a, b) {
  return compare(a, b) < 0;
}
export function lte(a, b) {
  return compare(a, b) <= 0;
}
export function gt(a, b) {
  return compare(a, b) > 0;
}
export function gte(a, b) {
  return compare(a, b) >= 0;
}
export function max(a, b) {
  return gte(a, b) ? a : b;
}
export function min(a, b) {
  return lte(a, b) ? a : b;
}

// Luỹ thừa BigNum^p (p là Number thường, có thể âm/thập phân) - tính trong không gian log10
// để KHÔNG BAO GIỜ gọi Math.pow(10, số mũ khổng lồ) trực tiếp bằng Number, tránh overflow.
export function pow(a, p) {
  if (p === 0) return fromNumber(1);
  if (isZero(a)) return { ...ZERO };
  const totalLog = p * (Math.log10(Math.abs(a.m)) + a.e);
  const resultNegative = a.m < 0 && Math.abs(p % 2) === 1;
  const e = Math.floor(totalLog);
  const m = (resultNegative ? -1 : 1) * Math.pow(10, totalLog - e);
  return normalize(m, e);
}

export function sqrt(a) {
  if (a.m < 0) return { ...ZERO }; // game không cần căn số âm
  return pow(a, 0.5);
}

// Làm tròn xuống số nguyên gần nhất. Với e đủ lớn, BigNum đã vượt quá độ chính xác biểu diễn
// phần thập phân nên coi như nguyên sẵn, không cần xử lý thêm.
export function floor(a) {
  if (a.e >= 15) return { ...a };
  return fromNumber(Math.floor(toNumber(a)));
}

// ---------------- Định dạng hiển thị (K/M/B/T rồi hệ Latin Qa/Qi/Sx/.../Vg...) ----------------

const SMALL_SUFFIXES = ["", "K", "M", "B", "T"];

// Tên viết tắt kiểu Latin cho hệ "-illion": ones ghép tens ghép hundreds.
// "Teen" (11-19) rút gọn hậu tố deci thành "d" - giống cách tiếng Anh gọi "undecillion"
// chứ không phải "unodecillion" - còn từ 20 trở lên giữ nguyên cả 2 phần (ví dụ Un + Vg = UVg).
const ONES = ["", "U", "D", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
const TENS = ["", "Dc", "Vg", "Tg", "Qag", "Qig", "Sxg", "Spg", "Ocg", "Nog"];
const HUNDREDS = ["", "Ce", "Dcc", "Tcc", "Qac", "Qic", "Sxc", "Spc", "Occ", "Noc"];
const MAX_ILLION_L = 999; // ~10^3003, vượt xa nhu cầu thực tế của 1 game clicker

function illionName(L) {
  const h = Math.floor(L / 100);
  const rest = L % 100;
  const t = Math.floor(rest / 10);
  const o = rest % 10;

  let core;
  if (t === 1 && o > 0) {
    core = ONES[o] + "d";
  } else {
    core = ONES[o] + TENS[t];
  }
  return core + HUNDREDS[h];
}

// tierIndex: 1=K(10^3), 2=M, 3=B, 4=T, 5+ = hệ Latin (Qa, Qi, Sx, ...)
// Trả về null nếu vượt bảng suffix hỗ trợ -> báo cho format() biết cần fallback khoa học.
function getSuffix(tierIndex) {
  if (tierIndex <= 4) return SMALL_SUFFIXES[tierIndex];
  const L = tierIndex - 1;
  if (L > MAX_ILLION_L) return null;
  return illionName(L);
}

function roundTo2(n) {
  return Math.round(n * 100) / 100;
}

function numberToDisplay(n) {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/0$/, "").replace(/\.$/, "");
}

// Format số cho dễ đọc: dưới 1.000 hiện nguyên; từ 1.000 trở lên dùng hậu tố K/M/B/T/Qa/Qi/...
// Chỉ fallback sang dạng khoa học (1.25e+1000) khi vượt bảng suffix - KHÔNG BAO GIỜ trả về
// "Infinity"/"NaN" cho 1 BigNum hữu hạn hợp lệ. Nhận cả Number thường lẫn BigNum để tương thích
// ngược với mọi lời gọi formatNumber(...) hiện có trong project (state.level, quest.target...).
// keepDecimals=true dùng cho multiplier/CPS (2.5x) thay vì currency nguyên (bucks, gems...).
export function format(value, keepDecimals = false) {
  const a = typeof value === "number" ? fromNumber(value) : value;
  if (!a || !isFinite(a) || isNaN(a) || isZero(a)) return "0";

  const negative = a.m < 0;
  const abs_ = negative ? neg(a) : a;
  const sign = negative ? "-" : "";

  if (abs_.e < 3) {
    const n = toNumber(abs_);
    if (!keepDecimals) return sign + Math.round(n).toLocaleString("en-US");
    return sign + numberToDisplay(roundTo2(n));
  }

  let tierIndex = Math.floor(abs_.e / 3);
  let scaled = roundTo2(abs_.m * Math.pow(10, abs_.e - tierIndex * 3));
  if (scaled >= 1000) {
    scaled = roundTo2(scaled / 1000);
    tierIndex += 1;
  }

  const suffix = getSuffix(tierIndex);
  if (suffix === null) {
    return sign + abs_.m.toFixed(2) + "e+" + abs_.e;
  }
  return sign + numberToDisplay(scaled) + suffix;
}

// Dùng riêng cho multiplier/CPS - luôn giữ phần thập phân khi số còn nhỏ (2.5x thay vì 3x),
// vẫn chuyển sang hậu tố K/M/B/... như format() bình thường khi số đã đủ lớn.
export function formatDecimal(value) {
  return format(value, true);
}
