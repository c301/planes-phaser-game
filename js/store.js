var Planes = Planes || {};

Planes.defaultState = {
    userId          : '',
    fullVersion     : false,
    //first run?
    firstRun        : true,
    //sound enable?
    enableSound     : true,
    //all levels completed
    gameFinished    : false,
    stats           : {
        //bullet fired  
        playerShots     : 0,
        //accurate shots
        accurateShots   : 0,
        //bullet fired by the enemies
        enemiesShots    : 0,
        //taken damage
        accurateEnemiesShots : 0,
        //flight distance
        flightDistance  : 0,
        //time in game
        timeInGame      : 0,
        //flight distance in clouds
        coveredDistance : 0,
        //enemies killed
        enemiesKilled   : 0,
        //deaths
        deaths          : 0,
        levelsStats     : [
            {
                //best win time 
                winTime     : 0,
                //number of wins
                wins        : 0
            }
        ],
        //bonuses consumed
        bonusesConsumed : 0
    },
    name            : '',
    currentPlane    : 'green',
    openedPlanes    : [ 'green' ],
    openedLevels    : [ 0 ],
    openedMedals    : [],
    stats           : []
};
var defaultState = Planes.defaultState;

var stateKey = 'planes_state_key';
Planes.store = {
    updateState     : function(){
        
    },
    getState        : function(){
        var state = localStorage.getItem(stateKey);
        try {
            return JSON.parse( state );
        } catch (e) {
            console.log( e.stack );
            return defaultState;
        }
    },
    setState        : function(newState){
        var state;
        try {
            localStorage.setItem(stateKey, JSON.stringify( newState ));
        } catch (e) {
            console.log( e.stack );
            return false;
        }
        return true;
    },
    updateState     : function( key, value ){
        var state = this.getState();
        state[key] = value;
        this.setState( state );
    },
    init            : function(){
        var currentState = this.getState();

        if( !currentState ){
            //check for the first run and save default state
            this.setState( defaultState );
        }else if( currentState.firstRun ){
            //turn off firstRun
            currentState.firstRun = false;
            this.setState( currentState );
        }else{
            this.setState( _.assign( defaultState, currentState ) );
        }
    },
    //for testing purpose
    reset           : function(){
        localStorage.removeItem( stateKey );
    }
}

Planes.store.init();


