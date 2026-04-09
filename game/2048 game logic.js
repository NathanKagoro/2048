username = sessionStorage.getItem("loggedInUser");
highscores = JSON.parse(localStorage.getItem("Highscores"));
console.log(highscores)
console.log("open")

username_header = document.getElementById("username_text");
score_text = document.querySelector(".score");
score_text.textContent = "Score: 0";

let user_stored = JSON.parse(localStorage.getItem(username));

body = document.getElementsByTagName("body");
let board = document.getElementById("board");

if (username != "Guest"){
    username_header.textContent = username;
    highscore_text = document.querySelector("#highscore");
    highscore_text.textContent = "Highscore: " + user_stored.Highscore;
}


let board_grid = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
];

// Displays the current board grid in console
function display_board(){
    for(row=0; row<4; row++){
        console.log(board_grid[row]);
    }
    console.log("From board display")
}

let board_divs = [];
let board_div_system = ["0-0","0-1", "0-2", "0-3", 
                        "1-0","1-1", "1-2", "1-3", 
                        "2-0","2-1", "2-2", "2-3", 
                        "3-0","3-1", "3-2", "3-3"]

let score = 0;
let maxTile = parseInt(sessionStorage.getItem("maxTile")) || 2;

window.addEventListener("load", (event) =>{

    for(row=0; row<4; row++){
        for(column=0; column<4; column++){
            let div = document.createElement('div');

            div.setAttribute("id","tile");
            board.appendChild(div);
            board_divs.push(div);
        }
    }
    generatenum(2);
    generatenum(2);
})


window.addEventListener("keyup", (event) =>{
    switch(event.key){
        case "ArrowLeft":
            slideleft();
            break;
        case "ArrowUp":
            slideup();
            break;
        case "ArrowRight":
            slideright();
            break;
        case "ArrowDown":
            slidedown();
            break;
    }
});

// Adds a new tile with given number at random empty spot
function generatenum(num){

    randrow = Math.floor(Math.random() * 4);
    randcol = Math.floor(Math.random() * 4);

    if(isplayable){
        if(isfree(randrow, randcol)){
            board_grid[randrow][randcol] = num;
            if(num > maxTile) {
                maxTile = num;
                sessionStorage.setItem("maxTile", maxTile);
            }
        }
        else{
            generatenum(num);
        }
    
        let game_tile = getgametile(randrow, randcol);
        to_add(num, game_tile);
    }
}

// Generates tiles for medium difficulty with increasing challenge
function generatenum_medium(num){
    difficulty = 0;
    randnum = Math.random();
    randnum1 = Math.random();

    if(score > 64){difficulty = 0.2;}
    else if(score > 128){difficulty = 0.25;}
    else if(score > 256){difficulty = 0.3;}
    else if(score > 512){difficulty = 0.35;}
    else if(score > 1024){difficulty = 0.4;}
    else if(score > 2048){difficulty = 0.45;}
    if(randnum1 < difficulty){
        num = num * 2;
    }

    if(randnum < difficulty){
        generatenum(num);
        generatenum(num);
    }
    else{
        generatenum(num);
    }
}

function generatenum_hard(num){
    difficulty = 0.1;
    randnum = Math.random();
    randnum1 = Math.random();

    if(score > 64){difficulty = 0.2;}
    else if(score > 128){difficulty = 0.3;}
    else if(score > 256){difficulty = 0.4;}
    else if(score > 512){difficulty = 0.5;}
    else if(score > 1024){difficulty = 0.55;}
    else if(score > 2048){difficulty = 0.6;}
    if(randnum1 < difficulty){
        num = num * 2;
    }

    if(randnum < difficulty){
        generatenum(num);
        generatenum(num);
    }
    else{
        generatenum(num);
    }
}

// Gets the index of the tile div for given row and column
function getgametile(row, column){
    let row_string = row.toString();
    let col_String = column.toString();

    let board_tile_position = row_string + "-" + col_String;
    let game_tile_priv = board_div_system.indexOf(board_tile_position);
    return game_tile_priv;
}

