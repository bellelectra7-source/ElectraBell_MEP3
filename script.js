// =========================================================
// ELECTRA BELL PORTFOLIO
// This file controls the interactive parts of my website.
// It includes the project filters, project details, contact
// form and my new Star Collector mini-game.
// =========================================================


// =========================================================
// 1. AUTOMATIC FOOTER YEAR
// I do not need to update the copyright year manually.
// JavaScript gets the current year from the visitor's device.
// =========================================================

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


// =========================================================
// 2. PROJECT FILTERS
// The filter buttons use data-filter values in index.html.
// Each project card has a data-category value.
// Matching values stay visible; other cards are hidden.
// =========================================================

const filterButtons = document.querySelectorAll(".filter-btn");
const projectItems = document.querySelectorAll(".project-item");

function filterProjects(selectedFilter) {
    projectItems.forEach(function (project) {
        const projectCategory = project.dataset.category;

        // "all" shows every card. Other filters show matching categories.
        if (selectedFilter === "all" || projectCategory === selectedFilter) {
            project.classList.remove("project-hidden");
        } else {
            project.classList.add("project-hidden");
        }
    });
}

// Listen for a click on each project filter button.
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedFilter = button.dataset.filter;

        // Remove the active style from every filter first.
        filterButtons.forEach(function (otherButton) {
            otherButton.classList.remove("active");
        });

        // Highlight the button the visitor clicked.
        button.classList.add("active");

        // Update which project cards are visible.
        filterProjects(selectedFilter);
    });
});


// =========================================================
// 3. PROJECT DETAILS
// For now, clicking a project detail button shows a simple
// browser alert. Later, I can replace this with a styled modal.
// =========================================================

const projectDetailButtons = document.querySelectorAll(".project-details-btn");

projectDetailButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const title = button.dataset.title;
        const description = button.dataset.description;

        alert(title + "\n\n" + description);
    });
});


// =========================================================
// 4. CONTACT FORM
// This is a front-end demonstration. It checks the fields,
// displays feedback and does not send an actual email.
// =========================================================

const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");

if (contactForm && formFeedback) {
    contactForm.addEventListener("submit", function (event) {
        // Stop the browser from refreshing the page on submission.
        event.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        // A quick check makes sure the fields contain something.
        if (name === "" || email === "" || message === "") {
            formFeedback.textContent = "Please complete all the fields.";
            return;
        }

        // The form is not connected to an email service yet.
        formFeedback.textContent =
            "Thanks, " + name + "! Your demo form was checked, but no email was sent.";

        // Clear the fields after showing the confirmation.
        contactForm.reset();
    });
}


// =========================================================
// 5. STAR COLLECTOR MINI-GAME
// This is my small playable browser game.
//
// The player moves using WASD or the arrow keys.
// Collect 8 stars before the 30-second timer reaches zero.
// Avoid the red hazard: touching it ends the round.
// =========================================================


// First, find the game elements created in index.html.
const gameArena = document.getElementById("gameArena");
const gamePlayer = document.getElementById("gamePlayer");
const gameStar = document.getElementById("gameStar");
const gameHazard = document.getElementById("gameHazard");

const gameScoreDisplay = document.getElementById("gameScore");
const gameTimerDisplay = document.getElementById("gameTimer");
const gameStatusDisplay = document.getElementById("gameStatus");

const gameOverlay = document.getElementById("gameOverlay");
const gameOverlayTitle = document.getElementById("gameOverlayTitle");
const gameOverlayText = document.getElementById("gameOverlayText");
const startGameBtn = document.getElementById("startGameBtn");


// These variables remember the state of the current round.
let gameScore = 0;
let gameTimeLeft = 30;
let gameIsRunning = false;

// The player's position is measured in percentages of the arena.
// This helps the game adapt when the arena changes size.
let playerX = 12;
let playerY = 50;

// The star and hazard also have their own positions.
let starX = 70;
let starY = 35;
let hazardX = 52;
let hazardY = 68;

// The hazard moves horizontally. A positive direction means right;
// a negative direction means left.
let hazardDirection = 1;

// These variables store the timers so we can stop them cleanly.
let countdownInterval = null;
let gameLoopInterval = null;

// A Set stores the keys currently being held down.
const keysPressed = new Set();


