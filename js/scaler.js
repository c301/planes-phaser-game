var Planes = Planes || {};

//calculate the dimensions of the game so that 100% of the screen is occupied
Planes.getGameLandscapeDimensions = function(max_w, max_h) {
  //get both w and h of the screen (some devices/browser measure this differntly, so you dont know for sure which one is which)
  var w = window.innerWidth * window.devicePixelRatio;
  var h = window.innerHeight * window.devicePixelRatio;
  
  //get the actual w and h. in landscape we'll define w as the longest one
  var landW = Math.max(w, h);
  var landH = Math.min(w, h);
  
  //do we need to scale to fit in width
  if(landW > max_w) {
    var ratioW = max_w / landW;
    landW *= ratioW;
    landH *= ratioW;
  }
  
  //do we need to scale to fit in height
  if(landH > max_h) {
    var ratioH = max_w / landW;
    landW *= ratioH;
    landH *= ratioH;
  }
  
  return {
    w: landW,
    h: landH
  }
}

