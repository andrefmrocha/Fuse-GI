    /**
     * @param  {Function} animation - must return true when it is finished
     * @param  {Array} args
     * @param  {Function} onFinished
     */class MyAnimation{
    constructor(ID, animation, onFinished){
        this.ID = ID;
        this.animation = animation;
        this.onFinished = onFinished;

        this.finished = false;
    }

    update(time){
        if(!this.finished && this.animation(time)) {
            this.onFinished();
            this.finished = true;
        }

    }
}