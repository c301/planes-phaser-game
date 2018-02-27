var Planes = Planes || {};

//text style
var style = Planes.Config.menuFontStyle;
Planes.CreditsState = {
    init: function( gameWin ){
        this.gameWin = gameWin;
    },
    create: function(){
        if(Planes.deviceready && window.analytics){
            window.analytics.trackView('Credits state');
        }
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

        var creditText = 'Thanks for trying this game. Anton Sivolapov anton.sivolapov@gmail.com'

        Planes._utils.placeNavigation.bind(this)({
            mainText: ' Credits ',
            prevState: 'Home'
        });

        this.game.input.onDown.add(function(  ){
            this.state.start('Home', true, false, {
                text: ' You Win! ',
                style: Planes.Config.winLevelStyle
            });
        }, this)
    }
};

