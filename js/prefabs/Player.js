var Planes = Planes || {};

Planes.Player = function(state, x, y, data) {
    Planes.Plane.call(this, state, x, y, data);
    //always allow to turn up first
    this.turnedUp = false;
};

Planes.Player.prototype = Object.create(Planes.Plane.prototype);
Planes.Player.prototype.constructor = Planes.Player;

Planes.Player.prototype.update = function() {
    Planes.Plane.prototype.update.call(this);
    if( this.flying ){
        var state = this.state;
        var dir = this.scale.y < 0 ? 1 : -1;

        if(!state.uiBlocked) {
            var goUp = false;
            var goDown = false;
            var direction = 0;

            if( state.spacebar.isDown || this.btnsPressed.action ){
                this.fire();
            }

            this.game.input.pointers.forEach(function( pointer ){
                if( pointer.isDown ){
                    var targetX = pointer.position.x;   
                    if( targetX < this.game.centerX ){
                        //get the location of the touch
                        var targetY = pointer.position.y;   
                        //define the direction of the speed
                        direction = targetY >= this.game.centerY ? -1 : 1;   
                    }
                }
            },this)

            if( state.cursors.up.isDown || direction > 0 ){
                goUp = true;
            }
            if(state.cursors.down.isDown || direction < 0){
                goDown = true;
            }

            if( this.turnedUp && goUp ){
                this.turnUp();
            }else if( goDown ){
                this.turnedUp = true;
                this.turnDown();
            }
        }
        this.updateVelocity();


        /*
        * if( this.body.angle < 0 ){
        *     //raising up
        *     if( state.SPEED > state.PLAYER_MIN_SPEED ){
        *         state.SPEED -= 0.2;
        *     }
        * }else if( this.body.angle > 0 ){
        *     //going down
        *     if( state.SPEED < state.PLAYER_MAX_SPEED ){
        *         state.SPEED += 0.5;
        *     }
        * }
        */

        if( this.SPEED <= state.PLAYER_MIN_SPEED && !state.fallingDown ){
            state.fallDown();
        }
    }
};
