var Planes = Planes || {};

//setting game configuration and loading the assets for the loading screen
Planes.BootState = {
    init: function() {
        //scaling options
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //have the game centered horizontally
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;


        //physics system
        // this.game.physics.startSystem(Phaser.Physics.P2JS);    
        this.game.physics.startSystem(Phaser.Physics.ARCADE);    

        var cX = this.game.width/2;
        var cY = this.game.height/2;

        this.game.centerX = cX;
        this.game.centerY = cY;
    },
    preload: function() {
        //assets we'll use in the loading screen
        this.load.image('preloadBar', Planes.GRAPHICS_DIR + 'bar.png');
        this.load.image('logo', Planes.GRAPHICS_DIR + 'logo.png');
    },
    create: function() {
        //loading screen will have a white background
        this.game.stage.backgroundColor = '#fff';  

        this.state.start('Preload', true);
    }
};

