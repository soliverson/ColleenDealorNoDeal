// Data Setup and Utility Functions
const prizes = [0.01, 1, 5, 10, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500];
const boxes = Array.from({ length: 18 }, (_, i) => i + 1);
let boxValues = {};
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(prizes);
boxes.forEach((box, index) => {
  boxValues[box] = prizes[index];
});

// Random Image Assignment
const images = Array.from({ length: 18 }, (_, i) => `images/${i + 1}.webp`);
shuffle(images);
const boxImages = {};
boxes.forEach((box, index) => {
  boxImages[box] = images[index];
});

// Game State Variables
let chosenBox = null;
let openedStatus = {};
let valuesRemaining = prizes.slice();
let currentRound = 0;
const rounds = [4, 3, 3, 2, 2, 1, 1, 1, 1];
let openedCount = 0;
let offersHistory = [];
let offerActive = false;
let finalSwapActive = false;
