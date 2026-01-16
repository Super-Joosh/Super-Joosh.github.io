document.addEventListener("DOMContentLoaded", () => {
    /*this line "listens" for an event before any of the code 
    within it runs; the event waits until the HTML document fully loads
    */

    /*the document.querySelector is a built-in JS method
    that uses the document object to access elements within 
    the html document it's linked to. In this case, the method is used
    to access the class "grid". specifically for document.querySelector, 
    the method will search the javascript document for the first instance 
    of an element that matches the identifier, which works in this case since 
    there is only one grid element*/

    const grid = document.querySelector(".grid");

    /* the following declaration of "squares" uses a similar method 
    to the previous document.querySelector; however, that method only
    returns the first element in the HTML document to match the selector.
    Since we want all the div elements in the grid class, we have to use 
    the document.querySelectorAll. We also convert each of those div elements
    into an array in order to store the game's grid in a way we can easily 
    manipulate and keep track of with JavaScript*/

    let squares = Array.from(document.querySelectorAll(".grid div"));

    //accessing the score and button id defined in the html file with the same method

    const scoreDisplay = document.querySelector("#score");
    const startButton = document.querySelector("#start-button");
    const width = 10;
    let timerId = null;
    let score = 0;
    let speed = 1000
    const colours = [
        "orange", 
        "rgb(0, 231, 0)", 
        "rgb(201, 25, 236)", 
        "yellow", 
        "rgb(62, 216, 255)", 
        "rgb(21, 34, 221)", 
        "red" 
    ]

    /*the tetrominoes, stored in arrays for their four rotations 
    and defined using the grid system used for the game view; top left
    starts at 0, then increases going right, then continues on the row 
    below from the left. each nested array is one tetromino rotation, 
    and each element of the nested array represents a 
    tile taken up by the tetromino in it's current rotation*/

    const lTetromino = [
        [1, 2, width + 1, width * 2 + 1], //rotation 1
        [width, width + 1, width + 2, width * 2 + 2], //rotation 2
        [1, width + 1, width * 2, width * 2 + 1], // rotation 3
        [width, width * 2, width * 2 + 1, width * 2 + 2] // rotation 4

        /*width is used because we're working relative to position 0, the 
        top left tile. By multiplying width, we can access the lower 
        rows while still technically allowing the width of the grid to 
        change in the future without distorting the tiles*/
    ];
    const zTetromino = [
        [width + 1, width + 2, width * 2, width * 2 + 1], 
        [0, width, width + 1, width * 2 + 1], 
        [width + 1, width + 2, width * 2, width * 2 + 1], 
        [0, width, width + 1, width * 2 + 1], 
    ];
    const tTetromino = [
        [1, width, width + 1, width + 2], 
        [1, width + 1, width + 2, width * 2 + 1], 
        [width, width + 1, width + 2, width * 2 + 1], 
        [1, width, width + 1, width * 2 + 1]
    ];
    const oTetromino = [
        [0, 1, width, width + 1], 
        [0, 1, width, width + 1], 
        [0, 1, width, width + 1], 
        [0, 1, width, width + 1], 
    ];
    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1], 
        [width, width + 1, width + 2, width + 3], 
        [1, width + 1, width * 2 + 1, width * 3 + 1], 
        [width, width + 1, width + 2, width + 3], 
    ];

    const l2Tetromino = [
        [0, 1, width + 1, width * 2 + 1], 
        [2, width, width + 1, width + 2], 
        [1, width + 1, width * 2 + 1, width * 2 + 2], 
        [0, 1, 2, width]
    ]

    const z2Tetromino = [
        [width, width + 1, width * 2 + 1, width * 2 + 2], 
        [1, width, width + 1, width * 2], 
        [width, width + 1, width * 2 + 1, width * 2 + 2], 
        [1, width, width + 1, width * 2]
    ]

    /*storing all the tetrominoes in one further array, so that we can 
    keep track of all of them to provide them all similar functionality */
    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, l2Tetromino, z2Tetromino];


    let currentPosition = 4;
    let currentRotation = 0;
    //let currentRotation = Math.round((Math.random() * 3) + 1);
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let nextRandom = Math.floor(Math.random() * theTetrominoes.length);

    /*this variable determines the current tetromino and its
    rotation used */
    let current = theTetrominoes[random][currentRotation];

    /*this function is used to draw the tetrominos on the grid using the 
    arrays we defined that contain the relative grid indexes of the tetrominoes.
    it uses the .forEach method, which is a built-in JavaScript method for arrays, 
    like push() and pop(), that accepts three arguments and essentially performs
    a specific funtion while iterating through each element of the array. the array 
    in question here is the "current" array, containing the information of one 
    specific tetromino. then, in the arrow function block, it identifies the 
    tiles that the tetromino occupies by adding the tetromino indexes to the current
    position, then giving those tetrominoes the class "tetromino" with the class.List.add
    method */
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add("tetromino");
            squares[currentPosition + index].style.backgroundColor = colours[random];
        })
    };

    /*the opposite of the previous function; erases the tetromino at the 
    given position */
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove("tetromino");
            squares[currentPosition + index].style.backgroundColor = "";
    })}
    /*main tetromino loop. causes tetromino to move down, checks for 
    collision, updates the frame, adds scores when rows are completed, 
    and checks for game overs.  */
    function moveDown() {
        if (!current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) {
            undraw();
            currentPosition += width;
            draw();
        } else {
            freeze();
        }
    }

    /*this function detects collision with the ground or other tetrominoes by 
    checking if any of the tetromino tiles (currentPosition + index) are 
    overlapping with any of the tiles in the grid array that has the class
    "taken". to do this, the function uses the current.some() method, that, 
    like the .forEach() method, iterates through each of the given list's items, 
    and if the function is evaluated to true on any of of true, the statement 
    as a whole will return true. */
    function freeze() {
        current.forEach(index => squares[currentPosition + index].classList.add("taken"));
        /*if there is a collision, the tetromino is given the class "taken" 
        to collide with other following tetrominoes, which are generated here, 
        where the new position and type are decided and drawn */
        currentPosition = 4;
        currentRotation = 0;
        //currentRotation = Math.round((Math.random() * 3) + 1);
        random = nextRandom;
        nextRandom = Math.floor(Math.random() * theTetrominoes.length);
        current = theTetrominoes[random][currentRotation];
        addScore();
        draw();
        displayShape();
        gameOver();
    }

    /*now getting into the gameplay, this function is run when you want to 
    move the tetromino left. it follows the same principles as the freeze() 
    script, using the .some() method to iterate through each of the tetromino's
    tiles at the hypothetical new position and checking if it can or can't move
    left */
    function moveLeft() {
        undraw();
        /*this line in particular checks if it's at the left edge by 
        checking the modulus of the the tetromino's poisition / 10, the 
        width, to see if it's 0. since the left edge tiles are multiples 
        of ten due to the structure of the grid, this is an easy way to check, 
        so we aren't able to move the tetromino outside of the grid, in which 
        case it would distort and partially wrap around */
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        const collideToLeft = current.some(index => squares[(currentPosition - 1) + index].classList.contains("taken"));
        if (!isAtLeftEdge && !collideToLeft) {
            currentPosition -= 1;
        }
        draw();
    } 

    /*this function allows tetrominoes to move right and uses the same logic
    as the moveLeft() function, utilizing the modulus operater
    and the fact that all tiles along the right edge have an identification 
    equal to multiples of 10, minus 1; 9, 19, 29, 39, etc.*/
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        const collideToRight = current.some(index => squares[(currentPosition + 1) + index].classList.contains("taken"));
        if (!isAtRightEdge && !collideToRight) {
            currentPosition += 1;
        }
        draw();
    }

    /*this function will run different input functions depending 
    on the keycode that it recieves from the event listener. all
    keys have their own unique "id" so we know what key is pressed*/
    function control(e) {
        if(e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 40) {
            moveDown(); 
        }
    }
    
    /*this code attaches an event listener to the html document, 
    listening for any time a key is pressed then lifted. it uses "keyup" 
    rather than "keydown" because keydown would rapidly fire the moment
    it is pressed, rather than just one input like we want.  */
    document.addEventListener("keyup", control);

    /*the rotation function that is called when the up arrow 
    is pressed; uses the increment function to increase the 
    currentRotation variable and an if statement to keep it 
    within a range of 0-4 */
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        draw();
    }
    

    /*similarly to with the main grid, here the document.querySelectorAll() 
    method is used so that we can access the mini-grid that houses the 
    upcoming tetrominoes*/
    const displaySquares = document.querySelectorAll(".mini-grid div");
    const displayWidth = 4;
    let displayIndex = 0;

    /*these nested arrays will tell the mini-grid how to display
    the upcoming tetrominoes. there are only the first rotations 
    of each since all tetrominoes spawn in at rotation 0 */
    const upNextTetrominoes = [
        [1, 2, displayWidth + 1, displayWidth * 2 + 1], //lTetromino
        [displayWidth + 1, displayWidth + 2, displayWidth * 2, displayWidth * 2 + 1], //zTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
        [0, 1, displayWidth, displayWidth + 1], //oTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],  //iTetromino
        [0, 1, displayWidth + 1, displayWidth * 2 + 1], //l2Tetromino
        [displayWidth, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2 + 2] //z2Tetromino
    ]

    /*this function displays the upcoming tetromino, defined as "nextRandom", 
    to the mini grid. first, it clears the entire mini grid of the tetromino
    class, essentially erasing it, then adds the class tetromino back in the 
    appropriate squares by using the .forEach() method, which enacts a function 
    on each item of an array; in this case, each tile the tetromino takes up, 
    which we defined in the array "upNextTetrominoes" */
    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove("tetromino");
            square.style.backgroundColor = "";
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add("tetromino");
            displaySquares[displayIndex + index].style.backgroundColor = colours[nextRandom];
        })
    }
    
    /*in this function, we add an event listener to the start button 
    element, which we retrieved from the html document with the 
    document.querySelector method. within the brackets, we define 
    two things: the event the button listens for and the function 
    enacted when it is activated.  */
    startButton.addEventListener("click", () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            /*this is the pause part, we can end the interval, 
            which is why we defined the interval with a variable 
            in the first place -- so we can pass it through the 
            clearInterval function*/
        } else {
            draw();
            timerId = setInterval(moveDown, speed);
              /*this is the start part. when pressed and the 
              timerId is equal to null, then we start the 
              setInterval, which calls the function every set 
              interval (in milliseconds). the variable speed decreases
              with each tetris (row cleared) which means that over time, 
              there will be less time between each function call, and the 
              game will speed up  */
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            displayShape();
            
        }
    })

    /*this function controls the score and is also responsible 
    for deleting completed rows from the grid, aka tetris' */
    function addScore() {
        /*this for loop iterates each row in the game grid, 
        starting at position 0, than 10, 20, 30, etc */
        for (let i = 0; i < 199; i += width) {
            /*since "i" is only defined as the left most
            edge of the row, this array defines the rest of the 
            row in relation to i */
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
            /*this if statement is asking whether or not the row completely 
            contains the class "taken". it does this by using the .every() 
            method, which returns true if every element in the array 
            satisfies the condition */
            if (row.every(index => squares[index].classList.contains("taken"))) {
                score += 10;
                speed -= 80;                
                scoreDisplay.innerHTML = score //the .innerHTML is used to alter html content
                row.forEach(index => {
                    /*here we remove the classes "taken" and "tetromino" 
                    from each tile in the row in the grid */
                    squares[index].classList.remove("taken");
                    squares[index].classList.remove("tetromino");
                    squares[index].style.backgroundColor = "";
                })
                /*lastly, splice() is used to remove the row completely, starting from 
                i with a range of width, aka 10. then, since splice returns the value 
                of those deleted elements, we add it to a variable, then use the 
                .concat() method which combines two arrays back to back. With this, 
                we reattach the deleted row to the start of the squares array, 
                meaning everything shifts down. lastly, we use the .appendChild() 
                method to actaully add the tiles to the grid, which is essentially 
                the same as adding elements to the grid array */
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    /*this is the game over script. it clears the timerId and ends the game 
    if the current tetromino is overlapping with a taken tile, which would only 
    occur if a tetromino stacked up to where the tetromino spawns in */
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
            scoreDisplay.innerHTML = score + " - Game Over";
            clearInterval(timerId);
        }
    }


})