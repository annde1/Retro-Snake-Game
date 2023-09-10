//Elements:
const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");
const scoreEl = document.querySelector("#score-div");
const highScoreEl = document.querySelector("#highscore");
const gameOverScreen = document.querySelector("#game-over");
const playAgainBtn = document.querySelector("#play-again");
const gameOverSound = document.querySelector("#game-over-sound");

//Classes:

//Board class manages the game board
class Board {
  constructor(color) {
    this.color = color;
    this.context = canvas.getContext("2d"); //context is used to draw on the board
  }
  //render the game board
  renderBoard() {
    this.context.fillStyle = this.color; //fillStyle property is used to fill a rectangle with a color
    this.context.fillRect(0, 0, canvas.width, canvas.height);
  }
  //render a colored square on the board
  renderSquare(x, y, color) {
    this.context.fillStyle = color;
    this.context.fillRect(
      x * squareSize,
      y * squareSize,
      squareSize,
      squareSize
    );
    this.context.strokeStyle = boardColor;
    this.context.strokeRect(
      x * squareSize,
      y * squareSize,
      squareSize,
      squareSize
    ); //stroke has the same parameters as fillRect because we want the stroke the be exactly on the rectangle
  }
}

// Snake class manages the snake's behavior

class Snake {
  constructor(color) {
    this.color = color;
    this.position = [
      //default position of the snake
      { x: 2, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ];
    //All possible movement directions of the snake
    this.directions = {
      right: "ArrowRight",
      left: "ArrowLeft",
      down: "ArrowDown",
      up: "ArrowUp",
    };
    //Current direction is always the first element of directionsQueue array. Initially it's empty
    this.currentDirection = "";
    //directionsQueue array is used to keep track of snake's movements so that if the opposite keys are pressed (ex.: left->right)it will prevent the snake from going to the opposite directions
    this.directionsQueue = [];
  }
  // Render the snake on the board

  renderSnake() {
    this.position.forEach((square) => {
      board.renderSquare(square.x, square.y, this.color);
    });
  }
  //Check if the snake hits itself. Some method returns true or false
  hitItself() {
    const snakeBody = [...this.position];
    const head = snakeBody.shift();
    let hitItself = snakeBody.some((square) => {
      return square.x === head.x && square.y === head.y;
    });
    return hitItself;
  }
  //wallCollision checks if the position of the snake's head is the same as wall position
  wallCollison() {
    const head = { ...this.position[0] };
    return (
      head.x < 0 || head.x >= horizontalSq || head.y < 0 || head.y >= verticalSq
    );
  }
  hasEatenFood() {
    //if the position of the head of the snake is the same as positioon of the food then it means the snake ate the food
    const head = { ...this.position[0] };
    return head.x === food.position.x && head.y === food.position.y;
  }
  moveSnake() {
    if (!gameStarted) {
      return;
    }
    //Creating shallow copy of the old head
    const head = { ...this.position[0] };
    //We need to check if the directionsQueue is not empty and only if it's not empty we set the current direction to the first element of directionsQueue array
    if (this.directionsQueue.length) {
      this.currentDirection = this.directionsQueue.shift(); //shift method removes the first element of array and returns, it will be assigned to currentDirection
    }
    //Based on the currentDirection's value change the head's positions
    switch (this.currentDirection) {
      case this.directions.right:
        head.x += 1;
        break;
      case this.directions.left:
        head.x -= 1;
        break;
      case this.directions.up:
        head.y -= 1;
        break;
      case this.directions.down:
        head.y += 1;
        break;
    }
    //If snake ate food crreate new food:
    if (this.hasEatenFood()) {
      player.score++;
      food.generateFood();
      food.renderFood();
    } else {
      //Remove his old tail (last element). If the tail wasn't removed it means the snake will keep growing
      this.position.pop();
    }
    //Add new head to the snake. If it ate food it will grow by one square. If it didn't eat the food the size will stay the same
    this.position.unshift(head);
  }
  //setDirections will push newDirection to the directionsQueue array
  setDirection(e) {
    const newDirection = e.key;
    const oldDirection = this.currentDirection;
    //We need to prevent the snake from going to opposite direction by checking what was the "previous" direction before setting new direction
    if (
      (newDirection === this.directions.left &&
        oldDirection !== this.directions.right) ||
      (newDirection === this.directions.right &&
        oldDirection !== this.directions.left) ||
      (newDirection === this.directions.up &&
        oldDirection !== this.directions.down) ||
      (newDirection === this.directions.down &&
        oldDirection !== this.directions.up)
    ) {
      //start the game
      if (!gameStarted) {
        gameStarted = true; //false by default
        gameLoop = setInterval(frame, fps);
      }
      //Push the new direction to the directions queue array
      this.directionsQueue.push(newDirection);
    }
  }
}

// Food class manages the food's behavior

class Food {
  constructor(color) {
    this.color = color;
    this.position = {};
  }
  //generateFood will generate new food at random postion if it happens that the food is generated on the snake (while loop) it will keep generating
  generateFood() {
    let foodPosition;
    foodPosition = {
      x: Math.floor(Math.random() * horizontalSq),
      y: Math.floor(Math.random() * verticalSq),
    };
    while (
      snake.position.some((square) => {
        return square.x === foodPosition.x && square.y === foodPosition.y;
      })
    ) {
      foodPosition = {
        x: Math.floor(Math.random() * horizontalSq),
        y: Math.floor(Math.random() * verticalSq),
      };
    }
    this.position = foodPosition;
  }
  renderFood() {
    board.renderSquare(this.position.x, this.position.y, this.color);
  }
}

class Player {
  constructor() {
    this.score = 0;
    this.highScore = this.getHighscore();
  }
  //Sets highscore of the player in the local storage
  setHighscore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("Snake_Highscore", this.highScore);
    }
  }
  //Get highscore from local storage
  getHighscore() {
    let data = localStorage.getItem("Snake_Highscore");
    if (!data) {
      return 0;
    }
    let highScore = JSON.parse(data);
    return highScore;
  }
}
//Variables:
let boardColor = "#97be5a";
let board = new Board("#97be5a");
let snake = new Snake("black");
let food = new Food("red");
let player = new Player();
let gameStarted = false;
let gameLoop;

