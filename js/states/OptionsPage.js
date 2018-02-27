var Planes = Planes || {};

//text style
var style = Planes.Config.menuFontStyle;
Planes.OptionsPageState = {
    showNavigation: function(){
        var padding = 100;
        var backOk = new Phaser.Button( this.game, padding, 50, 'graphics', function(){
            this.state.start('Game', true);
        }, this, 'green_boxCheckmark.png', 'green_boxCheckmark.png');

        var backCancel = new Phaser.Button( this.game, this.game.width - padding, 50, 'graphics', function(){
            this.state.start('CharacterSelect', true);
        }, this, 'green_boxCross.png', 'green_boxCross.png');

        backOk.anchor.setTo(0, 0.5);
        backCancel.anchor.setTo(1, 0.5);

        //add title
        var cX = this.game.centerX;
        var titleText = this.game.add.text(
            cX, backCancel.y, 
            'Options', 
            Planes.Config.bigTextStyle
        );
        titleText.anchor.setTo(0.5);
        this.layers.interfaceLayer.add(titleText);
        //end title

        this.add.existing(backOk);
        this.add.existing(backCancel);
        this.layers.interfaceLayer.add(backOk);
        this.layers.interfaceLayer.add(backCancel);
    },

    create: function(){
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

        for( var row = 0; row < ROWS; row++ ){
            var y = padding + buttonHeight * ( row + 1 );
            for( var col = 0; col < COLS; col++ ){
                var levelIndex = col * ROWS + row;
                if( this.levelsData[ levelIndex ]){

                    var x = padding + buttonWidth * ( col + 1 );

                    (function( levelNum ){
                        var button = new Phaser.Button( this.game, x, y, 'graphics', function(){
                            //load level on button click
                            this.state.start( 'Game', true, false, levelNum );
                        }, this, 'metalPanel.png', 'metalPanel.png');
                        button.anchor.setTo(0.5);

                        //place level number
                        var levelNumImg = this.game.add.sprite(
                            button.x, 
                            button.y, 
                            'graphics', 
                            'text_' + ( levelNum + 1 ) + '.png'
                        );
                        levelNumImg.anchor.setTo(0.5);

                        //add objects to save order
                        this.layers.interfaceLayer.add(button);
                        this.layers.interfaceLayer.add(levelNumImg);

                    }.bind(this))(levelIndex)
                }
            }
        }


        this.showNavigation();
    },
    getLevels: function(){
        return this.levelsData || JSON.parse(this.game.cache.getText('levels'));
    }
};

