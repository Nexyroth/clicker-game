import { elements } from "./dom.js";
import { state } from "./state.js";
import * as Big from "./numeric.js";
import { worlds, pets } from "./data.js";
import { formatNumber } from "./ui.js";
import {
  isWorldUnlocked,
  getWorldCurrency,
  setActiveWorld,
  getPetLevel,
  getPetCost,
  tamePet,
} from "./worlds.js";

function renderPetCard(worldId, worldCurrencyName, pet) {
  const level = getPetLevel(pet.id);
  const tamed = level > 0;
  const currency = getWorldCurrency(worldId);
  const cost = getPetCost(pet.id, pet);
  const affordable = Big.gte(currency, cost);

  const el = document.createElement("div");
  el.className = `rounded-lg p-3 border-2 ${
    tamed ? "bg-emerald-50 border-emerald-400" : "bg-white border-gray-200"
  }`;

  el.innerHTML = `
    <p class="text-sm font-bold ${tamed ? "text-emerald-700" : "text-gray-800"}">${
    tamed ? "🐾 " : ""
  }${pet.name}${tamed ? ` <span class="text-xs text-gray-500 font-normal">(cấp ${level})</span>` : ""}</p>
    <p class="text-xs text-gray-500 my-1">${pet.description}${
    tamed ? ` — hiện đang x${level}` : ""
  }</p>
    <p class="text-xs text-pink-500 font-semibold mb-2">${formatNumber(cost)} ${worldCurrencyName}</p>
    <button class="tame-pet-button w-full text-xs font-bold py-1 px-2 rounded transition duration-300 ease-in-out ${
      affordable
        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }" data-world="${worldId}" data-pet="${pet.id}" ${affordable ? "" : "disabled"}>
      ${tamed ? "Nâng Cấp" : "Thuần Hoá"}
    </button>
  `;
  return el;
}

function renderWorldSection(world) {
  const unlocked = isWorldUnlocked(world);
  const section = document.createElement("div");

  if (!unlocked) {
    section.className =
      "rounded-lg p-4 mb-4 border-2 bg-gray-100 border-gray-200 opacity-60";
    section.innerHTML = `
      <p class="font-bold text-gray-500">${world.icon} ${world.name} 🔒</p>
      <p class="text-xs text-gray-400 mt-1">Mở khoá sau ${world.unlockAscension} lần Thăng Thiên</p>
    `;
    return section;
  }

  const isActive = state.activeWorldId === world.id;
  section.className = `rounded-lg p-4 mb-4 border-2 bg-gradient-to-br ${world.bg} border-transparent`;

  const header = document.createElement("div");
  header.className = "flex items-center justify-between mb-3 flex-wrap gap-2";
  header.innerHTML = `
    <p class="font-bold ${world.accent}">${world.icon} ${world.name}</p>
    <div class="flex items-center gap-2">
      <span class="text-sm font-semibold ${world.accent}">${formatNumber(
    getWorldCurrency(world.id)
  )} ${world.currencyName}</span>
      <button class="set-active-world-button text-xs font-bold py-1 px-2 rounded transition duration-300 ease-in-out ${
        isActive
          ? "bg-gray-300 text-gray-500 cursor-default"
          : "bg-white hover:bg-gray-50 border border-gray-300"
      }" data-world="${world.id}" ${isActive ? "disabled" : ""}>
        ${isActive ? "✓ Đang chọn" : "Chọn Thế Giới này"}
      </button>
    </div>
  `;
  section.appendChild(header);

  const petGrid = document.createElement("div");
  petGrid.className = "grid grid-cols-1 sm:grid-cols-3 gap-2";
  (pets[world.id] || []).forEach((pet) => {
    petGrid.appendChild(renderPetCard(world.id, world.currencyName, pet));
  });
  section.appendChild(petGrid);

  return section;
}

// Vẽ lại toàn bộ khu Thế Giới/Pet - gọi khi mở modal và sau mỗi lần chọn Thế Giới/thuần hoá Pet
export function renderWorlds() {
  elements.worldsList.innerHTML = "";
  worlds.forEach((world) => {
    elements.worldsList.appendChild(renderWorldSection(world));
  });

  document.querySelectorAll(".tame-pet-button").forEach((button) => {
    button.addEventListener("click", () => {
      if (tamePet(button.dataset.world, button.dataset.pet)) {
        renderWorlds();
      }
    });
  });

  document.querySelectorAll(".set-active-world-button").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveWorld(button.dataset.world);
      renderWorlds();
    });
  });
}
