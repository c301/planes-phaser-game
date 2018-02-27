var Planes = Planes || {};

Planes.Plane = function(state, x, y, data){
    this.planeData = state.getPlane( data.plane_id ) || {};
    var spritesheet = this.planeData.spritesheet || 'graphics';
    Phaser.Sprite.call( this, state.game, x, y, spritesheet, this.planeData.startFrame );

    this.data = data || {};

    //add group for bullets or use existing one
    if( this.data.bullets ){
        this.bullets = this.data.bullets; 
    }else{
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
    }


    this.DEFAULT_SPEED = 70;
    this.SPEED = this.planeData.speed || this.DEFAULT_SPEED; //maximum speed
    this.bulletWobble = false;

    this.TURN_RATE = this.data.turn_rate || this.planeData.turn_rate || 1;

    //coldown in second between firing
    this.FIRE_COOLDOWN = 3;
    //delay between bullets in miliseconds
    this.FIRE_RATE = 100;
    //maximum bullets in one firing
    this.MAX_BULLETS = this.planeData.max_bullets || 3;
    //bullet speed
    this.BULLET_SPEED = this.planeData.bullet_speed || 350;
    //when last bullet was created
    this._lastBulletTime = 0;
    //fired bullets in current firing session
    this._fired = 0;
    //within firing session?
    this._firing = false;

    this.health = this.data.health || this.planeData.health || 10;

    this.turning = false;
    this.flying = false;
    this.takingOff = false;

    this.state = state;
    this.game = state.game;
    this.anchor.setTo(0.5);
    //faced to east by default
    this.direction = this.data.orientation || this.planeData.orientation || "E";

    this.game.physics.arcade.enable(this);
    this.body.setSize(this.width * 0.8, this.height * 0.8);

    this.scale.setTo(0.5);

    //initial rotation
    this._adjustingAngle = 0;
    if( this.direction === 'W' ){
        this.scale.y *= -1;
        this._adjustingAngle = Math.PI;
    }
    this.rotation += this._adjustingAngle;

    //place aim
    this.useAim = false;
    this.aimDistance = 180;
    this.aim = this.game.add.sprite(this.x, this.y, 'graphics', 'crosshair_red_small.png')
    this.state.layers.playerLayer.add(this.aim);
    this.aim.visible = false;
    this.aim.anchor.setTo(0.5);

    //create pointer
    this.pointer = this.game.add.sprite(
        this.x, this.y, 'graphics', 'red_sliderRight.png'
    );
    this.state.layers.interfaceLayer.add(this.pointer);
    this.pointer.visible = false;
    this.pointer.anchor = {
        x: 1,
        y: 0.5
    };

    //true, when plane pass clouds
    this.inClouds = false;

    //init flight animation
    if( !this.planeData.animations.flight ){
        this.planeData.animations.flight = [this.planeData.startFrame]
    }
    this.flight = this.animations.add('flight', this.planeData.animations.flight, 10, true);
    
    this.shotSound = this.state.add.audio('shot');
    this.flightSound = this.state.add.audio('plane-propeller');


};


Planes.Plane.prototype = Object.create(Phaser.Sprite.prototype);
Planes.Plane.prototype.constructor = Planes.Plane;

