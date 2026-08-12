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

    // Update the board so the selected personal box
    // is highlighted immediately.
    renderBriefcases();
    updateSidePanels();

    // Prevent any other briefcases from being clicked
    // while the personal-box reveal is showing.
    offerActive = true;

    const briefcase =
      document.getElementById("briefcase-" + box);

    // Make a large clone of the chosen personal box.
    const clone = briefcase.cloneNode(true);

    clone.innerHTML = `
      <img
        class="center-img"
        src="${boxImages[box]}"
        alt="Personal Box ${box}"
      >

      <div class="personal-box-message">
        THIS IS YOUR BOX!
      </div>

      <div class="center-amount">
        Box #${box}
      </div>
    `;

    clone.classList.add("center-open");
    clone.classList.add("personal-box-reveal");

    // Prevent the large reveal from reacting to mouse hover.
    clone.style.pointerEvents = "none";

    document.body.appendChild(clone);


    // ------------------------------------------------------
    // Show personal box reveal for 4 seconds
    // ------------------------------------------------------
    setTimeout(() => {

      clone.remove();

      // After the reveal, show the instruction popup.
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

      document.getElementById("offerModal").style.display =
        "flex";


      // Keep this instruction visible for 6 seconds.
      setTimeout(() => {

        document.getElementById("offerModal").style.display =
          "none";

        document.getElementById("gameMessage").textContent =
          `Choose ${casesToOpen} box${casesToOpen === 1 ? "" : "es"} to open.`;

        offerActive = false;

      }, 6000);

    }, 5000);

    return;
  }


  // ------------------------------------------------------
  // NORMAL GAME PLAY
  // ------------------------------------------------------

  // Don't allow the player's personal box to be opened.
  if (box === chosenBox) return;

  // Don't allow an already-opened box to be opened again.
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

  const clone = briefcase.cloneNode(true);

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

  // Prevent hover from moving/glitching the large image.
  clone.style.pointerEvents = "none";

  document.body.appendChild(clone);


  // ------------------------------------------------------
  // Remove prize value from remaining values
  // ------------------------------------------------------

  const idx =
    valuesRemaining.indexOf(boxValues[box]);

  if (idx > -1) {
    valuesRemaining.splice(idx, 1);
  }


  // Count opened box.
  openedCount++;

  renderBriefcases();
  updateSidePanels();


  // ------------------------------------------------------
  // Find unopened boxes besides personal box
  // ------------------------------------------------------

  const unopened = boxes.filter(
    b => !openedStatus[b] && b !== chosenBox
  );


  // ------------------------------------------------------
  // Update instructions after each opened box
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

  if (
    unopened.length === 1 &&
    !finalSwapActive
  ) {

    setTimeout(() => {
      finalSwap();
    }, 500);

    setTimeout(() => {
      clone.remove();
    }, 6000);

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

  // Wait until the enlarged picture disappears.
  setTimeout(() => {

    playSound("offerSound");

    offerDeal();

    // Reset opened box count for next round.
    openedCount = 0;

  }, 5500);
}


  // Remove large opened-box image after 5 seconds.
  setTimeout(() => {
    clone.remove();
  }, 5000);
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
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const average = sum / values.length;

  // Banker becomes more generous as the game progresses.
  const offerPercentages = [
    0.35, // Round 1
    0.45, // Round 2
    0.55, // Round 3
    0.65, // Round 4
    0.75, // Round 5
    0.85, // Round 6
    0.90, // Round 7
    0.95, // Round 8
    1.00  // Final rounds
  ];

  const percentage =
    offerPercentages[currentRound] ?? 1;

  let offer = average * percentage;

  // Keep early offers from becoming too large.
  if (currentRound === 0) {
    offer = Math.min(offer, 75);
  }

  if (currentRound === 1) {
    offer = Math.min(offer, 100);
  }

  // Round to the nearest dollar for cleaner offers.
offer = Math.round(offer / 5) * 5;
  return offer;
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


  // Keep No Deal / next-round instruction visible
  // for 6 seconds.
  setTimeout(() => {

    document.getElementById("offerModal").style.display =
      "none";

    renderBriefcases();

    updateSidePanels();

    document.getElementById("gameMessage").textContent =
      `Choose ${casesToOpen} box${casesToOpen === 1 ? "" : "es"} to open.`;

    offerActive = false;

    declineHandled = false;

  }, 6000);
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

  // At the very beginning,
  // ONLY ask the player to choose a personal box.
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


  // Initial "Choose your personal box"
  // message stays up for 5 seconds.
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

  }, 5000);
}