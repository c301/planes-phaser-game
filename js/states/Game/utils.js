var Planes = Planes || {};
Planes._utils = {
    placeNavigation: function( conf ){
        var backCancel = new Phaser.Button(
            this.game, 
            100,
            50,
            'graphics',
            function(){
                Planes.menuClick.play();
                this.state.start(conf.prevState);
            }, this, 'red_sliderRight.png', 'red_sliderRight.png');

        backCancel.angle = 180;
        backCancel.anchor.setTo(1, 0.5);

        //add title
        var cX = this.game.centerX;
        var titleText = this.game.add.text(
            cX, backCancel.y, 
            conf.mainText, 
            Planes.Config.subTitleStyle
        );
        titleText.anchor.setTo(0.5);
        titleText.setShadow(2, 2, "rgba(0,0,0,0.5)", 2, true, true);
        this.layers.interfaceLayer.add(titleText);
        //end title

        this.add.existing(backCancel);
        this.layers.interfaceLayer.add(backCancel);
    },
    loadWave : function( waveConfig, state ){
        var defaultWaveConfig = {
            "enemies"   : [],
            "items"   : [],
            "objects"   : []
        }
        var waveConfig = _.assign( defaultWaveConfig, waveConfig );

        var handleEnemies = function( enemies ){
            var self = this;
            _.each(enemies, function( enemyConfig ){
                enemyConfig.onEnemyKill = function( enemy ){
                    self.enemiesKilled++;
                    self.state.onEnemyKill(enemy);
                    if( enemyConfig.item ){
                        var itemConfig = enemyConfig.item;
                        itemConfig.position = enemy.position;
                        self.state.createItem(itemConfig);
                    }
                    if( enemies.length === self.enemiesKilled ){
                        self.onEnd();
                    }
                }
                enemyConfig.onEnemyFire = function( enemy ){
                    self.state.onEnemyFire(enemy);
                }
                if( enemyConfig.time ){
                    var creationTime = enemyConfig.time * 1000;
                    self.state.time.events.add( creationTime, 
                                               function(){
                                                   self.state.createEnemy(enemyConfig);
                                               }, self
                                              );
                }else{
                    self.state.createEnemy(enemyConfig);
                }
            })
        }
        var handleItems = function( items ){
            var self = this;
            _.each(items, function( itemConfig ){
                if( itemConfig.time ){
                    var creationTime = itemConfig.time * 1000;
                    self.state.time.events.add( creationTime, 
                                               function(){
                                                   self.state.createItem(itemConfig);
                                               }, self
                                              );
                }else{
                    self.state.createItem(itemConfig);
                }
            });
        }
        var handleObjects = function( objects ){
            var self = this;
            _.each(objects, function( objectConfig ){
                if( objectConfig.time ){
                    var creationTime = objectConfig.time * 1000;
                    self.state.time.events.add( creationTime, 
                                               function(){
                                                   self.state.createObject(objectConfig);
                                               }, self
                                              );
                }else{
                    self.state.createObject(objectConfig);
                }
            });
        }
        var startWave = function(){
            console.log( 'start wave', this.config );
            this.startTime = this.state.time.now;

            if( !Array.isArray(waveConfig.enemies) ){
                waveConfig.enemies = [waveConfig.enemies];
            }
            if( !Array.isArray(waveConfig.items) ){
                waveConfig.items = [waveConfig.items];
            }
            if( !Array.isArray(waveConfig.objects) ){
                waveConfig.objects = [waveConfig.objects];
            }
            this.handleEnemies(waveConfig.enemies);
            this.handleItems(waveConfig.items);
            this.handleObjects(waveConfig.objects);
        }
        var wave = {
            currentEnemyIndex: 0,
            enemiesKilled: 0,
            config: waveConfig,
            state: state,
            start: startWave,
            handleEnemies: handleEnemies,
            handleItems: handleItems,
            handleObjects: handleObjects,
            onEnd: function(){ console.log( 'default onEnd' ); }
        };

        return wave;
    }
}

