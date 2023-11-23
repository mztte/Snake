//author matt briggs

//variables
//number of grid boxes, changes CSS accordingly (when start button is clicked)
let width = height = 11; //only reason I used two variables here is to mess around, they will act as one in the actual game
let rt = document.querySelector(':root');

//dimensions of each individual grid box, changes CSS accordingly (when start button is clicked)
let gridBoxSize = "50px";
let gameBoard = document.getElementById("game-board");

//game mechanics related variables
let apple;
let score = 0;
let gameSpeed = 200; //game speed in miliseconds
let showGrid; //boolean
let winCondition; //# of score to win

//local storage variables (mainly statistics)
let highScore = {"11": 0, "13": 0, "15": 0, "17": 0, "19": 0, "21": 0}; //[dimension][highScore]
let gamesPlayed = 0;
let totalScore = 0;
let gamesWon = 0;
let purse = 0;

//colors are cool, anyways here is where they are initialized
//the colors being made with rgb values and formatted with spaces after each comma is VERY important --> the code will not work otherwise
let appleClr = "rgb(255, 0, 0)"; //apple color is used in js not css
let snakeClr = "rgb(50, 50, 50)";
rt.style.setProperty('--snake-clr', snakeClr);
let borderClr = "rgb(0, 0, 0)";
rt.style.setProperty('--border-clr', borderClr);
let bgClr = "rgb(255, 255, 255)"; 
rt.style.setProperty('--bg-clr', bgClr);
//snake related variables
let snake;
let tail = [];
let tailLength = 2;
let keyPress = 'w'; //start by going up (i dont know why, just is the best starting direction)

applyStats();
setStats();
//game loop 
document.getElementById('start-btn').onclick = () => {
    applyCosmetics();
    gamesPlayed++;
    //get user input
    let gridSize = document.getElementById('grid-size').value;
    let speed = document.getElementById('speed').value;
    showGrid = document.getElementById('show-grid');

    //get grid size selection as an n x n
    width = height = Number(gridSize);
    //make grid box size based off of the width = height selected 
    gridBoxSize = `${1/(width+4)*100}vh`;
    // establish win condition
    winCondition = width*height - 4*height - 4*width;
    document.getElementById('win-condition').innerText = winCondition;
    //get game speed selection
    if(speed == 'Slow') {
        gameSpeed = 350;
    } else if (speed == 'Normal') {
        gameSpeed = 200;
    } else if (speed == 'Fast') {
        gameSpeed = 150;
    } else if(speed == 'Faster') {
        gameSpeed = 100;
    } else if(speed == 'Impossible') {
        gameSpeed = 50;
    }
    
    //establish variables based off user input
    rt.style.setProperty('--grid-width', width);
    rt.style.setProperty('--grid-height', height);
    rt.style.setProperty('--box-size', gridBoxSize);

    //log what is chosen by the user
    console.log("Starting Game");
    console.log("Game Speed: " + gameSpeed);
    console.log("Grid Size: " + width + " x " + height);
    console.log("Grid: " + showGrid.checked);
    //create board and game loop
    createBoard(); 
    interval = setInterval(gameLoop, gameSpeed);
    //hide the menu
    document.getElementById('menu').style.display = "none";
}

