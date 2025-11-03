/**
 * =================================
 * CONSTANTS & CONFIG
 * =================================
 */
const FACTIONS = {
  ISHIDA: "ishida",
  TOKUGAWA: "tokugawa",
};

const BLOCK_TYPES = {
  MUSKET: "조총",
  CAVALRY: "기마",
};

const FACTION_DATA = {
  [FACTIONS.ISHIDA]: {
    name: "서군",
    crestIcons: {
      1: "images/ishida_1.png",
      2: "images/ishida_2.png",
      3: "images/ishida_3.png",
      4: "images/ishida_4.png",
      5: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M20 20 L80 80 M80 20 L20 80' stroke='currentColor' stroke-width='15' fill='none'/%3e%3c/svg%3e",
    },
    crestNames: {
      1: "코바야카와",
      2: "모리",
      3: "우에스기",
      4: "우키타",
      5: "배신자",
    },
  },
  [FACTIONS.TOKUGAWA]: {
    name: "동군",
    crestIcons: {
      1: "images/tokugawa_1.png",
      2: "images/tokugawa_2.png",
      3: "images/tokugawa_3.png",
      4: "images/tokugawa_4.png",
      5: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath d='M20 20 L80 80 M80 20 L20 80' stroke='currentColor' stroke-width='15' fill='none'/%3e%3c/svg%3e",
    },
    crestNames: {
      1: "마에다",
      2: "다테",
      3: "후쿠시마",
      4: "도쿠가와",
      5: "배신자",
    },
  },
};

/**
 * =================================
 * DOM ELEMENTS
 * =================================
 */
const modal = document.getElementById("block-modal");
const modalTitle = document.getElementById("modal-title");
const crestSelector = document.getElementById("crest-selector");
const blockTypeSelector = document.getElementById("block-type-selector");
let currentFaction = "";

// 블록 선택 모달 열기
function openBlockModal(faction = FACTIONS.ISHIDA) {
  currentFaction = faction;
  const data = FACTION_DATA[faction];
  modalTitle.textContent = `${data.name} 블록 선택`;

  // 진영에 맞는 문양 데이터 선택
  const { crestIcons, crestNames } = data;

  // 문양 선택 버튼 생성
  crestSelector.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
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
  const blockTypes = [
    "1",
    "2",
    "3",
    "4",
    `1+${BLOCK_TYPES.MUSKET}`,
    `1+${BLOCK_TYPES.CAVALRY}`,
  ];
  const blockTypeValues = [
    "1",
    "2",
    "3",
    "4",
    BLOCK_TYPES.MUSKET,
    BLOCK_TYPES.CAVALRY,
  ];
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

  const crestIcon = FACTION_DATA[currentFaction].crestIcons[selectedCrest];

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

  // 특수 블록일 경우에만 좌클릭으로 특수 효과 토글
  if (blockType === BLOCK_TYPES.MUSKET || blockType === BLOCK_TYPES.CAVALRY) {
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

// 모달 창 바깥의 어두운 영역(오버레이)을 클릭하면 모달을 닫습니다.
// 모달 외부 클릭 시 닫기
window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
};

// 페이지 로드 시 한 번 실행하여 결과창을 미리 표시
document.addEventListener("DOMContentLoaded", updateFinalResult);

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
  [FACTIONS.ISHIDA, FACTIONS.TOKUGAWA].forEach((faction) => {
    const containerId = `#${faction}-block-container`;
    const blocks = document.querySelectorAll(`${containerId} .battle-block`);

    blocks.forEach((block, index) => {
      const prevBlocks = Array.from(blocks).slice(0, index);
      updateBlockStrength(block, prevBlocks);
    });
  });

  // 개별 블록의 전투력이 업데이트된 후, 최종 전투 결과를 다시 계산
  updateFinalResult();
}

/**
 * 개별 블록의 전투력을 계산하고 DOM에 업데이트합니다.
 * @param {HTMLElement} block - 전투력을 계산할 블록 요소
 * @param {Array<HTMLElement>} prevBlocks - 해당 블록 이전에 추가된 블록들의 배열
 */
function updateBlockStrength(block, prevBlocks) {
  let strength = 0;
  const blockType = block.dataset.blockType;
  const crest = block.dataset.crest;

  // --- 보너스 계산을 위해 '이전' 블록들의 정보만 수집 ---
  const prevCrestCounts = {};
  const prevSpecialAttackCounts = {
    [BLOCK_TYPES.MUSKET]: 0,
    [BLOCK_TYPES.CAVALRY]: 0,
  };
  prevBlocks.forEach((prevBlock) => {
    // 배신자 블록(crest 5)이 아니면 문양 카운트
    if (prevBlock.dataset.crest !== "5") {
      prevCrestCounts[prevBlock.dataset.crest] =
        (prevCrestCounts[prevBlock.dataset.crest] || 0) + 1;
    }

    const prevBlockType = prevBlock.dataset.blockType;
    // 이전 블록의 활성화 여부와 상관없이 동일 병종(조총, 기마) 카운트
    if (
      prevBlockType === BLOCK_TYPES.MUSKET ||
      prevBlockType === BLOCK_TYPES.CAVALRY
    ) {
      prevSpecialAttackCounts[prevBlockType]++;
    }
  });
  // --- ----------------------------------------- ---

  // 1. 기본 점수 계산
  if (
    blockType === "1" ||
    blockType === BLOCK_TYPES.MUSKET ||
    blockType === BLOCK_TYPES.CAVALRY
  )
    strength += 1;
  else if (blockType === "2") strength += 2;
  else if (blockType === "3") strength += 3;
  else if (blockType === "4") strength += 4;

  // 2. 특수 공격 활성화 보너스
  if (block.classList.contains("effect-active")) {
    strength += 2;
  }

  // 3. 동일 병종 보너스
  const prevSameSpecialCount = prevSpecialAttackCounts[blockType] || 0;
  if (block.classList.contains("effect-active") && prevSameSpecialCount > 0) {
    strength += prevSameSpecialCount * 2;
  }

  // 4. 문양 보너스
  const prevSameCrestCount = prevCrestCounts[crest] || 0;
  if (crest !== "5" && prevSameCrestCount > 0) {
    strength += prevSameCrestCount;
  }

  block.querySelector(".block-strength").textContent = strength;
}

/**
 * 각 진영의 최종 전투력을 합산하고 결과를 화면에 업데이트합니다.
 */
function updateFinalResult() {
  const ishidaStrength = sumStrengthFor(FACTIONS.ISHIDA);
  const tokugawaStrength = sumStrengthFor(FACTIONS.TOKUGAWA);

  let winner = "";
  if (ishidaStrength > tokugawaStrength) {
    winner = "이시다 미츠나리";
  } else if (tokugawaStrength > ishidaStrength) {
    winner = "도쿠가와 이에야스";
  } else {
    winner = "무승부"; // 게임 규칙에 따라 '공격자 패배' 등으로 변경 가능
  }

  const resultMessage = `서군 ${ishidaStrength} vs 동군 ${tokugawaStrength}`;
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
}

/**
 * 특정 진영의 모든 블록 전투력을 합산하여 반환합니다.
 * @param {string} faction - 진영 이름 (e.g., 'ishida')
 * @returns {number} - 해당 진영의 총 전투력
 */
function sumStrengthFor(faction) {
  const blocks = document.querySelectorAll(
    `#${faction}-block-container .battle-block`
  );
  return Array.from(blocks).reduce((total, block) => {
    return (
      total +
      (parseInt(block.querySelector(".block-strength").textContent) || 0)
    );
  }, 0);
}
