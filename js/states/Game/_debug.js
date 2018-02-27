//see states/Game.js
//debugging staff

var Planes = Planes || {};
Planes._debug = {
    /*
     * paused: function(  ){
     *     this.pausedLabel.visible = true;
     * },
     * resumed: function(  ){
     *     this.pausedLabel.visible = false;
     * },
     */
    toggleDebug: function () {
        this.showDebug = (this.showDebug) ? false : true;
    },
    renderBody: function (sprite) {
        this.game.debug.body(sprite);
    },
    _renderDebug: function(){
        this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
        if(this.showDebug){

            this.renderBody(this.player);
            this.enemies.forEachAlive(this.renderBody, this);
        }else{
            // this.game.debug.reset();
        }
    }
}
