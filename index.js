const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = new Image();
boardBackground.src = 'Assets/pizza-background.png';
boardBackground.onload = function(){
    ctx.drawImage(boardBackground, 0, 0, gameWidth, gameHeight);
};
const ballImage = new Image();
ballImage.src = 'Assets/broccoli.png';
const ballRadius = 12.5;
const paddleSpeed = 50;
const paddle1Image = new Image();
paddle1Image.src = 'Assets/paddle1.png';
const paddle2Image = new Image();
paddle2Image.src = 'Assets/paddle2.png'; 
let intervalID;
let ballSpeed;
let ballX = gameWidth / 2;
let ballY = gameHeight / 2;
let ballXDirection = 0;
let ballYDirection = 0;
let player1Score =0;
let player2Score =0;
let paddle1 = {
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    backgroundColor: "transparent",
};
let paddle2 = {
    width: 100,
    height: 100,
    x: gameWidth - 25,
    y: gameHeight - 100,
    backgroundColor: "transparent",
};
let isPaused = false;
let isComp = false;

let paddle1Angle = Math.PI;  
let paddle2Angle = 0;       

const centerX = gameWidth / 2;  
const centerY = gameHeight / 2; 
const effectiveRadius = centerX - 50; 

//Buttons

const pauseBtn = document.querySelector("#pauseBtn");
pauseBtn.addEventListener("click", togglePause);

const compBtn = document.querySelector("#compBtn");
compBtn.addEventListener("click", toggleComp);

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);

const gameStartBtn = document.querySelector("#gameStartBtn");
gameStartBtn.addEventListener("click", gameStart);

function gameStart(){
    updatePaddlePositions();
    createBall();
    nextTick();
}

function nextTick(){
    if(isPaused) return;
    intervalID = setTimeout(() => {
        clearBoard();
        if(isComp) {
            moveComputerPaddle();
        }
        drawPaddles();
        moveBall();
        drawBall(ballX, ballY);
        checkCollision();
        nextTick();
    }, 10);
}

function clearBoard(){
    ctx.save();
    ctx.beginPath();
    ctx.arc(gameWidth/2, gameHeight/2, gameWidth/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(boardBackground, 0, 0, gameWidth, gameHeight);
    ctx.restore();
};

function drawPaddles(){
    ctx.drawImage(paddle1Image, paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.drawImage(paddle2Image, paddle2.x, paddle2.y, paddle2.width, paddle2.height);
}

function createBall(){
    ballSpeed = 1;
    if(Math.round(Math.random()) == 1){
        ballXDirection =  1; 
    }
    else{
        ballXDirection = -1; 
    }
    if(Math.round(Math.random()) == 1){
        ballYDirection = Math.random() * 1;
    }
    else{
        ballYDirection = Math.random() * -1; 
    }
    ballX = gameWidth / 2;
    ballY = gameHeight / 2;
    drawBall(ballX, ballY);
};
function moveBall(){
    ballX += (ballSpeed * ballXDirection);
    ballY += (ballSpeed * ballYDirection);
};
function drawBall(ballX, ballY){
    ctx.drawImage(ballImage, ballX - ballRadius, ballY - ballRadius, ballRadius * 2, ballRadius * 2);
};
function checkCollision(){
    const dx = ballX - centerX;
    const dy = ballY - centerY;
    const distance = Math.hypot(dx, dy);
    const allowedDistance = gameWidth/2 - ballRadius;
    if(distance > allowedDistance) {
        const angle = Math.atan2(dy, dx);
        if(angle > -Math.PI/2 && angle < Math.PI/2){
            player1Score++;
        } else {
            player2Score++;
        }
        updateScore();
        createBall();  
        return;
    }
   
    if(ballX <= (paddle1.x + paddle1.width + ballRadius)){
        if(ballY > paddle1.y && ballY < paddle1.y + paddle1.height){
            ballX = (paddle1.x + paddle1.width) + ballRadius;
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
    if(ballX >= (paddle2.x - ballRadius)){
        if(ballY > paddle2.y && ballY < paddle2.y + paddle2.height){
            ballX = paddle2.x - ballRadius;
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
};
function changeDirection(event){
    const keyPressed = event.keyCode;
    const increment = 0.1;
    switch(keyPressed){
        case 87: 
            paddle1Angle -= increment;
            break;
        case 83: 
            paddle1Angle += increment;
            break;
        case 38: 
            paddle2Angle -= increment;
            break;
        case 40: 
            paddle2Angle += increment;
            break;
    }
    updatePaddlePositions();
}
function updateScore(){
    scoreText.textContent = `${player1Score}:${player2Score}`;
    if(player1Score >= 5 || player2Score >= 5){
        clearTimeout(intervalID);
        let winner = (player1Score >= 5) ? "Gamer" : "Dog";
        alert(`${winner} wins!`);
        resetGame();
    }
};
function resetGame(){
    player1Score =0;
    player2Score =0;
    paddle1 = {
        width: 100,
        height: 100,
        x: 0,
        y: 0
    };
    paddle2 = {
        width: 100,
        height: 100,
        x: gameWidth - 25,
        y: gameHeight - 100
    };
    ballSpeed = 1;
    ballX = 0;
    ballY = 0;
    ballXDirection = 0;
    ballYDirection = 0;
    updateScore();
    clearInterval(intervalID);
    gameStart();
};

function togglePause() {
    if (isPaused) {
        isPaused = false;
        pauseBtn.textContent = "Pause";
        nextTick();
    } else {
        isPaused = true;
        pauseBtn.textContent = "Resume";
        clearTimeout(intervalID);
    }
}

function toggleComp() {
    if (isComp) {
        isComp = false;
        compBtn.textContent = "AI";
        dog.textContent = "Dog";
    } else {
        isComp = true;
        compBtn.textContent = "Human";
        dog.textContent = "Robo-dog";
    }
}

function moveComputerPaddle() {

    let predictionError = Math.random() * 50 - 25;
    
    let predictedBallY = ballY + predictionError;
    
    const paddle2Center = paddle2.y + paddle2.height / 2;
    
    if (paddle2Center < predictedBallY) {
        paddle2.y += paddleSpeed * 0.25;
    } else if (paddle2Center > predictedBallY) {
        paddle2.y -= paddleSpeed * 0.25;
    }

    if (paddle2.y < 0) paddle2.y = 0;
    
    if (paddle2.y + paddle2.height > gameHeight) {
        paddle2.y = gameHeight - paddle2.height;
    }
}

function updatePaddlePositions(){
    paddle1.x = centerX + effectiveRadius * Math.cos(paddle1Angle) - paddle1.width / 2;
    paddle1.y = centerY + effectiveRadius * Math.sin(paddle1Angle) - paddle1.height / 2;
    paddle2.x = centerX + effectiveRadius * Math.cos(paddle2Angle) - paddle2.width / 2;
    paddle2.y = centerY + effectiveRadius * Math.sin(paddle2Angle) - paddle2.height / 2;
}