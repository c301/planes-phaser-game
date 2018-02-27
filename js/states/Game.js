var Planes = Planes || {};

Planes._gameState = {
    LATEST_LEVEL: 5,
    init: function(currentLevel) {    
        console.log( 'game state init' );
        this.showDebug = false;

        this.world.setBounds(0, 0, 2024, 1024);

        //keep track of the current level
        this.currentLevel = currentLevel ? currentLevel : 0;

        //TODO: remove in production
        this.game.time.advancedTiming = true;

        //no gravity in a top-down game
        // this.game.physics.arcade.applyGravity = true;    
        // this.game.physics.arcade.gravity.y = 9.8;    
    },
    create: function(){
        console.log( 'start game' );
        this.game.sound.stopAll();

        if(Planes.deviceready && window.analytics){
            window.analytics.trackView('Game state');
        }

        //stats
        this.levelStat = Planes.defaultState.stats;
        //stars game
        this.startTime = this.time.now;

        this.currentState = Planes.store.getState();
        this.game.onscreenControls = this.game.plugins.add(Phaser.Plugin.OnscreenControls);
        // this.game.debugInfo = this.game.add.plugin(Phaser.Plugin.Debug);

        // CHANGE ORDER HERE TO CHANGE RENDERING ORDER!        
        this.layers = {
            backgroundLayer: this.add.group(),
            backgroundDetail: this.add.group(),
            playerLayer: this.add.group(),
            frontLayer: this.add.group(),
            interfaceLayer: this.add.group(),
            pauseLayer: this.add.group()
        };

        this.endOfLevel = false;
        //all interface fixed to camera
        this.layers.interfaceLayer.fixedToCamera = true;
        this.layers.pauseLayer.fixedToCamera = true;
        this.gameEnded = false;

        this.PLAYER_MIN_SPEED = 10;
        this.PLAYER_MAX_SPEED = 100;
        this.startGame = false;
        this.uiBlocked = false;

        //parse file with planes data
        this.planesData = JSON.parse(this.game.cache.getText('planes'));
        //parse file with items data
        this.itemsData = JSON.parse(this.game.cache.getText('items'));
        //parse file with objects data
        this.objectsData = JSON.parse(this.game.cache.getText('objects'));

        //load level
        this.loadLevel();

        //init controls
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //init GUI
        this.initGUI();

        this.showReadyLabel();

        //  Press P to pause and resume the game
        this.pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
        this.pauseKey.onDown.add(this.togglePause, this);

        //  Press D to toggle the debug display
        this.debugKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.debugKey.onDown.add(this.toggleDebug, this);

        //  Press G to toggle god (invincible) mode
        this.godMode = false;
        this.godModeKey = this.input.keyboard.addKey(Phaser.Keyboard.G);
        this.godModeKey.onDown.add(this.toggleGodMode, this);

        //sounds
        Planes.uiSound.stop();
        this.battleMusic = this.add.audio('battle-theme', 0.5, true);
        this.consumeBonusSound = this.add.audio('consume-bonus', 0.3);
        this.damageSound = this.add.audio('bullet-explosion', 0.5);
        this.winSound = this.add.audio('win', 0.5);
        this.lossSound = this.add.audio('battle-loss', 0.5);
        this.planeExplosion = this.add.audio('plane-explosion', 0.8);

        this.sound.setDecodedCallback([ this.battleMusic ], function(){
            this.battleMusic.play();
        }, this);
    },   
    update: function(){    
        //always reset inClouds
        this.player.inClouds = false;

        //damage emenies
        this.game.physics.arcade.overlap(
            this.playerBullets, 
            this.enemies, 
            this.damageEnemy, null, this
        );
        //damage player
        this.game.physics.arcade.overlap(
            this.enemyBullets, 
            this.player, 
            this.damagePlayer, null, this
        );

        //player and enemies consume items
        this.game.physics.arcade.overlap(
            this.player, 
            this.items, 
            this.consumeItem, null, this
        );
        this.game.physics.arcade.overlap(
            this.enemies, 
            this.items, 
            this.consumeItem, null, this
        );

        //colide player and env
        this.game.physics.arcade.collide(this.player, this.blocks, this.handleGroundCollision, null, this);

        //start game
        // if( !this.startGame && this.game.input.activePointer.isDown ){
        if( !this.startGame && ( this.game.input.activePointer.isDown || this.spacebar.isDown ) ){
            this.startingGame();
        }else{
            if( this.player.alive ){
                //actual game
                var distanceToBorder = this.player.distanceToBorder({bottom: true});
                //warning level
                if( distanceToBorder < 300 && distanceToBorder > 100 ){
                    this.GUIoutOfBoundsWarning( this.player.closestBorder );
                }else if( distanceToBorder < 100 ){
                    //player too close to border, so fall down
                    this.player.fallDown();
                }else{
                    //within game area
                    this.stopWarning();
                }
            }
        }
    },
    toggleGodMode: function(){
        this.godMode = !this.godMode;
        console.log( 'God mode enabled?', this.godMode );
    },
    handleGroundCollision: function(){
        if( !this.blasting ){
            //play sound
            if( this.planeExplosion.isDecoded ){
                this.planeExplosion.play();
            }
            this.blasting = true;
            this.player.touchingGround = true;
            this.player.kill();

            this.blasting = false;
        }
    },
    onEnemyFire: function( enemy ){
        this.levelStat.enemiesShots++;
    },
    onEnemyKill: function( enemy ){
        var blastAnimation = Planes.CONST.regularBlastAnimation;
        //play sound
        if( this.planeExplosion.isDecoded ){
            this.planeExplosion.play();
        }
        //update stat
        this.levelStat.enemiesKilled++;

        var blast = this.game.add.sprite(
            enemy.x, enemy.y, 'graphics', blastAnimation[0]
        );
        blast.anchor.setTo(0.5);
        this.layers.playerLayer.add(blast);

        var blastOut = blast.animations.add('blastOut', blastAnimation, 10);
        blastOut.onComplete.add(function(){
            blast.destroy();
        }, this);
        blastOut.play();
    },
    onPlayerFire: function( player ){
        this.levelStat.playerShots++;
    },
    onPlayerKill: function( player ){
        //play sound
        if( this.planeExplosion.isDecoded ){
            this.planeExplosion.play();
        }
        //update stat
        this.levelStat.deaths++;

        //wait some time before restart
        var blastAnimation = Planes.CONST.regularBlastAnimation;
        if( player.touchingGround ){
            blastAnimation = Planes.CONST.groundBlastAnimation;
        }
        this.blast = this.game.add.sprite(
            this.player.x, this.player.y, 'graphics', blastAnimation[0]
        );
        this.blast.anchor.setTo(0.5);
        this.layers.playerLayer.add(this.blast);

        this.blastOut = this.blast.animations.add('blastOut', blastAnimation, 10);
        this.blastOut.play();
        this.blastOut.onComplete.add(function(){
            this.blast.destroy();
            this.endGame(' GAME OVER! ');
        }, this)

    },
    render: function () {
        this._renderDebug();
    },
    startingGame: function(  ){
        this.startGame = true;
        this.player.takeoff();
    },
    consumeItem: function( plane, item ){
        if( this.consumeBonusSound.isDecoded ){
            this.consumeBonusSound.play();
        }
        //update stat
        this.levelStat.bonusesConsumed++;

        plane.consumeItem(item);
        item.kill();
    },
    bulletExplode: function( bullet ){
        //play sound
        if( this.damageSound.isDecoded ){
            this.damageSound.play();
        }

        var blastAnimation = Planes.CONST.simpleBlastAnimation;

        var blast = this.game.add.sprite(
            bullet.x, bullet.y, 'graphics', blastAnimation[0]
        );
        blast.anchor.setTo(0.5);
        blast.scale.setTo(0.3);

        this.layers.playerLayer.add(blast);

        var blastOut = blast.animations.add('blastOut', blastAnimation, 10);
        blastOut.onComplete.add(function(){
            blast.destroy();
        }, this);

        bullet.kill();
        blastOut.play();
    },
    damageEnemy: function( bullet, enemy ){
        enemy.damage(1);    
        //update stat
        this.levelStat.accurateShots++;

        this.bulletExplode(bullet);
    },
    damagePlayer: function( player, bullet ){
        if( !this.godMode ){
            player.damage(1);    
        }
        //update stat
        this.levelStat.accurateEnemiesShots++;

        this.bulletExplode(bullet);
        this.refreshGUI();
    },
    getPlane: function( plane_id ){
        return _.find(this.planesData, function( plane ){
            return plane.plane_id === plane_id;
        });
    },
    getItem: function( item_id ){
        return _.find(this.itemsData, function( item ){
            return item.item_id === item_id;
        });
    },
    getObject: function( object_id ){
        return _.find(this.objectsData, function( object ){
            return object.object_id === object_id;
        });
    },
    endGame: function( message, state ){
        if( !this.gameEnded ){

            this.gameEnded = true;
            //show cool label for few seconds
            if( state === 'win' ){
                if(Planes.deviceready && window.analytics){
                    window.analytics.trackEvent('General', 'Win');
                }
                //play sound
                if( this.winSound.isDecoded ){
                    this.winSound.play();
                }
                //stats
                this.levelStat.winTime = this.time.now - this.startTime;

                //update stat
                this.levelStat.wins++;

                this.showWinLabel();

                //new level opened
                var state = Planes.store.getState();
                //update state. see "rewards" in levelData ( levels.json )
                var newLevelToOpen = this.currentLevel + 1;
                if( state.openedLevels.indexOf(newLevelToOpen) !== -1 ){
                    //level already opened
                    newLevelToOpen = false;
                }
                _.each(this.levelData.rewards.state_update || {}, function( val, key ){
                    if( val instanceof Array ){
                        state[key] = state[key] || [];
                        state[key] = state[key].concat(val);
                    }else{
                        state[key] = val;
                    }
                })
                var gameFinished = false;
                //if it was latest level, so game finished. congrats!
                if( this.currentLevel == this.LATEST_LEVEL && !state.gameFinished ){
                    state.gameFinished = true;
                    gameFinished = true;
                }
                Planes.store.setState(state);

                this.battleMusic.fadeOut(2);
                //return back to title screen in few seconds
                this.game.time.events.add(5000, function(){
                    if( gameFinished ){
                        this.state.start('Credits', true, false, true );
                    }else{
                        this.state.start('LevelSelect', true, false, newLevelToOpen );
                    }
                }, this);
            }else{
                if(Planes.deviceready && window.analytics){
                    window.analytics.trackEvent('General', 'Loss');
                }
                //play sound
                if( this.lossSound.isDecoded ){
                    this.lossSound.play();
                }
                this.showLooseLabel();
                this.battleMusic.fadeOut(2);
                //return back to title screen in few seconds
                this.game.time.events.add(5000, function(){
                    this.game.state.start('Home', true, false, message);
                }, this);
            }
        }
    }
};

Planes.GameState = _.assign(
    Planes._gameState, 
    Planes._levelLoader, //place BG, planes, schedule enemies
    Planes._debug, //renderBody, frames
    Planes._GUI, //pause menu, health bar, warning
    Planes._utils //variout stuff: pointers, loadWave
)
