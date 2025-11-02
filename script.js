// 서군 (이시다) 문양 데이터
const ISHIDA_CREST_ICONS = {
  1: "images/ishida_1.png", // 코바야카와
  2: "images/ishida_2.png",
  3: "images/ishida_3.png",
  4: "images/ishida_4.png",
};
const ISHIDA_CREST_NAMES = {
  1: "코바야카와",
  2: "모리",
  3: "우에스기",
  4: "우키타",
};

// 동군 (도쿠가와) 문양 데이터 (임시)
const TOKUGAWA_CREST_ICONS = {
  1: "images/tokugawa_1.png",
  2: "images/tokugawa_2.png",
  3: "images/tokugawa_3.png",
  4: "images/tokugawa_4.png",
};
const TOKUGAWA_CREST_NAMES = {
  1: "마에다",
  2: "다테",
  3: "후쿠시마",
  4: "도쿠가와",
};

const modal = document.getElementById("block-modal");
const modalTitle = document.getElementById("modal-title");
const crestSelector = document.getElementById("crest-selector");
const blockTypeSelector = document.getElementById("block-type-selector");
let currentFaction = "";

// 블록 선택 모달 열기
function openBlockModal(faction) {
  currentFaction = faction;
  modalTitle.textContent = `${
    faction === "ishida" ? "서군" : "동군"
  } 블록 선택`;

  // 진영에 맞는 문양 데이터 선택
  const crestIcons =
    faction === "ishida" ? ISHIDA_CREST_ICONS : TOKUGAWA_CREST_ICONS;
  const crestNames =
    faction === "ishida" ? ISHIDA_CREST_NAMES : TOKUGAWA_CREST_NAMES;

  // 문양 선택 버튼 생성
  crestSelector.innerHTML = "";
  for (let i = 1; i <= 4; i++) {
    const btn = document.createElement("button");
    btn.className = "crest-btn";
    btn.innerHTML = `
      <img src="${crestIcons[i]}" class="crest-icon" alt="${crestNames[i]}">
      <span class="crest-name">${crestNames[i]}</span>
    `;
    btn.onclick = () => selectCrest(i, btn);
    crestSelector.appendChild(btn);
  }

  // 블록 종류 선택 버튼 생성
  blockTypeSelector.innerHTML = "";
  const blockTypes = ["1개", "2개", "3개", "4개", "1+조총", "1+기마"];
  const blockTypeValues = ["1", "2", "3", "4", "조총", "기마"];
  blockTypes.forEach((type, index) => {
    const btn = document.createElement("button");
    btn.className = "block-type-btn";
    btn.textContent = type;
    btn.onclick = () => createBlock(blockTypeValues[index]);
    blockTypeSelector.appendChild(btn);
  });

  modal.style.display = "flex";
}

// 문양 선택
function selectCrest(crestNumber, selectedBtn) {
  document
    .querySelectorAll(".crest-btn")
    .forEach((btn) => btn.classList.remove("active"));
  selectedBtn.classList.add("active");
  // 선택된 문양 정보를 임시 저장
  modal.dataset.selectedCrest = crestNumber;
}

// 블록 생성 및 추가
function createBlock(blockType) {
  const selectedCrest = modal.dataset.selectedCrest;
  if (!selectedCrest) {
    alert("먼저 문양을 선택해주세요.");
    return;
  }

  const container = document.getElementById(
    `${currentFaction}-block-container`
  );
  const block = document.createElement("div");
  // 모든 블록은 생성 시 바로 'supported' 상태가 됨
  block.className = `battle-block ${currentFaction}-block supported`;

  const crestIcon =
    currentFaction === "ishida"
      ? ISHIDA_CREST_ICONS[selectedCrest]
      : TOKUGAWA_CREST_ICONS[selectedCrest];

  block.innerHTML = `
    <div class="block-info">
      <img src="${crestIcon}" class="block-icon" alt="문양${selectedCrest}">
      <span>:${blockType}</span>
    </div>
    <div class="block-strength">0</div>
  `;

  // 블록 종류를 데이터 속성으로 저장
  block.dataset.blockType = blockType;
  block.dataset.crest = selectedCrest;

  // '조총' 또는 '기마' 블록일 경우에만 좌클릭으로 특수 효과 토글
  if (blockType === "조총" || blockType === "기마") {
    block.addEventListener("click", () => {
      block.classList.toggle("effect-active");
      updateAllBlockDisplays(); // 변경 시 전체 업데이트
    });
  }

  // 더블클릭: 블록 제거
  block.addEventListener("dblclick", () => {
    block.remove();
    updateAllBlockDisplays(); // 변경 시 전체 업데이트
  });

  // 우클릭: 블록 제거
  block.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // 우클릭 메뉴 방지
    block.remove();
    updateAllBlockDisplays(); // 변경 시 전체 업데이트
  });

  container.appendChild(block);
  closeModal();
  updateAllBlockDisplays(); // 블록 추가 후 전체 디스플레이 업데이트
}

