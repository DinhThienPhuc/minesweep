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
  const [rows, cols] = size;

  const minesCoordinates = mineNumbers.map((num) => {
    const r = Math.ceil(num / cols);
    const c = num % cols === 0 ? cols : num % cols;
    return `${r}-${c}`;
  });

  return minesCoordinates;
};

const createBox = (coordinate) => {
  return (
    `<div class="js-box-${coordinate} box">` +
    `<img class="js-layer-${coordinate} layer transparent" src="images/square.png" alt="layer-${coordinate}"/>` +
    "</div>"
  );
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

const getBoxesCoordinateAround = ([rows, cols], r, c) => {
  const boxesCoordinateAround = [];
  if (r - 1 > 0 && c - 1 > 0) {
    boxesCoordinateAround.push(`${r - 1}-${c - 1}`);
  }
  if (r - 1 > 0) {
    boxesCoordinateAround.push(`${r - 1}-${c}`);
  }
  if (r - 1 > 0 && c + 1 <= cols) {
    boxesCoordinateAround.push(`${r - 1}-${c + 1}`);
  }
  if (c - 1 > 0) {
    boxesCoordinateAround.push(`${r}-${c - 1}`);
  }
  if (c + 1 <= cols) {
    boxesCoordinateAround.push(`${r}-${c + 1}`);
  }
  if (r + 1 <= rows && c - 1 > 0) {
    boxesCoordinateAround.push(`${r + 1}-${c - 1}`);
  }
  if (r + 1 <= rows) {
    boxesCoordinateAround.push(`${r + 1}-${c}`);
  }
  if (r + 1 <= rows && c + 1 <= cols) {
    boxesCoordinateAround.push(`${r + 1}-${c + 1}`);
  }
  return boxesCoordinateAround;
};

const countMineAround = ([rows, cols], row, col) => {
  const boxesCoordinateAround = getBoxesCoordinateAround(
    [rows, cols],
    row,
    col
  );
  let count = 0;

  boxesCoordinateAround.map((coordinate) => {
    const boxAroundDOM = document.querySelector(`.js-box-${coordinate}`);
    const hasMine = !!boxAroundDOM.querySelectorAll("img")[1];
    if (hasMine) {
      count += 1;
    }
  });
  if (count) {
    const boxDOM = document.querySelector(`.js-box-${row}-${col}`);
    boxDOM.innerText = count;
    boxDOM.classList.add(`box-color-${count}`);
  }
};

const renderMines = (mineCoordinates) => {
  mineCoordinates.map((coordinate) => {
    const boxDOM = document.querySelector(`.js-box-${coordinate}`);
    boxDOM.insertAdjacentHTML(
      "beforeend",
      `<img class="mine" src="images/mine.png" alt="mine-${coordinate}" />`
    );
  });
};

const renderMineHintNumber = ([rows, cols]) => {
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const boxSelector = `.js-box-${r}-${c}`;
      const boxDOM = document.querySelector(boxSelector);
      const hasMine = !!boxDOM.querySelectorAll("img")[1];
      if (hasMine) {
        continue;
      }
      countMineAround([rows, cols], r, c);
    }
  }
};

const addClickEvent = ([rows, cols]) => {
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const boxSelector = `.js-box-${r}-${c}`;
      const squareSelector = `.js-layer-${r}-${c}`;
      const boxDOM = document.querySelector(boxSelector);
      const squareDOM = document.querySelector(squareSelector);
      if (!squareDOM) {
        continue;
      }
      boxDOM.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        squareDOM.src = squareDOM.src.includes("flag")
          ? "images/square.png"
          : "images/square-flag.png";
        return false;
      });
      boxDOM.addEventListener("click", () => {
        const isFlaged = squareDOM.src.includes("flag");
        if (!isFlaged) {
          const hasMine = !!boxDOM.querySelectorAll("img")[1];
          squareDOM.classList.add("transparent");
          setTimeout(() => {
            if (hasMine) {
              alert("You lose!");
              document.querySelector(".js-map").innerHTML = "";
            }
          }, 200);
        }
      });
    }
  }
};

const createGame = (level) => {
  const mapDOM = document.querySelector(".js-map");

  if (mapDOM.innerHTML) {
    console.log("tạo lại game cái cu!");
    return;
  }

  renderBoxes(mapDOM, LEVELS[level].size);

  const mineNumbers = generateMineNumbers(LEVELS[level]);

  const mineCoordinates = convertToMinesCoordinate(
    mineNumbers,
    LEVELS[level].size
  );

  renderMines(mineCoordinates);

  renderMineHintNumber(LEVELS[level].size);

  addClickEvent(LEVELS[level].size);
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
