var Planes = Planes || {};

//text style
var style = Planes.Config.menuFontStyle;
Planes.LevelSelectState = {
    init: function( openLevel ){
        this.openLevel = openLevel;
    },
    create: function(){
        if(Planes.deviceready && window.analytics){
            window.analytics.trackView('LevelSelect state');
        }

        if( !Planes.uiSound.isPlaying ){
            Planes.uiSound.play();
        }
        this.levelsData = this.getLevels();
        // CHANGE ORDER HERE TO CHANGE RENDERING ORDER!        
        this.layers = {
            backgroundLayer: this.add.group(),
            backgroundDetail: this.add.group(),
            playerLayer: this.add.group(),
            frontLayer: this.add.group(),
            interfaceLayer: this.add.group()
        };
        //all interface fixed to camera
        this.layers.interfaceLayer.fixedToCamera = true;


        //attach BG
        var background = this.game.add.sprite(0,0,'graphics', 'background.png');
        this.layers.backgroundLayer.add(background);

        var ROWS = 2;
        var COLS = 3;
        var padding = 50;
        var buttonWidth = (this.game.width - padding * 2) / ( COLS + 1 );
        var buttonHeight = (this.game.height - padding * 2) / ( ROWS + 1 );

        var state = Planes.store.getState();
        var openedLevels = state.openedLevels;

        var levelIndex = 0;
        var buttons = [];

        for( var row = 0; row < ROWS; row++ ){
            var y = padding + buttonHeight * ( row + 1 );
            for( var col = 0; col < COLS; col++ ){
                if( this.levelsData[ levelIndex ]){

                    var x = padding + buttonWidth * ( col + 1 );

                    (function( levelNum ){
                        var buttonLabel; 
                        var clickHandler = function(){
                            Planes.menuClick.play();
                            //load level on button click
                            this.state.start( 'Game', true, false, levelNum );
                        }

                        var frame = 'text_' + ( levelNum + 1 ) + '.png';
                        var buttonBg = this.game.add.sprite(
                            x, y, 
                            'graphics', 
                            'metalPanel.png'
                        );
                        buttonBg.anchor.setTo(0.5);
                        buttons.push(buttonBg);

                        //place level number
                        if( ~openedLevels.indexOf( levelNum ) && this.openLevel !== levelNum ){
                            //level opened
                            buttonLabel = this.game.add.button(
                                buttonBg.x, 
                                buttonBg.y, 
                                'graphics', 
                                clickHandler,
                                this,
                                frame, frame, frame, frame
                            );
                        }else{
                            //closed level
                            buttonLabel = this.game.add.sprite(
                                buttonBg.x, 
                                buttonBg.y, 
                                'graphics', 
                                'lock_green.png'
                            );
                        }
                        buttonLabel.anchor.setTo(0.5);

                        //add objects to save order
                        this.layers.interfaceLayer.add(buttonBg);
                        this.layers.interfaceLayer.add(buttonLabel);

                        //we want to show opening animation
                        if( this.openLevel === levelNum ){
                            // buttonLabel
                            buttonLabel.angle = -15;
                            var breakAnim = this.game.add
                            .tween(buttonLabel).to(
                                { angle: 15 }, 100,
                                Phaser.Easing.Linear.None,
                                true, 0, 100, true
                            );
                            var zoomOutAmin = this.game.add
                            .tween(buttonLabel.scale).to(
                                { x: 0.3, y: 0.3 }, 500,
                                Phaser.Easing.Quadratic.InOut,
                                true, 0, 0, false
                            );
                            zoomOutAmin.onComplete.add(function(){
                                buttonLabel.kill();

                                buttonLabel = this.game.add.button(
                                    buttonBg.x, 
                                    buttonBg.y, 
                                    'graphics', 
                                    clickHandler,
                                    this,
                                    frame, frame, frame, frame
                                );
                                buttonLabel.anchor.setTo(0.5);
                                buttonLabel.scale.setTo(0.3);

                                var zoomInAmin = this.game.add
                                .tween(buttonLabel.scale).to(
                                    { x: 1, y: 1 }, 1000,
                                    Phaser.Easing.Elastic.Out,
                                    true, 0, 0, false
                                );
                            }, this);
                        }

                    }.bind(this))(levelIndex);
                }
                levelIndex++;
            }
        }


        Planes._utils.placeNavigation.bind(this)({
            mainText: ' Choose Level ',
            prevState: 'CharacterSelect'
        });
    },
    getLevels: function(){
        return this.levelsData || JSON.parse(this.game.cache.getText('levels'));
    }
};

