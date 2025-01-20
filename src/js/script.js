gridSize = 8;
numberBox = 2;

let gridMatrix = [];
for(i=0; i<gridSize; i++) {
    gridMatrix[i] = new Array(gridSize);
}

createTheGrid();

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        moveRobot(e.key);
    }
});


function createTheGrid() {
    const grid = document.getElementById("grid");

    for(i = 0; i < gridSize; i++) {
        for(j = 0; j < gridSize; j++) {
            let unit = document.createElement("div");
            unit.className = "grid-unit";
            unit.id = `unit-${i}-${j}`;
            grid.appendChild(unit);
        }
    }

    let robot = document.createElement("div");
    robot.className = "robot";
    robot.id = "robot";

    let firstUnit = document.getElementById("unit-0-0");
    firstUnit.appendChild(robot);
    gridMatrix[0][0] = robot.id;

    for(boxIndex = 0; boxIndex < numberBox; boxIndex ++) {
        let x;
        let y;
        let boxDirection;
        do  {
            x = Math.floor(Math.random() * gridSize);
            y = Math.floor(Math.random() * gridSize);

            boxDirection = Math.floor(Math.random() * 2);
        }
        while (
            (boxDirection === 0 && x >= gridSize-1) ||
            (boxDirection === 1 && y >= gridSize-1) ||
            gridMatrix[x][y] != undefined ||
            (boxDirection === 0 && gridMatrix[x+1][y] != undefined) ||
            (boxDirection === 1 && gridMatrix[x][y+1] != undefined)
        );

        // Adding the first part of the box
        let firstBox = document.createElement("div");
        firstBox.className = "box";
        firstBox.id = `box-${boxIndex}-0`;
        let firstBoxUnit = document.getElementById(`unit-${x}-${y}`);
        firstBoxUnit.appendChild(firstBox);
        gridMatrix[x][y] = firstBox.id;

        let secondBox = document.createElement("div");
        secondBox.className = "box";
        secondBox.id = `box-${boxIndex}-1`;
        let secondBoxUnit;

        // Adding the second part of the box when going down
        if (boxDirection === 0 && x < gridSize-1) {
            secondBoxUnit = document.getElementById(`unit-${x+1}-${y}`);
            gridMatrix[x+1][y] = secondBox.id;
        }
        // Adding the second part of the box when going left
        else {
            secondBoxUnit = document.getElementById(`unit-${x}-${y+1}`);
            gridMatrix[x][y+1] = secondBox.id;
        }
        secondBoxUnit.appendChild(secondBox);
    }
}

function haveElementPosition(id) {
    for(i = 0; i < gridSize; i++) {
        for(j = 0; j < gridSize; j++) {
            if (gridMatrix[i][j] === id) {
                return [i, j];
            }
        }
    }
}

function findNextUnit(xPosition, yPosition, direction, numberOfMove = 1) {
    x = xPosition;
    y = yPosition;
    if (direction == "ArrowUp") for (i=0; i<numberOfMove; i++) x--;
    else if (direction == "ArrowDown") for (i=0; i<numberOfMove; i++) x++;
    else if (direction == "ArrowRight") for (i=0; i<numberOfMove; i++) y++;
    else if (direction == "ArrowLeft") for (i=0; i<numberOfMove; i++) y--;

    return [x, y];
}

function boxesInSameDirection(firstBoxX, firstBoxY, secondBoxX, secondBoxY, direction) {
    if (direction == "ArrowUp" || direction == "ArrowDown") return firstBoxY === secondBoxY;
    else if (direction == "ArrowRight" || direction == "ArrowLeft") return firstBoxX === secondBoxX;
}

function widthPushedBoxes(robotXPosition, robotYPosition, robotDirection) {
    function pushedBoxes(boxNumber, xPosition, yPosition, direction) {
        [i, j] = findNextUnit(xPosition, yPosition, direction);
        if (gridMatrix[i] && gridMatrix[i][j] != undefined && gridMatrix[i][j].startsWith("box")) {
            boxNumber ++;

            let boxUnit = document.getElementById(`unit-${i}-${j}`).firstElementChild;
            let boxIndex = boxUnit.getAttribute('id').at(4);
            let boxHalfNumber = boxUnit.getAttribute('id').at(6) === "0" ? "1" : "0";
            let nextSecondBoxUnit = document.getElementById(`box-${boxIndex}-${boxHalfNumber}`);
            [secondBoxX, secondBoxY] = searchHalfBoxPosition(i, j, nextSecondBoxUnit);
            if (!boxesInSameDirection(i, j, secondBoxX, secondBoxY, direction)) {
                return Math.max(pushedBoxes(boxNumber, i, j, direction), pushedBoxes(boxNumber, secondBoxX, secondBoxY, direction));
            }
            else {
                return pushedBoxes(boxNumber, i, j, direction);
            }

        }
        else {
            return boxNumber;
        }
    }
    return pushedBoxes(0, robotXPosition, robotYPosition, robotDirection);
}

