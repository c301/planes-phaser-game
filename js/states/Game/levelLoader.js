//see states/Game.js
//level loader, shortcut moved into dedicated file
var Planes = Planes || {};
Planes._levelLoader = {
    loadLevel: function(){
        //parse loaded json file
        var defaultLevel = JSON.parse(this.game.cache.getText('defaultLevel'));
        var levelData = JSON.parse(this.game.cache.getText('levels'))[this.currentLevel];

        this.levelData = _.assign( defaultLevel, levelData );


        //all planes, including enemies and player
        this.planes = this.game.add.group();

        this.items = this.game.add.group();
        this.layers.playerLayer.add( this.items );

        this.enemies = this.game.add.group();
        this.layers.playerLayer.add( this.enemies );
        this.enemies.enableBody = true;

        //init background
        this.background     = this.add.tileSprite(
            0,0,
            this.game.world.width,
            this.game.world.height,
            'graphics', 
            this.levelData.background
            );
        this.layers.backgroundLayer.add( this.background );

        //init bullets
        this.enemyBullets = this.add.group();
        this.enemyBullets.enableBody = true;
        this.layers.frontLayer.add( this.enemyBullets );

        this.playerBullets = this.add.group();
        this.playerBullets.enableBody = true;
        this.layers.frontLayer.add( this.playerBullets );

        //create and place player
        this.createPlayer();


        //keep track of what enemy needs to be shown next
        this.currentItemIndex = 0;
        this.currentObjectIndex = 0;

        this.killedEnemies = 0;

        //blocks
        this.blocks = this.add.group();
        this.blocks.enableBody = true;

        this.ground = this.add.tileSprite(
            0,
            this.game.world.height - 24, 
            this.game.world.width, 48, 
            'graphics',
            this.levelData.ground
        );

        this.blocks.add(this.ground);
        this.game.physics.arcade.enable(this.ground);

        this.blocks.setAll('body.immovable', true);
        this.blocks.setAll('body.allowGravity', false);

        this.layers.frontLayer.add( this.blocks );

        //load rest of the level
        this.loadWave( this.levelData.level_data, this ).start();

        //load first wave
        var loadNextWave = function(){
            this.currentWaveIndex++;
            var nextWave = this.levelData.enemies_waves[this.currentWaveIndex]; 
            if( nextWave ){
                this.currentWave = this.loadWave( nextWave, this );
                this.currentWave.onEnd = loadNextWave;
                this.currentWave.start();
            }else{
                //latest wave ended, level completed
                this.endGame('You win!', 'win');
            }
        }.bind(this);

        this.currentWaveIndex = 0;
        this.currentWave = this.loadWave( this.levelData.enemies_waves[this.currentWaveIndex], this );
        this.currentWave.onEnd = loadNextWave;
        this.currentWave.start();
    },
    createObject: function( data ){
        var objectData = this.getObject( data.object_id ) || {};
        var defaultObjectConfig = this.getObject( '_defaultObjectConfig' );
        if( objectData ){
            objectData = _.assign( {}, defaultObjectConfig, objectData, data );
            var layer = objectData.layer;
            var x = objectData.x;
            var y = objectData.y;
            if( y < 0 ){
                y = this.game.world.height + y;
            }
            if( objectData.on_ground ){
                //if object on the ground, set y coord
                y = this.ground.top;
            }
            if( x < 0 ){
                x = this.game.world.width + x;
            }
            var startFrame = objectData.startFrame;
            if( layer && x !== undefined && y !== undefined ){
                //all mandatory data exists
                var object_constructor = objectData.object_constructor;
                if( object_constructor ){
                    //we assume, that we have prefab for this object
                    if( Planes[object_constructor] ){
                        var sprite = new Planes[object_constructor](this, x, y, objectData);
                        this.layers[layer].add( sprite );
                    }
                }else if( startFrame ){
                    //generic sprite
                    var sprite = this.add.sprite(x, y, 'graphics', startFrame);
                    if( objectData.scale ){
                        sprite.scale = objectData.scale;
                    }
                    if( objectData.on_ground ){
                        //if object on the ground, adjust anchor
                        sprite.anchor.setTo(0.5, 1);
                    }
                    this.layers[layer].add( sprite );
                }else{
                    console.error( 'ERROR. Object %o doesnt have mandatory fields', objectData );
                }
            }else{
                console.error( 'ERROR. Object %o doesnt have mandatory fields', objectData );
            }
        }
    },
    createItem: function(data){
        console.log( '==== create item', data );
        //if no item_id or random bonus, create another bonus
        if( !data.item_id || data.item_id === 'random_bonus' ){
            //pick up random item_id
            var bonuses = _.keys( Planes.Item.itemsHandlers );
            var bonusName = this.game.rnd.pick(bonuses);
            //pick random position

            var itemConfig = {
                "item_id": bonusName
            }
            return this.createItem(itemConfig);
        }else{
            //look for a dead element
            data.position = data.position || {};
            var x = data.position.x || 
                this.game.rnd.between(150, this.game.world.width - 150);
            var y = data.position.y || this.game.world.height - 70;

            var newItem = this.items.getFirstDead();

            //if there are no dead ones, create a new one
            if(!newItem) {
                newItem = new Planes.Item(this, x, y, data);
                this.items.add(newItem);
            }else{
                newItem.reset(x, y, data);
            }
            return newItem;
        }
    },
    createEnemy: function(data){
        console.log( '== create enemy', data );
        //look for a dead element
        // var newEnemy = this.enemies.getFirstDead();
        //random y position
        data.position = data.position || {};
        var y = data.position.y || 
            this.game.rnd.between( 50, this.game.world.height - 100 );
        var x = data.position.x || this.game.world.width + 20;
        //set default orientation
        data.orientation = data.orientation || "W";


        //always create new enemy
        data.bullets = this.enemyBullets;
        var newEnemy = new Planes.Enemy(this, x, y, data);

        newEnemy.onKill = data.onEnemyKill;
        newEnemy.onFire = data.onEnemyFire;

        this.enemies.add(newEnemy);
        newEnemy.startEngine();
        return newEnemy;
    },
    createPlayer: function(){
        if(Planes.deviceready && window.analytics){
            window.analytics.trackEvent('Start game', 'Plane selected', '',  this.currentState.currentPlane );
        }
        var playerPlaneData = this.getPlane( this.currentState.currentPlane );
        //load player
        var playerData = {
            plane_id    : playerPlaneData.plane_id,
            orientation : "E",
            bullets     : this.playerBullets,
            health      : 10
        };
        this.player         = new Planes.Player(this, -100, 100, playerData);
        this.player.onKill = this.onPlayerKill.bind(this);
        this.player.onFire = this.onPlayerFire.bind(this);
        this.player.x = 300;
        //place player right on the ground
        this.player.y = this.game.world.height - 24 - this.player.height/2;

        this.player.body.mass = 2000;
        this.player.landed();

        this.game.camera.follow(this.player);

        //fix scaling bug on iPhone
        // this.player.angle += 1;

        this.layers.playerLayer.add( this.player );
    }
}