// Updates the tile div with the number and styling
function to_add(num, game_tile){
    class_add = 'x' + num.toString();
    let board_tile =  board_divs[game_tile];
    board_tile.classList.remove(board_tile.classList.item(0));
    board_tile.classList.add(class_add);
    board_tile.innerHTML = num.toString();
}

function isfree(row, column){
    open = false;
    if(board_grid[row][column] == 0){
        open = true;
    }
    return open;
}

function isfreerow(row,column){
    open = false;
    if(row[column] == 0){
        open = true;
    }
    return open;
}

// Checks if there are any empty spaces on the board
function isopen(){
    open = false;

    for(row=0; row<4; row++){
        for(column=0; column<4; column++){ 
            if (board_grid[row][column] == 0 ){
                return open = true;
            }
        }
    }

    if (!open){
        endgame()
    }
    return open
}

function update_highscores(num){

    highscores_new = {
        "first_name": '',
        "first_points": '',

        "second_name": '',
        "second_points": '',

        "third_name": '',
        "third_points": '',

        "fourth_name": '',
        "fourth_points": '',

        "fifth_name": '',
        "fifth_points": ''
    }

    function first(){
        highscores_new.fifth_name = highscores.fourth_name;
        highscores_new.fifth_points = highscores.fourth_points;
 
        highscores_new.fourth_name = highscores.third_name;
        highscores_new.fourth_points = highscores.third_points;

        highscores_new.third_name = highscores.second_name;
        highscores_new.third_points = highscores.second_points;

        highscores_new.second_name = highscores.first_name;
        highscores_new.second_points = highscores.first_points;

        highscores_new.first_name = username;
        highscores_new.first_points = num;

        highscores_json = JSON.stringify(highscores_new);
        localStorage.setItem("Highscores", highscores_json)
        return 0;
    }

    function second(){
        highscores_new.fifth_name = highscores.fourth_name;
        highscores_new.fifth_points = highscores.fourth_points;


        
        highscores_new.fourth_name = highscores.third_name;
        highscores_new.fourth_points = highscores.third_points;


        highscores_new.third_name = highscores.second_name;
        highscores_new.third_points = highscores.second_points;


        
        highscores_new.second_name = username;
        highscores_new.second_points = num;

        highscores_json = JSON.stringify(highscores_new);
        localStorage.setItem("Highscores", highscores_json)
        return 0;
    }
    

    function third(){
        highscores_new.fifth_name = highscores.fourth_name;
        highscores_new.fifth_points = highscores.fourth_points;


        
        highscores_new.fourth_name = highscores.third_name;
        highscores_new.fourth_points = highscores.third_points;

        highscores_new.third_name = username;
        highscores_new.third_points = num;

        highscores_json = JSON.stringify(highscores_new);
        localStorage.setItem("Highscores", highscores_json)
        return 0;
    }

    function fourth(){
        highscores_new.fifth_name = highscores.fourth_name;
        highscores_new.fifth_points = highscores.fourth_points;

        highscores_new.fourth_name = username;
        highscores_new.fourth_points = num;

        highscores_json = JSON.stringify(highscores_new);
        localStorage.setItem("Highscores", highscores_json)
        return 0;
    }
    

    function fifth(){
        highscores_new.fifth_name = username;
        highscores_new.fifth_points = num;

        highscores_json = JSON.stringify(highscores_new);
        localStorage.setItem("Highscores", highscores_json)
        return 0;
    }

    if(num > highscores.first_points){
        first();
        return;
    }

    else if(num > highscores.seconod_points){
        second();
    }
    
    else if(num > highscores.third_points){
        third();
    }
         
    else if(num > highscores.fourth_points){
        fourth();
    }

    else if(num > highscores.fifth_points){
        fifth();
    }
    else{null}
}

// Ends the game and updates highscores
function endgame(){
    if(username != "Guest"){update_highscores(score);}
    board.innerHTML = "<span style= 'text-align:center;  background-color:white; color:red; font-size: 67px; font-family: 'Times New Roman', Times, serif;font-weight: bold;'><br>GAME OVER</span>";
    if(user_stored.Highscore < score){
        user_stored.Highscore = score;
        highscore_text.textContent = "Highscore: " + user_stored.Highscore;
        let user_json = JSON.stringify(user_stored);
        localStorage.setItem(username, user_json);
    }
}

