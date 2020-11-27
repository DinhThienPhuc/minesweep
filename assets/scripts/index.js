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

const createBox = (coordinate) => {
  return (
    `<div class="js-box-${coordinate} box">` +
    `<div class="js-layer-${coordinate} layer" data-flag=""></div>` +
    "</div>"
  );
};

const renderBoxes = (dom) => {
  const [rows, cols] = window.LEVEL.size;
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
  const [_, cols] = size;

  const minesCoordinates = mineNumbers.map((num) => {
    const r = Math.ceil(num / cols);
    const c = num % cols === 0 ? cols : num % cols;
    return `${r}-${c}`;
  });

  return minesCoordinates;
};

const renderMines = (mineCoordinates) => {
  mineCoordinates.map((coordinate) => {
    const boxDOM = document.querySelector(`.js-box-${coordinate}`);
    boxDOM.insertAdjacentHTML(
      "beforeend",
      `<img class="mine" src="assets/images/mine.png" alt="mine-${coordinate}" />`
    );
  });
};

const getBoxesCoordinateAround = (r, c) => {
  const [rows, cols] = window.LEVEL.size;
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

const countMineAround = (r, c) => {
  const boxesCoordinateAround = getBoxesCoordinateAround(r, c);
  let count = 0;

  boxesCoordinateAround.map((coordinate) => {
    const boxAroundDOM = document.querySelector(`.js-box-${coordinate}`);
    const hasMine = boxAroundDOM.querySelector(".mine");
    if (hasMine) {
      count += 1;
    }
  });

  return count;
};

const renderMineHintNumber = () => {
  const [rows, cols] = window.LEVEL.size;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const boxSelector = `.js-box-${r}-${c}`;
      const boxDOM = document.querySelector(boxSelector);
      const hasMine = boxDOM.querySelector(".mine");
      if (hasMine) {
        continue;
      }
      const count = countMineAround(r, c);
      if (count) {
        const boxDOM = document.querySelector(`.js-box-${r}-${c}`);
        boxDOM.insertAdjacentHTML(
          "beforeend",
          `<span class="box-text box-text-color-${count}">${count}</span>`
        );
      }
    }
  }
};

const checkVictory = () => {
  setTimeout(() => {
    const [rows, cols] = window.LEVEL.size;
    const uniqueNoMineBoxes = unique(window.NO_MINE_BOXES).length;
    if (uniqueNoMineBoxes === rows * cols - window.LEVEL.mines) {
      alert("Victory!");
      document.location.reload();
    }
  }, 300);
};

const renderAroundBoxes = (aroundBoxes) => {
  let hasMine = false;
  for (let i = 0, len = aroundBoxes.length; i < len; i++) {
    const coor = aroundBoxes[i];
    const box = document.querySelector(`.js-layer-${coor}`);
    if (!box.classList.contains("transparent")) {
      window.NO_MINE_BOXES.push(coor);
      box.classList.add("transparent");
      if (box.parentNode.querySelector(".mine")) {
        hasMine = true;
      }
    }
  }
  if (hasMine) {
    setTimeout(() => {
      alert("You lose!");
      window.NO_MINE_BOXES = null;
      document.location.reload();
    }, 200);
  }
  checkVictory();
};

const showFlagsCount = (flagsCount) => {
  document.querySelector(".js-flags-count").innerText = flagsCount;
};

const rightClick = (event, squareDOM) => {
  event.preventDefault();
  if (squareDOM.getAttribute("data-flag") === "flag") {
    squareDOM.setAttribute("data-flag", "");
    squareDOM.innerHTML = "";
    window.FLAGS_COUNT += 1;
  } else {
    squareDOM.setAttribute("data-flag", "flag");
    squareDOM.insertAdjacentHTML(
      "beforeend",
      `<img class="flag" src="assets/images/flag.svg" />`
    );
    window.FLAGS_COUNT -= 1;
  }
  showFlagsCount(window.FLAGS_COUNT);
  return false;
};

const handleDoubleClickOnBox = (event, boxDOM, squareDOM, row, col) => {
  event.preventDefault();
  const opennedBox = !!squareDOM.classList.contains("transparent");
  const boxTextDOM = boxDOM.querySelector(".box-text");
  if (opennedBox && boxTextDOM) {
    const minesCount = +boxTextDOM.innerText;
    const boxesCoordinateAround = getBoxesCoordinateAround(row, col);
    let newboxesCoordinateAround = [];
    let flagsCount = 0;
    for (let i = 0, len = boxesCoordinateAround.length; i < len; i++) {
      const coordinate = boxesCoordinateAround[i];
      aroundSquareDOM = document.querySelector(`.js-layer-${coordinate}`);
      if (aroundSquareDOM.getAttribute("data-flag") === "flag") {
        flagsCount += 1;
        newboxesCoordinateAround.push(coordinate);
      }
    }
    newboxesCoordinateAround = diff(
      boxesCoordinateAround,
      newboxesCoordinateAround
    );
    if (flagsCount && flagsCount === minesCount) {
      renderAroundBoxes(newboxesCoordinateAround);
    }
  }
};

