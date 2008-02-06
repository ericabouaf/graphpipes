var move_to_step = function(id) {
  var width = 975
  var position = id * width - width
  new Effect.Move ('all',{ x: -position, y: 0, mode: 'absolute'}); 
  return false;
}

Event.observe(window, 'dom:loaded', function() { 
  var tabs = $$('ul.gallery_tabs li a')
  
  tabs[0].addClassName('current')
  
  tabs.each(function(tab) {
    tab.href = '#' + tab.innerHTML.gsub(/[^a-z1-9]+/i, '-')
    tab.observe('click', function() {
      tabs.each(function(b) { b.removeClassName('current') })
      this.addClassName('current')      
      move_to_step(tabs.indexOf(tab) + 1)
    })
  })  
})