function checkEmptiness(xPosition, yPosition) {
    if (gridMatrix[xPosition][yPosition] === undefined) {
        return true;
    }
    return false;
}

function moveElement(element, position, nextPosition) {
    [previousX, previousY] = position;
    [nextX, nextY] = nextPosition;

    if (gridMatrix[previousX] !== undefined) {
        gridMatrix[previousX][previousY] = undefined;
    } else {
        console.error(`gridMatrix[${previousX}] is undefined! x=${previousX}, y=${previousY}`);
    }

    if (gridMatrix[nextX] !== undefined) {
        gridMatrix[nextX][nextY] = element.getAttribute("id");
    } else {
        console.error(`gridMatrix[${nextX}] is undefined! x=${nextX}, y=${nextY}`);
    }

    let newUnit = document.getElementById(`unit-${x}-${y}`);
    newUnit.appendChild(element);
}

function searchHalfBoxPosition(xPosition, yPosition, searchedBox) {
    if (xPosition > 0) {
        let unitUp = document.getElementById(`unit-${xPosition-1}-${yPosition}`);
        if (unitUp.contains(searchedBox)) return [xPosition-1, yPosition];
    }

    if (xPosition < gridSize-1) {
        let unitDown = document.getElementById(`unit-${xPosition+1}-${yPosition}`);
        if (unitDown.contains(searchedBox)) return [xPosition+1, yPosition];
    }

    if (yPosition < gridSize-1) {
        let unitRight = document.getElementById(`unit-${xPosition}-${yPosition+1}`);
        if (unitRight.contains(searchedBox)) return [xPosition, yPosition+1];
    }

    if (xPosition > 0) {
        let unitLeft = document.getElementById(`unit-${xPosition}-${yPosition-1}`);
        if (unitLeft.contains(searchedBox)) return [xPosition, yPosition-1];
    }
}

function pushBoxes(xPosition, yPosition, direction, numberPushedBoxes) {
    for (box = numberPushedBoxes; box > 0; box--) {
        let [x, y] = findNextUnit(xPosition, yPosition, direction, box);
        let [i, j] = findNextUnit(xPosition, yPosition, direction, box-1);
        if (!checkEmptiness(x, y)) {
            // Move the first half box
            let boxUnit = document.getElementById(`unit-${x}-${y}`).firstElementChild;
            nextPosition = findNextUnit(x, y, direction);
            moveElement(boxUnit, [x, y], nextPosition);

            // Search for the second half of the box
            let boxIndex = boxUnit.getAttribute('id').at(4);
            let boxHalfNumber = boxUnit.getAttribute('id').at(6) === "0" ? "1" : "0";
            let nextSecondBoxUnit = document.getElementById(`box-${boxIndex}-${boxHalfNumber}`);
            let [secondBoxX, secondBoxY] = searchHalfBoxPosition(x, y, nextSecondBoxUnit);

            // Move boxes pushed by the half box
            numberPushedBoxesBySecondBox = widthPushedBoxes(secondBoxX, secondBoxY, direction);
            pushBoxes(secondBoxX, secondBoxY, direction, numberPushedBoxesBySecondBox);

            // Move the second half of the box
            moveElement(nextSecondBoxUnit, [secondBoxX, secondBoxY], findNextUnit(secondBoxX, secondBoxY, direction));
        }
    }
}

function isGoingOut(xPosition, yPosition, robotDirection, widthPushedBox) {
    if (robotDirection == "ArrowUp") return xPosition-widthPushedBox-1 < 0;
    else if (robotDirection == "ArrowDown") return xPosition+widthPushedBox+1 >= gridSize;
    else if (robotDirection == "ArrowRight") return yPosition+widthPushedBox+1 >= gridSize;
    else if (robotDirection == "ArrowLeft") return yPosition-widthPushedBox-1 < 0;
}

function moveRobot(direction) {
    [xPosition, yPosition] = haveElementPosition("robot");

    numberPushedBoxes = widthPushedBoxes(xPosition, yPosition, direction);
    if (!isGoingOut(xPosition, yPosition, direction, numberPushedBoxes)) {
        pushBoxes(xPosition, yPosition, direction, numberPushedBoxes);

        [x, y] = findNextUnit(xPosition, yPosition, direction);
        let robot = document.getElementById("robot");
        moveElement(robot, [xPosition, yPosition], [x, y])
    }
    else {
        console.log("Action stopped: going outside.")
    }
}