function createBoard() {
    //create starting snake position (+1 because it starts out with the 'w' key being pressed)
    snake = [Math.ceil(width/2)+1, Math.ceil(height/2)]
    //creates the board by for each row it makes all of the columns across
    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            let element = document.createElement("div");
            element.setAttribute('class', 'box');
            element.setAttribute('id', `box${i+1}-${j+1}`);
            element.style.backgroundColor = bgClr;
            // element.innerText = `${i+1}-${j+1}`; //this is used when testing to see the id of the box
            document.getElementById("game-board").appendChild(element);
        }
    }
    //get whether or not to show the grid
    if(showGrid.checked == false) {
        for(let i = 0; i < document.getElementsByClassName('box').length; i++) {
            document.getElementsByClassName('box')[i].style.border = "none";
        }
    }
    //start by creating a new apple
    newApple();
}
//clears the board by reloading the window (absolutely genius ik)
function reloadGame() {
    //100ms delay makes the reload function more reliable, sometimes with no delay it doesn't work
    setTimeout( () => {
        window.location.reload();
    }, 100);
}
//store each keypress
document.onkeydown = e => {
    if(e.key =='w' || e.key =='a' || e.key =='s' || e.key == 'd') {
        if(checkIllegalMovement(e.key)) {
            keyPress = e.key;
        }
    }
}
//the snake cannot go backwards into itself, this checks that it doesnt
//returns true if there is NOT an illegal movement
function checkIllegalMovement(key) {
    //keyPress variable is the previous key, key parameter is the attempted key
    switch(keyPress) {
        case 'w':
            if(key == 's') {
                return false;
            }
            break;
        case 'a':
            if(key == 'd') {
                return false;
            }
            break;
        case 's':
            if(key == 'w') {
                return false;
            }
            break;
        case 'd':
            if(key == 'a') {
                return false;
            }
            break;
    }
    return true;
} 
//gameLoop, loop update speed dependent on the interval
function gameLoop() {
    //DONT USE tail.push(snake) it will change every value as the snake moves
    tail.push([snake[0], snake[1]]);
    //tail isnt actually calculating the tail, instead a 'white tail' is following the snake
    if(tail.length+1 > tailLength) {
        let whiteTail = tail.shift();
        document.getElementById(`box${whiteTail[0]}-${whiteTail[1]}`).style.backgroundColor = bgClr;
    }
    
    //movement
    if(keyPress == 'w') {
        snake[0] -= 1;
    } else if(keyPress =='s') {
        snake[0] += 1;
    } else if(keyPress == 'a') {
        snake[1] -= 1;
    } else if(keyPress == 'd') {
        snake[1] += 1;
    }
    
    //color in the snake, if the snake values are invalid catch the error and gameOver since they must be out of bounds in order for an error to occur (error = the box id doesn't exist)
    try{
        //if snake head goes onto a dark square before it is made dark (by next block of code), then it must be on its tail, thus game over. Don't you love sequential programming?
        if(window.getComputedStyle( document.getElementById(`box${snake[0]}-${snake[1]}`), null).getPropertyValue('background-color') == snakeClr) {
            gameOver("You ran into yourself!");
        }
        document.getElementById(`box${snake[0]}-${snake[1]}`).style.backgroundColor = snakeClr;
    } catch(e) {
        gameOver("You hit a wall!");
    }
    //check if apple secured
    if((snake[0] == apple[0]) && (snake[1] == apple[1])) {
        score++;
        totalScore++;
        purse++;
        if(score > highScore[width.toString()]) {
            highScore[width.toString()] = score;
        }
        document.getElementById('score').innerText = score;
        newApple();
        if(score >= winCondition) {
            gameWon();
        }
    }
    
}
function newApple() {
    tailLength++;
    apple = [Math.ceil(Math.random()*width), Math.ceil(Math.random()*height)];

    //make sure that its going on a square that has the background color (elsewise it must be an apple or part of the snake)
    while( !(window.getComputedStyle( document.getElementById(`box${apple[0]}-${apple[1]}`), null).getPropertyValue('background-color') == bgClr) ) {
        apple = [Math.ceil(Math.random()*width), Math.ceil(Math.random()*height)];
        console.log("Apple prevented from going into an illegal spot");
    }
    document.getElementById(`box${apple[0]}-${apple[1]}`).style.backgroundColor = appleClr;
    console.log(`Apple Placed At ${apple[0]}-${apple[1]}`)
}
//game over function, uses an alert and stops the interval
function gameOver(reason) {
    setStats();
    alert("Game Over\n" + reason);
    clearInterval(interval);
    document.getElementById('new-game-btn').style.display = "block";
}
//gameWon, just alerts the user that they have won but can keep going
function gameWon() {
    setStats();
    gamesWon++;
    alert("You Won! \nPress OK to continue");
}
//new game button will start a new game
document.getElementById('new-game-btn').onclick = () => {
    reloadGame();
};

