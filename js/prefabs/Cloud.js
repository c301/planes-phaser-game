var Planes = Planes || {};

Planes.Cloud = function(state, x, y, data) {
    var cloudsStyles = [
        'cloud1.png',
        'cloud3.png',
        'cloud5.png'
    ]
    var cloudStyle = state.rnd.pick(cloudsStyles);
    Phaser.Sprite.call(this, state.game, x, y, 'graphics', cloudStyle);

    //some default values
    this.anchor.setTo(0.5);

    this.data = data;
    this.state = state;
    this.game = state.game;

    this.game.physics.arcade.enable(this);
    this.checkWorldBounds = true;
    this.data.velocity.x = this.data.velocity.x || 0;
    this.data.velocity.y = this.data.velocity.y || 0;

    //respawn cloud on oposite side, when it move out of the screen
    this.events.onOutOfBounds.add(function(  ){
        if( this.body.velocity ){
            if( this.body.velocity.x > 0 ){
                this.x = -200;
            }
            if( this.body.velocity.x < 0 ){
                this.x = this.game.world.width + 200;
            }
        }
    }, this);
};


Planes.Cloud.prototype = Object.create(Phaser.Sprite.prototype);
Planes.Cloud.prototype.constructor = Planes.Cloud;


Planes.Cloud.prototype.update = function(){
    //set default alpha
    this.alpha = 1;

    this.game.physics.arcade.overlap(
        this.state.player, 
        this, 
        this.passCloud, null, this
    );

    if( this.data.velocity ){
        this.body.velocity = this.data.velocity;
    }
}
Planes.Cloud.prototype.passCloud = function(player, cloud){
    cloud.alpha = 0.5;
    player.inClouds = true;
}
