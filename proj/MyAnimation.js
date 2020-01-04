  
    class MyAnimation{
    /**
     * @param  {integer} ID ID of this animation, should be unique.
     * @param  {Array} animation animation function, must return true when finished
     * @param  {Function} onFinished callback to be called when animation finishes
     */
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