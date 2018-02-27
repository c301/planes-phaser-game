try{
    var Planes = Planes || {};
    Planes.deviceready = false;

    Planes.game = new Phaser.Game(800, 480, Phaser.AUTO, '', null, false, true);
    //TODO: uncomment in production
    // Planes.dim = Planes.getGameLandscapeDimensions(800, 480);
    // Planes.game = new Phaser.Game(Planes.dim.w, Planes.dim.h, Phaser.AUTO, '', null, false, true);

    Planes.GRAPHICS_DIR = 'assets/graphics/';

    Planes.game.state.add('Boot', Planes.BootState); 
    Planes.game.state.add('Preload', Planes.PreloadState); 
    Planes.game.state.add('Home', Planes.HomeState); 
    Planes.game.state.add('CharacterSelect', Planes.CharacterSelect); 
    Planes.game.state.add('LevelSelect', Planes.LevelSelectState); 
    Planes.game.state.add('OptionsPage', Planes.OptionsPageState); 
    Planes.game.state.add('Credits', Planes.CreditsState);
    Planes.game.state.add('UpgradeToFull', Planes.UpgradeToFull);
    Planes.game.state.add('Stats', Planes.StatsState);
    Planes.game.state.add('Game', Planes.GameState);

    Planes.game.state.start('Boot'); 

    var state = Planes.store.getState();
    var userId = state.userId;
    if( !userId ){
        //first load
        userId = Planes.game.rnd.uuid();
        state.userId = userId;
        Planes.store.setState(state);
    }

    document.addEventListener("menubutton", function menubutton(e){
        e.preventDefault();
        // this.togglePause();
    }.bind(this), false);

    document.addEventListener("backbutton", function backbutton(e){
        e.preventDefault();
        // this.togglePause();
    }.bind(this), false);

    Planes.game.fpsProblemNotifier.add(function(  ){
        if(Planes.deviceready && window.analytics){
            window.analytics.trackEvent('General', 'Low FPS');
        }
    });
    document.addEventListener("deviceready", function () {
        Planes.deviceready = true;
        if( navigator.globalization ){
            navigator.globalization.getPreferredLanguage(function( lang ){
                var locale = lang.value.split('-')[0];
                Planes.Config.locale = locale;
            }, function( e ){
                Planes.Config.locale = 'en';
            }) 
        }
        if( window.analytics ){
            window.analytics.startTrackerWithId('UA-71733922-1');
            window.analytics.setUserId(userId);
            window.analytics.debugMode();
            window.analytics.enableUncaughtExceptionReporting(true);
            window.analytics.trackEvent('General', 'Start game');
        }
    }, false);
}catch(e){
    console.log( e.stack );
    alert( e.stack );
}