// Only start the game logic if the mini-game exists on the page.
if (
    gameArena &&
    gamePlayer &&
    gameStar &&
    gameHazard &&
    startGameBtn
) {

    // -----------------------------------------------------
    // A. UPDATE OBJECT POSITIONS
    // These functions move the objects visually by changing
    // their CSS left and top percentages.
    // -----------------------------------------------------

    function updatePlayerPosition() {
        gamePlayer.style.left = playerX + "%";
        gamePlayer.style.top = playerY + "%";
    }

    function updateStarPosition() {
        gameStar.style.left = starX + "%";
        gameStar.style.top = starY + "%";
    }

    function updateHazardPosition() {
        gameHazard.style.left = hazardX + "%";
        gameHazard.style.top = hazardY + "%";
    }


    // -----------------------------------------------------
    // B. UPDATE THE SCORE AND TIMER DISPLAY
    // The visitor can see their progress above the game area.
    // -----------------------------------------------------

    function updateGameDisplay() {
        gameScoreDisplay.textContent = gameScore + " / 8";
        gameTimerDisplay.textContent = gameTimeLeft + "s";
    }


    // -----------------------------------------------------
    // C. PLACE THE STAR SOMEWHERE NEW
    // Math.random() chooses a new position.
    // The margins keep the star away from the very edge.
    // -----------------------------------------------------

    function moveStarToRandomPosition() {
        starX = 10 + Math.random() * 80;
        starY = 12 + Math.random() * 76;

        // Do not put the star right on top of the player.
        let attempts = 0;

        while (
            Math.abs(starX - playerX) < 12 &&
            Math.abs(starY - playerY) < 15 &&
            attempts < 10
        ) {
            starX = 10 + Math.random() * 80;
            starY = 12 + Math.random() * 76;
            attempts++;
        }

        updateStarPosition();
    }


    // -----------------------------------------------------
    // D. CHECK DISTANCE BETWEEN TWO OBJECTS
    // If both horizontal and vertical distances are small,
    // the objects count as touching.
    // -----------------------------------------------------

    function objectsTouch(x1, y1, x2, y2, distanceNeeded) {
        const horizontalDistance = Math.abs(x1 - x2);
        const verticalDistance = Math.abs(y1 - y2);

        return (
            horizontalDistance < distanceNeeded &&
            verticalDistance < distanceNeeded
        );
    }


    // -----------------------------------------------------
    // E. END THE ROUND
    // This stops the timer and movement before showing the
    // result. It prevents the game continuing in the background.
    // -----------------------------------------------------

    function endGame(playerWon, reason) {
        gameIsRunning = false;

        clearInterval(countdownInterval);
        clearInterval(gameLoopInterval);

        countdownInterval = null;
        gameLoopInterval = null;

        keysPressed.clear();

        gameOverlay.classList.remove("is-hidden");

        if (playerWon) {
            gameStatusDisplay.textContent = "You won!";
            gameOverlayTitle.textContent = "Star collector!";
            gameOverlayText.textContent =
                "You collected all 8 stars. Great job! Your final score is " +
                gameScore + ".";
            startGameBtn.textContent = "Play again";
        } else {
            gameStatusDisplay.textContent = "Round over";
            gameOverlayTitle.textContent = "Game over!";

            if (reason === "hazard") {
                gameOverlayText.textContent =
                    "You touched the red hazard. You collected " +
                    gameScore + " out of 8 stars. Try again!";
            } else {
                gameOverlayText.textContent =
                    "Time ran out! You collected " +
                    gameScore + " out of 8 stars. Try again!";
            }

            startGameBtn.textContent = "Try again";
        }
    }


    // -----------------------------------------------------
    // F. CHECK FOR COLLECTING THE STAR OR HITTING THE HAZARD
    // This is where the game's basic rules are checked.
    // -----------------------------------------------------

    function checkCollisions() {
        // If the player gets close to the star, collect it.
        if (objectsTouch(playerX, playerY, starX, starY, 5.5)) {
            gameScore++;

            updateGameDisplay();

            // Winning happens as soon as the eighth star is collected.
            if (gameScore >= 8) {
                endGame(true, "win");
                return;
            }

            // Move the next star to a new location.
            moveStarToRandomPosition();
        }

        // If the player touches the hazard, the round ends.
        if (objectsTouch(playerX, playerY, hazardX, hazardY, 6)) {
            endGame(false, "hazard");
        }
    }


    // -----------------------------------------------------
    // G. MOVE THE PLAYER AND HAZARD
    // The player moves when a key is held down.
    // The hazard automatically travels back and forth.
    // -----------------------------------------------------

    function moveGameObjects() {
        if (!gameIsRunning) {
            return;
        }

        // A larger number means faster movement.
        const playerSpeed = 1.15;

        // WASD and the arrow keys both control the player.
        if (keysPressed.has("arrowup") || keysPressed.has("w")) {
            playerY -= playerSpeed;
        }

        if (keysPressed.has("arrowdown") || keysPressed.has("s")) {
            playerY += playerSpeed;
        }

        if (keysPressed.has("arrowleft") || keysPressed.has("a")) {
            playerX -= playerSpeed;
        }

        if (keysPressed.has("arrowright") || keysPressed.has("d")) {
            playerX += playerSpeed;
        }

        // Keep the player inside the arena instead of letting
        // them disappear outside the playable area.
        playerX = Math.max(3, Math.min(97, playerX));
        playerY = Math.max(5, Math.min(95, playerY));

        // The hazard moves left and right automatically.
        hazardX += 0.55 * hazardDirection;

        // Reverse direction when the hazard reaches either side.
        if (hazardX >= 91) {
            hazardX = 91;
            hazardDirection = -1;
        }

        if (hazardX <= 9) {
            hazardX = 9;
            hazardDirection = 1;
        }

        // Apply the updated positions to the screen.
        updatePlayerPosition();
        updateHazardPosition();

        // Check whether any game rules have been triggered.
        checkCollisions();
    }


    // -----------------------------------------------------
    // H. START OR RESTART THE GAME
    // Reset the score, timer, positions and direction so each
    // round starts fairly. Clear old intervals first.
    // -----------------------------------------------------

    function startGame() {
        clearInterval(countdownInterval);
        clearInterval(gameLoopInterval);

        countdownInterval = null;
        gameLoopInterval = null;

        keysPressed.clear();

        gameScore = 0;
        gameTimeLeft = 30;
        gameIsRunning = true;

        playerX = 12;
        playerY = 50;

        hazardX = 52;
        hazardY = 68;
        hazardDirection = 1;

        // Put the objects back in their starting positions.
        updatePlayerPosition();
        updateHazardPosition();
        moveStarToRandomPosition();
        updateGameDisplay();

        gameStatusDisplay.textContent = "Playing";
        gameOverlay.classList.add("is-hidden");

        // Focus the arena so the player can begin using the keys.
        gameArena.focus();

        // The movement loop runs about 30 times each second.
        gameLoopInterval = setInterval(moveGameObjects, 1000 / 30);

        // The timer decreases once every second.
        countdownInterval = setInterval(function () {
            if (!gameIsRunning) {
                return;
            }

            gameTimeLeft--;
            updateGameDisplay();

            if (gameTimeLeft <= 0) {
                gameTimeLeft = 0;
                updateGameDisplay();
                endGame(false, "time");
            }
        }, 1000);
    }


    // -----------------------------------------------------
    // I. KEYBOARD CONTROLS
    // keydown remembers which key is held.
    // keyup removes it when the player releases the key.
    // -----------------------------------------------------

    document.addEventListener("keydown", function (event) {
        const key = event.key.toLowerCase();

        // Only handle game movement keys when the game is active
        // and the arena is the focused area.
        if (
            gameIsRunning &&
            document.activeElement === gameArena &&
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                "w",
                "a",
                "s",
                "d"
            ].includes(key)
        ) {
            // Prevent the arrow keys from scrolling the webpage.
            event.preventDefault();
            keysPressed.add(key);
        }
    });

    document.addEventListener("keyup", function (event) {
        keysPressed.delete(event.key.toLowerCase());
    });

    // If the visitor switches tabs or clicks away, clear held keys
    // so the player does not continue moving unexpectedly.
    window.addEventListener("blur", function () {
        keysPressed.clear();
    });


    // -----------------------------------------------------
    // J. BUTTON AND INITIAL STATE
    // The game does not start automatically. The visitor
    // chooses when to play by pressing the start button.
    // -----------------------------------------------------

    startGameBtn.addEventListener("click", startGame);

    // Make sure the game starts in a clean, ready-to-play state.
    updatePlayerPosition();
    updateStarPosition();
    updateHazardPosition();
    updateGameDisplay();
}
