const BG_COLOR = "#231f20";
const SNAKE1_COLOR = "#08f7ff";
const SNAKE2_COLOR = "#f21";
const FOOD_COLOR = "#b8fb3c";

const socket = io("https://still-spire-17070.herokuapp.com/");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("timer", handleTimer);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const gameCodeToggle = document.getElementById("gameCodeToggle");

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

let canvas, ctx;
let playerNumber;
let gameActive = false;

function newGame() {
  socket.emit("newGame");
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit("joinGame", code);
  gameCodeToggle.style.display = "none"; // to hide gamecode element on joining.
  init();
}

function init() {
  // to hide the initial screen.
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = canvas.height = 600;
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height); // x->The x-coordinate of the upper-left corner of the rectangle,y->The y-coordinate of the upper-left corner of the rectangle	width->The width of the rectangle, in pixels, height->The height of the rectangle, in pixels,

  document.addEventListener("keydown", keydown); // detects keypress and store the corresponding value to keydown.
  gameActive = true;
}

function keydown(e) {
  socket.emit("keydown", e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize; // 60px / 20square = 30px per square.

  ctx.fillStyle = FOOD_COLOR;
  ctx.fillRect(food.x * size, food.y * size, size, size); // to convert x or y in gamespace to pixel space by * with size;

  paintPlayer(state.players[0], size, SNAKE1_COLOR);
  paintPlayer(state.players[1], size, SNAKE2_COLOR);
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;

  ctx.fillStyle = color;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  console.log(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  if (data.winner === playerNumber) {
    swal({
      title: "You Win!!!",
      icon: "success",
      button: "Aww yess!",
    });
    reset();
  } else {
    swal({
      title: "You lose",
      icon: "error",
      button: "Not Again!",
    });
    reset();
  }
  gameActive = false;
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
  reset();
  swal({
    title: "Unknown game code!",
    icon: "warning",
    button: "Ok",
  });
}

function handleTooManyPlayers() {
  reset();
  swal({
    title: "This game is already in progress",
    icon: "warning",
    button: "Ok",
  });
}

// to reset the game.
function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  gameCodeDisplay.innerText = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}

function handleTimer() {
  swal("Your game starts in 3 2 1", {
    buttons: false,
    timer: 2800,
  });
}