const squareSize = 20;
const fps = 1000 / 12; //Frames per second ( how many frames will be rendered on each interval)
const horizontalSq = canvas.width / squareSize; //how many squares we have in horizontal axis
const verticalSq = canvas.height / squareSize; //how many squares we have in vertical axis
const initialSnakeLength = snake.position.length; //initial length of the snake

//Functions:

const renderScore = () => {
  let highScore = player.highScore;
  highScore = highScore > 0 ? highScore : 0;
  scoreEl.innerHTML = `Score: ${player.score}`;
  highScoreEl.innerHTML = `Highscore: ${highScore}`;
};
//Function frame represents a single image of the game
const frame = () => {
  board.renderBoard();
  food.renderFood();
  snake.moveSnake();
  snake.renderSnake();
  renderScore();

  //If snake hit a well or hit itself stop the game:
  if (snake.hitItself() || snake.wallCollison()) {
    clearInterval(gameLoop);
    gameOver();
  }
};
const gameOver = () => {
  //Show the game over screen
  gameOverScreen.classList.remove("hide");
  //Play the game over sound
  gameOverSound.play();
  //Selecting the game over scores:
  const scoreEl = document.querySelector("#current-score");
  const highScoreEl = document.querySelector("#high");
  scoreEl.innerHTML = `Score: ${player.score}`;
  let highScore = player.highScore;
  highScoreEl.innerHTML = `Highscore: ${highScore}`;
  player.setHighscore();
};
//restartGame resets all the game's variables and hides the game over screen
const restartGame = () => {
  gameOverScreen.classList.add("hide");
  //reset player's scores:
  player.score = 0;
  //Rest the snake's position:
  snake.position = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ];
  //reset current direction:
  snake.currentDirection = "";
  //Empty directions queue:
  snake.directionsQueue = [];
  //Reset if game started
  gameStarted = false;
  //Create new food
  food.generateFood();
  //Show food on the screen
  food.renderFood();
  //Render everything:
  frame();
};

//Event listener to keyup event:
document.addEventListener("keyup", snake.setDirection.bind(snake)); //binding the this keyword to snake because the this keyword in event handlers points to the element that cause the event
playAgainBtn.addEventListener("click", restartGame);
food.generateFood();
frame();