function isplayable(){
    open = false;

    if(canslide("up") || canslide("down") || canslide("left") || canslide("right")){
        return open = true;
    }
    for(row=0; row<4; row++){
        for(column=0; column<4; column++){ 
            if (board_grid[row][column] == 0 ){
                return open = true;
            }
        }
    }

    if (!open){
        endgame()
    }
    return open
}

// Updates the displayed score based on board values
function update_score(){
    sum = -4;
    for(row=0; row<4; row++){
        for(column=0; column<4; column++){
            sum += board_grid[row][column]
        }
    }

    if(sum > 0){
        score_text.textContent = "Score: " + sum.toString();
        score = sum;
    }

}

function remove_zeros(grid){

    function isnotzero(value){
        return value != 0;
    }

    for(row=0; row < 4; row++){
        grid[row] = grid[row].filter(isnotzero);
    }
    return grid
}

function hor_to_vert(grid){
    let row = 3;
    let col = 0;
    let inverted_board_grid = [[],[],[],[]];
    while (col < 4){
        while(row > -1){
            inverted_board_grid[col].push(grid[row][col]);
            row = row - 1;
        }
    
        col += 1;
        row = 3;
    }

    return inverted_board_grid;    
}

function vert_to_hor(grid){
    let row = 3;
    let col = 3;
    let inverted_board_grid = [[],[],[],[]];
    let inverted_board_grid_final = [[],[],[],[]];


    while (col > -1){
        while(row > -1){
            inverted_board_grid[col].unshift(grid[row][col]);
            row = row - 1;
        }
    
        col -= 1;
        row = 3;
    }
    
    inverted_board_grid_final[0] = inverted_board_grid[3]
    inverted_board_grid_final[1] = inverted_board_grid[2]
    inverted_board_grid_final[2] = inverted_board_grid[1]
    inverted_board_grid_final[3] = inverted_board_grid[0]

    return inverted_board_grid_final;  
}

function add_zeros_left(grid){
    row = 0;
    while(row < 4){
        while(grid[row].length < 4){
            grid[row].push(0);
        }
        row +=1;
    }
    return grid;
    
}

function add_zeros_right(grid){ 
    row = 0;
    while(row < 4){
        while(grid[row].length < 4){
            grid[row].unshift(0);
        }
        row +=1;
    }
    return grid;
}

function add_zeros_up(grid){
    row = 0;
    while(row < 4){
        while(grid[row].length < 4){
            grid[row].unshift(0);
        }
        row +=1;
    }
    return grid;
    
}

function add_zeros_down(grid){
    row = 0;
    while(row < 4){
        while(grid[row].length < 4){
            grid[row].push(0);
        }
        row +=1;
    }
    return grid;
}

function clone(grid){
    cloned = [[],[],[],[]]
    for(row=0; row<4; row++){
        for(column=0; column<4; column++){
            cloned[row].push(grid[row][column])
        }
    }

    return cloned
}

function slideleft(){
    isplayable()
    if(canslide("left")){
        grid = clone(board_grid)
        grid = remove_zeros(board_grid);
        grid = merge_nums_left(grid);
        gird = add_zeros_left(grid);
        update_board(grid)
        if( sessionStorage.gamemode == "medium"){
            generatenum_medium(2)
        }
        else if( sessionStorage.gamemode == "hard"){
            generatenum_hard(2);
        }
        else{
            generatenum(2)
        }
        update_score();
    }
}

function slideright(){
    isplayable()
    if(canslide("right")){
        grid = clone(board_grid)
        grid = remove_zeros(grid);
        grid = merge_nums_right(grid);
        gird = add_zeros_right(grid);
        update_board(gird);
        if( sessionStorage.gamemode == "medium"){
            generatenum_medium(2)
        }
        else if( sessionStorage.gamemode == "hard"){
            generatenum_hard(2);
        }
        else{
            generatenum(2)
        }
        update_score();
    }
}

