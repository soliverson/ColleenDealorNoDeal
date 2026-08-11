// Global flag to prevent double handling on decline.
let declineHandled = false;

function briefcaseClicked(box) {
  if (!chosenBox) {
    chosenBox = box;
    document.getElementById("gameMessage").textContent =
      `You have chosen box #${box} as your personal box. Now open other boxes by clicking on them.`;
    renderBriefcases();
  } else {
    if (box === chosenBox) return;
    if (openedStatus[box]) return;
    openBriefcase(box);
  }
  updateSidePanels();
}

function openBriefcase(box) {
  openedStatus[box] = true;
  const briefcase = document.getElementById("briefcase-" + box);
  let clone = briefcase.cloneNode(true);
  clone.innerHTML = `<img class="center-img" src="${boxImages[box]}" alt="Image ${box}">
                     <div class="center-amount">$${boxValues[box].toLocaleString(undefined, {
                       minimumFractionDigits: 2,
                       maximumFractionDigits: 2
                     })}</div>`;
  clone.classList.add("center-open");
  document.body.appendChild(clone);

  const idx = valuesRemaining.indexOf(boxValues[box]);
  if (idx > -1) valuesRemaining.splice(idx, 1);
  renderBriefcases();

  openedCount++;

  // Check if only one unopened briefcase (besides the chosen box) remains.
  const unopened = boxes.filter(b => !openedStatus[b] && b !== chosenBox);
  if (unopened.length === 1 && !finalSwapActive) {
    setTimeout(() => finalSwap(), 500);
    return; // Exit early to avoid triggering banker offer.
  }

  // Trigger banker offer if enough boxes have been opened for the current round.
  // Note: Use rounds[currentRound] because rounds array is 0-indexed.
  if (openedCount >= rounds[currentRound]) {
    offerActive = true;
    playSound('offerSound');
    setTimeout(() => {
      offerDeal();
      // Do not increment currentRound here.
      openedCount = 0;
    }, 1000);
  }

  setTimeout(() => clone.remove(), 19000);
}

function finalSwap() {
  finalSwapActive = true;
  offerActive = true;
  // Build final decision modal content.
  const finalHTML = `
    <p class="message">Final decision:</p>
    <p class="message">Do you want to keep your personal box or swap it with the last remaining briefcase?</p>
    <button class="deal" onclick="keepBox()">Keep My Box</button>
    <button class="decline" onclick="swapBox()">Swap Box</button>
  `;
  document.getElementById('offerDetails').innerHTML = finalHTML;
  document.getElementById('offerModal').style.display = 'flex';
}

function keepBox() {
  stopSound('suspenseMusic');
  const resultHTML = `
    <p class="message">You kept your personal box (#${chosenBox}).</p>
    <p class="message">It contains: $${boxValues[chosenBox].toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</p>
    <button onclick="playAgain()">Play Again</button>
  `;
  document.getElementById('offerDetails').innerHTML = resultHTML;
  // Add extra exciting styling for the final result.
  document.querySelector('.modal-content').classList.add('result-modal');
  playSound('applause');
  launchFireworks();
}

function swapBox() {
  stopSound('suspenseMusic');
  const unopened = boxes.filter(b => !openedStatus[b] && b !== chosenBox);
  const swapBox = unopened[0];
  chosenBox = swapBox;
  const resultHTML = `
    <p class="message">You swapped your box.</p>
    <p class="message">Your new box (#${chosenBox}) contains: $${boxValues[chosenBox].toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</p>
    <button onclick="playAgain()">Play Again</button>
  `;
  document.getElementById('offerDetails').innerHTML = resultHTML;
  document.querySelector('.modal-content').classList.add('result-modal');
  playSound('applause');
  launchFireworks();
}

function getBankersOffer(values) {
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return sum / values.length;
}

// Display the banker offer in a modal overlay.
function offerDeal() {
  const offer = getBankersOffer(valuesRemaining);
  offersHistory.push(offer);

  const offerHTML = `
    <p class="message">The banker offers you: $${offer.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</p>
    <p class="message">Deal or No Deal?</p>
    <button class="deal" onclick="acceptDeal(${offer})">Deal</button>
    <button class="decline" onclick="declineDealModal()">No Deal</button>
  `;
  document.getElementById('offerDetails').innerHTML = offerHTML;
  document.getElementById('offerModal').style.display = 'flex';
  playSound('suspenseMusic');
}

// When the deal is accepted, update the modal content to show the result.
function acceptDeal(offer) {
  stopSound('suspenseMusic');
  const resultHTML = `
    <p class="message">You accepted the deal of $${offer.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}!</p>
    <p class="message">Your personal box (#${chosenBox}) contained: $${boxValues[chosenBox].toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</p>
    <button onclick="playAgain()">Play Again</button>
  `;
  document.getElementById('offerDetails').innerHTML = resultHTML;
  document.querySelector('.modal-content').classList.add('result-modal');
  playSound('applause');
  launchFireworks();
}

// When the deal is declined, hide the offer modal, increment the round,
// show the new round modal immediately, then resume play.
function declineDealModal() {
  if (declineHandled) return;
  declineHandled = true;

  stopSound('suspenseMusic');
  document.getElementById('offerModal').style.display = 'none';
  playSound('declineSound');

  // Increment round immediately.
  currentRound++;
  // Show the new round modal (display round as currentRound+1).
  showRoundModal(currentRound + 1);

  // After the modal disappears, resume play.
  setTimeout(() => {
    renderBriefcases();
    updateSidePanels();
    document.getElementById("gameMessage").innerText = "Continue opening boxes by clicking on them.";
    offerActive = false; // Re-enable briefcase clicks.
    declineHandled = false;
  }, 3000);
}

function playAgain() {
  window.location.reload();
}

// Show a round announcement modal for a few seconds.
function showRoundModal(roundDisplay) {
  const roundHTML = `<p class="message">Round ${roundDisplay}</p>`;
  document.getElementById('offerDetails').innerHTML = roundHTML;
  document.getElementById('offerModal').style.display = 'flex';
  setTimeout(() => {
    document.getElementById('offerModal').style.display = 'none';
    // Remove result-modal styling so future modals look normal.
    document.querySelector('.modal-content').classList.remove('result-modal');
  }, 3000);
}
