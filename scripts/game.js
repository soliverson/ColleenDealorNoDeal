// ======================================================
// GAME STATE / FLAGS
// ======================================================

// Prevents the No Deal button from being handled twice.
let declineHandled = false;


// ======================================================
// BRIEFCASE CLICK
// ======================================================

function briefcaseClicked(box) {

  // ------------------------------------------------------
  // FIRST CLICK: Choose the player's personal box
  // ------------------------------------------------------
  if (!chosenBox) {

    chosenBox = box;

    const casesToOpen = rounds[currentRound];

    // Update the board immediately so the selected
    // personal box is highlighted.
    renderBriefcases();
    updateSidePanels();

    // Temporarily prevent other briefcases from being clicked.
    offerActive = true;

    // Tell the player what they selected and what to do next.
    document.getElementById("offerDetails").innerHTML = `
      <p class="message">
        Your personal box is
        <strong>#${box}</strong>
      </p>

      <p class="cases-to-open">
        Now choose
        <strong>${casesToOpen}</strong>
        box${casesToOpen === 1 ? "" : "es"} to open.
      </p>
    `;

    document.getElementById("offerModal").style.display = "flex";

    // Keep this instruction on the screen for 6 seconds.
    setTimeout(() => {

      document.getElementById("offerModal").style.display = "none";

      document.getElementById("gameMessage").textContent =
        `Choose ${casesToOpen} box${casesToOpen === 1 ? "" : "es"} to open.`;

      offerActive = false;

    }, 5000);

    return;
  }


  // ------------------------------------------------------
  // NORMAL GAME PLAY
  // ------------------------------------------------------

  // Do not allow the personal box to be opened.
  if (box === chosenBox) return;

  // Do not allow an already-opened box to be opened again.
  if (openedStatus[box]) return;

  openBriefcase(box);

  updateSidePanels();
}


// ======================================================
// OPEN A BRIEFCASE
// ======================================================

function openBriefcase(box) {

  openedStatus[box] = true;

  const briefcase =
    document.getElementById("briefcase-" + box);

  let clone = briefcase.cloneNode(true);

  clone.innerHTML = `
    <img
      class="center-img"
      src="${boxImages[box]}"
      alt="Image ${box}"
    >

    <div class="center-amount">
      $${boxValues[box].toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </div>
  `;

  clone.classList.add("center-open");

  document.body.appendChild(clone);


  // ------------------------------------------------------
  // Remove the prize value from remaining values
  // ------------------------------------------------------

  const idx =
    valuesRemaining.indexOf(boxValues[box]);

  if (idx > -1) {
    valuesRemaining.splice(idx, 1);
  }


  // Count this opened box.
  openedCount++;

  renderBriefcases();
  updateSidePanels();


  // ------------------------------------------------------
  // Find remaining unopened boxes
  // ------------------------------------------------------

  const unopened = boxes.filter(
    b => !openedStatus[b] && b !== chosenBox
  );


  // ------------------------------------------------------
  // Update instructions as boxes are opened
  // ------------------------------------------------------

  if (currentRound < rounds.length) {

    const casesNeeded =
      rounds[currentRound];

    const casesLeftThisRound =
      Math.max(
        casesNeeded - openedCount,
        0
      );

    if (casesLeftThisRound > 0) {

      document.getElementById("gameMessage").textContent =
        `Choose ${casesLeftThisRound} more box${casesLeftThisRound === 1 ? "" : "es"} to open.`;
    }
  }


  // ------------------------------------------------------
  // FINAL TWO BOXES
  // ------------------------------------------------------

  // If only one unopened box remains besides
  // the player's personal box, go to final swap.
  if (
    unopened.length === 1 &&
    !finalSwapActive
  ) {

    setTimeout(() => {
      finalSwap();
    }, 500);

    setTimeout(() => {
      clone.remove();
    }, 19000);

    return;
  }


  // ------------------------------------------------------
  // BANKER OFFER
  // ------------------------------------------------------

  if (
    currentRound < rounds.length &&
    openedCount >= rounds[currentRound]
  ) {

    offerActive = true;

    document.getElementById("gameMessage").textContent =
      "Waiting for the banker...";

    playSound("offerSound");

    setTimeout(() => {

      offerDeal();

      // Reset for the next round.
      openedCount = 0;

    }, 1000);
  }


  // Remove enlarged opened-box image.
  setTimeout(() => {
    clone.remove();
  }, 19000);
}


// ======================================================
// FINAL SWAP
// ======================================================

function finalSwap() {

  if (finalSwapActive) return;

  finalSwapActive = true;
  offerActive = true;

  stopSound("suspenseMusic");

  const finalHTML = `
    <p class="message">
      Final Decision
    </p>

    <p class="message">
      Do you want to keep your personal box
      or swap it with the last remaining box?
    </p>

    <button
      class="deal"
      onclick="keepBox()"
    >
      Keep My Box
    </button>

    <button
      class="decline"
      onclick="swapBox()"
    >
      Swap Box
    </button>
  `;

  document.getElementById("offerDetails").innerHTML =
    finalHTML;

  document.getElementById("offerModal").style.display =
    "flex";

  playSound("finalSwapMusic");
}


// ======================================================
// KEEP PERSONAL BOX
// ======================================================

function keepBox() {

  stopSound("suspenseMusic");
  stopSound("finalSwapMusic");

  const resultHTML = `
    <p class="message">
      You kept your personal box
      (#${chosenBox}).
    </p>

    <p class="message">
      It contains:
      $${boxValues[chosenBox].toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </p>

    <button onclick="playAgain()">
      Play Again
    </button>
  `;

  document.getElementById("offerDetails").innerHTML =
    resultHTML;

  document
    .querySelector(".modal-content")
    .classList.add("result-modal");

  playSound("applause");

  launchFireworks();
}


