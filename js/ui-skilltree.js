import { elements } from "./dom.js";
import { state } from "./state.js";
import * as Big from "./numeric.js";
import { skillTree } from "./data.js";
import {
  purchaseSkillNode,
  getSkillNodeCost,
} from "./skilltree.js";
import { renderAscensionPanel } from "./ui-prestige.js";
import { formatNumber } from "./ui.js";

// Vẽ 1 node trong nhánh Cây Kỹ Năng: đã mở (✓) / mua được (nút Mua) / khoá (🔒) / mua lặp lại vô hạn (♾️)
function renderSkillNode(branch, node, index) {
  const owned = state.skillTree[branch] || 0;

  // Node cuối cùng của nhánh, nếu đánh dấu repeatable, có thể mua vô hạn lần MỘT KHI đã tới lượt nó (owned >= index)
  if (node.repeatable && owned >= index) {
    const timesBought = Math.max(0, owned - index);
    const cost = getSkillNodeCost(branch);
    const affordable = Big.gte(state.crystals, cost);
    const el = document.createElement("div");
    el.className = `skill-node bg-emerald-50 border-2 ${
      affordable ? "border-emerald-400" : "border-gray-300"
    } rounded-lg p-3 text-center`;
    el.innerHTML = `
      <p class="text-sm font-semibold text-emerald-700">♾️ ${node.name} <span class="text-xs text-gray-500 font-normal">(x${timesBought})</span></p>
      <p class="text-xs text-gray-500 my-1">${node.description}</p>
      <p class="text-xs text-pink-500 font-semibold mb-2">${formatNumber(cost)} Tinh Thể</p>
      <button class="skill-node-button w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2 rounded text-sm transition duration-300 ease-in-out" data-branch="${branch}" ${
      affordable ? "" : "disabled"
    }>
        Mua Thêm
      </button>
    `;
    return el;
  }

  const el = document.createElement("div");

  if (index < owned) {
    // Đã mở node này
    el.className =
      "skill-node bg-green-50 border-2 border-green-400 rounded-lg p-3 text-center";
    el.innerHTML = `
      <p class="text-sm font-semibold text-green-700">✓ ${node.name}</p>
      <p class="text-xs text-gray-500 mt-1">${node.description}</p>
    `;
  } else if (index === owned) {
    // Node tiếp theo, có thể mua
    const affordable = Big.gte(state.crystals, Big.fromNumber(node.cost));
    el.className = `skill-node bg-white border-2 ${
      affordable ? "border-blue-400" : "border-gray-300"
    } rounded-lg p-3 text-center`;
    el.innerHTML = `
      <p class="text-sm font-semibold text-blue-600">${node.name}</p>
      <p class="text-xs text-gray-500 my-1">${node.description}</p>
      <p class="text-xs text-pink-500 font-semibold mb-2">${node.cost} Tinh Thể</p>
      <button class="skill-node-button w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm transition duration-300 ease-in-out" data-branch="${branch}" ${
      affordable ? "" : "disabled"
    }>
        Mua
      </button>
    `;
  } else {
    // Chưa tới lượt, còn khoá
    el.className =
      "skill-node bg-gray-100 border-2 border-gray-200 rounded-lg p-3 text-center opacity-60";
    el.innerHTML = `
      <p class="text-sm font-semibold text-gray-400">🔒 ${node.name}</p>
      <p class="text-xs text-gray-400 mt-1">Cần mở node trước</p>
    `;
  }
  return el;
}

// Vẽ lại toàn bộ Cây Kỹ Năng (4 nhánh) - gọi khi mở modal và sau mỗi lần mua
export function renderSkillTree() {
  const branches = [
    { key: "power", container: elements.powerBranchList },
    { key: "speed", container: elements.speedBranchList },
    { key: "crit", container: elements.critBranchList },
    { key: "ascension", container: elements.ascensionBranchList },
  ];

  branches.forEach(({ key, container }) => {
    container.innerHTML = "";
    skillTree[key].forEach((node, index) => {
      container.appendChild(renderSkillNode(key, node, index));
    });
  });

  document.querySelectorAll(".skill-node-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (purchaseSkillNode(button.dataset.branch)) {
        renderSkillTree();
        renderAscensionPanel();
      }
    });
  });
}
