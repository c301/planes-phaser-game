//see states/Game.js
//GUI

var Planes = Planes || {};
Planes._GUI = {
    initGUI: function(){
        this.initWarningBorder();

        //styles for all texts
        var style   = Planes.Config.menuStyle;
        var alarmStyle = Planes.Config.mainTextStyle;
        var uiStyle = Planes.Config.menuStyle;

        //game over overlay
        var overlay = this.add.bitmapData(this.game.width, this.game.height);
        overlay.ctx.fillStyle = '#000';
        overlay.ctx.fillRect(0, 0, this.game.width, this.game.height);

        //sprite for the overlay
        this.pausePanel = this.game.add.sprite(0, -this.game.height, overlay);
        this.pausePanel.alpha = 0.55;
        this.layers.pauseLayer.add(this.pausePanel);

        this.placeMenu();

        //add menu icon
        this.menuIcon = this.game.add.sprite(this.game.width - 40, -60, 'graphics', 'green_sliderDown.png');
        this.menuIcon.inputEnabled = true;
        this.menuIcon.events.onInputDown.add(this.togglePause, this);

        this.layers.pauseLayer.add( this.menuIcon );

        //show live icon
        this.healthIcon = this.game.add.sprite(50, 40, 'graphics', 'hudHeart_full.png');
        this.healthIcon.anchor.setTo(0.5);
        this.healthIcon.scale.setTo(0.5);
        this.layers.interfaceLayer.add( this.healthIcon );

        //show lives
        this.healthLabel = this.game.add.text(this.healthIcon.right + 20, this.healthIcon.y, this.player.health, uiStyle);
        this.healthLabel.anchor.setTo(0.5);
        this.layers.interfaceLayer.add( this.healthLabel );

        //init alarm textLabel
        this.alarmLabel = this.game.add.text(this.game.centerX, this.healthIcon.y, '', alarmStyle);
        this.alarmLabel.anchor.setTo(0.5);
        // hide on start
        this.alarmLabel.visible = false;
        this.layers.interfaceLayer.add( this.alarmLabel );

        this.pausedLabel = this.game.add.text(this.game.width - 130, 40, 'PAUSED', uiStyle);
        this.pausedLabel.anchor.setTo(0.5);
        // hide paused label at start
        this.pausedLabel.visible = false;
        this.layers.pauseLayer.add( this.pausedLabel );

        //onscreen controls setup
        this.game.onscreenControls.setup(this.player, {
            action: true,
            actionSprite: {
                spritesheet: 'graphics',
                frame: 'shadedDark49.png',
                downFrame: 'flatDark48.png'
            }
        });

    },
    placeMenu: function(){
        var style = Planes.Config.menuStyle;
        var button1 = Planes.Config.mainBtn;
        var button2 = Planes.Config.mainBtnPressed;
        
        var cX = this.game.centerX;
        var cY = this.game.centerY;

        this.menuGroup = this.game.add.group();

        //exit button
        var exitButton = this.add.sprite(cX, cY - 100, 'graphics', button1);
        exitButton.anchor.setTo(0.5);
        this.exitButton = exitButton;

        var t = this.game.add.text(exitButton.x, exitButton.y, 'Exit', style);
        t.anchor.setTo(0.5);

        this.menuGroup.add(exitButton);
        this.menuGroup.add(t);
        //end exit button

        //continue button
        var continueButton = this.add.sprite(cX, cY - 30, 'graphics', button1);
        continueButton.anchor.setTo(0.5);
        this.continueButton = continueButton;

        var t = this.game.add.text(continueButton.x, continueButton.y, 'Continue', style);
        t.anchor.setTo(0.5);

        this.menuGroup.add(continueButton);
        this.menuGroup.add(t);
        //end continue button

        //reset button
        var resetButton = this.add.sprite(cX, cY + 40, 'graphics', button1);
        resetButton.anchor.setTo(0.5);
        this.resetButton = resetButton;

        var t = this.game.add.text(resetButton.x, resetButton.y, 'Reset', style);
        t.anchor.setTo(0.5);

        this.menuGroup.add(resetButton);
        this.menuGroup.add(t);
        //end reset button

        //hide menu on start
        this.menuGroup.visible = false;

        this.layers.pauseLayer.add(this.menuGroup);
    },
    initWarningBorder: function(){
        //init warning border
        //left
        var warningBorderLeft     = this.add.tileSprite(
            0,0,
            30,
            this.game.world.height,
            'graphics', 'warning_line.png');
        this.layers.interfaceLayer.add( warningBorderLeft );

        //right
        var warningBorderRight     = this.add.tileSprite(
            this.game.width,
            0,
            30,
            this.game.world.height,
            'graphics', 'warning_line.png');
        warningBorderRight.scale.setTo(-1, 1);
        this.layers.interfaceLayer.add( warningBorderRight );

        //top
        var warningBorderTop     = this.add.tileSprite(
            0, 0,
            30,
            this.game.world.height,
            'graphics', 'warning_line.png');
        warningBorderTop.scale.setTo(-1, -1);
        warningBorderTop.anchor.setTo(0, 1);
        warningBorderTop.angle = -90;

        this.warningBorders = {
            left:   warningBorderLeft,
            right:  warningBorderRight,
            top:    warningBorderTop,
        }
        this.warningGroup = this.add.group();

        this.warningGroup.add(warningBorderLeft);
        this.warningGroup.add(warningBorderTop);
        this.warningGroup.add(warningBorderRight);

        this.layers.interfaceLayer.add( this.warningGroup );

        //hide all warning on start
        this.warningBorders.left.visible = false;
        this.warningBorders.top.visible = false;
        this.warningBorders.right.visible = false;
    },
    refreshGUI: function(){
        this.healthLabel.text = this.player.health;
    },
    GUIoutOfBoundsWarning: function( border ){
        if( border ){
            this.warningBorders.left.visible = false;
            this.warningBorders.top.visible = false;
            this.warningBorders.right.visible = false;

            var warningBorder = this.warningBorders[border];
            warningBorder.visible = true;

            if( !this.warnPlayer ){
                this.warnPlayer = true;
                this.warningGroup.alpha = 0;

                this.alarmLabel.visible = true;
                this.alarmLabel.text = 'Turn back to the battle, chicken!';
                this.alarmLabel.alpha = 0;
                this.warningTextTween = 
                    this.game.add.tween(this.alarmLabel).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 100, true);

                var warningBorder = this.warningBorders[border];
                this.currentActiveWarningBorder = warningBorder;

                this.warningBorderTween = 
                    this.game.add.tween(this.warningGroup).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 100, true);
            }
        }
    },
    stopWarning: function(){
        if( this.warnPlayer ){
            this.warnPlayer = false;
            this.warningTextTween.stop();
            this.warningBorderTween.stop();
            this.alarmLabel.visible = false;

            this.warningGroup.alpha = 0;
        }
    },
    togglePause: function () {
        var pauseIconTween;
        if( !this.game.paused ){
            //pull down menu icon
            pauseIconTween = this.game.add.tween(this.menuIcon).to( { y: -10 }, 300, Phaser.Easing.Linear.None, true);
            
            //overlay raising tween animation
            var raisePausePanel = this.add.tween(this.pausePanel);
            raisePausePanel.to({y: 0}, 200);
            raisePausePanel.start();

            pauseIconTween.onComplete.add(function(){
                this.menuGroup.visible = true;
                // Add a input listener that can help us return from being paused
                this.game.input.onDown.add(this.unpause, this);
                this.game.paused = true;
            }, this);
        }else{
            this.game.paused = false;
            this.game.input.onDown.remove(this.unpause, this);

            //overlay raising tween animation
            var raisePausePanel = this.add.tween(this.pausePanel);
            raisePausePanel.to({y: -this.game.height}, 200);
            raisePausePanel.start();

            this.menuGroup.visible = false;
            pauseIconTween = this.game.add.tween(this.menuIcon).to( { y: -60 }, 200, Phaser.Easing.Linear.None, true);
        }
    },
    unpause: function( event ){
        var eX = event.x;
        var eY = event.y;

        //handle exit button
        var rect = new Phaser.Rectangle(0, 0, 200, 200).copyFrom(this.exitButton);
        rect.centerOn(this.exitButton.x, this.exitButton.y);

        if (rect.contains(this.game.input.x, this.game.input.y)) {
            this.togglePause();
            this.state.start('Home', true);
        }

        //handle reset button
        var rect = new Phaser.Rectangle(0, 0, 200, 200).copyFrom(this.resetButton);
        rect.centerOn(this.resetButton.x, this.resetButton.y);

        if (rect.contains(this.game.input.x, this.game.input.y)) {
            this.togglePause();
            this.state.start('Game', true, false, this.currentLevel);
        }

        //handle continue button
        var rect = new Phaser.Rectangle(0, 0, 200, 200).copyFrom(this.continueButton);
        rect.centerOn(this.continueButton.x, this.continueButton.y);

        if (rect.contains(this.game.input.x, this.game.input.y)) {
            this.togglePause();
        }

        //handle menu icon
        var rect = new Phaser.Rectangle(0, 0, 200, 200).copyFrom(this.menuIcon);
        if (rect.contains(this.game.input.x, this.game.input.y)) {
            this.togglePause();
        }
    },
    showReadyLabel: function(){
        var label = this.game.add.text(
            this.game.centerX, this.game.centerY, ' GET READY! ', 
            Planes.Config.bigNotificationStyle
        );
        label.setShadow(2, 2, "rgba(0,0,0,0.5)", 2, true, true);
        label.anchor.setTo(0.5);
        label.scale.setTo(0.5);

        var appearing = this.game.add.tween(label.scale)
            .to( { x: 1, y:1 }, 1000, Phaser.Easing.Back.InOut, true);

        appearing.onComplete.add(function(){
            this.game.time.events.add(2000, function(){
                var hiding = this.game.add.tween(label.scale)
                .to( { x: 0.5, y:0.5 }, 1000, Phaser.Easing.Back.InOut, true);

                hiding.onComplete.add(function(){
                    label.kill();
                })
            }, this);
        }, this);

        this.layers.interfaceLayer.add( label );
    },
    showWinLabel: function(){
        var label = this.game.add.text(
            this.game.centerX, this.game.centerY - 50, ' Level Cleared! ', 
            Planes.Config.winLevelStyle
        );
        label.setShadow(2, 2, "rgba(0,0,0,0.5)", 2, true, true);
        label.anchor.setTo(0.5);
        label.scale.setTo(0.5);

        var appearing = this.game.add.tween(label.scale)
            .to( { x: 1, y:1 }, 1000, Phaser.Easing.Back.InOut, true);

        appearing.onComplete.add(function(){
            this.game.time.events.add(2000, function(){
                var hiding = this.game.add.tween(label.scale)
                .to( { x: 0.5, y:0.5 }, 1000, Phaser.Easing.Back.InOut, true);

                hiding.onComplete.add(function(){
                    label.kill();
                })
            }, this);
        }, this);

        this.layers.interfaceLayer.add( label );
    },
    showLooseLabel: function(){
        var label = this.game.add.text(
            this.game.centerX, this.game.centerY, ' Game Over! ', 
            Planes.Config.gameOverStyle
        );
        label.setShadow(2, 2, "rgba(0,0,0,0.5)", 2, true, true);
        label.anchor.setTo(0.5);
        label.scale.setTo(0.5);

        var appearing = this.game.add.tween(label.scale)
            .to( { x: 1, y:1 }, 1000, Phaser.Easing.Back.InOut, true);

        appearing.onComplete.add(function(){
            this.game.time.events.add(2000, function(){
                var hiding = this.game.add.tween(label.scale)
                .to( { x: 0.5, y:0.5 }, 1000, Phaser.Easing.Back.InOut, true);

                hiding.onComplete.add(function(){
                    label.kill();
                })
            }, this);
        }, this);

        this.layers.interfaceLayer.add( label );
    },
    _showLooseLabel: function(){
        var label = this.game.add.sprite(
            this.game.centerX, this.game.centerY,
            'graphics', 'textGameOver.png'
        );

        label.anchor.setTo(0.5);
        label.scale.setTo(0.5);

        var appearing = this.game.add.tween(label.scale)
            .to( { x: 1, y:1 }, 1000, Phaser.Easing.Back.InOut, true);

        appearing.onComplete.add(function(){
            this.game.time.events.add(2000, function(){
                var hiding = this.game.add.tween(label.scale)
                .to( { x: 0.5, y:0.5 }, 1000, Phaser.Easing.Back.InOut, true);

                hiding.onComplete.add(function(){
                    label.kill();
                })
            }, this);
        }, this);

        this.layers.interfaceLayer.add( label );
    },
}