Planes.Plane.prototype.landed = function() {
    this.flight.stop();
    this.flying = false;
}
Planes.Plane.prototype.incSpeed = function(value) {
    this.SPEED += value;
}
Planes.Plane.prototype.incTurnRate = function(value) {
    console.log( 'inc turn rate', value );
    this.TURN_RATE += value;
}
Planes.Plane.prototype.incMaxBullets = function() {
    this.MAX_BULLETS++;
}
Planes.Plane.prototype.showAim = function() {
    this.useAim = true;
    this.aim.visible = true;
}
Planes.Plane.prototype.hideAim = function() {
    this.useAim = false;
    this.aim.visible = false;
}
Planes.Plane.prototype.showPointer = function() {
    this.pointer.visible = true;
}
Planes.Plane.prototype.hidePointer = function() {
    this.pointer.visible = false;
}
Planes.Plane.prototype.updatePointer = function(){
    var x, y;
    var view = this.game.camera.view;
    var outRight    = this.x > view.right;
    var outLeft     = this.x < view.left;
    var outBottom   = this.y > view.bottom;
    var outTop      = this.y < view.top;

    // console.log( 'out right %o. out left %o. out top %o. out bottom %o. \
    //             sprite x %s, sprite cameraOffset.x %s, sprite y %s, sprite cameraOffset.y %s', 
    //            outRight, outLeft, outTop, outBottom, this.x, this.cameraOffset.x, this.y, this.cameraOffset.y);

    y = this.worldPosition.y;

    if( outLeft ){
        x = 0;
        this.pointer.angle = 180;
    }
    if( outRight ){
        x = this.game.width;
        this.pointer.angle = 0;
    }
    if( outTop ){
        y = 0;
        this.pointer.angle = -90;
    }
    if( outBottom ){
        y = this.game.height;
        this.pointer.angle = 90;
    }
    if( x === undefined ){
        x = this.worldPosition.x;
    }
    if( outRight && outTop ){
        this.pointer.angle = -45;
    }
    if( outRight && outBottom ){
        this.pointer.angle = 45;
    }
    if( outLeft && outTop ){
        this.pointer.angle = -135;
    }
    if( outLeft && outBottom ){
        this.pointer.angle = 135;
    }

    // console.log( 'position', x,y );
    this.pointer.position.x = x;
    this.pointer.position.y = y;
}
Planes.Plane.prototype.updateAimPosition = function() {
    this.aim.x = this.x + Math.cos(this.rotation) * this.aimDistance;
    this.aim.y = this.y + Math.sin(this.rotation) * this.aimDistance;
}

Planes.Plane.prototype.startPropeller = function() {
    this.flight.play();
}
Planes.Plane.prototype.startEngine = function() {
    this.flightSound.onDecoded.add(function(){
        this.flightSound.play('', 0, 0.3, true);
    }, this)
    this.startPropeller();
}
Planes.Plane.prototype.takeoff = function() {
    this.startEngine();
    this.flying = false;
    this.takingOff = true;
}

Planes.Plane.prototype.update = function() {
    if( this.useAim ){
        this.updateAimPosition();
    }

    if( this.stopped ){
        return;
    }
    if( this.takingOff ){
        if( this.body.velocity.x < this.SPEED ){
            this.body.velocity.x += 1;
        }else{
            this.flying = true;
        }
    }else if( this.flying ){
        //rotate on Y axis
        //DISABLED

        /*
         * var angle1 = ( 0 < this.angle && this.angle < 90 ) || ( 0 > this.angle && this.angle > -90 );
         * var angle2 = ( 90 < this.angle && this.angle < 180 ) || ( -90 > this.angle && this.angle > -180 );
         * var noKeys = state.cursors.up.isUp && state.cursors.down.isUp ;

         * if( !this.turning && ( ( angle1 && this.scale.y < 0 ) || ( angle2 &&  this.scale.y > 0 ) ) ){
         *     if( noKeys ){
         *         if( this.turningStat ){
         *             if( this.turningStat.time + 500 <= this.game.time.now && noKeys ){
         *                 this.makeTurn();
         *                 this.turningStat = null;
         *             }
         *         }else{
         *             //save rotation and start wait
         *             this.turningStat = {
         *                 time:   this.game.time.now
         *             }
         *         }
         *     }
         * }
         */
    }
}

Planes.Plane.prototype.turnUp = function() {
    var dir = this.scale.y < 0 ? 1 : -1; //direction
    dir = -1;

    this.angle -= dir * this.TURN_RATE;
}
Planes.Plane.prototype.turnDown = function() {
    var dir = this.scale.y < 0 ? 1 : -1; //direction

    dir = -1;
    this.angle += dir * this.TURN_RATE;
}
Planes.Plane.prototype.updateVelocity = function() {
    // Calculate velocity vector based on state.rotation and state.SPEED
    this.body.velocity.x = Math.floor( Math.cos(this.rotation) * this.SPEED );
    this.body.velocity.y = Math.floor( Math.sin(this.rotation) * this.SPEED );
}

Planes.Plane.prototype.createBullet = function() {
    if( !this.alive ){
        return 
    }
    var bullet = this.bullets.getFirstExists(false);

    //exec callback
    if( this.onFire ){
        this.onFire(this);
    }
    //only create a bullet if there are no dead ones available to reuse
    var bulletConfig = { angle: this.rotation, speed: this.BULLET_SPEED, wobble: this.bulletWobble };
    if(!bullet) {
        bullet = new Planes.Bullet(
            this.state,
            this.body.center.x,
            this.body.center.y,
            bulletConfig
        );
        this.bullets.add( bullet );
    }else{
        //reset position
        bullet.reset(
            this.body.center.x, 
            this.body.center.y, 
            bulletConfig
        );
    }

    if( this.shotSound.isDecoded ){
        this.shotSound.play('', 0, 0.2);
    }
    bullet.planeEmmiter = this;
    bullet.rotation = this.rotation;
};

