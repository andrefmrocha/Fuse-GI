    /**
     * @param  {Function} animation - must return true when it is finished
     * @param  {Array} args
     * @param  {Function} onFinished
     */class MyAnimation{
    constructor(animation, onFinished){
        this.animation = animation;
        this.onFinished = onFinished;
    }

    update(time){
       if(this.animation(time))
        this.onFinished();

    }
}