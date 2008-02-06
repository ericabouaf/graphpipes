Event.observe(window, 'dom:loaded', function(){
  if (Prototype.Browser.IE) {
    window.location = "http://www.graphpipes.de/internet_explorer"
  }
})