// Create OSX-style Sheets  
var Sheet = Class.create({
  initialize: function(element, trigger, options) {
    this.sheet = element
    
    if(!this.sheet) return;

    this.sheetHeight  = this.sheet.getHeight();
    this.trigger      = trigger;
    this.overlay;
    
    this.build(element.id);
    this.addObservers();
  },
  
  addObservers: function() {
    // [this.trigger].flatten().each(function(t) {
    //   $(t).observe('click', this.toggle.bind(this));
    // }.bind(this));
    // this.cancelBtn.observe('click', this.hide.bind(this));
  },
  

  
  toggle: function(event) {
    event.stop();
    this.overlay.visible() ? this.hide() : this.show();
  },
  
  hide: function(event) {
    if(event) event.stop();

    new Effect.SlideUp (this.sheetContent, {
      duration: 0.9,
      transition: Effect.Transitions.sinoidal,      
      afterFinish: function() { this.overlay.hide(); }.bind(this)
    })
  },
  
  hide_now : function() {
    this.overlay.hide()    
    new Effect.SlideUp (this.sheetContent, {
      duration: 0.0,
      transition: Effect.Transitions.linear
    })
  },
  
  show: function(event) {
    // if(Sheet.Current && Sheet.Current.overlay.visible()) Sheet.Current.hide()
    
    this.overlay.show();

    new Effect.SlideDown (this.sheetContent, {
       duration: 0.9,
       transition: Effect.Transitions.sinoidal
    })
  },
  
  build: function(namespace) {
    this.overlay = new Element('div', { id: namespace + '-overlay', 'class' : "overlay" });
    this.overlay.hide();
  
    var IE7 = navigator.userAgent.indexOf('MSIE 7') > -1
    if(!Prototype.Browser.WebKit && !IE7) { this.overlay.setStyle({position: 'absolute'}) }

    this.sheetContent = new Element('div', {id: namespace + '-content', 'class' : 'overlay-content'});
    
    this.sheet.setStyle({visibility: 'visible'})
    this.sheet.removeClassName('sheet')
    
    this.sheetContent.appendChild(this.sheet);
    this.overlay.appendChild(this.sheetContent);
        
    $('body').appendChild(this.overlay);

    this.hide_now()
  }
});


