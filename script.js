/* ==========================================
   ELECTRA BELL PORTFOLIO — STAR COLLECTOR
   Matches the HTML IDs and purple-theme CSS
   ========================================== */


/* 1. FIND THE HTML ELEMENTS */

const arena = document.getElementById("arena");
const player = document.getElementById("player");
const star = document.getElementById("star");
const hazard = document.getElementById("hazard");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("gameStatus");

const gameMessage = document.getElementById("gameMessage");
const messageTitle = document.getElementById("messageTitle");
const messageText = document.getElementById("messageText");
const startButton = document.getElementById("startGame");

const yearDisplay = document.getElementById("currentYear");


/* 2. SHOW THE CURRENT YEAR IN THE FOOTER */

if (yearDisplay) {
    yearDisplay.textContent = new Date().getFullYear();
}


/* 3. GAME SETTINGS */

const starsNeeded = 5;
const startingTime = 20;

let score = 0;
let timeLeft = startingTime;

let gameRunning = false;
let timerInterval = null;
let hazardInterval = null;


/* 4. PLAYER POSITION AND MOVEMENT SETTINGS */

/*
   Positions are percentages of the game arena.
   This means the player can move around even if
   the game arena changes size on smaller screens.
*/

let playerX = 10;
let playerY = 50;

const playerStep = 2.5;


/* 5. HAZARD MOVEMENT SETTINGS */

let hazardX = 50;
let hazardY = 60;

let hazardDirection = 1;

const hazardSpeed = 1.2;


/* 6. KEEP THE PLAYER INSIDE THE ARENA */

function keepPlayerInsideArena() {
    playerX = Math.max(3, Math.min(97, playerX));
    playerY = Math.max(6, Math.min(94, playerY));

    player.style.left = playerX + "%";
    player.style.top = playerY + "%";
}


/* 7. MOVE THE HAZARD */

function moveHazard() {
    if (!gameRunning) {
        return;
    }

    /*
       The hazard moves left and right.
       When it reaches an edge, it changes direction.
    */

    hazardX += hazardSpeed * hazardDirection;

    if (hazardX >= 94) {
        hazardX = 94;
        hazardDirection = -1;
    }

    if (hazardX <= 6) {
        hazardX = 6;
        hazardDirection = 1;
    }

    hazard.style.left = hazardX + "%";
    hazard.style.top = hazardY + "%";

    checkHazardCollision();
}


/* 8. PLACE THE STAR IN A RANDOM POSITION */

function moveStar() {
    /*
       Keep the star away from the very edges so it
       remains visible and easier to collect.
    */

    const randomX = 10 + Math.random() * 80;
    const randomY = 12 + Math.random() * 76;

    star.style.left = randomX + "%";
    star.style.top = randomY + "%";
}


/* 9. CHECK WHETHER TWO GAME OBJECTS TOUCH */

function objectsTouch(firstObject, secondObject) {
    const first = firstObject.getBoundingClientRect();
    const second = secondObject.getBoundingClientRect();

    return (
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top
    );
}


/* 10. CHECK IF THE PLAYER COLLECTS THE STAR */

function checkStarCollection() {
    if (!gameRunning) {
        return;
    }

    if (objectsTouch(player, star)) {
        score++;

        scoreDisplay.textContent = score;

        statusDisplay.textContent =
            "Star collected! Keep going!";

        if (score >= starsNeeded) {
            endGame(true);
            return;
        }

        moveStar();
    }
}


/* 11. CHECK IF THE PLAYER TOUCHES THE HAZARD */

function checkHazardCollision() {
    if (!gameRunning) {
        return;
    }

    if (objectsTouch(player, hazard)) {
        /*
           Touching the hazard sends the player back
           to the starting position. The timer continues.
        */

        playerX = 10;
        playerY = 50;

        keepPlayerInsideArena();

        statusDisplay.textContent =
            "Watch out! The hazard sent you back to the start.";

        /*
           Briefly flash the player so the collision
           is visible without ending the whole game.
        */

        player.style.opacity = "0.35";

        setTimeout(function () {
            player.style.opacity = "1";
        }, 180);
    }
}


/* 12. UPDATE THE SCORE AND TIMER */

function updateTimer() {
    if (!gameRunning) {
        return;
    }

    timeLeft--;

    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
        timeLeft = 0;
        timerDisplay.textContent = timeLeft;

        endGame(false);
    }
}


/* 13. START THE GAME */

function startGame() {
    /*
       Clear old timers first so restarting the game
       never creates multiple timers running together.
    */

    clearInterval(timerInterval);
    clearInterval(hazardInterval);

    score = 0;
    timeLeft = startingTime;

    playerX = 10;
    playerY = 50;

    hazardX = 50;
    hazardY = 60;
    hazardDirection = 1;

    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;

    player.style.left = playerX + "%";
    player.style.top = playerY + "%";

    hazard.style.left = hazardX + "%";
    hazard.style.top = hazardY + "%";

    player.style.opacity = "1";

    moveStar();

    gameRunning = true;

    gameMessage.style.display = "none";

    statusDisplay.textContent =
        "Collect five stars and avoid the moving hazard!";

    /*
       The timer counts down once per second.
       The hazard moves more frequently to look animated.
    */

    timerInterval = setInterval(updateTimer, 1000);
    hazardInterval = setInterval(moveHazard, 35);
}


/* 14. END THE GAME */

function endGame(won) {
    gameRunning = false;

    clearInterval(timerInterval);
    clearInterval(hazardInterval);

    gameMessage.style.display = "flex";

    if (won) {
        messageTitle.textContent = "You Win!";
        messageText.textContent =
            "Amazing! You collected all five stars in time.";

        statusDisplay.textContent =
            "Victory! You collected all five stars.";
    } else {
        messageTitle.textContent = "Game Over!";

        messageText.textContent =
            "Time ran out! You collected " + score +
            " out of " + starsNeeded +
            " stars. Try again!";

        statusDisplay.textContent =
            "Time is up. Press Play Again to retry.";
    }

    startButton.textContent = "Play Again";
}


/* 15. MOVE THE PLAYER WITH THE KEYBOARD */

document.addEventListener("keydown", function (event) {
    if (!gameRunning) {
        return;
    }

    const key = event.key.toLowerCase();

    /*
       Prevent the arrow keys from scrolling the page
       while the player is controlling the game.
    */

    if (
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        key === " "
    ) {
        event.preventDefault();
    }

    if (key === "w" || key === "arrowup") {
        playerY -= playerStep;
    }

    if (key === "s" || key === "arrowdown") {
        playerY += playerStep;
    }

    if (key === "a" || key === "arrowleft") {
        playerX -= playerStep;
    }

    if (key === "d" || key === "arrowright") {
        playerX += playerStep;
    }

    keepPlayerInsideArena();

    checkStarCollection();
    checkHazardCollision();
});


/* 16. CONNECT THE START BUTTON */

startButton.addEventListener("click", function () {
    startGame();
});


/* 17. SET UP THE GAME BEFORE IT STARTS */

function prepareGame() {
    scoreDisplay.textContent = "0";
    timerDisplay.textContent = startingTime;

    playerX = 10;
    playerY = 50;

    hazardX = 50;
    hazardY = 60;

    keepPlayerInsideArena();

    hazard.style.left = hazardX + "%";
    hazard.style.top = hazardY + "%";

    moveStar();

    gameMessage.style.display = "flex";
}

prepareGame();