const diff = (arr1, arr2) => arr1.filter((e) => !arr2.includes(e));

const unique = (arr) => [...new Set(arr)];

const getEmptyBoxes = (aroundBoxes) =>
  aroundBoxes.filter((coor) => {
    const boxDOM = document.querySelector(`.js-box-${coor}`);
    if (boxDOM.querySelectorAll(".box-text").length) {
      return false;
    } else {
      return true;
    }
  });

const spread = (r, c) => {
  let trackBoxes = [`${r}-${c}`];
  let result = [];
  let trackedBoxes = [];

  while (trackBoxes.length) {
    let temp = [];
    trackBoxes.map((coor) => {
      if (!trackedBoxes.includes(coor)) {
        const [r, c] = coor.split("-");
        const aroundBoxes = getBoxesCoordinateAround(+r, +c);
        const emptyBoxes = getEmptyBoxes(aroundBoxes);
        temp = [...temp, ...emptyBoxes];
        trackedBoxes.push(coor);
        result.push(coor);
        result = [...result, ...emptyBoxes];
      }
    });
    trackBoxes = diff(temp, trackedBoxes);
  }

  return unique(result);
};

const getEmptyBoxesBorders = (emptyBoxes) => {
  let temp = [];

  emptyBoxes.map((emptyBoxCoor) => {
    const [r, c] = emptyBoxCoor.split("-");
    const aroundBoxes = getBoxesCoordinateAround(+r, +c);
    temp = [...temp, ...aroundBoxes];
  });

  temp = unique(temp);

  return diff(temp, emptyBoxes);
};

const renderNoneMineBoxes = (noneMineBoxes) => {
  noneMineBoxes.map((coor) => {
    document.querySelector(`.js-layer-${coor}`).classList.add("transparent");
  });
  window.NO_MINE_BOXES = [...window.NO_MINE_BOXES, ...noneMineBoxes];
  checkVictory();
};

const handleClickOnBox = (boxDOM, squareDOM, r, c) => {
  const isFlaged = squareDOM.getAttribute("data-flag") === "flag";
  if (!isFlaged && !squareDOM.classList.contains("transparent")) {
    const hasMine = boxDOM.querySelector(".mine");
    const hasMineCountNumber = !!boxDOM.querySelectorAll(".box-text").length;
    squareDOM.classList.add("transparent");
    setTimeout(() => {
      if (hasMine) {
        alert("You lose!");
        window.NO_MINE_BOXES = null;
        document.location.reload();
      }
      if (hasMineCountNumber) {
        window.NO_MINE_BOXES.push(`${r}-${c}`);
        checkVictory();
      }
      if (!hasMine && !hasMineCountNumber) {
        const emptyBoxes = spread(r, c);
        const emptyBoxesBorders = getEmptyBoxesBorders(emptyBoxes);

        const noneMineBoxes = [...emptyBoxes, ...emptyBoxesBorders];
        renderNoneMineBoxes(noneMineBoxes);
      }
    }, 200);
  }
};

const addClickEvent = () => {
  const [rows, cols] = window.LEVEL.size;
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const boxSelector = `.js-box-${r}-${c}`;
      const squareSelector = `.js-layer-${r}-${c}`;
      const boxDOM = document.querySelector(boxSelector);
      const squareDOM = document.querySelector(squareSelector);
      if (!squareDOM) {
        continue;
      }
      boxDOM.addEventListener("contextmenu", (event) =>
        rightClick(event, squareDOM)
      );
      boxDOM.addEventListener("dblclick", (event) =>
        handleDoubleClickOnBox(event, boxDOM, squareDOM, r, c)
      );
      boxDOM.addEventListener("click", () =>
        handleClickOnBox(boxDOM, squareDOM, r, c)
      );
      // Using on mobile
      boxDOM.addEventListener("touchend", (event) => {
        rightClick(event, squareDOM);
      });
    }
  }
};

const createGame = (level) => {
  const mapDOM = document.querySelector(".js-map");

  if (mapDOM.innerHTML) {
    alert("Game created. Please continue the game or reload page to restart.");
    return;
  }

  window.NO_MINE_BOXES = [];
  window.LEVEL = LEVELS[level];
  window.FLAGS_COUNT = +LEVELS[level].mines;

  showFlagsCount(window.FLAGS_COUNT);

  renderBoxes(mapDOM, window.LEVEL.size);

  const mineNumbers = generateMineNumbers(LEVELS[level]);

  const mineCoordinates = convertToMinesCoordinate(
    mineNumbers,
    window.LEVEL.size
  );

  renderMines(mineCoordinates);

  renderMineHintNumber(window.LEVEL.size);

  addClickEvent(window.LEVEL.size);
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
  document
    .querySelector(".js-restart")
    .addEventListener("click", () => window.location.reload());
});
