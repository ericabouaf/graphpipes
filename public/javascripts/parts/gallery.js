var move_to_step = function(id) {
  var position = id * 960 - 960
  new Effect.Move ('all',{ x: -position, y: 0, mode: 'absolute'}); 
  return false;
}  

