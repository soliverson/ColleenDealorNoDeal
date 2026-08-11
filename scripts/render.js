// Renders the briefcases grid
function renderBriefcases() {
  const container = document.getElementById('briefcasesContainer');
  container.innerHTML = "";
  boxes.forEach(box => {
    const briefcase = document.createElement("div");
    briefcase.className = "briefcase";
    briefcase.id = "briefcase-" + box;
    if (box === chosenBox) {
      briefcase.innerHTML = `<img class="briefcase-img" src="${boxImages[box]}" alt="Image ${box}">
                              <div class="briefcase-number">${box}</div>`;
      briefcase.classList.add("personal");
    } else if (openedStatus[box]) {
      briefcase.innerHTML = `<img class="briefcase-img" src="${boxImages[box]}" alt="Image ${box}">
                              <div class="briefcase-number">$${boxValues[box].toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}</div>`;
      briefcase.classList.add("opened");
    } else {
      briefcase.innerHTML = `<img class="briefcase-img" src="${boxImages[box]}" alt="Image ${box}">
                              <div class="briefcase-number">${box}</div>`;
      // Only add click handler if not in final swap mode.
      if (!finalSwapActive) {
        briefcase.onclick = function () {
          if (offerActive) return;
          if (openedStatus[box] || box === chosenBox) return;
          playSound('clickSound');
          briefcaseClicked(box);
        };
      }
    }
    container.appendChild(briefcase);
  });
  
  // If only one unopened briefcase (besides the personal box) remains, trigger final swap prompt.
  const unopened = boxes.filter(b => !openedStatus[b] && b !== chosenBox);
  if (unopened.length === 1 && !finalSwapActive) {
    setTimeout(() => finalSwap(), 500);
  }
}

// Updates the prize board displayed in two vertical columns.
// The left column contains the lower half of prizes (e.g., $0.01, $1, $5, etc.),
// while the right column shows the higher values (starting with $150, etc.).
function updatePrizeBoard() {
  const prizeBoard = document.getElementById('prizeBoard');
  prizeBoard.innerHTML = "";
  const sortedPrizes = [...prizes].sort((a, b) => a - b);
  const half = Math.ceil(sortedPrizes.length / 2);
  const leftPrizes = sortedPrizes.slice(0, half);
  const rightPrizes = sortedPrizes.slice(half);

  // Create left column container
  const leftCol = document.createElement('ul');
  leftCol.className = "prize-column left-column";
  leftPrizes.forEach(prize => {
    const li = document.createElement("li");
    li.textContent = "$" + prize.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    if (!valuesRemaining.includes(prize)) li.className = "eliminated";
    leftCol.appendChild(li);
  });

  // Create right column container
  const rightCol = document.createElement('ul');
  rightCol.className = "prize-column right-column";
  rightPrizes.forEach(prize => {
    const li = document.createElement("li");
    li.textContent = "$" + prize.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    if (!valuesRemaining.includes(prize)) li.className = "eliminated";
    rightCol.appendChild(li);
  });

  // Append both columns to the prize board container
  prizeBoard.appendChild(leftCol);
  prizeBoard.appendChild(rightCol);
}

// Updates the offers history panel
function updateOffersHistory() {
  const historyList = document.getElementById('offersHistory');
  historyList.innerHTML = "";
  offersHistory.forEach((offer, index) => {
    const li = document.createElement("li");
    li.textContent = `Offer ${index + 1}: $${offer.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
    historyList.appendChild(li);
  });
}

// Updates both the prize board and the offers history
function updateSidePanels() {
  updatePrizeBoard();
  updateOffersHistory();
}

// Updates the round indicator text
function updateRoundIndicator() {
  document.getElementById("roundIndicator").textContent = "Round: " + (currentRound + 1);
}

// Updates the main game area (briefcases info) with provided HTML content,
// and then updates the side panels.
function updateGameArea(htmlContent) {
  const gameArea = document.getElementById("briefcasesInfo");
  gameArea.innerHTML = htmlContent;
  updateSidePanels();
}
