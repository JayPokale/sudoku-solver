const sudokuGrid = document.getElementById("sudokuGrid");

function cursorAtEnd(element) {
  const sel = window.getSelection();
  const textNode = element.firstChild;
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    sel.removeAllRanges();
    const range = document.createRange();
    range.setStart(textNode, 1);
    range.setEnd(textNode, 1);
    sel.addRange(range);
  }
}

// Create cells and gaps
function createCell(str) {
  const outer = document.createElement("div");
  sudokuGrid.appendChild(outer);

  const cell = document.createElement("div");
  cell.classList.add(str);
  outer.appendChild(cell);

  // If cell then add input functionality
  if (str === "cell") {
    cell.contentEditable = true;

    cell.addEventListener("input", function () {
      if (this.textContent.length > 1) {
        this.textContent = this.textContent.charAt(this.textContent.length - 1);
      }
      if (!/^[1-9]$/.test(this.textContent)) {
        this.textContent = "";
      }

      cursorAtEnd(this);

      if (cell.innerText) cell.classList.add("defaultcell");
      else cell.classList.remove("defaultcell");
    });
  }
}

// Create row including cell and gap
function createRow(str1, str2) {
  for (let i = 1; i <= 11; ++i) {
    createCell(i === 4 || i === 8 ? str2 : str1);
  }
}

// Create columns including rows and gap
for (let i = 1; i <= 11; ++i) {
  createRow(i === 4 || i === 8 ? "gap" : "cell", "gap");
}

const submitbtn = document.getElementById("submit");
const cells = document.getElementsByClassName("cell");
for (let i = 0; i < 81; i++) {
  cells[i].addEventListener("click", function () {
    focusCell(i);
  });
  cells[i].addEventListener("focus", function () {
    const cur = this;
    setTimeout(() => {
      cursorAtEnd(cur);
    }, 0);
  });
}
let activeCellIndex = -1;

function focusCell(index) {
  if (index === -1) index = 80;
  if (index === 81) index = 0;

  if (activeCellIndex >= 0 && activeCellIndex < 81) {
    cells[activeCellIndex].classList.remove("focused");
  }

  // if (index >= 0 && index < 81) {
  cells[index].focus();
  cells[index].classList.add("focused");
  activeCellIndex = index;
  // }
}
focusCell(0);

// Navigation by arrow keys
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "Tab":
      ++activeCellIndex;
      break;
    case "ArrowLeft":
      focusCell(activeCellIndex - 1);
      break;
    case "ArrowRight":
      focusCell(activeCellIndex + 1);
      break;
    case "ArrowUp":
      focusCell(activeCellIndex - 9);
      break;
    case "ArrowDown":
      focusCell(activeCellIndex + 9);
      break;
    default:
      break;
  }
});

// Onsubmit
submitbtn.addEventListener("click", function () {
  this.disabled = true;
  const grid = Array(9)
    .fill()
    .map(() => Array(9).fill(null));

  // Get all cells input
  let count = 0;
  for (let i = 0; i < 9; ++i) {
    for (let j = 0; j < 9; ++j) {
      if (cells[i * 9 + j].innerText) {
        grid[i][j] = +cells[i * 9 + j].innerText;
        ++count;
      }
    }
  }

  if (count < 17) {
    alert("No Solution");
    this.disabled = false;
    return;
  }
  const solution = solve(grid);
  if (solution) {
    for (let i = 0; i < 81; i++) {
      if (!cells[i].innerText) {
        cells[i].innerText = solution[Math.floor(i / 9)][i % 9];
      }
    }
  }

  this.disabled = false;
});

// This function will solve sudoku
function solve(grid) {
  const solution = [];

  // Check initial values
  for (let i = 0; i < 9; ++i) {
    for (let j = 0; j < 9; ++j) {
      if (!check(grid, i, j, grid[i][j])) {
        alert("No Solution");
        return null;
      }
    }
  }

  // Recursive function
  function dfs(cell) {
    if (cell === 81) {
      solution.push(grid.map((row) => [...row]));
      return;
    }
    if (solution.length > 1) return;

    const row = Math.floor(cell / 9);
    const col = cell % 9;

    if (grid[row][col]) {
      dfs(cell + 1);
      return;
    }

    for (let i = 1; i <= 9; ++i) {
      if (check(grid, row, col, i)) {
        grid[row][col] = i;
        dfs(cell + 1);
        grid[row][col] = null;
      }
    }
  }

  dfs(0);

  if (solution.length === 1) {
    return solution[0];
  } else {
    solution.length ? alert("Multiple Solutions") : alert("No Solution");
    return null;
  }
}

// Check if cur grid is possible
function check(grid, row, col, num) {
  for (let i = 0; i < 9; ++i) {
    // Check row
    if (grid[row][i] && grid[row][i] === num) {
      if (i !== col) return false;
    }
    // Check col
    if (grid[i][col] && grid[i][col] === num) {
      if (i !== row) return false;
    }
  }

  const arr = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];
  const gridRow = arr[Math.floor(row / 3)];
  const gridCol = arr[Math.floor(col / 3)];

  // Check 3 by 3 grid
  for (const i of gridRow) {
    for (const j of gridCol) {
      if (grid[i][j] && grid[i][j] === num) {
        if (i !== row || j !== col) return false;
      }
    }
  }
  return true;
}

// Clear all
const clearbtn = document.getElementById("clear");
clearbtn.addEventListener("click", function () {
  for (let i = 0; i < 81; i++) {
    cells[i].innerText = "";
    cells[i].classList.remove("defaultcell");
  }
});

const temp = [
  [null, null, null, 2, 6, null, 7, null, 1],
  [6, 8, null, null, 7, null, null, 9, null],
  [1, 9, null, null, null, 4, 5, null, null],
  [8, 2, null, 1, null, null, null, 4, null],
  [null, null, 4, 6, null, 2, 9, null, null],
  [null, 5, null, null, null, 3, null, 2, 8],
  [null, null, 9, 3, null, null, null, 7, 4],
  [null, 4, null, null, 5, null, null, 3, 6],
  [7, null, 3, null, 1, 8, null, null, null],
];

window.onload = () => {
  for (let i = 0; i < 9; ++i) {
    for (let j = 0; j < 9; ++j) {
      if (temp[i][j]) {
        cells[i * 9 + j].innerText = temp[i][j];
        cells[i * 9 + j].classList.add("defaultcell");
      }
    }
  }
};