// ======================================================
// SWAP PERSONAL BOX
// ======================================================

function swapBox() {

  stopSound("suspenseMusic");
  stopSound("finalSwapMusic");

  const unopened = boxes.filter(
    b => !openedStatus[b] && b !== chosenBox
  );

  const newBox = unopened[0];

  chosenBox = newBox;

  const resultHTML = `
    <p class="message">
      You swapped your box.
    </p>

    <p class="message">
      Your new box (#${chosenBox}) contains:
      $${boxValues[chosenBox].toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </p>

    <button onclick="playAgain()">
      Play Again
    </button>
  `;

  document.getElementById("offerDetails").innerHTML =
    resultHTML;

  document
    .querySelector(".modal-content")
    .classList.add("result-modal");

  playSound("applause");

  launchFireworks();
}


// ======================================================
// BANKER OFFER CALCULATION
// ======================================================

function getBankersOffer(values) {

  const sum = values.reduce(
    (acc, curr) => acc + curr,
    0
  );

  return sum / values.length;
}


// ======================================================
// SHOW BANKER OFFER
// ======================================================

function offerDeal() {

  const offer =
    getBankersOffer(valuesRemaining);

  offersHistory.push(offer);

  updateOffersHistory();

  const offerHTML = `
    <p class="message">
      The banker offers you:
    </p>

    <p class="bank-offer">
      $${offer.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </p>

    <p class="message">
      Deal or No Deal?
    </p>

    <button
      class="deal"
      onclick="acceptDeal(${offer})"
    >
      Deal
    </button>

    <button
      class="decline"
      onclick="declineDealModal()"
    >
      No Deal
    </button>
  `;

  document.getElementById("offerDetails").innerHTML =
    offerHTML;

  document.getElementById("offerModal").style.display =
    "flex";

  playSound("suspenseMusic");
}


// ======================================================
// ACCEPT DEAL
// ======================================================

function acceptDeal(offer) {

  stopSound("suspenseMusic");

  const resultHTML = `
    <p class="message">
      You accepted the deal of
      $${offer.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}!
    </p>

    <p class="message">
      Your personal box (#${chosenBox}) contained:
      $${boxValues[chosenBox].toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </p>

    <button onclick="playAgain()">
      Play Again
    </button>
  `;

  document.getElementById("offerDetails").innerHTML =
    resultHTML;

  document
    .querySelector(".modal-content")
    .classList.add("result-modal");

  playSound("applause");

  launchFireworks();
}


// ======================================================
// NO DEAL
// ======================================================

function declineDealModal() {

  if (declineHandled) return;

  declineHandled = true;

  stopSound("suspenseMusic");

  playSound("declineSound");


  // ------------------------------------------------------
  // Move to next round
  // ------------------------------------------------------

  currentRound++;

  let casesToOpen;

  if (currentRound < rounds.length) {
    casesToOpen =
      rounds[currentRound];
  } else {
    casesToOpen = 1;
  }


  const roundName =
    currentRound < rounds.length
      ? `Round ${currentRound + 1}`
      : "Final Round";


  // ------------------------------------------------------
  // Tell player how many boxes to choose
  // ------------------------------------------------------

  document.getElementById("offerDetails").innerHTML = `
    <p class="message">
      NO DEAL!
    </p>

    <p class="round-number">
      ${roundName}
    </p>

    <p class="cases-to-open">
      Choose
      <strong>${casesToOpen}</strong>
      more box${casesToOpen === 1 ? "" : "es"} to open.
    </p>
  `;

  document.getElementById("offerModal").style.display =
    "flex";


  // Keep the No Deal / next-round instructions
  // visible for 6 seconds as well.
  setTimeout(() => {

    document.getElementById("offerModal").style.display =
      "none";

    renderBriefcases();

    updateSidePanels();

    document.getElementById("gameMessage").textContent =
      `Choose ${casesToOpen} box${casesToOpen === 1 ? "" : "es"} to open.`;

    offerActive = false;

    declineHandled = false;

  }, 5000);
}


// ======================================================
// PLAY AGAIN
// ======================================================

function playAgain() {
  window.location.reload();
}


// ======================================================
// ROUND / STARTING INSTRUCTION MODAL
// ======================================================

function showRoundModal(roundDisplay) {

  let roundHTML;


  // ------------------------------------------------------
  // START OF GAME
  // ------------------------------------------------------

  // At the very beginning, ONLY ask the player
  // to choose their personal box.
  if (
    roundDisplay === 1 &&
    !chosenBox
  ) {

    roundHTML = `
      <p class="message">
        Welcome to Deal or No Deal!
      </p>

      <p class="cases-to-open">
        Choose your personal box.
      </p>
    `;

  } else {

    // ----------------------------------------------------
    // NORMAL ROUND ANNOUNCEMENT
    // ----------------------------------------------------

    const roundIndex =
      roundDisplay - 1;

    const casesToOpen =
      rounds[roundIndex] ?? 1;

    roundHTML = `
      <p class="message">
        Round ${roundDisplay}
      </p>

      <p class="cases-to-open">
        Choose
        <strong>${casesToOpen}</strong>
        box${casesToOpen === 1 ? "" : "es"} to open.
      </p>
    `;
  }


  document.getElementById("offerDetails").innerHTML =
    roundHTML;

  document.getElementById("offerModal").style.display =
    "flex";


  // Initial "Choose your personal box" message
  // stays up for 3 seconds.
  setTimeout(() => {

    document.getElementById("offerModal").style.display =
      "none";

    document
      .querySelector(".modal-content")
      .classList.remove("result-modal");

    if (!chosenBox) {

      document.getElementById("gameMessage").textContent =
        "Choose your personal box.";
    }

  }, 6000);
}