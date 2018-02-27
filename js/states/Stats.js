var Planes = Planes || {};

//text style
var style = Planes.Config.menuFontStyle;
Planes.StatsState = {
    showNavigation: function(){
        var padding = 100;
        var backOk = new Phaser.Button( this.game, padding, 50, 'graphics', function(){
            this.state.start('Home', true);
        }, this, 'green_boxCheckmark.png', 'green_boxCheckmark.png');

        var backCancel = new Phaser.Button( this.game, this.game.width - padding, 50, 'graphics', function(){
            this.state.start('Home', true);
        }, this, 'green_boxCross.png', 'green_boxCross.png');

        backOk.anchor.setTo(0, 0.5);
        backCancel.anchor.setTo(1, 0.5);

        //add title
        var cX = this.game.centerX;
        var titleText = this.game.add.text(
            cX, backCancel.y, 
            'Medals', 
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

        this.showNavigation();
    }
};