function slideup(){
    isplayable()
    if(canslide("up")){
        grid = clone(board_grid)
        grid = hor_to_vert(grid);
        grid = remove_zeros(grid)
        grid = merge_nums_right(grid)
        gird = add_zeros_right(grid);
        grid = vert_to_hor(grid);
    
        update_board(grid);
        if( sessionStorage.gamemode == "medium"){
            generatenum_medium(2)
        }
        else if( sessionStorage.gamemode == "hard"){
            generatenum_hard(2);
        }
        else{
            generatenum(2)
        }
        update_score();
    }
}

function slidedown(){
    isplayable();
    if(canslide("down")){
        grid = clone(board_grid)
        grid = hor_to_vert(grid);
        grid = remove_zeros(grid)
        grid = merge_nums_left(grid)
        gird = add_zeros_left(grid);
        grid = vert_to_hor(grid);
    
        update_board(grid);
        if( sessionStorage.gamemode == "medium"){
            generatenum_medium(2)
        }
        else if( sessionStorage.gamemode == "hard"){
            generatenum_hard(2);
        }
        else{
            generatenum(2)
        }
        update_score();
    }
}

function update_board(grid){
    for(row=0; row<4; row++){
        for(column=0; column<4; column++){
            game_tile = getgametile(row, column);
            board_grid[row][column] = grid[row][column];
            if (board_grid[row][column] != 0){
                to_add(board_grid[row][column], game_tile);
            }
            else{
                to_add("", game_tile);
            }
        }
    }
}

function merge_nums_left(grid1){
    grid = [[],[],[],[]];

    function sum(to_be_summed, to_be_moved){
        num = 0;
        while(num < to_be_summed.length){
            if(to_be_summed[num] == to_be_summed[num+1]){
                let newVal = to_be_summed[num]*2;
                to_be_moved.push(newVal);
                if(newVal > maxTile) {
                    maxTile = newVal;
                    sessionStorage.setItem("maxTile", maxTile);
                }
                to_be_summed[num+1] = 0;
                num += 1;
            }
            else{
                to_be_moved.push(to_be_summed[num]);
            }
            num += 1;
        }
    }

    for(row=0; row<4; row++){
        grid_row = grid1[row];
        sum(grid_row, grid[row]);
    }
    return grid;
}

function merge_nums_right(grid1){
    grid = [[],[],[],[]];

    function sum(to_be_summed, to_be_moved){
        num = 0;
        while(num < to_be_summed.length){
            if(to_be_summed[num] == to_be_summed[num+1]){
                let newVal = to_be_summed[num]*2;
                to_be_moved.push(newVal);
                if(newVal > maxTile) {
                    maxTile = newVal;
                    sessionStorage.setItem("maxTile", maxTile);
                }
                to_be_summed[num+1] = 0;
                num += 1;
            }
            else{
                to_be_moved.push(to_be_summed[num]);
            }
            num += 1;
        }
    }

    for(row=0; row<4; row++){
        grid_row = grid1[row];
        grid_row = grid_row.reverse();
        sum(grid_row, grid[row]);
        grid[row].reverse();
    }
    return grid;
}

function check_row_slide(row){
    check = false;
    for(col=0; col <3; col ++){
        if((row[col] != 0 && row[col+1] == 0) || row[col] != 0 && (row[col] == row[col+1]) ){
            check = true;
        }
    }
    return check;
}

function canslide(direction){
    grid = clone(board_grid)
    if(isopen()){
        if(direction == "up"){
            grid = hor_to_vert(grid, "can up")
            for(row=0;row < 4; row++){
                test = grid[row];
                if(check_row_slide(test)){
                    return can = true;
                }
            }
        }
        else if(direction == "down"){
            grid = hor_to_vert(grid, "can up")
            for(row=0;row < 4; row++){
                test = grid[row].reverse();
                if(check_row_slide(test)){
                    return can = true;
                }
            }
        }
        else if(direction == "right"){
            for(row=0;row < 4; row++){
                test = grid[row];
                if(check_row_slide(test)){
                    return can = true;
                }
            }
        }
        else if(direction == "left"){
            for(row=0;row < 4; row++){
                test = grid[row].reverse();
                if(check_row_slide(test)){
                    return can = true;
                }
            }
        }
    }
        return can = false;
}