//shop functions
function applyCosmetics() {
    
    //applies color theme
    if(document.getElementById('theme1').checked) { //default theme
        console.log('Default theme selected');
        appleClr = "rgb(255, 0, 0)";
        snakeClr = "rgb(50, 50, 50)";
        borderClr = "rgb(0, 0, 0)";
        bgClr = "rgb(255, 255, 255)"; 
        
    }
    if(document.getElementById('theme2').checked) {
        console.log('Ocean theme selected')
        appleClr = "rgb(255, 0, 0)";
        snakeClr = "rgb(96, 220, 103)";
        borderClr = "rgb(18, 150, 122)";
        bgClr = "rgb(0, 45, 121)"; 
    }
    if(document.getElementById('theme3').checked) {
        console.log('Techno theme selected')
        appleClr = "rgb(255, 0, 0)";
        snakeClr = "rgb(57, 255, 19)";
        borderClr = "rgb(30, 90, 33)";
        bgClr = "rgb(1, 11, 18)"; 
    }
    if(document.getElementById('theme4').checked) {
        console.log('Redland theme selected')
        appleClr = "rgb(214, 0, 0)";
        snakeClr = "rgb(225, 215, 77)";
        borderClr = "rgb(120, 0, 0)";
        bgClr = "rgb(13, 0, 0)"; 
    }
    rt.style.setProperty('--snake-clr', snakeClr);
    rt.style.setProperty('--border-clr', borderClr);
    rt.style.setProperty('--bg-clr', bgClr);
}
//clears the local storage
function removeLocalStorage() {
    localStorage.clear();
}
document.getElementById('delete-stats').onclick = () => {
    removeLocalStorage();
}
function setStats() {
    
    localStorage.setItem("purse", purse);
    localStorage.setItem("highScore", JSON.stringify(highScore));
    localStorage.setItem("gamesPlayed", gamesPlayed);
    localStorage.setItem("totalScore", totalScore);
    localStorage.setItem("gamesWon", gamesWon);


    document.getElementById('coins').innerText = purse;
    document.getElementById('high-score').innerText = highScore[document.getElementById('high-score-grid').value];
    document.getElementById('total-games').innerText = gamesPlayed;
    document.getElementById('total-score').innerText = totalScore;
    document.getElementById('games-won').innerText = gamesWon;
}
//copy paste of if the local storage doesnt exist, then make it, if it does, then get it and set it to its corresponding variable
function applyStats() {
    if(localStorage.getItem("purse")) {
        purse = localStorage.getItem("purse");
    } else {
        localStorage.setItem("purse", purse);
        console.log("purse initialized to 0");
    }
    if( (JSON.parse(localStorage.getItem("highScore")) != null)) {
        highScore = JSON.parse(localStorage.getItem("highScore"));
    } else { 
        localStorage.setItem("highScore", JSON.stringify(highScore));
        console.log("high score values initialized to 0");
    }
    if(localStorage.getItem("gamesPlayed")) {
        gamesPlayed = localStorage.getItem("gamesPlayed");
    } else {
        localStorage.setItem("gamesPlayed", gamesPlayed);
        console.log("games played initialized to 0");
    }
    if(localStorage.getItem("totalScore")) {
        totalScore = localStorage.getItem("totalScore"); 
    } else {
        localStorage.setItem("totalScore", totalScore);
        console.log("total score intialized to 0");
    }
    if(localStorage.getItem("gamesWon")) {
        gamesWon = localStorage.getItem("gamesWon");
    } else {
        localStorage.setItem("gamesWon", gamesWon);
        console.log("games won initialized to 0");
    }
}
document.getElementById('high-score-grid').onchange = () => {
    document.getElementById('high-score').innerText = highScore[document.getElementById('high-score-grid').value];
}