// 모달 닫기
function closeModal() {
  modal.style.display = "none";
  modal.dataset.selectedCrest = "";
}

// 모달 외부 클릭 시 닫기
window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
};

// 페이지 로드 시 한 번 실행하여 결과창을 미리 표시
document.addEventListener("DOMContentLoaded", () => calculateCombat());

// 전투 초기화 함수
function resetBattle() {
  const ishidaContainer = document.getElementById("ishida-block-container");
  const tokugawaContainer = document.getElementById("tokugawa-block-container");

  ishidaContainer.innerHTML = "";
  tokugawaContainer.innerHTML = "";

  updateAllBlockDisplays();
}

// 모든 블록의 전투력 표시를 업데이트하는 함수
function updateAllBlockDisplays() {
  const factions = ["ishida", "tokugawa"];
  factions.forEach((faction) => {
    const containerId = `#${faction}-block-container`;
    const blocks = document.querySelectorAll(`${containerId} .battle-block`);

    // 각 블록의 점수를 개별적으로 계산하고 표시 업데이트
    blocks.forEach((block, index) => {
      let strength = 0;
      const blockType = block.dataset.blockType;
      const crest = block.dataset.crest;

      // --- 보너스 계산을 위해 '이전' 블록들의 정보만 수집 ---
      const prevBlocks = Array.from(blocks).slice(0, index);
      const prevCrestCounts = {};
      const prevSpecialAttackCounts = { 조총: 0, 기마: 0 };
      prevBlocks.forEach((prevBlock) => {
        prevCrestCounts[prevBlock.dataset.crest] =
          (prevCrestCounts[prevBlock.dataset.crest] || 0) + 1;
        if (prevBlock.classList.contains("effect-active")) {
          prevSpecialAttackCounts[prevBlock.dataset.blockType]++;
        }
      });
      // --- ----------------------------------------- ---

      // 1. 기본 점수 계산
      if (blockType === "1" || blockType === "조총" || blockType === "기마")
        strength += 1;
      else if (blockType === "2") strength += 2;
      else if (blockType === "3") strength += 3;
      else if (blockType === "4") strength += 4;

      // 2. 특수 공격 보너스
      if (block.classList.contains("effect-active")) {
        strength += 2;
      }

      // 3. 동일 병종 보너스
      // 이전에 활성화된 동일 병종 블록이 1개 이상 있을 경우
      const prevActiveSameTypeCount = prevSpecialAttackCounts[blockType] || 0;
      if (
        block.classList.contains("effect-active") &&
        prevActiveSameTypeCount > 0
      ) {
        // 이전에 활성화된 동일 병종 블록의 '개수' * 2 만큼 보너스
        strength += prevActiveSameTypeCount * 2;
      }

      // 4. 문양 보너스
      // 이전에 동일한 문양 블록이 있었던 개수만큼 보너스
      const prevSameCrestCount = prevCrestCounts[crest] || 0;
      if (prevSameCrestCount > 0) {
        strength += prevSameCrestCount;
      }

      block.querySelector(".block-strength").textContent = strength;
    });
  });

  // 개별 블록의 전투력이 업데이트된 후, 최종 전투 결과를 다시 계산
  calculateCombat();
}

// 전투력 계산 함수
function calculateFactionStrength(faction) {
  let totalStrength = 0;
  const containerId = `#${faction}-block-container`;
  const blocks = document.querySelectorAll(`${containerId} .battle-block`);

  const crestCounts = {}; // 문양 보너스 계산용
  const specialAttackCounts = { 조총: 0, 기마: 0 }; // 동일 병종 보너스 계산용

  blocks.forEach((block) => {
    // 이미 updateAllBlockDisplays에서 계산된 개별 블록의 점수를 가져와 합산
    totalStrength +=
      parseInt(block.querySelector(".block-strength").textContent) || 0;
  });

  return totalStrength;
}

function calculateCombat() {
  const ishidaStrength = calculateFactionStrength("ishida");
  const tokugawaStrength = calculateFactionStrength("tokugawa");

  let winner = "";

  if (ishidaStrength > tokugawaStrength) {
    winner = "이시다 미츠나리";
  } else if (tokugawaStrength > ishidaStrength) {
    winner = "도쿠가와 이에야스";
  } else {
    winner = "무승부";
  }

  const resultMessage = `서군 ${ishidaStrength} vs 동군 ${tokugawaStrength}`;

  const resultArea = document.getElementById("resultArea");
  const resultText = document.getElementById("resultText");
  const winnerText = document.getElementById("winnerText");

  resultText.textContent = resultMessage;

  winnerText.className = "winnerText"; // 클래스 초기화
  if (winner === "무승부") {
    winnerText.textContent = winner;
  } else if (winner === "이시다 미츠나리") {
    winnerText.textContent = `승자: ${winner}`;
    winnerText.classList.add("ishida-win");
  } else {
    winnerText.textContent = `승자: ${winner}`;
    winnerText.classList.add("tokugawa-win");
  }

  resultArea.style.display = "block"; // 결과 영역을 보이게 함
}
