Phaser.Plugin.OnscreenControls = function(game, parent) {
  Phaser.Plugin.call(this, game, parent);

  //add your own custom init logic
  this.game = game;
};

Phaser.Plugin.OnscreenControls.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.OnscreenControls.prototype.constructor = Phaser.Plugin.OnscreenControls;

Phaser.Plugin.OnscreenControls.prototype.setup = function(player, buttons) {
  this.player = player;

  //object in the player to keep track of buttons pressed
  this.player.btnsPressed = this.player.btnsPressed || {};

  //size of the buttons is relative to the screen
  this.btnH = 0.08 * this.game.width;
  this.btnW = this.btnH;
  this.edgeDistance = 0.25 * this.btnH;
  this.sizeActionBtn = 1.5 * this.btnH;

  //button positions
  var leftX = this.edgeDistance;
  var leftY = this.game.height - this.edgeDistance - this.btnW - this.btnH;   

  var rightX = this.edgeDistance + this.btnH + this.btnW;
  var rightY = this.game.height - this.edgeDistance - this.btnW - this.btnH;    

  var upX = this.edgeDistance + this.btnW + this.btnH;
  var upY = this.game.height - this.edgeDistance - 2 * this.btnW - this.btnH;    

  var downX = this.edgeDistance + this.btnW + this.btnH;
  var downY = this.game.height - this.edgeDistance - this.btnW;

  //buttons are bitmaps
  this.directionBitmap = this.game.add.bitmapData(this.btnW, this.btnH);
  this.directionBitmap.ctx.fillStyle = '#4BAFE3';
  this.directionBitmap.ctx.fillRect(0,0,this.btnW, this.btnH);

  this.diagonalBitmap = this.game.add.bitmapData(this.btnW, this.btnH);
  this.diagonalBitmap.ctx.fillStyle = '#4BAFE3';
  this.diagonalBitmap.ctx.fillRect(0, 0, this.btnW, this.btnH);

  this.actionBitmap = this.game.add.bitmapData(this.sizeActionBtn, this.sizeActionBtn);
  this.actionBitmap.ctx.fillStyle = '#C14BE3';
  this.actionBitmap.ctx.fillRect(0, 0, this.sizeActionBtn, this.sizeActionBtn);

  //left arrow directional button
  if(buttons.left) {     
    this.leftArrow = this.game.add.button(leftX, leftY, this.directionBitmap);
    this.leftArrow.alpha = 0.5;
    this.leftArrow.fixedToCamera = true;

    //events
    this.leftArrow.events.onInputDown.add(function(){
      this.player.btnsPressed.left = true;
    }, this);

    this.leftArrow.events.onInputUp.add(function(){
      this.player.btnsPressed.left = false;
    }, this);

    this.leftArrow.events.onInputOver.add(function(){
      this.player.btnsPressed.left = true;
    }, this);

    this.leftArrow.events.onInputOut.add(function(){
      this.player.btnsPressed.left = false;
    }, this);
  }

  //right arrow directional button
  if(buttons.right) {    
    this.rightArrow = this.game.add.button(rightX, rightY, this.directionBitmap);
    this.rightArrow.alpha = 0.5;
    this.rightArrow.fixedToCamera = true;

    //events
    this.rightArrow.events.onInputDown.add(function(){
      this.player.btnsPressed.right = true;
    }, this);

    this.rightArrow.events.onInputUp.add(function(){
      this.player.btnsPressed.right = false;
    }, this);

    this.rightArrow.events.onInputOver.add(function(){
      this.player.btnsPressed.right = true;
    }, this);

    this.rightArrow.events.onInputOut.add(function(){
      this.player.btnsPressed.right = false;
    }, this);
  }


  //up arrow directional button
  if(buttons.up) {    
    this.upArrow = this.game.add.button(upX, upY, this.directionBitmap);
    this.upArrow.angle = 90;
    this.upArrow.alpha = 0.5;
    this.upArrow.fixedToCamera = true;

    //events
    this.upArrow.events.onInputDown.add(function(){
      this.player.btnsPressed.up = true;
    }, this);

    this.upArrow.events.onInputUp.add(function(){
      this.player.btnsPressed.up = false;
    }, this);

    this.upArrow.events.onInputOver.add(function(){
      this.player.btnsPressed.up = true;
    }, this);

    this.upArrow.events.onInputOut.add(function(){
      this.player.btnsPressed.up = false;
    }, this);
  }

  //down arrow directional button
  if(buttons.down) {    
    this.downArrow = this.game.add.button(downX, downY, this.directionBitmap);
    this.downArrow.angle = 90;
    this.downArrow.alpha = 0.5;
    this.downArrow.fixedToCamera = true;

    //events
    this.downArrow.events.onInputDown.add(function(){
      this.player.btnsPressed.down = true;
    }, this);

    this.downArrow.events.onInputUp.add(function(){
      this.player.btnsPressed.down = false;
    }, this);

    this.downArrow.events.onInputOver.add(function(){
      this.player.btnsPressed.down = true;
    }, this);

    this.downArrow.events.onInputOut.add(function(){
      this.player.btnsPressed.down = false;
    }, this);
  }

  //diagonal directional button
  if(buttons.upleft) {  
    this.upleftArrow = this.game.add.button(leftX, upY, this.directionBitmap);
    this.upleftArrow.alpha = 0.3;
    this.upleftArrow.fixedToCamera = true;

    //events
    this.upleftArrow.events.onInputDown.add(function(){
      this.player.btnsPressed.upleft = true;
    }, this);

    this.upleftArrow.events.onInputUp.add(function(){
      this.player.btnsPressed.upleft = false;
    }, this);

    this.upleftArrow.events.onInputOver.add(function(){
      this.player.btnsPressed.upleft = true;
    }, this);

    this.upleftArrow.events.onInputOut.add(function(){
      this.player.btnsPressed.upleft = false;
    }, this);
  }

  //diagonal button
  if(buttons.upright) {
    this.uprightArrow = this.game.add.button(rightX, upY, this.directionBitmap);
    this.uprightArrow.alpha = 0.3;
    this.uprightArrow.fixedToCamera = true;

    //events
    this.uprightArrow.events.onInputDown.add(function(){
      this.player.btnsPressed.upright = true;
    }, this);

    this.uprightArrow.events.onInputUp.add(function(){
      this.player.btnsPressed.upright = false;
    }, this);

    this.uprightArrow.events.onInputOver.add(function(){
      this.player.btnsPressed.upright = true;
    }, this);

    this.uprightArrow.events.onInputOut.add(function(){
      this.player.btnsPressed.upright = false;
    }, this);
  }


  //diagonal button
  if(buttons.downleft) {
    this.downleftArrow = this.game.add.button(leftX, downY, this.directionBitmap);
    this.downleftArrow.alpha = 0.3;
    this.downleftArrow.fixedToCamera = true;

    //events
    this.downleftArrow.events.onInputDown.add(function(){
      this.player.btnsPressed.downleft = true;
    }, this);

    this.downleftArrow.events.onInputUp.add(function(){
      this.player.btnsPressed.downleft = false;
    }, this);

    this.downleftArrow.events.onInputOver.add(function(){
      this.player.btnsPressed.downleft = true;
    }, this);

    this.downleftArrow.events.onInputOut.add(function(){
      this.player.btnsPressed.downleft = false;
    }, this);
  }

  //diagonal button
  if(buttons.downright) {
    this.downrightArrow = this.game.add.button(rightX, downY, this.directionBitmap);
    this.downrightArrow.alpha = 0.3;
    this.downrightArrow.fixedToCamera = true;

    //events
    this.downrightArrow.events.onInputDown.add(function(){
      this.player.btnsPressed.downright = true;
    }, this);

    this.downrightArrow.events.onInputUp.add(function(){
      this.player.btnsPressed.downright = false;
    }, this);

    this.downrightArrow.events.onInputOver.add(function(){
      this.player.btnsPressed.downright = true;
    }, this);

    this.downrightArrow.events.onInputOut.add(function(){
      this.player.btnsPressed.downright = false;
    }, this);
  }

  
  //action button (jump, shoot, etc)
  if(buttons.action) {
    var actionX = this.game.width - this.edgeDistance - this.sizeActionBtn;
    var actionY = this.game.height - this.edgeDistance - this.btnW - this.btnH;
    if( buttons.actionSprite ){
        this.actionButton = this.game.add.button(
            actionX, actionY, 
            buttons.actionSprite.spritesheet,
            null, null,
            buttons.actionSprite.frame,
            buttons.actionSprite.frame,
            buttons.actionSprite.downFrame,
            buttons.actionSprite.frame
        );
        this.actionButton.alpha = 1;
    }else{
        this.actionButton = this.game.add.button(
            actionX, actionY, this.actionBitmap
        );
        this.actionButton.alpha = 0.5;
    }
    this.actionButton.fixedToCamera = true;

    //events
    this.actionButton.events.onInputDown.add(function(){
      player.btnsPressed.action = true;
    }, this);

    this.actionButton.events.onInputUp.add(function(){
      player.btnsPressed.action = false;
    }, this);
  }
};

Phaser.Plugin.OnscreenControls.prototype.stopMovement = function() {
  this.player.btnsPressed = {};
};
