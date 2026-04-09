username = sessionStorage.getItem("loggedInUser");

username_header = document.getElementById("username_text");
score_text = document.querySelector(".score");


let user_stored = JSON.parse(localStorage.getItem(username));

username_header.textContent = username;

if (username != "Guest"){
    highscore_text = document.querySelector("#highscore");
    highscore_text.textContent = "Highscore: " + user_stored.Highscore;
}


let board_grid = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
];

let score = 0;

window.addEventListener("load", (event) =>{

    for(row=0; row<4; row++){
        for(column=0; column<4; column++){
            let board = document.getElementById("board");
            let div = document.createElement('div');
            let tile_class = row + '-' + column;

            div.classList.add("tile", tile_class);
            board.appendChild(div);
        }
    }
})

function getile(row, column){
    tile = board
}

function generatefirst(){
    randrow = Math.floor(Math.random() * 4);
    randcol = Math.floor(Math.random() * 4);

    board_grid[randrow][randcol] = 2;
    
}

function isopen(){
    open = false;
    for(row=0; row<4; row++){
        for(column=0; column<4; column++){ 
            if (board_grid[row][column] == 0){
                open = true;
            }
        }
    }

    if (!open){
        endgame()
    }
    return open
}



function endgame(){
    null
}