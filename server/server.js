const io = require("socket.io")();
const { initGame, gameLoop, getUpdateVelocity } = require("./game");
const { FRAME_RATE } = require("./constant");
const { makeId } = require("./utils");

const state = {};
const clientRooms = {}; // a lookuptable to get the roomName of particular userId;

io.on("connection", (client) => {
  // getting key value from frontend
  client.on("keydown", handleKeydown);

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];

    if (!roomName) {
      return;
    }

    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.log(e);
      return;
    }

    const vel = getUpdateVelocity(keyCode);
    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }

  // handeling newGame and JoinGame request from client.
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  // by creating a newGame, it create a new socketio room(name of the room is the code, to enter the game).
  function handleNewGame() {
    let roomName = makeId("5"); // here 5 is the length of the id.
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
  }

  function handleJoinGame(gameCode) {
    const room = io.sockets.adapter.rooms[gameCode];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit("unknownGame");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = gameCode;

    client.join(gameCode);
    client.number = 2;
    client.emit("init", 2);

    startGameInterval(gameCode);
  }
});

function startGameInterval(roomName) {
  emitTimer(roomName, roomName);

  setTimeout(() => {
    // game will start 3 sec after player2 joins the game.
    const intervalId = setInterval(() => {
      const winner = gameLoop(state[roomName]);

      if (!winner) {
        emitGameState(roomName, state[roomName]);
      } else {
        emitGameOver(roomName, winner);
        state[roomName] = null;
        clearInterval(intervalId);
      }
    }, 1000 / FRAME_RATE);
  }, 3000);
}

function emitTimer(roomName, roomName) {
  io.sockets.in(roomName).emit("timer", roomName);
}

function emitGameState(roomName, state) {
  io.sockets.in(roomName).emit("gameState", JSON.stringify(state)); // socketio will emit to all clients in the roomName
}

function emitGameOver(roomName, winner) {
  io.sockets.in(roomName).emit("gameOver", JSON.stringify({ winner }));
}

io.listen(3000);
