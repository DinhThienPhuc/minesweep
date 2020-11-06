const LEVELS = {
  beginner: {
    size: [8, 8],
    mines: 10,
  },
  intermediate: {
    size: [16, 16],
    mines: 40,
  },
  expert: {
    size: [16, 30],
    mines: 99,
  },
};

const generateMineNumbers = ({ size, mines }) => {
  const [rows, cols] = size;
  const lowerBound = 1;
  const upperBound = rows * cols;
  let mineNumbers = [];

  while (mineNumbers.length < mines) {
    const random_number = Math.floor(
      Math.random() * (upperBound - lowerBound) + lowerBound
    );
    if (!mineNumbers.includes(random_number)) {
      mineNumbers.push(random_number);
    }
  }

  return mineNumbers;
};

const convertToMinesCoordinate = (mineNumbers, size) => {
  const [rows, cols] = size; // 16 x 30: 16 rows, 30 columns
  let minesCoordinates = [];

  mineNumbers.map((num) => {
    const r = Math.ceil(num / rows);
    const c = num % cols === 0 ? rows : num % cols;
    minesCoordinates.push(`${r}-${c}`);
  });

  return minesCoordinates;
};

const createBox = (coordinate) => {
  return `<div class="js-box-${coordinate} box"></div>`;
};

const renderBoxes = (dom, [rows, cols]) => {
  let gameContentString = "";

  for (let r = 1; r <= rows; r++) {
    let gameContentRowStr = `<div class="js-row-${r} row">`;
    for (let c = 1; c <= cols; c++) {
      gameContentRowStr += createBox(`${r}-${c}`);
    }
    gameContentRowStr += "</div>";
    gameContentString += gameContentRowStr;
  }

  dom.innerHTML = gameContentString;
};

const renderMines = (dom, mineCoordinates) => {
  mineCoordinates.map((coordinate) => {
    const selector = `.js-box-${coordinate}`;
    document.querySelector(selector).innerHTML = "m";
  });
};

const createGame = (level) => {
  const gameDOM = document.querySelector(".js-map");

  if (gameDOM.innerHTML) {
    console.log("tạo lại game cái cu!");
    return;
  }

  renderBoxes(gameDOM, LEVELS[level].size);

  const mineNumbers = generateMineNumbers(LEVELS[level]);

  const mineCoordinates = convertToMinesCoordinate(
    mineNumbers,
    LEVELS[level].size
  );

  renderMines(gameDOM, mineCoordinates);
};

document.addEventListener("DOMContentLoaded", async () => {
  document
    .querySelector(".js-create-game-beginner")
    .addEventListener("click", () => createGame("beginner"));
  document
    .querySelector(".js-create-game-intermediate")
    .addEventListener("click", () => createGame("intermediate"));
  document
    .querySelector(".js-create-game-expert")
    .addEventListener("click", () => createGame("expert"));
});
