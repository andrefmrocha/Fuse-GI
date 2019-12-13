class MyGameOrchestrator extends CGFobject {
    constructor(scene) {
        super(scene);

        const serverURL = "http://localhost:8001";
        this.generateURL = serverURL + "/generate";
        this.userMoveURL = serverURL + "/move";
        this.botMoveURL = serverURL + "/bot";
        this.playerPointsURL = serverURL + "/points";


        this.initGame();

        this.auxBoardWhite = new MyAuxBoard(scene, 10, "wt");
        this.auxBoardBlack = new MyAuxBoard(scene, 10, "bl");
        this.board = new MyGameBoard(scene, [
            [
                "corner",
                "bl",
                "wt",
                "bl",
                "wt",
                "bl",
                "corner"
            ],
            [
                "wt",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "bl"
            ],
            [
                "wt",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "wt"
            ],
            [
                "bl",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "bl"
            ],
            [
                "bl",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "wt"
            ],
            [
                "wt",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "bl"
            ],
            [
                "corner",
                "wt",
                "bl",
                "wt",
                "wt",
                "bl",
                "corner"
            ]
        ]);
    }

    initGame() {
        const request = {
            "columns": 5,
            "lines": 5
        };

        let promise = postRequest(this.generateURL, request);

        promise.then(
            function(response) {
                console.log(response);
            }
        );
    }

    display() {
        this.board.display();
      
        this.scene.pushMatrix();
        this.scene.translate(5, 0, 0);
        this.auxBoardWhite.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-5, 0, 0);
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