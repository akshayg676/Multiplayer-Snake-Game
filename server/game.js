const { GRID_SIZE } = require("./constant");

module.exports = {
  initGame,
  gameLoop,
  getUpdateVelocity,
};

function initGame() {
  const state = createGameState();
  randomFood(state);
  return state;
}

function createGameState() {
  return {
    players: [
      {
        pos: {
          x: 3,
          y: 10,
        },
        vel: {
          x: 1,
          y: 0,
        },
        snake: [
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
        ],
      },
      {
        pos: {
          x: 10,
          y: 5,
        },
        vel: {
          x: -1,
          y: 0,
        },
        snake: [
          { x: 10, y: 5 },
          { x: 11, y: 5 },
          { x: 12, y: 5 },
        ],
      },
    ],
    food: {},
    gridsize: GRID_SIZE,
    active: true,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }
  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  // checking if player hit the edge of the canvas
  if (
    playerOne.pos.x < 0 ||
    playerOne.pos.x > GRID_SIZE ||
    playerOne.pos.y < 0 ||
    playerOne.pos.y > GRID_SIZE
  ) {
    return 2; // here player1 hit the edge of the canvas so player1 lost
  }
  if (
    playerTwo.pos.x < 0 ||
    playerTwo.pos.x > GRID_SIZE ||
    playerTwo.pos.y < 0 ||
    playerTwo.pos.y > GRID_SIZE
  ) {
    return 1; // here player2 hit the edge of the canvas so player1 lost
  }

  // check if snake eats the food
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    randomFood(state);
  }
  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    randomFood(state);
  }

  // if snake is moving
  if (playerOne.vel.x || playerOne.vel.y) {
    // check if snake had bumbed into itself
    for (let cell of playerOne.snake) {
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        // that means one of the cell in the body of the snake is overlapping with the head
        return 2; //player1 lost
      }
    }
    // to move all of the squares(snake's body) forward
    playerOne.snake.push({ ...playerOne.pos }); //adding pos element which results in increase in length.
    playerOne.snake.shift(); // removing one element to maintain the length.
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    // check if snake had bumbed into itself
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        // that means one of the cell in the body of the snake is overlapping with the head
        return 2; //player1 lost
      }
    }
    // to move all of the squares(snake's body) forward
    playerTwo.snake.push({ ...playerTwo.pos }); //adding pos element which results in increase in length.
    playerTwo.snake.shift(); // removing one element to maintain the length.
  }

  return false; // means player is still in the game and no winner yet.
}

//to place food randomly in the canvas
function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  // to check if the randomly placed food is on top of the snake , if yes then recursively call the function .
  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }
  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}

// snake movement
function getUpdateVelocity(keyCode) {
  switch (keyCode) {
    case 37: {
      //left
      return { x: -1, y: 0 };
    }
    case 38: {
      //up
      return { x: 0, y: -1 };
    }
    case 39: {
      //right
      return { x: 1, y: 0 };
    }
    case 40: {
      // down
      return { x: 0, y: 1 };
    }
  }
}
