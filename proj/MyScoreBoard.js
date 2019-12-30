const playerName = document.querySelector('#player');
const whiteScore = document.querySelector('#white-score');
const blackScore = document.querySelector('#black-score');
const ScoreBoard = {
    displayInfo : async (player, url, board) => {
        const name = player == "wt" ? "White" : "Black";
        playerName.textContent = name;
        
        const response = await postRequest(url, {
            board: board
        });

        const points = await response.json();
        whiteScore.textContent = points[PLAYER_1];
        blackScore.textContent = points[PLAYER_2];
        return points;
    }
}