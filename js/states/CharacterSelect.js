var Planes = Planes || {};

//text style
var descStyle = Planes.Config.mainTextStyle;
Planes.CharacterSelect = {
    statsIncons: {
        "damage"    : "crossair_redOutline.png",
        "speed"     : "powerupYellow_bolt.png",
        "control"   : "things_bronze.png"
    },
    create: function() {
        if(Planes.deviceready && window.analytics){
            window.analytics.trackView('CharacterSelect state');
        }

        // CHANGE ORDER HERE TO CHANGE RENDERING ORDER!        
        this.layers = {
            backgroundLayer: this.add.group(),
            backgroundDetail: this.add.group(),
            playerLayer: this.add.group(),
            interfaceLayer: this.add.group(),
            frontLayer: this.add.group()
        };
        //all interface fixed to camera
        this.layers.interfaceLayer.fixedToCamera = true;

        //get saved selected plane
        var firstPlane = this.getPlane( Planes.store.getState().currentPlane ) || false;

        //attach BG
        var background = this.game.add.sprite(0,0,'graphics', 'background.png');
        this.layers.backgroundLayer.add(background);

        //all buttons
        this.planesButtons = [];
        //all sprites on buttons
        this.previews = [];
        //calculate buttons positions
        var totalButtons = this.planesData.length;

        var state = Planes.store.getState();
        var openedPlanes = state.openedPlanes;

        this.planesData.forEach(function( plane, index ){
            try{
                var x = this.game.width/(totalButtons + 1) * (index + 1);
                var y = this.game.centerY - 100;

                var button = new Phaser.Button( this.game, x, y, 'graphics', function(){
                    Planes.menuClick.play();
                    var previewPlane = this.previews[index];

                    if(this.selectedPlane.plane_id === previewPlane.planeData.plane_id){
                        // plane active(second click), proceed to next screen
                        Planes.store.updateState('currentPlane', this.selectedPlane.plane_id);

                        this.state.start('LevelSelect');
                    }else{
                        //stop all animations
                        this.previews.forEach(function( p, i ){
                            if( i !== index ){
                                p && p.flight && p.flight.stop();
                            }
                        });
                        //play active animation
                        previewPlane.flight.play();
                        //show information about plane
                        this.showPlaneInfo(previewPlane.planeData);
                    }
                }, this, 'metalPanel.png', 'metalPanel.png');
                button.anchor.setTo(0.5);

                this.layers.interfaceLayer.add(button);
                //push into corresponding collections
                this.planesButtons.push(button);

                if( ~openedPlanes.indexOf(plane.plane_id) ){
                    //plane was opened
                    var planePreview = new Planes.Plane(
                        this, button.x, button.y, plane
                    );
                    planePreview.scale.setTo(0.7);
                    this.previews.push(planePreview);
                    //add objects to save order
                    this.layers.interfaceLayer.add(planePreview);

                    //animate selected plane
                    if( firstPlane && firstPlane.plane_id === plane.plane_id ){
                        planePreview.flight.play();
                    }
                }else{
                    //plane locked
                    var lockedPreview = this.game.add.sprite(
                        button.x, button.y, 'graphics', 
                        'lock_' + plane.plane_id + '.png'
                    );
                    lockedPreview.anchor.setTo(0.5);
                    this.previews.push(lockedPreview);
                    //add objects to save order
                    this.layers.interfaceLayer.add(lockedPreview);
                }
            }catch(e){
                console.log( e.stack );
            }
        }, this)

        this.allStatItems = this.add.group();
        this.showPlaneInfo( firstPlane );
        Planes._utils.placeNavigation.bind(this)({
            mainText: ' Get Plane ',
            prevState: 'Home'
        });
    },
    showPlaneInfo: function(planeToDescribe){
        this.allStatItems.removeAll();

        this.selectedPlane = planeToDescribe;

        this.currentInfoText = this.add.text(
            this.game.centerX,
            this.planesButtons[0].bottom + 50,
            '',
            descStyle);
        this.currentInfoText.setShadow(1, 1, "rgba(0,0,0,0.5)", 2, true, true);

        this.currentInfoText.anchor.setTo(0.5);
        this.allStatItems.add( this.currentInfoText );

        if( !planeToDescribe ){
            this.currentInfoText.text = 'Pick up your plane for the battle!';
        }else{
            var textHeight = 70;
            var planeData = planeToDescribe;
            var availableSpace = this.game.height - this.planesButtons[0].bottom - textHeight;
            var totalStats = planeData.information.stats.length;

            this.currentInfoText.text = planeData.information.description;

            planeData.information.stats.forEach(function( stat, index ){
                var x = this.planesButtons[0].x;
                var y = this.planesButtons[0].bottom + textHeight + availableSpace/(totalStats + 1) * (index + 1);

                var statIcon = this.add.sprite(x, y, 'graphics', this.statsIncons[stat.name])
                statIcon.anchor.setTo(0.5, 0.5);

                var statItemsCount = 10;
                var statMargin = 20;
                var statSpace =  this.planesButtons[this.planesButtons.length - 1].x - this.planesButtons[0].right - statMargin;
                var statY = statIcon.y;
                var statesSprites = {
                    full: 'squareGreen.png',
                    empty: 'square_shadow.png'
                }

                for( var i = 0; i < statItemsCount; i++ ){
                    var statX = this.planesButtons[0].right + statMargin + statSpace / (statItemsCount - 1) * i
                    var sprite = statesSprites.empty;
                    if( stat.points > i){
                        sprite = statesSprites.full;
                    }
                    var statItem = new Phaser.Sprite(this.game, statX, statY, 'graphics', sprite)
                    statItem.anchor.setTo(0.5, 0.5);
                    this.allStatItems.add(statItem);
                }

                this.allStatItems.add(statIcon);
            }, this)
        }
    },
    getPlane: function( plane_id ){
        this.planesData = this.planesData || JSON.parse(this.game.cache.getText('planes'));
        return _.find(this.planesData, function( plane ){
            return plane.plane_id === plane_id;
        });
    },
    getItem: function( item_id ){
        return _.find(this.itemsData, function( item ){
            return item.item_id === item_id;
        });
    }
};
