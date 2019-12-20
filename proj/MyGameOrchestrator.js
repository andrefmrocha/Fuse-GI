class MyGameOrchestrator extends CGFobject {
    constructor(scene) {
        super(scene);

        const serverURL = "http://localhost:8001";
        this.generateURL = serverURL + "/generate";
        this.userMoveURL = serverURL + "/move";
        this.botMoveURL = serverURL + "/bot";
        this.playerPointsURL = serverURL + "/points";


        this.gameReady = false;
        this.initGame();

        this.auxBoardWhite = new MyAuxBoard(scene, 0, "wt");
        this.auxBoardBlack = new MyAuxBoard(scene, 0, "bl");
        this.board = new MyGameBoard(scene, [[]]);
    }

    async initGame() {
        // sizes must be between 2 and 7, inclusive
        const request = {
            columns: 3,
            lines: 3
        };

        let genBoardResponse = await postRequest(this.generateURL, request);
        let boardJson = await genBoardResponse.json();
        this.board = new MyGameBoard(this.scene, boardJson.board);
        
        this.auxBoardWhite = new MyAuxBoard(this.scene, request.columns + request.lines, "wt");
        this.auxBoardBlack = new MyAuxBoard(this.scene, request.columns + request.lines, "bl");

        this.gameReady = true;
    }

    display() {
        if (!this.gameReady) return;

        this.board.display();
      
        this.scene.pushMatrix();
        this.scene.translate(7, 0, 0);
        this.auxBoardWhite.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-7, 0, 0);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.auxBoardBlack.display();
        this.scene.popMatrix();
    }


}

function postRequest(url, body) {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}