highscores = JSON.parse(localStorage.Highscores);

first_name = document.getElementById("first_name");
first_points = document.getElementById("first_points");

second_name = document.getElementById("second_name");
second_points = document.getElementById("second_points");

third_name = document.getElementById("third_name");
third_points = document.getElementById("third_points");

fourth_name = document.getElementById("fourth_name");
fourth_points = document.getElementById("fourth_points");

fifth_name = document.getElementById("fifth_name");
fifth_points = document.getElementById("fifth_points");


function intialize_leaderboard(){
    highscores.first_name = first_name.textContent;
    highscores.first_points = first_points.textContent;

    highscores.second_name = second_name.textContent;
    highscores.second_points = second_points.textContent;

    highscores.third_name = third_name.textContent;
    highscores.third_points = third_points.textContent;

    highscores.fourth_name = fourth_name.textContent;
    highscores.fourth_points = fourth_points.textContent;

    highscores.fifth_name = fifth_name.textContent;
    highscores.fifth_points = fifth_points.textContent;

    highscores_json = JSON.stringify(highscores);
    localStorage.setItem("Highscores", highscores_json)
}

function display_leaderboard(){
    first_name.textContent = highscores.first_name;
    first_points.textContent = highscores.first_points;

    second_name.textContent = highscores.second_name;
    second_points.textContent = highscores.second_points;

    third_name.textContent = highscores.third_name;
    third_points.textContent = highscores.third_points;

    fourth_name.textContent = highscores.fourth_name;
    fourth_points.textContent = highscores.fourth_points;

    fifth_name.textContent = highscores.fifth_name;
    fifth_points.textContent = highscores.fifth_points;
}
display_leaderboard()





