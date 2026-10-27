/* ==================================================
   STAR COLLECTOR
   This script controls the mini-game in index.html.
   ================================================== */

// Find the HTML elements that the game needs to control.
const arena = document.getElementById("arena");
const player = document.getElementById("player");
const star = document.getElementById("star");
const hazard = document.getElementById("hazard");

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");

const messageBox = document.getElementById("gameMessage");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const startButton = document.getElementById("startGame");

const yearText = document.getElementById("year");

// Display the current year automatically in the footer.
yearText.textContent = new Date().getFullYear();

// These variables remember the game's current state.
const targetScore = 5;
const startingTime = 20;
const playerStep = 12;

let score = 0;
let timeLeft = startingTime;
let playerX = 12;
let playerY = 12;
let hazardX = 50;
let hazardY = 75;

let timerInterval = null;
let hazardInterval = null;
let gameRunning = false;

// Place a game object using percentages of the arena's size.
// This helps the objects stay inside the game on different screens.
function placeObject(element, x, y) {
    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
}

// Move the star to a random position.
// The edges are avoided so the star stays easy to reach.
function moveStar() {
    const randomX = 8 + Math.random() * 80;
    const randomY = 8 + Math.random() * 76;

    placeObject(star, randomX, randomY);
}

// Move the player in response to a key press.
function movePlayer(key) {
    if (!gameRunning) return;

    const arenaWidth = arena.clientWidth;
    const arenaHeight = arena.clientHeight;

    // Convert the player's percentage position into pixels.
    let x = (playerX / 100) * arenaWidth;
    let y = (playerY / 100) * arenaHeight;

    // Work out which direction the player wants to move.
    switch (key.toLowerCase()) {
        case "arrowup":
        case "w":
            y -= playerStep;
            break;

        case "arrowdown":
        case "s":
            y += playerStep;
            break;

        case "arrowleft":
        case "a":
            x -= playerStep;
            break;

        case "arrowright":
        case "d":
            x += playerStep;
            break;

        default:
            return;
    }

    // Keep the player inside the arena boundaries.
    x = Math.max(16, Math.min(arenaWidth - 16, x));
    y = Math.max(16, Math.min(arenaHeight - 16, y));

    // Convert the updated pixel position back into percentages.
    playerX = (x / arenaWidth) * 100;
    playerY = (y / arenaHeight) * 100;

    placeObject(player, playerX, playerY);

    // Check whether the player touched a game object.
    checkCollisions();
}

// Check the distance between two objects.
// A small distance means the player has touched the object.
function touching(x1, y1, x2, y2) {
    const arenaWidth = arena.clientWidth;
    const arenaHeight = arena.clientHeight;

    const pixelX1 = (x1 / 100) * arenaWidth;
    const pixelY1 = (y1 / 100) * arenaHeight;
    const pixelX2 = (x2 / 100) * arenaWidth;
    const pixelY2 = (y2 / 100) * arenaHeight;

    const distance = Math.hypot(
        pixelX1 - pixelX2,
        pixelY1 - pixelY2
    );

    return distance < 28;
}

// Check if the player collects the star or hits the hazard.
function checkCollisions() {
    if (!gameRunning) return;

    // Collecting a star increases the score.
    const starX = parseFloat(star.style.left);
    const starY = parseFloat(star.style.top);

    if (touching(playerX, playerY, starX, starY)) {
        score++;
        scoreText.textContent = `${score} / ${targetScore}`;

        if (score >= targetScore) {
            endGame(true);
            return;
        }

        moveStar();
    }

    // Touching the hazard ends the round.
    if (touching(playerX, playerY, hazardX, hazardY)) {
        endGame(false, "You hit the hazard!");
    }
}

// Move the hazard between two positions.
// The player must avoid it while collecting stars.
function moveHazard() {
    if (!gameRunning) return;

    hazardX = hazardX >= 78 ? 18 : hazardX + 10;

    // The hazard also shifts between two rows.
    hazardY = hazardY === 75 ? 25 : 75;

    placeObject(hazard, hazardX, hazardY);

    checkCollisions();
}

// Stop both repeating timers.
// This prevents multiple timers from running after a restart.
function stopTimers() {
    clearInterval(timerInterval);
    clearInterval(hazardInterval);

    timerInterval = null;
    hazardInterval = null;
}

// Finish the game and display the result.
function endGame(won, customMessage = "") {
    gameRunning = false;
    stopTimers();

    messageBox.classList.remove("is-hidden");

    if (won) {
        messageTitle.textContent = "You won!";
        messageText.textContent = "Amazing! You collected all 5 stars.";
    } else {
        messageTitle.textContent = "Game over!";
        messageText.textContent =
            customMessage || "Time ran out. Give it another try!";
    }

    startButton.textContent = "Play again";
}

// Start a new round or restart after a result.
function startGame() {
    stopTimers();

    score = 0;
    timeLeft = startingTime;

    playerX = 12;
    playerY = 12;

    hazardX = 50;
    hazardY = 75;

    scoreText.textContent = `${score} / ${targetScore}`;
    timerText.textContent = `${timeLeft}s`;

    placeObject(player, playerX, playerY);
    placeObject(hazard, hazardX, hazardY);

    moveStar();

    // Hide the welcome message so the player can play.
    messageBox.classList.add("is-hidden");

    gameRunning = true;

    // Count down once per second.
    timerInterval = setInterval(() => {
        timeLeft--;
        timerText.textContent = `${timeLeft}s`;

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);

    // Move the hazard every 700 milliseconds.
    hazardInterval = setInterval(moveHazard, 700);

    // Focus the game area so the player can use the keyboard.
    arena.focus();
}

// Listen for movement keys on the keyboard.
document.addEventListener("keydown", (event) => {
    const movementKeys = [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "w",
        "a",
        "s",
        "d"
    ];

    if (movementKeys.includes(event.key.toLowerCase())) {
        if (gameRunning) {
            event.preventDefault();
            movePlayer(event.key);
        }
    }
});

// Start the game when the button is clicked.
startButton.addEventListener("click", startGame);

// Set up the initial positions before the first round.
placeObject(player, playerX, playerY);
placeObject(star, 70, 45);
placeObject(hazard, hazardX, hazardY);
