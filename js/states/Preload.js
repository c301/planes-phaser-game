var Planes = Planes || {};

//loading the game assets
Planes.PreloadState = {
    preload: function() {
        try{
            //load the game assets before the game starts
            this.logo = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
            this.logo.anchor.setTo(0.5);

            this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadBar');
            this.preloadBar.anchor.setTo(0.5);
            this.load.setPreloadSprite(this.preloadBar);

            //load all graphics
            this.load.atlas('graphics', Planes.GRAPHICS_DIR + 'graphics.png', Planes.GRAPHICS_DIR + 'graphics.json');

            //load planes configuration
            this.load.text('planes', 'assets/data/planes.json');

            //load levels
            this.load.text('levels', 'assets/data/levels.json');
            this.load.text('defaultLevel', 'assets/data/defaultLevel.json');
            this.load.text('items', 'assets/data/items.json');
            this.load.text('objects', 'assets/data/objects.json');

            //init i8n
            this.load.text('locale-en', 'assets/data/en/messages.json');
            this.load.text('locale-ru', 'assets/data/ru/messages.json');

            //load sounds
            /*
             * this.load.audio('battle-loss', ['assets/sounds/loss-level.ogg', 'assets/sounds/loss-level.mp3']);
             * this.load.audio('win', ['assets/sounds/win-level.ogg', 'assets/sounds/win-level.mp3']);
             * this.load.audio('battle-theme', ['assets/sounds/battle.ogg', 'assets/sounds/battle.mp3']);
             * this.load.audio('bullet-explosion', ['assets/sounds/bullet-explosion.ogg', 'assets/sounds/bullet-explosion.mp3']);
             * this.load.audio('consume-bonus', ['assets/sounds/bonus_consume.ogg','assets/sounds/bonus_consume.mp3']);
             * this.load.audio('plane-explosion', ['assets/sounds/plane-explosion.ogg', 'assets/sounds/plane-explosion.mp3']);
             * this.load.audio('plane-propeller', ['assets/sounds/engine-plane.ogg', 'assets/sounds/engine-plane.mp3']);
             * this.load.audio('menu-click', ['assets/sounds/menu-click.ogg', 'assets/sounds/menu-click.mp3']);
             * this.load.audio('shot', [ 'assets/sounds/shot.ogg', 'assets/sounds/shot.mp3' ]);
             * this.load.audio('ui', ['assets/sounds/menu.ogg', 'assets/sounds/menu.mp3']);
             */
        }catch(e){
            console.log( e.stack );
            alert( e.stack );
        }
    },
    create: function() {
        //set app version
        if(Planes.deviceready && (typeof cordova !== 'undefined') && cordova.getAppVersion){
            cordova.getAppVersion(function( v ){
                if(v){
                    Planes.Config.version = v;
                }
            })
        }
        //cache locales
        Planes._locales = {};
        try{
            Planes._locales.en = JSON.parse(this.game.cache.getText('locale-en'));
            Planes._locales.ru = JSON.parse(this.game.cache.getText('locale-ru'));
        }catch(e){
            console.log( e.stack );
            alert( e.stack );
        }
        this.state.start('Home', true );
    }
};

