var Planes = Planes || {};

Planes.HomeState = {
    init: function(message) {
        this.world.setBounds(0, 0, 800, 600);
        if( typeof message === 'string' ){
            message = {
                text: message,
                style: Planes.Config.gameOverStyle
            }
        }
        this.message = message;
        this.game.physics.arcade.applyGravity = false;    
        this.game.physics.arcade.gravity.y = 0;    
    },

    create: function() {
        try{
            if(Planes.deviceready && window.analytics){
                window.analytics.trackView('Home state');
            }
            this.game.sound.stopAll();

            // CHANGE ORDER HERE TO CHANGE RENDERING ORDER!        
            this.layers = {
                backgroundLayer: this.add.group(),
                backgroundDetail: this.add.group(),
                playerLayer: this.add.group(),
                frontLayer: this.add.group(),
                interfaceLayer: this.add.group()
            };

            var background = this.game.add.sprite(0,0,'graphics', 'background.png');
            background.inputEnabled = true;
            this.layers.backgroundLayer.add(background);



            var button1 = Planes.Config.mainBtn;
            var button2 = Planes.Config.mainBtnPressed;

            var style = Planes.Config.menuStyle;


            var cX = this.game.centerX;
            var cY = this.game.centerY;

            var titleText = this.game.add.text(
                cX, 50, 
                _t('title'), 
                Planes.Config.mainTitleStyle
            );
            titleText.anchor.setTo(0.5);
            titleText.setShadow(2, 2, "rgba(0,0,0,0.5)", 2, true, true);
            this.titleText = titleText;


            this.startButton = new Phaser.Button( this.game, cX, cY - 30, 'graphics', function(  ){
                Planes.menuClick.play();
                this.state.start('CharacterSelect', true);
            }, this, button1, button1, button2, button2);

            this.startButton.anchor.setTo(0.5);


            this.game.add.existing(this.startButton);
            this.layers.playerLayer.add(this.startButton);

            var t = this.game.add.text(
                this.startButton.x, this.startButton.y, _t('goFight'), style);
            t.setShadow(1, 1, "rgba(0,0,0,0.5)", 2, true, true);
            t.anchor.setTo(0.5);
            this.startText = t;
            this.layers.playerLayer.add(this.startText);

            var gameState = Planes.store.getState();

            var soundFrame = 'musicOn.png';
            if( gameState.enableSound !== undefined ){
                this.game.sound.mute = !gameState.enableSound;
            }
            if( this.game.sound.mute ){
                soundFrame = 'musicOff.png';
            }
            var sound = this.game.add.button(
                this.game.width - 50,
                40,
                'graphics', 
                function(){
                    Planes.menuClick.play();
                    //toggle all sounds
                    if( !this.game.sound.mute ){
                        this.game.sound.mute = true;
                        //turn off sound
                        sound.setFrames(
                            'musicOff.png',
                            'musicOff.png',
                            'musicOff.png',
                            'musicOff.png'
                        )
                    }else{
                        this.game.sound.mute = false;
                        //turn on sound
                        sound.setFrames(
                            'musicOn.png',
                            'musicOn.png',
                            'musicOn.png',
                            'musicOn.png'
                        )
                    }
                    Planes.store.updateState('enableSound', !this.game.sound.mute);
                },
                this,
                soundFrame,
                soundFrame,
                soundFrame,
                soundFrame
            );
            sound.anchor.setTo(0.5);
            sound.scale.setTo(0.5);


            if(this.message) {
                var message = this.game.add.text(
                    this.game.centerX, this.game.centerY + 100, this.message.text, 
                    this.message.style
                );
                message.setShadow(2, 2, "rgba(0,0,0,0.5)", 2, true, true);
                message.anchor.setTo(0.5);
            }

            var _versionText = 'Music CleytonRX. Created by Anton Sivolapov anton.sivolapov@gmail.com      version ';
            _versionText += Planes.Config.version;
            if( gameState.fullVersion ){
                _versionText += ' (full)';
            }else{
                _versionText += ' (free)';
            }
            _versionText += ' ' + Planes.Config.locale;

            var versionText = this.game.add.text(
                this.game.width - 20, this.game.height - 20, 
                _versionText , 
                Planes.Config.techTextStyle
            );
            versionText.anchor.setTo(1);

            //parse file with planes data
            this.planesData = JSON.parse(this.game.cache.getText('planes'));

            this.plane = new Planes.Enemy(
                this,
                this.game.left - 20,
                this.game.centerY + 100,
                {
                    plane_id: 'red'
                }
            );
            this.plane.startEngine();
            this.layers.playerLayer.add(this.plane);

            //  Being mp3 files these take time to decode, so we can't play them instantly
            //  Using setDecodedCallback we can be notified when they're ALL ready for use.
            //  The audio files could decode in ANY order, we can never be sure which it'll be.
            Planes.uiSound = this.add.audio('ui', 0.8, true);
            Planes.menuClick = this.add.audio('menu-click', 0.8);
            this.sound.setDecodedCallback([ Planes.uiSound ], function(){
                Planes.uiSound.play();
            });

            this.game.state.onShutDownCallback = function(  ){
                this.plane.stop();
            }

            //shortcut for development
            // this.state.start('CharacterSelect', false, false);
            // this.state.start('LevelSelect', false, false);
            // this.state.start('Game', false, true);
            // return 
        }catch(e){
            console.log( e.stack );
            alert( e.stack );
        }
    },
    getPlane: function( plane_id ){
        return _.find(this.planesData, function( plane ){
            return plane.plane_id === plane_id;
        });
    }
};
