/* Settings */
    //colors
    let defaultColor = 'lightblue';
    let startColor = 'dodgerblue';
    let color = startColor;
    let wallColor = 'tomato';
    let goalColor = 'yellow';
    let pathColor = 'slateblue';
    let recursedPathColor = 'pink';
    let objectType = [startColor, wallColor, goalColor];

    //current color selection
    function setColor(c) {
      color = objectType[c];
    }

    //pathfinding settings
    let algorithmType = 0;
    let stopped = false;
    let speed = getSpeed();

    //current color selection
    function setAlgorithm(c) {
      algorithmType = c;
    }

    function runAlgorithm() {
      switch (algorithmType) {
        case 0:
          depthFirstSearch();
          break;
        case 1:
          breathFirstSearch();
          break;
      }
    }


    /* UI setup */

    //grid initialisation
    const gridContainer = document.getElementById('grid-container');
    const size = 15
    const grid = new Array(size);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = new Array(size);
    }

    //creates cell
    function createGridItem() {
      const gridItem = document.createElement('div');
      gridItem.className = 'grid-item';
      //set cell to default color
      gridItem.style.backgroundColor = defaultColor;
      //toggles sets or resets color depending on color button clicked
      gridItem.addEventListener('click', () => {
        if (gridItem.style.backgroundColor != defaultColor) {
          gridItem.style.backgroundColor = defaultColor;
        }
        else {
          gridItem.style.backgroundColor = color;
        }
      })
      return gridItem;
    }

    //creates Grid
    function populateGrid(grid) {
      // Populate the grid initially
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
          grid[i][j] = createGridItem();
          gridContainer.appendChild(grid[i][j]);
        }
      }
    }

    function fullReset() {
      stopped = true;
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
          //set maze color to default
          grid[i][j].style.backgroundColor = defaultColor;
        }
      }
    }

    function pathReset() {
      stopped = true;
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
          //set maze color to default
          let color = grid[i][j].style.backgroundColor;
          if (color == pathColor || color == recursedPathColor) {
            grid[i][j].style.backgroundColor = defaultColor;
          }
        }
      }
    }

    function getSpeed() {
      return document.getElementById("speed").max - document.getElementById("speed").value;
    }

    // Initial population of the grid
    populateGrid(grid);



    /*search algorithms*/

    //0 = empty, 1 = start position, 2 = wall, 3 = goal

    const start = 1,
      wall = 2,
      goal = 3,
      visited = 4;


    //creates seperate matrix to perform search algorithms on
    /* 
      const matrix = new Array(size);
     for (let i = 0; i < matrix.length; i++) {
       matrix[i] = new Array(size);
     }
      */

    const possibleMoves = [
      {x: 0, y: -1},
      {x: -1, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 0},
    ];

    //convert current current grid display into uniform matrix format
    function convertGridToMatrix(matrix, grid) {
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
          //assigns numbers to the pathfinding matrix given the cell color
          switch (grid[i][j].style.backgroundColor) {
            case defaultColor:
              matrix[i][j] = 0;
              break;
            case startColor:
              matrix[i][j] = start;
              break;
            case wallColor:
              matrix[i][j] = wall;
              break;
            case goalColor:
              matrix[i][j] = goal;
              break;
          }
        }
      }
    }

    function findElementInMatrix(matrix, objectType) {
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
          if (matrix[i][j] == objectType) {
            return {x: j, y: i};
          }
        }
      }
    }

    async function depthFirstSearch() {
      //when algorithm is run, stopped is reset to false
      stopped = false;

      //creates seperate matrix to perform search algorithms on
      const matrix = new Array(size);
      for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(size);
      }

      convertGridToMatrix(matrix, grid);
      const startPosition = findElementInMatrix(matrix, start);
      //const goalPosition = findElementInMatrix(matrix, goal);
      const stack = []
      stack.push(startPosition);

      while (stack.length > 0) {
        const current = stack.pop();

        //check if goal is reached, maintains goal color 
        if (matrix[current.y][current.x] == goal) {
          break;
        }

        // keep start color visible and doesn't overwrite start color
        if (grid[current.y][current.x].style.backgroundColor != startColor) {
          //shows the current location otherwise
          grid[current.y][current.x].style.backgroundColor = recursedPathColor;
        }

        //get all possible moves
        for (let i = 0; i < possibleMoves.length; i++) {
          const newX = current.x + possibleMoves[i].x;
          const newY = current.y + possibleMoves[i].y;

          //bounds check
          if (newX > matrix[0].length - 1 || newX < 0) {
            continue;
          }
          if (newY > matrix.length - 1 || newY < 0) {
            continue;
          }

          //wallCheck
          if (matrix[newY][newX] == wall) {
            continue;
          }

          //visitedCheck
          if (matrix[newY][newX] == visited) {
            continue;
          }

          //all conditions are satisfied
          stack.push({x: newX, y: newY})
        }

        matrix[current.y][current.x] = visited;

        //update speed if required for dynamic update of speed
        speed = getSpeed();

        //timeout slows down algorithm so users can see it 
        await new Promise(r => setTimeout(r, speed));

        //checks to see if algorithm was aborted before proceeding with the next iteration
        if (stopped) {
          return;
        }

        /*renders path*/

        //doesn't overwrite start color
        if (grid[current.y][current.x].style.backgroundColor == startColor) {
          continue;
        }

        //overwrites all other cells
        grid[current.y][current.x].style.backgroundColor = pathColor;

      }
    }
    async function breathFirstSearch() {
      //when algorithm is run, stopped is reset to false
      stopped = false;

      //creates seperate matrix to perform search algorithms on
      const matrix = new Array(size);
      for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(size);
      }

      convertGridToMatrix(matrix, grid);
      const startPosition = findElementInMatrix(matrix, start);
      //const goalPosition = findElementInMatrix(matrix, goal);
      const stack = []
      stack.push(startPosition);

      while (stack.length > 0) {
        const current = stack.shift();

        //check if goal is reached, maintains goal color 
        if (grid[current.y][current.x].style.backgroundColor == goalColor) {
          break;
        }

        // keep start color visible and doesn't overwrite start color
        if (grid[current.y][current.x].style.backgroundColor != startColor) {
          //shows the current location otherwise
          grid[current.y][current.x].style.backgroundColor = recursedPathColor;
        }

        //get all possible moves
        for (let i = 0; i < possibleMoves.length; i++) {
          const newX = current.x + possibleMoves[i].x;
          const newY = current.y + possibleMoves[i].y;

          //bounds check
          if (newX > matrix[0].length - 1 || newX < 0) {
            continue;
          }
          if (newY > matrix.length - 1 || newY < 0) {
            continue;
          }

          //wallCheck
          if (matrix[newY][newX] == wall) {
            continue;
          }

          //visitedCheck
          if (matrix[newY][newX] == visited) {
            continue;
          }

          //all conditions are satisfied
          stack.push({x: newX, y: newY})
          matrix[newY][newX] = visited;
        }


        //update speed if required for dynamic update of speed
        speed = getSpeed();

        //timeout slows down algorithm so users can see it 
        await new Promise(r => setTimeout(r, speed));

        //checks to see if algorithm was aborted before proceeding with the next iteration
        if (stopped) {
          return;
        }

        /*renders path*/

        //doesn't overwrite start color
        if (grid[current.y][current.x].style.backgroundColor == startColor) {
          continue;
        }

        //overwrites all other cells
        grid[current.y][current.x].style.backgroundColor = pathColor;

      }
    }
