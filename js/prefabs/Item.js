var Planes = Planes || {};

Planes.Item = function(state, x, y, data) {
    this.itemData = state.getItem( data.item_id ) || {};
    this.spritesheet = this.itemData.spritesheet || 'graphics';

    Phaser.Sprite.call( this, state.game, x, y, this.spritesheet, this.itemData.startFrame );
    this.data = data;

    this.DEFAULT_DURATION = 30; //seconds
    this.SPEED = 25;
    this.state = state;
    this.game = state.game;
    this.anchor.setTo(0.5);

    this.game.physics.arcade.enable(this);

    this.checkWorldBounds = true;

    //create pointer
    this.pointer = this.game.add.sprite(
        this.x, this.y, 'graphics', 'green_sliderRight.png'
    );
    this.state.layers.interfaceLayer.add(this.pointer);
    this.pointer.visible = false;
    this.pointer.anchor = {
        x: 1,
        y: 0.5
    };

    this.outOfBoundsKill = true;
};

Planes.Item.prototype = Object.create(Phaser.Sprite.prototype);
Planes.Item.prototype.constructor = Planes.Item;

Planes.Item.itemsHandlers = {
    "drunken_bullet": {
        "apply": function( plane ){
            plane.bulletWobble = true;
        },
        "resetStat": function( plane ){
            plane.bulletWobble = false;
        }
    },
    "aim": {
        "apply": function( plane ){
            plane.showAim();
        },
        "resetStat": function( plane ){
            plane.hideAim();
        }
    },
    "fire_up": {
        "apply": function( plane ){
            plane.incMaxBullets();
        }
    },
    "speed": {
        "apply": function( plane, itemData ){
            plane.incSpeed(itemData.value);
        },
        "resetStat": function( plane, itemData ){
            plane.incSpeed(-itemData.value);
        }
    },
    "turn_rate": {
        "apply": function( plane, itemData ){
            plane.incTurnRate(itemData.value);
        },
        "resetStat": function( plane, itemData ){
            plane.incTurnRate(-itemData.value);
        }
    },
    "add_clouds": {
        "apply": function( plane, itemData ){
            //pick side of the cloud
            var x = this.game.rnd.pick([
                -10,
                this.game.world.width + 10
            ]);
            var y = this.game.rnd.between( 50, this.game.world.height - 100 )
            //pick velocity
            var velocity = { y: 0 };
            if( x < 0 ){
                velocity.x = Planes.Config.cloudSpeed;
            }else{
                velocity.x = -Planes.Config.cloudSpeed;
            }

            this.state.createObject({
                "object_id"     : "cloud",
                "x"             : x,
                "y"             : y,
                "velocity"      : velocity
            });
        }
    }
}

Planes.Item.prototype.showPointer = function() {
    this.pointer.visible = true;
}
Planes.Item.prototype.hidePointer = function() {
    this.pointer.visible = false;
}
Planes.Item.prototype.updatePointer = function(){
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
Planes.Item.prototype.update = function() {
    if( this.alive && !this.inCamera ){
        this.showPointer();
        this.updatePointer();
    }else{
        this.hidePointer();
    }

    this.body.velocity.y = -this.SPEED;
};
Planes.Item.prototype.updatePlane = function(plane) {
    var handlers = Planes.Item.itemsHandlers[this.itemData.item_id];
    if( handlers ){
        var resetStat = handlers.resetStat;
        var apply = handlers.apply.bind(this);
        if( resetStat ){
            resetStat = handlers.resetStat.bind(this);
        }

        //apply bonuses
        apply(plane, this.itemData);

        if( this.itemData.duration && resetStat ){
            var _resetStat = (function( plane, itemData ){
                return function(){
                    return resetStat(plane, itemData);   
                };
            })(plane, this.itemData)
            this.game.time.events.add(this.itemData.duration * 1000, _resetStat, this);
        }
    }

};

Planes.Item.prototype.reset = function(x, y, data){
    Phaser.Sprite.prototype.reset.call(this, x, y);

    this.itemData = this.state.getItem( data.item_id );
    this.loadTexture(this.spritesheet, this.itemData.startFrame);
};
