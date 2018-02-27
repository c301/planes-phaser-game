var Planes = Planes || {};

Planes.Bullet = function(state, x, y, data) {
    data = data || {};
    this.SPEED = data.speed || 350;
    this.data = data;

    Phaser.Sprite.call(this, state.game, x, y, 'graphics','bulletBeige_outline.png');

    //some default values
    this.anchor.setTo(0.5);
    this.scale.setTo(0.3);

    this.state = state;
    this.game = state.game;

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;

    var direction = Phaser.Utils.chanceRoll(50) ? -1 : 1;
    this.TURN_RATE = 5;
    this.WOBBLE_LIMIT = direction * 15; // degrees
    this.WOBBLE_SPEED = 250; // milliseconds
    this.wobble = 0;


    this.wobbling = this.game.add.tween(this)
    .to(
        { wobble: this.WOBBLE_LIMIT },
        this.WOBBLE_SPEED, Phaser.Easing.Sinusoidal.InOut, false, 0,
        Number.POSITIVE_INFINITY, true
    );
    // if( data.wobble ){
        // Create a variable called wobble that tweens back and forth between
        // -this.WOBBLE_LIMIT and +this.WOBBLE_LIMIT forever
        this.wobble = -this.WOBBLE_LIMIT;
        this.wobbling.start();
    // }
};


Planes.Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Planes.Bullet.prototype.constructor = Planes.Bullet;


Planes.Bullet.prototype.update = function(){
    var targetAngle = this.data.angle;
    //if plane use aim, follow plane rotation
    if( this.planeEmmiter && this.planeEmmiter.useAim ){
        targetAngle = this.planeEmmiter.rotation;
    }

    // Add our "wobble" factor to the targetAngle to make the missile wobble
    // Remember that this.wobble is tweening (above)
    if( this.data.wobble ){
        targetAngle += this.game.math.degToRad(this.wobble);
    }

    // Gradually (this.TURN_RATE) aim the missile towards the target angle
    if (this.rotation !== targetAngle) {
        // Calculate difference between the current angle and targetAngle
        var delta = targetAngle - this.rotation;

        // Keep it in range from -180 to 180 to make the most efficient turns.
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        if (delta > 0) {
            // Turn clockwise
            this.angle += this.TURN_RATE;
        } else {
            // Turn counter-clockwise
            this.angle -= this.TURN_RATE;
        }

        // Just set angle to target angle if they are close
        if (Math.abs(delta) < this.game.math.degToRad(this.TURN_RATE)) {
            this.rotation = targetAngle;
        }
    }
    //set velocity
    this.body.velocity.x = Math.cos(this.rotation) * this.SPEED;
    this.body.velocity.y = Math.sin(this.rotation) * this.SPEED;
}

Planes.Bullet.prototype.reset = function(x, y, data){
    Phaser.Sprite.prototype.reset.call(this, x, y);

    this.data = data;
};
