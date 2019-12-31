const playerName = document.querySelector('#player');
const whiteScore = document.querySelector('#white-score');
const blackScore = document.querySelector('#black-score');
const time = document.querySelector('#time');
const timeInput = time.querySelector('span');

class ScoreBoard {
    constructor(turnTime){
        this.turnTime = turnTime;
    }

    static async displayInfo(player, url, board) {
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

    startTimer(currentTime) {
        this.startTime = currentTime;
        time.style.display = "block";
        timeInput.textContent = this.turnTime;
    }

    update(currentTime) {
        const timePassed = (currentTime - this.startTime) / 1000;
        if (timePassed > this.turnTime) {
            timeInput.textContent = "Time's up!";
            return true;
        }
        timeInput.textContent = String(this.turnTime - timePassed).substr(0, 4);
    }
}