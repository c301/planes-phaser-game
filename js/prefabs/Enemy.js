var Planes = Planes || {};

/**
 * Enemy
 *
 * @param state
 * @param x
 * @param y
 * @param data
 * @param data.agression how ofter enemy will follow the player
 * @param data.followDuration how long enemy will pursui player in seconds
 * @return {undefined}
 */
Planes.Enemy = function(state, x, y, data) {
    Planes.Plane.call(this, state, x, y, data);

    this.DISTANCE_TO_BORDER = 150;
    this.turning = false;
    this.target = null;
    //how ofter enemy will follow the player
    this.agression = this.data.agression || 60; 
    //how long enemy will pursui player in seconds
    this.followDuration = this.data.followDuration || 3;

    //indicates, that enemy pursuit player
    this._following = false;
    //indicates, that enemy avoiding something
    this._avoiding = false;

    //last time when want to pursuit player
    this._lastFolowCheck = 0;
    //check for following every X miliseconds
    this._folowCheckInterval = 3 * 1000;
    //time for avoing maneuver
    this._avoidingDuration = 3;
};

Planes.Enemy.prototype = Object.create(Planes.Plane.prototype);
Planes.Enemy.prototype.constructor = Planes.Enemy;


Planes.Enemy.prototype.update = function() {
    Planes.Plane.prototype.update.call(this);

    if( !this.inCamera ){
        if( this.flight.isPlaying ){
            //stop animation
            this.flight.stop();
        }
    }else{
        if( !this.flight.isPlaying ){
            this.flight.play();
        }
    } 
    if( this.alive && !this.inCamera ){
        this.showPointer();
        this.updatePointer();
    }else{
        this.hidePointer();
    }

    var canInteractWithPlayer = false;
    if( this.state.player ){
        canInteractWithPlayer = !this.state.player.inClouds;
    }

    if( !this.avoidBorder() ){
        if( canInteractWithPlayer ){
            this.followPlayer();
        }
    }

    if( canInteractWithPlayer ){
        this.shootPlayer();
    }
    this.updateVelocity();
};

Planes.Enemy.prototype.pointToPlayer = function() {
    var angleToPlayer = this.angleToPlayer();

    if( Math.abs( angleToPlayer - this.rotation ) < 0.15 ){
        this.fire();
    }
}

Planes.Enemy.prototype.shootPlayer = function() {
    if( this.pointToPlayer() ){
        if( Phaser.Utils.chanceRoll(0.3) ){
            this.fire();
        }
    }
};

Planes.Enemy.prototype.rotateToAngle = function(targetAngle) {
    // Gradually (this.TURN_RATE) aim the missile towards the target angle
    if (this.rotation !== targetAngle) {
        // Calculate difference between the current angle and targetAngle
        var delta = targetAngle - this.rotation;

        // Keep it in range from -180 to 180 to make the most efficient turns.
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        if (delta > 0) {
            // Turn clockwise
            this.turnUp();
        } else {
            // Turn counter-clockwise
            this.turnDown();
        }

        // Just set angle to target angle if they are close
        if (Math.abs(delta) < this.game.math.degToRad(this.TURN_RATE)) {
            this.rotation = targetAngle;
        }
    }
}
Planes.Enemy.prototype.followPlayer = function() {
    if( this._following ){
        //follow the player
        var targetAngle = this.angleToPlayer();
        this.rotateToAngle(targetAngle);
    }else{
        if( ( this.game.time.now - this._lastFolowCheck ) > this._folowCheckInterval ){
            this._lastFolowCheck = this.game.time.now;

            if( Phaser.Utils.chanceRoll( this.agression ) ){
                //allow enemy to follow the player
                this._following = true;
                this.game.time.events.add( this.followDuration * 1000, function(){
                    this._following = false;
                }, this)
            }
        }
    }
};
Planes.Enemy.prototype.shouldAvoidBorder = function() {
    var d = this.distanceToBorder();
    return (d < this.DISTANCE_TO_BORDER);
}
Planes.Enemy.prototype.avoidBorder = function() {
    // var shouldAvoid = !this.withinWorldBounds();
    var shouldAvoid = false;
    if( !shouldAvoid ){
        shouldAvoid = this.shouldAvoidBorder();
    }
    //if too close to border, turn to the center of the world
    if( this._avoiding ){
        //follow the world center
        var targetAngle = this.angleToWorldCenter();
        this.rotateToAngle(targetAngle);
        return true;
    }else{
        if( shouldAvoid ){
            this._avoiding = true;
            this.game.time.events.add( this._avoidingDuration * 1000, function(){
                this._avoiding = false;
            }, this)

            return true;
        }else{
            return false;
        }
    }
}

Planes.Enemy.prototype.angleToWorldCenter = function() {
    var worldAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.game.world.centerX, this.game.world.centerY
    );
    return worldAngle;
}
Planes.Enemy.prototype.angleToPlayer = function() {
    var playerAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.state.player.x, this.state.player.y
    );

    return playerAngle;
}

Planes.Enemy.prototype.withinWorldBounds = function() {
    return this.state.world.bounds.contains(this.x, this.y);
}