Planes.Plane.prototype.makeTurn = function() {
    var self = this;

    if( self.planeData.animations.turn && self.planeData.animations.turn.length ){
        if( self.flight.frame == 0 ){
            self._makeTurn();
        }else{
            self.flight.onLoop.addOnce(function(){
                self._makeTurn();
            })
        }
    }
}

Planes.Plane.prototype._makeTurn = function() {
    var self = this;
    var frames = self.planeData.animations.turn;
    self.turning = true;
    self.flight.stop();

    self.turn = self.animations.add('turn', frames, 15, false);
    self.turn.onComplete.addOnce(function(){
        self.scale.y = -self.scale.y;
        self.flight.play();
        self.turning = false;
    })
    self.turn.play();
}

Planes.Plane.prototype.fire = function() {
    // console.log( '== fire' );
    if( this._firing ){
        if( this.MAX_BULLETS > this._fired ){
            // console.log( 'fire bullet' );
            if(( this.game.time.now - this._lastBulletTime ) > this.FIRE_RATE){
                this.createBullet();
                this._lastBulletTime = this.game.time.now;
                this._fired++;
            }
        }
    }else{
        // console.log( 'start firing' );
        this._firing = true;

        this.game.time.events.add(this.FIRE_COOLDOWN * 1000, function(){
            // console.log('stop firing');
            this._fired = 0;
            this._firing = false;
        }, this);
    }
}
Planes.Plane.prototype.consumeItem = function(item) {
    console.log( 'consumeItem', item );
    item.updatePlane(this)
}

Planes.Plane.prototype.distanceToBorder = function( exclude ) {
    var currentLocation = new Phaser.Point( this.x, this.y );
    var distances = [];
    var distanceToTop = currentLocation.distance({ x: this.x, y: this.game.world.bounds.top });
    var distanceToBottom = currentLocation.distance({ x: this.x, y: this.game.world.bounds.bottom });
    var distanceToRight = currentLocation.distance({ x: this.game.world.bounds.right, y: this.y });
    var distanceToLeft = currentLocation.distance({ x: this.game.world.bounds.left, y: this.y });

    var boundsNames = [];
    if( exclude ){
        if( !exclude.top ){
            boundsNames.push('top');
            distances.push(distanceToTop);
        }
        if( !exclude.bottom ){
            boundsNames.push('bottom');
            distances.push(distanceToBottom);
        }
        if( !exclude.left ){
            boundsNames.push('left');
            distances.push(distanceToLeft);
        }
        if( !exclude.right ){
            boundsNames.push('right');
            distances.push(distanceToRight);
        }
    }else{
        boundsNames = [
            'top', 'bottom', 'right', 'left'
        ];
        distances = [
            distanceToTop,
            distanceToBottom,
            distanceToRight,
            distanceToLeft
        ];
    }

    var minimumDistance = Math.min.apply(Math, distances);

    this.closestBorder = boundsNames[ distances.indexOf(minimumDistance) ];
    return minimumDistance;
}

Planes.Plane.prototype.stop = function() {
    this.flightSound.stop();
    this.stopped = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
}
Planes.Plane.prototype.fallDown = function(amount) {
    if( !this.fallingDown ){
        this.state.uiBlocked = true;
        this.fallingDown = true

        var fallTween = this.game.add.tween(this).to(
        { angle: 90 }, 50, Phaser.Easing.Linear.None, true
        );
        fallTween.onComplete.add(function(  ){
            var fallSpeed = this.game.add.tween(this.body.velocity).to(
                { y: 150, x: 0 }, 200, Phaser.Easing.Linear.None, true
            );
            this.game.time.events.add(2000, function(){
                //enable ui to recover
                this.state.uiBlocked = false;
                //we have some time to recover
                this.game.time.events.add(500, function(){
                    this.fallingDown = false;
                }, this);
            }, this);
        }, this)
    }
}

Planes.Plane.prototype.kill = function(amount) {
    this.aim.destroy();
    this.pointer.destroy();
    //exec callback
    if( this.onKill ){
        this.onKill(this);
    }
    this.flightSound.destroy();
    Phaser.Sprite.prototype.destroy.call(this, amount);
}

Planes.Plane.prototype.reset = function(x, y, data){
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.data = data;
};
