/*  Prototype-UI, version trunk
 *
 *  Prototype-UI is freely distributable under the terms of an MIT-style license.
 *  For details, see the PrototypeUI web site: http://www.prototype-ui.com/
 *
 *--------------------------------------------------------------------------*/

if(typeof Prototype == 'undefined' || !Prototype.Version.match("1.6"))
  throw("Prototype-UI library require Prototype library >= 1.6.0");

if (Prototype.Browser.WebKit) {
  Prototype.Browser.WebKitVersion = parseFloat(navigator.userAgent.match(/AppleWebKit\/([\d\.\+]*)/)[1]);
  Prototype.Browser.Safari2 = (Prototype.Browser.WebKitVersion < 420)
}

Prototype.falseFunction = function() { return false };

/*
Namespace: UI

  Introduction:
    Prototype-UI is a library of user interface components based on the Prototype framework.
    Its aim is to easilly improve user experience in web applications.

    It also provides utilities to help developers.

  Guideline:
    - Prototype conventions are followed
    - Everything should be unobstrusive
    - All components are themable with CSS stylesheets, various themes are provided

  Warning:
    Prototype-UI is still under deep development, this release is targeted to developers only.
    All interfaces are subjects to changes, suggestions are welcome.

    DO NOT use it in production for now.

  Authors:
    - Sébastien Gruhier, <http://www.xilinus.com>
    - Samuel Lebeau, <http://gotfresh.info>
*/

var UI = {
  Abstract: { }
};
Object.extend(Class.Methods, {
  extend: Object.extend.methodize(),

  addMethods: Class.Methods.addMethods.wrap(function(proceed, source) {
    // ensure we are not trying to add null or undefined
    if (!source) return this;

    // no callback, vanilla way
    if (!source.hasOwnProperty('methodsAdded'))
      return proceed(source);

    var callback = source.methodsAdded;
    delete source.methodsAdded;
    proceed(source);
    callback.call(source, this);
    source.methodsAdded = callback;

    return this;
  }),

  addMethod: function(name, lambda) {
    var methods = {};
    methods[name] = lambda;
    return this.addMethods(methods);
  },

  method: function(name) {
    return this.prototype[name].valueOf();
  },

  classMethod: function() {
    $A(arguments).flatten().each(function(method) {
      this[method] = (function() {
        return this[method].apply(this, arguments);
      }).bind(this.prototype);
    }, this);
    return this;
  },

  // prevent any call to this method
  undefMethod: function(name) {
    this.prototype[name] = undefined;
    return this;
  },

  // remove the class' own implementation of this method
  removeMethod: function(name) {
    delete this.prototype[name];
    return this;
  },

  aliasMethod: function(newName, name) {
    this.prototype[newName] = this.prototype[name];
    return this;
  },

  aliasMethodChain: function(target, feature) {
    feature = feature.camelcase();

    this.aliasMethod(target+"Without"+feature, target);
    this.aliasMethod(target, target+"With"+feature);

    return this;
  }
});
Object.extend(Number.prototype, {
  // Snap a number to a grid
  snap: function(round) {
    return parseInt(round == 1 ? this : (this / round).floor() * round);
  }
});
Object.extend(String.prototype, {
  camelcase: function() {
    var string = this.dasherize().camelize();
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
Object.extend(Array.prototype, {
  empty: function() {
    return !this.length;
  },

  extractOptions: function() {
    return this.last().constructor === Object ? this.pop() : {};
  }
});
Element.addMethods({
  getScrollDimensions: function(element) {
    return {
      width:  element.scrollWidth,
      height: element.scrollHeight
    }
  },

  getScrollOffset: function(element) {
    return Element._returnOffset(element.scrollLeft, element.scrollTop);
  },

  setScrollOffset: function(element, offset) {
    if (arguments.length == 3)
      offset = { left: offset, top: arguments[2] };
    element.scrollLeft = offset.left;
    element.scrollTop  = offset.top;
    return $(element);
  },

  // returns "clean" numerical style (without "px") or null if style can not be resolved
  getNumStyle: function(element, style) {
    var value = $(element).getStyle(style);
    return value === null ? null : parseInt(value);
  }
});

Object.extend(document.viewport, {
  // Alias this method for consistency
  getScrollOffset: document.viewport.getScrollOffsets,

  setScrollOffset: function(offset) {
    Element.setScrollOffset(Prototype.Browser.WebKit ? document.body : document.documentElement, offset);
  },

  getScrollDimensions: function() {
    return Element.getScrollDimensions(Prototype.Browser.WebKit ? document.body : document.documentElement);
  }
});

if (Prototype.Browser.IE) {
  Prototype.Browser.IEVersion = parseFloat(navigator.appVersion.split(';')[1].strip().split(' ')[1]);
}
/*
Interface: UI.Options
  Mixin to handle *options* argument in initializer pattern.

  TODO: find a better example than Circle that use an imaginary Point function,
        this example should be used in tests too.

  It assumes class defines a property called *options*, containing
  default options values.

  Instances hold their own *options* property after a first call to <setOptions>.

  Example:
    > var Circle = Class.create(UI.Options, {
    >
    >   // default options
    >   options: {
    >     radius: 1,
    >     origin: Point(0, 0)
    >   },
    >
    >   // common usage is to call setOptions in initializer
    >   initialize: function(options) {
    >     this.setOptions(options);
    >   }
    > });
    >
    > var circle = new Circle({ origin: Point(1, 4) });
    >
    > circle.options
    > // => { radius: 1, origin: Point(1,4) }

  Accessors:
    There are builtin methods to automatically write options accessors. All those
    methods can take either an array of option names nor option names as arguments.
    Notice that those methods won't override an accessor method if already present.

     * <optionsGetter> creates getters
     * <optionsSetter> creates setters
     * <optionsAccessor> creates both getters and setters

    Common usage is to invoke them on a class to create accessors for all instances
    of this class.
    Invoking those methods on a class has the same effect as invoking them on the class prototype.
    See <classMethod> for more details.

    Example:
    > // Creates getter and setter for the "radius" options of circles
    > Circle.optionsAccessor('radius');
    >
    > circle.setRadius(4);
    > // 4
    >
    > circle.getRadius();
    > // => 4 (circle.options.radius)

  Inheritance support:
    Subclasses can refine default *options* values, after a first instance call on setOptions,
    *options* attribute will hold all default options values coming from the inheritance hierarchy.
*/

(function() {
  UI.Options = {
    methodsAdded: function(klass) {
      klass.classMethod($w(' setOptions allOptions optionsGetter optionsSetter optionsAccessor '));
    },

    // Group: Methods

    /*
      Method: setOptions
        Extends object's *options* property with the given object
    */
    setOptions: function(options) {
      if (!this.hasOwnProperty('options'))
        this.options = this.allOptions();

      this.options = Object.extend(this.options, options || {});
    },

    /*
      Method: allOptions
        Computes the complete default options hash made by reverse extending all superclasses
        default options.

        > Widget.prototype.allOptions();
    */
    allOptions: function() {
      var superclass = this.constructor.superclass, ancestor = superclass && superclass.prototype;
      return (ancestor && ancestor.allOptions) ?
          Object.extend(ancestor.allOptions(), this.options) :
          Object.clone(this.options);
    },

    /*
      Method: optionsGetter
        Creates default getters for option names given as arguments.
        With no argument, creates getters for all option names.
    */
    optionsGetter: function() {
      addOptionsAccessors(this, arguments, false);
    },

    /*
      Method: optionsSetter
        Creates default setters for option names given as arguments.
        With no argument, creates setters for all option names.
    */
    optionsSetter: function() {
      addOptionsAccessors(this, arguments, true);
    },

    /*
      Method: optionsAccessor
        Creates default getters/setters for option names given as arguments.
        With no argument, creates accessors for all option names.
    */
    optionsAccessor: function() {
      this.optionsGetter.apply(this, arguments);
      this.optionsSetter.apply(this, arguments);
    }
  };

  // Internal
  function addOptionsAccessors(receiver, names, areSetters) {
    names = $A(names).flatten();

    if (names.empty())
      names = Object.keys(receiver.allOptions());

    names.each(function(name) {
      var accessorName = (areSetters ? 'set' : 'get') + name.camelcase();

      receiver[accessorName] = receiver[accessorName] || (areSetters ?
        // Setter
        function(value) { return this.options[name] = value } :
        // Getter
        function()      { return this.options[name]         });
    });
  }
})();
/*
Class: UI.Shadow
  Add shadow around a DOM element. The element MUST BE in ABSOLUTE position.

  Shadow can be skinned by CSS (see mac_shadow.css or drop_shadow.css).
  CSS must be included to see shadow.

  A shadow can have two states: focused and blur.
  Shadow shifts are set in CSS file as margin and padding of shadow_container to add visual information.

  Example:
    > new UI.Shadow("element_id");
*/
UI.Shadow = Class.create(UI.Options, {
  options: {
    theme: "mac_shadow",
    focus: false,
    zIndex: 100
  },

  /*
    Method: initialize
      Constructor, adds shadow elements to the DOM if element is in the DOM.
      ELement MUST BE in ABSLOUTE position

    Parameters:
      element - DOM element
      options - Hashmap of options
        - theme (default: mac_shadow)
        - focus (default: true)
        - zIndex (default: 100)

    Returns:
      this
  */
  initialize: function(element, options) {
    this.setOptions(options);

    this.element = $(element);
    this.create();
    if (Object.isElement(this.element.parentNode))
      this.render();
  },

  /*
    Method: destroy
      Destructor, removes elements from the DOM
  */
  destroy: function() {
    if (this.shadow.parentNode)
      this.remove();
  },

  // Group: Size and Position
  /*
    Method: setPosition
      Sets top/left shadow position in pixels

    Parameters:
      top -  top position in pixel
      left - left position in pixel

    Returns:
      this
  */
  setPosition: function(top, left) {
    var shadowStyle = this.shadow.style;
    shadowStyle.top  = parseInt(top)  - this.shadowSize.top  + this.shadowShift.top + 'px';
    shadowStyle.left = parseInt(left) - this.shadowSize.left + this.shadowShift.left+ 'px';

    return this;
  },

  /*
    Method: setSize
      Sets width/height shadow in pixels

    Parameters:
      width  - width in pixel
      height - height in pixel

    Returns:
      this
  */
  setSize: function(width, height) {
    var w = parseInt(width) + this.shadowSize.width - this.shadowShift.width + "px";
    this.shadow.style.width = w;
    this.shadowContents[1].style.height = parseInt(height) - this.shadowShift.height + "px";
    this.shadowContents.each(function(item){ item.style.width = w});

    return this;
  },

  /*
    Method: setBounds
      Sets shadow bounds in pixels

    Parameters:
      bounds - an Hash {top:, left:, width:, height:}

    Returns:
      this
  */
  setBounds: function(bounds) {
    return this.setPosition(bounds.top, bounds.left).setSize(bounds.width, bounds.height);
  },

  /*
    Method: setZIndex
      Sets shadow z-index

    Parameters:
      zIndex - zIndex value

    Returns:
      this
  */
  setZIndex: function(zIndex) {
    this.shadow.style.zIndex = zIndex;
    return this;
  },

   // Group: Render
  /*
    Method: show
      Displays shadow

    Returns:
      this
  */
  show: function() {
   this.shadow.show();
   return this;
  },

  /*
    Method: hide
      Hides shadow

    Returns:
      this
  */
  hide: function() {
    this.shadow.hide();
    return this;
  },

  /*
    Method: remove
      Removes shadow from the DOM

    Returns:
      this
  */
  remove: function() {
    this.shadow.remove();
    return this;
  },

  // Group: Status
  /*
    Method: focus
      Focus shadow.

      Change shadow shift. Shift values are set in CSS file as margin and padding of shadow_container to add visual information
      of shadow status

    Returns:
      this
  */
  focus: function() {
    this.options.focus = true;
    this.updateShadow();
    return this;
  },

  /*
    Method: blur
      Blurs shadow.

      Change shadow shift. Shift values are set in CSS file as margin and padding of shadow_container to add visual information
      of shadow status

    Returns:
      this
  */
  blur: function() {
    this.options.focus = false;
    this.updateShadow();
    return this;
  },

  // Private Functions
  // Adds shadow elements to DOM, computes shadow size and display it
  render: function() {
    if (this.element.parentNode && !Object.isElement(this.shadow.parentNode)) {
      this.element.parentNode.appendChild(this.shadow);
      this.computeSize();
      this.setBounds(Object.extend(this.element.getDimensions(), this.getElementPosition()));
      this.shadow.show();
    }
    return this;
  },

  // Creates HTML elements without inserting them into the DOM
  create: function() {
    var zIndex = this.element.getStyle('zIndex');
    if (!zIndex)
      this.element.setStyle({zIndex: this.options.zIndex});
    zIndex = (zIndex || this.options.zIndex) - 1;

    this.shadowContents = new Array(3);

    this.shadowContents[0] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper"}).insert(new Element("div", {className: "n_shadow"})))
      .insert(new Element("div", {className: "shadow_right ne_shadow"}))
      .insert(new Element("div", {className: "shadow_left nw_shadow"}));

    this.shadowContents[1] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper c_shadow"}))
      .insert(new Element("div", {className: "shadow_right e_shadow"}))
      .insert(new Element("div", {className: "shadow_left w_shadow"}));

    this.shadowContents[2] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper"}).insert(new Element("div", {className: "s_shadow"})))
      .insert(new Element("div", {className: "shadow_right se_shadow"}))
      .insert(new Element("div", {className: "shadow_left sw_shadow"}));

    this.shadow = new Element("div", {className: "shadow_container " + this.options.theme,
                                      style: "position:absolute; top:-10000px; left:-10000px; display:none; z-index:" + zIndex })
      .insert(this.shadowContents[0])
      .insert(this.shadowContents[1])
      .insert(this.shadowContents[2]);
  },

  // Compute shadow size
  computeSize: function() {
    if (this.focusedShadowShift)
      return;
    this.shadow.show();

    // Trick to get shadow shift designed in CSS as padding
    var content = this.shadowContents[1].select("div.c_shadow").first();
    this.unfocusedShadowShift = {};
    this.focusedShadowShift = {};

    $w("top left bottom right").each(function(pos) {this.unfocusedShadowShift[pos] = content.getNumStyle("padding-" + pos) || 0}.bind(this));
    this.unfocusedShadowShift.width  = this.unfocusedShadowShift.left + this.unfocusedShadowShift.right;
    this.unfocusedShadowShift.height = this.unfocusedShadowShift.top + this.unfocusedShadowShift.bottom;

    $w("top left bottom right").each(function(pos) {this.focusedShadowShift[pos] = content.getNumStyle("margin-" + pos) || 0}.bind(this));
    this.focusedShadowShift.width  = this.focusedShadowShift.left + this.focusedShadowShift.right;
    this.focusedShadowShift.height = this.focusedShadowShift.top + this.focusedShadowShift.bottom;

    this.shadowShift = this.options.focus ? this.focusedShadowShift : this.unfocusedShadowShift;

    // Get shadow size
    this.shadowSize  = {top:    this.shadowContents[0].childElements()[1].getNumStyle("height"),
                        left:   this.shadowContents[0].childElements()[1].getNumStyle("width"),
                        bottom: this.shadowContents[2].childElements()[1].getNumStyle("height"),
                        right:  this.shadowContents[0].childElements()[2].getNumStyle("width")};

    this.shadowSize.width  = this.shadowSize.left + this.shadowSize.right;
    this.shadowSize.height = this.shadowSize.top + this.shadowSize.bottom;

    // Remove padding
    content.setStyle("padding:0; margin:0");
    this.shadow.hide();
  },

  // Update shadow size (called when it changes from focused to blur and vice-versa)
  updateShadow: function() {
    this.shadowShift = this.options.focus ? this.focusedShadowShift : this.unfocusedShadowShift;
    var shadowStyle = this.shadow.style, pos  = this.getElementPosition(), size = this.element.getDimensions();

    shadowStyle.top  =  pos.top    - this.shadowSize.top   + this.shadowShift.top   + 'px';
    shadowStyle.left  = pos.left   - this.shadowSize.left  + this.shadowShift.left  + 'px';
    shadowStyle.width = size.width + this.shadowSize.width - this.shadowShift.width + "px";
    this.shadowContents[1].style.height = size.height - this.shadowShift.height + "px";

    var w = size.width + this.shadowSize.width - this.shadowShift.width+ "px";
    this.shadowContents.each(function(item) { item.style.width = w });
  },

  // Get element position in integer values
  getElementPosition: function() {
    return {top: this.element.getNumStyle("top"), left: this.element.getNumStyle("left")}
  }
});

// Set theme and focus as read/write accessor
UI.Shadow.optionsAccessor($w("theme focus"));
// By Tobie Langel (http://tobielangel.com)
var CSS = {
  // inspired by http://yuiblog.com/blog/2007/06/07/style/
  addRule: function(css, backwardCompatibility) {
    if (backwardCompatibility) css = css + '{' + backwardCompatibility + '}';
    var style = new Element('style', {type: 'text/css', media: 'screen'});
    $(document.getElementsByTagName('head')[0]).insert(style);
    if (style.styleSheet) style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));
    return style;
  }
};
UI.Benchmark = {
  benchmark: function(lambda, iterations) {
    var date = new Date();
    (iterations || 1).times(lambda);
    return (new Date() - date) / 1000;
  }
};
/*
  Class: UI.DragHelper
    DragHelper is a little helper that allows elements to fire drag-related events.
    It takes a parent element to observe mouse events from and lets children elements matching
    <selector> options fire corresponding drag events when they occur.

    Events fired:
      - drag:started : fired when a drag is started (mousedown then mousemove)
      - drag:updated : fired when a drag is updated (mousemove)
      - drag:ended   : fired when a drag is ended (mouseup)


    Notice it doesn't actually move anything, drag behavior has to be implemented
    by attaching handlers to drag events.

    Drag-related informations:
      event.memo contains useful information about the drag occuring:
        - dragX      : difference between pointer x position when drag started
                       and actual x position
        - dragY      : difference between pointer y position when drag started
                       and actual y position
        - mouseEvent : the original mouse event, useful to know pointer absolute position,
                       or if key were pressed.

    Example, with event handling for a specific element:

    > // Only 'resizable' will fire drag events
    > new UI.DragHelper('resizable');
    >
    > $('resizable')
    >    .observe('drag:started', function() {
    >      this.originalDimension = this.getDimension();
    >    })
    >   .observe('drag:ended', function() {
    >     this.setStyle({
    >       width:  this.originalDimension.width  + event.memo.dragX + 'px',
    >       height: this.originalDimension.height + event.memo.dragY + 'px'
    >     });
    >   });

    Example, with event delegating on the whole document:

    > // All elements in the body having the "draggable" class name will fire drag events.
    > new UI.DragHelper(document.body, { selector: '.draggable' });
    >
    > document.observe('drag:started', function(event) {
    >   alert('trying to drag ' + event.target.id);
    > }):
*/
UI.DragHelper = Class.create(UI.Options, {
  // Group: Options
  options: {
    // Property: scoll
    //   TODO.
    //   If set to true, automatically scrolls to follow the mouse when dragging,
    //   default is true.
    scroll: true,

    // Property: selector
    //   Only elements matching this selector will fire drag events,
    //   default is "body *" so all elements are candidates
    selector: 'body *'
  },

  initialize: function(element, options) {
    this.element = $(element);
    this.setOptions(options);

    $w(' mousedown mousemove mouseup ').each(function(eventName) {
      this[eventName+'Event'] = this['on'+eventName.capitalize()].bind(this);
    }, this);

    this.element.observe("mousedown", this.mousedownEvent);
  },

  // Method: destroy
  //   Stop observing the element
  destroy: function() {
    this.element.stopObserving("mousedown", this.mousedownEvent);
  },

  onMousedown: function(event) {
    var target = event.findElement(this.options.selector);

    if (!target) return;

    // store the original target and pointer
    this.dragged = target;
    Object.extend(this, event.pointer());

    document.observe("mousemove", this.mousemoveEvent)
            .observe("mouseup",   this.mouseupEvent);
  },

  onMousemove: function(event) {
    event.stop();

    if (!this.dragging)
      return this.startDrag(event);

    if (this.options.scroll)
      this.scroll(event);

    this.fire('drag:updated', event);
  },

  onMouseup: function(event) {
    document.stopObserving("mousemove", this.mousemoveEvent);
    document.stopObserving("mouseup"  , this.mouseupEvent);

    if (!this.dragging)
      return

    event.stop();
    this.endDrag(event);
  },

  startDrag: function(event) {
    this.savedCallbacks = UI.DragHelper.eventsToStop.inject({ }, function(save, name) {
      save[name] = document.body[name];
      document.body[name] = Prototype.falseFunction;
      return save;
    });

    this.dragging = true;
    this.fire('drag:started', event);
  },

  endDrag: function(event) {
    // Object.extend(document.body, this.savedCallbacks);

    this.dragging = false;
    this.fire('drag:ended', event);
  },

  scroll: function(event) {
    // TODO !

    // var area    = this.element === document.body ? document.viewport : this.element,
    //     dim     = area.getDimensions()
    //     scrollOffset  = area.getScrollOffset(),
    //     // will be [0, 0] for document.body
    //     offset  = this.element.cumulativeOffset();
    //     pointer = event.pointer();
    //
    // area.setScrollsOffset();
  },

  fire: function(eventName, event) {
    var pointer = event.pointer();

    this.dragged.fire(eventName, {
      dragX: pointer.x - this.x,
      dragY: pointer.y - this.y,
      mouseEvent: event
    });
  }
});

UI.DragHelper.eventsToStop = $w(' ondrag onselectstart ');
/*
  Class: UI.IframeShim
    Handles IE6 bug when <select> elements overlap other elements with higher z-index

  Example:
    > // creates iframe and positions it under "contextMenu" element
    > this.iefix = new UI.IframeShim().positionUnder('contextMenu');
    > ...
    > document.observe('click', function(e) {
    >   if (e.isLeftClick()) {
    >     this.contextMenu.hide();
    >
    >     // hides iframe when left click is fired on a document
    >     this.iefix.hide();
    >   }
    > }.bind(this))
    > ...
*/

// TODO:
//
// Maybe it makes sense to bind iframe to an element
// so that it automatically calls positionUnder method
// when the element it's binded to is moved or resized
// Not sure how this might affect overall perfomance...

UI.IframeShim = Class.create(UI.Options, {

  /*
    Method: initialize
    Constructor

      Creates iframe shim and appends it to the body.
      Note that this method does not perform proper positioning and resizing of an iframe.
      To do that use positionUnder method

    Returns:
      this
  */
  initialize: function() {
    this.element = new Element('iframe', {
      style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
      src: 'javascript:false;',
      frameborder: 0
    });
    $(document.body).insert(this.element);
  },

  /*
    Method: hide
      Hides iframe shim leaving its position and dimensions intact

    Returns:
      this
  */
  hide: function() {
    this.element.hide();
    return this;
  },

  /*
    Method: show
      Show iframe shim leaving its position and dimensions intact

    Returns:
      this
  */
  show: function() {
    this.element.show();
    return this;
  },

  /*
    Method: positionUnder
      Positions iframe shim under the specified element
      Sets proper dimensions, offset, zIndex and shows it
      Note that the element should have explicitly specified zIndex

    Returns:
      this
  */
  positionUnder: function(element) {
    var element = $(element),
        offset = element.cumulativeOffset(),
        dimensions = element.getDimensions(),
        style = {
          left: offset[0] + 'px',
          top: offset[1] + 'px',
          width: dimensions.width + 'px',
          height: dimensions.height + 'px',
          zIndex: element.getStyle('zIndex') - 1
        };
    this.element.setStyle(style).show();

    return this;
  },

  /*
    Method: setBounds
      Sets element's width, height, top and left css properties using 'px' as units

    Returns:
      this
  */
  setBounds: function(bounds) {
    for (prop in bounds) {
      bounds[prop] += 'px';
    }
    this.element.setStyle(bounds);
    return this;
  },

  /*
    Method: destroy
      Completely removes the iframe shim from the document

    Returns:
      this
  */
  destroy: function() {
    if (this.element)
      this.element.remove();

    return this;
  }
});
/*
  Group: Logging Facilities
    Prototype UI provides a facility to log message with levels.
    Levels are in order "debug", "info", "warn" and "error".

    As soon as the DOM is loaded, a default logger is present in UI.logger.

    This logger is :
    * an <ElementLogger> if $('log') is present
    * a <ConsoleLogger> if window.console is defined
    * a <MemLogger> otherwise

    See <AbstractLogger> to learn how to use it.

    Example:

    > UI.logger.warn('something bad happenned !');
*/

// Class: AbstractLogger

UI.Abstract.Logger = Class.create({
  /*
    Property: level
      The log level, default value is debug  <br/>
  */
  level: 'debug'
});

(function() {
  /*
    Method: debug
      Logs with "debug" level

    Method: info
      Logs with "info" level

    Method: warn
      Logs with "warn" level

    Method: error
      Logs with "error" level
  */
  var levels = $w(" debug info warn error ");

  levels.each(function(level, index) {
    UI.Abstract.Logger.addMethod(level, function(message) {
      // filter lower level messages
      if (index >= levels.indexOf(this.level))
        this._log({ level: level, message: message, date: new Date() });
    });
  });
})();

/*
  Class: NullLogger
    Does nothing
*/
UI.NullLogger = Class.create(UI.Abstract.Logger, {
  _log: Prototype.emptyFunction
});

/*
  Class: MemLogger
    Logs in memory

    Property: logs
      An array of logs, objects with "date", "level", and "message" properties
*/
UI.MemLogger = Class.create(UI.Abstract.Logger, {
  initialize: function() {
    this.logs = [];
  },

  _log: function(log) {
    this.logs.push(log);
  }
});

/*
  Class: ConsoleLogger
    Logs using window.console
*/
UI.ConsoleLogger = Class.create(UI.Abstract.Logger, {
  _log: function(log) {
    console[log.level || 'log'](log.message);
  }
});

/*
  Class: ElementLogger
    Logs in a DOM element
*/
UI.ElementLogger = Class.create(UI.Abstract.Logger, {
  /*
    Method: initialize
      Constructor, takes a DOM element to log into as argument
  */
  initialize: function(element) {
    this.element = $(element);
  },

  /*
    Property: format
      A format string, will be interpolated with "date", "level" and "message"

      Example:
        > "<p>(#{date}) #{level}: #{message}</p>"
  */
  format: '<p>(<span class="date">#{date}</span>) ' +
              '<span class="level">#{level}</span> : ' +
              '<span class="message">#{message}</span></p>',

  _log: function(log) {
    var entry = this.format.interpolate({
      level:   log.level.toUpperCase(),
      message: log.message.escapeHTML(),
      date:    log.date.toLocaleTimeString()
    });
    this.element.insert({ top: entry });
  }
});

document.observe('dom:loaded', function() {
  if ($('log'))             UI.logger = new UI.ElementLogger('log');
  else if (window.console)  UI.logger = new UI.ConsoleLogger();
  else                      UI.logger = new UI.MemLogger();
});
/*
  Class: UI.Carousel
*/
UI.Carousel = Class.create(UI.Options, {
  options: {
    direction      : "horizontal",
    previousButton : "previous_button",
    nextButton     : "next_button",
    scrollInc      : "auto",
    beforeScroll   : Prototype.emptyFunction
  },

  initialize: function(element, options) {
    this.setOptions(options);
    this.element = $(element);

    this.container   = this.element.firstDescendant();
    this.elements    = this.container.childElements();
    this.elementSize = this.elements.first().getDimensions();

    this.previousButton = $(this.options.previousButton);
    this.nextButton     = $(this.options.nextButton);

    this.cssAttribute = (this.options.direction == "horizontal" ? "left" : "top");
    this.dimAttribute = (this.options.direction == "horizontal" ? "width" : "height");

    this.nbVisible = Math.round(this.element.getDimensions()[this.dimAttribute] / this.elementSize[this.dimAttribute]);

    if (this.options.scrollInc == "auto")
      this.options.scrollInc = this.nbVisible;

    [ this.previousButton, this.nextButton ].each(function(button) {
      if (!button) return;
      button.observe("click", this.scroll.bind(this, (button == this.nextButton ? 1 : -1) * this.options.scrollInc))
            .observe("mouseover", function() {button.addClassName("over")}.bind(this))
            .observe("mouseout",  function() {button.removeClassName("over")}.bind(this));
    }, this);

    this.position = 0;
    this.updateButtons();
  },

  // Private function
  scroll: function(nbElements, event) {
    if (event) event.stop();

    if (this.animating)
      return;

    this.options.beforeScroll(nbElements);

    if (this.position + nbElements < 0)
      nbElements = -this.position;

    if (this.position + nbElements + this.nbVisible >= this.elements.length)
      nbElements = this.elements.length - nbElements - this.position ;

    if (nbElements != 0) {
      this.animating = true;
      this.position += nbElements;

      var position = this.container.getNumStyle(this.cssAttribute);
      position -= nbElements * this.elementSize[this.dimAttribute];

      if (Prototype.Browser.Safari2)
        this.container.morph(this.cssAttribute + ": " + position + "px", {
          duration: 0.4,
          afterFinish: function() { this.animating = false }.bind(this)
        });
      else {
        this.container.fade({to: 0.5, duration: 0.2, queue: "end"});
        this.container.morph(this.cssAttribute + ": " + position + "px", {
          duration: 0.4,
          queue: "end"
        });
        this.container.appear({
          from:0.5,
          duration: 0.2,
          queue: "end",
          afterFinish: function() { this.animating = false }.bind(this)
        });
      }

      this.element.fire("carousel:scrolled", { shift: nbElements });
      this.updateButtons();
    }
  },

  /*  Method: scrollTo
        Scrolls carousel, so that element with specified index is the left-most element.
        This method is convenient when using carousel in a tabbed navigation.
        Clicking on first tab should scroll first container into view, clicking on a fifth - fifth one, etc.
        Indexing starts with 0.

      Parameters:
        index index of an element which will be a left-most visible in a carousel

      Returns:
        this
  */
  scrollTo: function(index) {
    if (index > this.elements.length || index == this.position) return;
    this.scroll((this.position - index) * -1);
    return this;
  },

  // Private functions
  updateButtons: function() {
    Element[this.position == 0 ? "addClassName" : "removeClassName"](this.previousButton, "disabled");
    Element[this.position == this.elements.length - this.nbVisible ? "addClassName" : "removeClassName"](this.nextButton, "disabled")
  }
});
/*
  Class: UI.Dock
    EXPERIMENTAL.

    Creates a dock with a fisheye effect from an element.

    Assumptions:
      - Element is a UL, items are LI elements.
      - Images are IMG markups inside LI items
      - LI can contain label elements, which match a given selector (see <labelsSelector> option)

    Example:
      > new UI.Dock('dock', { hideLabels: true });

    Original source code from Safalra (Stephen Morley)
      http://www.safalra.com/web-design/javascript/mac-style-dock/.
    This is a Prototype "port"


*/
UI.Dock = Class.create(UI.Options, {

  // Group: Options
  options: {
    // Property: maxItemSize
    //   maximum size in pixel of images when magnified, default is 96.
    maxItemSize: 96,

    // Property: range
    //   number of items the magnify effect affects, default is 2.
    range: 2,

    // Property: hideLabels
    //   a boolean, if set to true labels are only visible when mouse is over, default is false.
    hideLabels: false,

    // Property: labelsSelector
    //   CSS3 selector to select labels element, default is ".label".
    labelsSelector: '.label'
  },

  initialize: function(element, options) {
    this.element = $(element);
    this.setOptions(options);

    this.scale = 0;
    this.create();
  },

  create: function() {
    this.createSchedulers();
    this.parseItems();
    this.observeElement();

    if (this.options.hideLabels)
      this.items.pluck('label').invoke('hide');

    this.options.itemSize = this.options.itemSize || this.items.first().size;
    var offset = this.options.maxItemSize - this.options.itemSize;

    this.items.pluck('element').invoke('setStyle', {
      top: "-"+offset+"px",
      position: "relative" }, this);

    this.element.style.height = this.options.itemSize + "px";
    this.redrawItems();
  },

  parseItems: function() {
    var selector = this.options.labelsSelector;

    this.items = this.element.select('LI').collect(function(LI, i) {
      LI._dockPosition = i;
      return {
        element: LI,
        image:   LI.down('img'),
        size:    parseInt(LI.down('img').readAttribute('width')),
        label:   LI.down(selector)
      }
    });
  },

  findEventItem: function(event) {
    var element = event.findElement('LI');
    return element && this.items[element._dockPosition];
  },

  createSchedulers: function() {
    this.magnifyScheduler = new PeriodicalExecuter(this.magnifyStep.bind(this), 0.01);
    this.magnifyScheduler.stop();
    this.closeScheduler = new PeriodicalExecuter(this.closeStep.bind(this), 0.01);
    this.closeScheduler.stop();
  },

  onMouseOver: function(event){
    var item = this.findEventItem(event);
    if (!item) return;

    if (this.options.hideLabels)
      this.shownLabel = item.label.show();
  },

  onMouseMove: function(event) {
    this.magnify();

    var item = this.findEventItem(event);
    if (!item) return;

    var index  = this.items.indexOf(item),
        across = (event.layerX || event.offsetX) / this.items[index].size;

    if (!across) return;

    this.items.each(function(item, i) {
      item.size = this.itemSize + (((i < index - this.range) || (i > index + this.range)) ? 0 :
        ((this.maxItemSize - this.itemSize) * (Math.cos(i - index - across + 0.5) + 1) / 2).ceil());
    }, this.options);

    this.redrawItems();
  },

  onMouseOut: function(event){
    if (this.closeTimeout || this.closeScheduler.timer)
      return;

    this.closeTimeout = this.close.bind(this).delay(0.05);

    if (this.options.hideLabels)
      this.shownLabel.hide();
  },

  magnify: function() {
    if (this.closeTimeout) {
      window.clearTimeout(this.closeTimeout);
      this.closeTimeout = false;
    }

    this.closeScheduler.stop();

    if (this.scale != 1 && !this.magnifyScheduler.timer)
      this.magnifyScheduler.registerCallback();
  },

  close: function() {
    this.closeTimeout = false;
    this.magnifyScheduler.stop();
    this.closeScheduler.registerCallback();
  },

  magnifyStep: function(scheduler){
    if (this.scale < 1) this.scale += 0.125;
    else {
      this.scale = 1;
      scheduler.stop();
    }
    this.redrawItems();
  },

  closeStep: function(scheduler){
    if (this.scale > 0) this.scale -= 0.125;
    else {
      this.scale = 0;
      scheduler.stop();
    }
    this.redrawItems();
  },

  observeElement: function() {
    this.element.observe('mouseover', this.onMouseOver.bind(this))
                .observe('mousemove', this.onMouseMove.bind(this))
                .observe('mouseout',  this.onMouseOut.bind(this));
  },

  redrawItems: function(){
    var itemSize  = this.options.itemSize,
        maxSize   = this.options.maxItemSize,
        totalSize = 0;

    this.items.each(function(item) {
      var size = itemSize + this.scale * (item.size - itemSize),
          image = item.image;
      image.setAttribute('width', size);
      image.setAttribute('height', size);
      image.style.marginTop = maxSize - size + 'px';
      if (item.label)
        item.label.style.width = size + 'px';
      totalSize += size;
    }, this);

    this.element.style.width = totalSize + 'px';
  }
});
/*
Class: UI.Window
  Main class to handle windows inside a web page.

  Example:
    > new UI.Window({ theme: 'bluglighting' }).show()
*/


/*
<div class="STitle">Options</div>
*/

UI.Window = Class.create(UI.Options, {
  // Group: Options
  options: {

    // Property: theme
    //   window theme, uses the window manager theme as default
    theme:         null,

    // Property: shadowTheme
    //   window shadow theme, uses the window manager one as default
    //   Only useful if <shadow> options is true, see <UI.Shadow> for details
    shadowTheme:   null,

    // Property: id
    //   id ot the window, generated by default
    id:            null,

    // Property: windowManager
    //   window manager that manages this window,
    //   uses UI.defaultWM as default
    windowManager: null,

    // Property: constraintToViewport
    //   TODO: unused, useful ?
    constraintToViewport: true,

    // FIXME: do something not to document all of these
    top:           null,
    left:          null,
    width:         200,
    height:        300,
    minHeight:     100,
    minWidth:      100,
    maxHeight:     null,
    maxWidth:      null,
    altitude:      "front",

    // Property: resizable
    //   true by default
    resizable:     true,

    // Property: draggable
    //   true by default
    draggable:     true,

    // Property: wired
    //   draw wires around window when dragged, false by default
    wired:         false,

    // Property: show
    //   Function used to show the window, default is Element.show
    show: Element.show,

    // Property: hide
    //   Function used to hide the window, default is Element.hide.
    hide: Element.hide,

    // Property: superflousEffects
    //   uses superflous effects when resizing or moving window.
    //   it's true if Scriptaculous' Effect is defined, false otherwise
    superflousEffects: !Object.isUndefined(window.Effect),

    // Property: shadow
    //   draw shadow around the window, default is false
    shadow:            false,

    // Property: activeOnClick
    //   When set to true, a click on an blurred window content activates it,
    //   default is true
    activeOnClick:     true,

    // Grid
    gridX:  1,
    gridY:  1,

    // Buttons and actions (false to disable)

    // Property: close
    //   Window method name as string, or false to disable close button
    //   Default is 'destroy'
    close:    'destroy',

    // Property: minimize
    //   Window method name as string, or false to disable minimize button
    //   Default is 'toggleFold'
    minimize: 'toggleFold',

    // Property: maximize
    //   Window method name as string, or false to disable maximize button
    //   Default is 'toggleMaximize'
    maximize: 'toggleMaximize'
  },

  // Group: Attributes

  /*
    Property: id
      DOM id of the window's element

    Property: element
      DOM element containing the window

    Property: windowManager
      Window manager that manages the window

    Property: content
      Window content element

    Property: header
      Window header element

    Property: footer
      Window footer element

    Property: visible
      true if window is visible

    Property: focused
      true if window is focused

    Property: folded
      true if window is folded

    Property: maximized
      true if window is maximized
  */

  /*
    Group: Events
    List of events fired by a window
  */

  /*
    Property: created
      Fired after creating the window

    Property: destroyed
      Fired after destroying the window

    Property: showing
      Fired when showing a window

    Property: shown
      Fired after showing effect

    Property: hiding
      Fired when hiding a window

    Property: hidden
      Fired after hiding effect

    Property: focused
      Fired after focusing the window

    Property: blurred
      Fired after bluring the window

    Property: maximized
      Fired after maximizing the window

    Property: restored
      Fired after restoring the window from its maximized state

    Property: fold
      Fired after unfolding the window

    Property: unfold
      Fired after folding the window

    Property: altitudeChanged
      Fired when window altitude has changed (z-index)
  */

  // Group: Contructor

  /*
    Method: initialize
      Constructor, should not be called directly, it's called by new operator (new Window())
      The window is not open and nothing has been added to the DOM yet

    Parameters:
      options - (Hash) list of optional parameters

    Returns:
      this
  */
  initialize: function(options) {
    this.setOptions(options);

    options = this.options;

    // TODO: callback here for placement
    options.top  = (options.top  || Math.random() * 500).snap(options.gridY);
    options.left = (options.left || Math.random() * 500).snap(options.gridX);

    this.windowManager = options.windowManager || UI.defaultWM;

    this.create();

    this.id = this.element.id;

    this.render();
    this.windowManager.register(this);
  },

  /*
    Method: destroy
      Destructor, closes window, cleans up DOM and memory
  */
  destroy: function($super) {
    this.hide();
    if (this.centerOptions)
      Event.stopObserving(this.windowManager.getScrollContainer(), "scroll", this.centerOptions.handler);
    this.windowManager.unregister(this);
    this.fire('destroyed');
  },

  // Group: Event handling

  /*
    Method: fire
      Fires a window custom event automatically namespaced in "window:" (see Prototype custom events).
      The memo object contains a "window" property referring to the window.

    Example:
      > UI.Window.addMethods({
      >   iconify: function() {
      >     // ... your iconifying code here ...
      >     // "fire" returns the instance so it's chain friendly
      >     return this.fire('iconified');
      >   }
      > });
      >
      > document.observe('window:iconified', function(event) {
      >   alert("Window with id " + event.memo.window.id + " has just been iconified");
      > });

    Parameters:
      eventName - an event name
      memo - a memo object

    Returns:
      this
  */
  fire: function(eventName, memo) {
    memo = memo || { };
    memo.window = this;
    this.element.fire('window:' + eventName, memo);
    return this;
  },

   /*
     Method: observe
       Observe a window event with a handler function automatically bound to the window

     Parameters:
       eventName - an event name
       handler - a handler function

     Returns:
       this
  */
  observe: function(eventName, handler) {
    this.element.observe('window:' + eventName, handler.bind(this));
    return this;
  },


  // Group: Actions

  /*
    Method: show
      Opens the window (appends it to the DOM)

    Parameters:
      modal - open the window in a modal mode (default false)

    Returns:
      this
 */
  show: function(modal) {
    if (this.visible) return this;

    this.fire('showing').effect('show');

    if (modal) {
      this.windowManager.startModalSession(this);
      this.modalSession = true;
    }

    this.addElements();
    this.visible = true;

    new PeriodicalExecuter(function(executer) {
      if (!this.element.visible()) return;
      this.fire('shown');
      executer.stop();
    }.bind(this), 0.1);

    return this;
  },

  /*
    Method: hide
       Hides the window, (removes it from the DOM)

     Returns:
       this
  */
  hide: function() {
    if (!this.visible) return this;

    this.fire('hiding').effect('hide');

    if (this.modalSession) {
      this.windowManager.endModalSession(this);
      this.modalSession = false;
    }

    this.windowManager.hide(this);

    new PeriodicalExecuter(function(executer) {
      if (this.element.visible()) return;
      this.visible = false;
      this.element.remove();
      this.fire('hidden');
      executer.stop();
    }.bind(this), 0.1);

    return this;
  },

  close: function() {
    return this.action('close');
  },

  /*
    Method: activate
      Brings window to the front and sets focus on it

     Returns:
       this
  */
  activate: function() {
    return this.bringToFront().focus();
  },

  /*
    Method: bringToFront
      Brings window to the front (but does not set focus on it)

     Returns:
       this
  */
  bringToFront: function() {
    return this.setAltitude('front');
  },

  /*
    Method: sendToBack
      Sends window to the back (without changing its focus)

     Returns:
       this
  */
  sendToBack: function() {
    return this.setAltitude('back');
  },

  /*
    Method: focus
      Focuses the window (without bringing window to the front)

     Returns:
       this
  */
  focus: function() {
    if (this.focused) return this;

    this.windowManager.focus(this);
    // Hide the overlay that catch events
    this.overlay.hide();
    // Add focused class name
    this.element.addClassName(this.options.theme + '_focused');

    this.focused = true;
    return this.fire('focused');
  },

  /*
    Method: blur
      Blurs the window (without changing windows order)

     Returns:
       this
  */
  blur: function() {
    if (!this.focused) return this;

    this.windowManager.blur(this);
    this.element.removeClassName(this.options.theme + '_focused');

    // Show the overlay to catch events
    if (this.options.activeOnClick)
      this.overlay.setStyle({ zIndex: this.lastZIndex + 1 }).show();

    this.focused = false;
    return this.fire('blurred');
  },

  /*
    Method: maximize
      Maximizes window inside its viewport (managed by WindowManager)
      Makes window take full size of its viewport

     Returns:
       this
  */
  maximize: function() {
    if (this.maximized) return this;

    // Get bounds has to be before  this.windowManager.maximize for IE!! this.windowManager.maximize remove overflow
    // and it breaks this.getBounds()
    var bounds = this.getBounds();
    if (this.windowManager.maximize(this)) {
      this.disableButton('minimize').setResizable(false);

      this.activate();
      this.maximized = true;
      this.savedArea = bounds;
      var newBounds = Object.extend(this.windowManager.getViewport().getDimensions(), { top: 0, left: 0 });
      this[this.options.superflousEffects && !Prototype.Browser.IE ? "morph" : "setBounds"](newBounds);
      return this.fire('maximized');
    }
  },

  /*
    Function: restore
      Restores a maximized window to its initial size

     Returns:
       this
  */
  restore: function() {
    if (!this.maximized) return this;

    if (this.windowManager.restore(this)) {
      this[this.options.superflousEffects ? "morph" : "setBounds"](this.savedArea);
      this.enableButton("minimize").setResizable(true);

      this.maximized = false;
      return this.fire('restored');
    }
  },

  /*
    Function: toggleMaximize
      Maximizes/Restores window inside it's viewport (managed by WindowManager)

     Returns:
       this
  */
  toggleMaximize: function() {
    return this.maximized ? this.restore() : this.maximize();
  },

  /*
    Function: adapt
      Adapts window size to fit its content

     Returns:
       this
  */
  adapt: function() {
    var dimensions = this.content.getScrollDimensions();
    this[this.options.superflousEffects ? "morph" : "setBounds"](dimensions, true);
    return this;
  },

  /*
    Method: fold
      Folds window content

     Returns:
       this
  */
  fold: function() {
    if (!this.folded) {
      var size = this.getSize(true);
      this.folded = true;
      this.savedInnerHeight = size.height;

      if (this.options.superflousEffects)
        this.morph({ width: size.width, height: 0 }, true);
      else
        this.setSize(size.width, 0, true);

      this.setResizable(false);
      this.fire("fold")
    }
    return this;
  },

  /*
    Method: unfold
      Unfolds window content

     Returns:
       this
  */
  unfold: function() {
    if (this.folded) {
      var size = this.getSize(true);
      this.folded = false;

      if (this.options.superflousEffects)
        this.morph({ width: size.width, height: this.savedInnerHeight }, true);
      else
        this.setSize(size.width, this.savedInnerHeight, true);

      this.setResizable(true);
      this.fire("unfold");
    }
    return this;
  },

  /*
    Method: toggleFold
      Folds/Unfolds window content

     Returns:
       this
  */
  toggleFold: function() {
    return this.folded ? this.unfold() : this.fold();
  },

  /*
    Method: setHeader
      Sets window header, equivalent to this.header.update(...) but allows chaining

     Returns:
       this
  */
  setHeader: function(header) {
    this.header.update(header);
    return this;
  },

  /*
    Method: setContent
      Sets window content, equivalent to this.content.update(...) but allows chaining

     Returns:
       this
  */
  setContent: function(content) {
    this.content.update(content);
    return this;
  },

  /*
    Method: setFooter
      Sets window footer, equivalent to this.footer.update(...) but allows chaining

     Returns:
       this
  */
  setFooter: function(footer) {
    this.footer.update(footer);
    return this;
  },

  /*
    Method: setAjaxContent
      Sets window content using Ajax request
      You can use this.loadIndicator to show a message while request is taking place

      Example (from functional test: test_ajax.html):

      (start example)
       new UI.Window().show().setAjaxContent('../fixtures/content.html', {
         onCreate: function() {
           this.loadIndicator.update('<div class="message">Please wait...</div>' +
                                     '<div class="spinner">   </div>').show();
         },

         onComplete: function() {
           this.loadIndicator.fade();
         }
       });
      (end example)


     Parameters:
        url - Ajax URL
        options - Ajax Updater options (see http://prototypejs.org/api/ajax/options and
          http://prototypejs.org/api/ajax/updater)

     Returns:
       this
  */
  setAjaxContent: function(url, options) {
    options = Object.extend({
      onCreate: function() { this.loadIndicator.show() },
      onComplete: function() { this.loadIndicator.hide() }
    }, options || {});

    // bind all callbacks to the window
    Object.keys(options).each(function(name) {
      if (Object.isFunction(options[name]))
        options[name] = options[name].bind(this);
    }, this);

    new Ajax.Updater(this.content, url, options);
    return this;
  },

  // Group: Size and Position

  /*
    Method: getPosition
      Returns top/left position of a window (in pixels)

     Returns:
       an Hash {top:, left:}
  */
  getPosition: function() {
    return { left: this.options.left, top: this.options.top };
  },

  /*
    Method: setPosition
      Sets top/left position of a window (in pixels)

    Parameters
      top:  top position in pixel
      left: left position in pixel

    Returns:
      this
  */
  setPosition: function(top, left) {
    var pos = this.computePosition(top, left);
    this.options.top  = pos.top;
    this.options.left = pos.left;

    var elementStyle  = this.element.style;
    elementStyle.top  = pos.top + 'px';
    elementStyle.left = pos.left + 'px';

    return this;
  },

  /*
    Method: center
      Centers the window within its viewport

    Returns:
      this
  */
  center: function(options) {
    var size          = this.getSize(),
        windowManager = this.windowManager,
        viewport      = windowManager.getViewport();
        viewportArea  = viewport.getDimensions(),
        offset        = viewport.getScrollOffset();

    if (options && options.auto) {
      this.centerOptions = Object.extend({ handler: this.recenter.bind(this) }, options);
      Event.observe(this.windowManager.getScrollContainer(),"scroll", this.centerOptions.handler);
      Event.observe(window,"resize", this.centerOptions.handler);
    }

    options = Object.extend({
      top:  (viewportArea.height - size.height) / 2,
      left: (viewportArea.width  - size.width)  / 2
    }, options || {});

    return this.setPosition(options.top + offset.top, options.left + offset.left);
  },

  /*
    Method: getSize
      Returns window width/height dimensions (in pixels)

    Parameters
      innerSize: returns content size if true, window size if false (defaults to false)

    Returns:
      Hash {width:, height:}
  */
  getSize: function(innerSize) {
    if (innerSize)
      return { width:  this.options.width  - this.borderSize.width,
               height: this.options.height - this.borderSize.height };
    else
      return { width: this.options.width, height: this.options.height };
  },

  /*
    Method: setSize
      Sets window width/height dimensions (in pixels)

    Parameters
      width:  width (in pixels)
      height: height (in pixels)
      innerSize: if true change set content size, else set window size (defaults to false)

    Returns:
      this
  */
  setSize: function(width, height, innerSize) {
    var size = this.computeSize(width, height, innerSize);
    var elementStyle = this.element.style, contentStyle = this.content.style;

    this.options.width  = size.outerWidth;
    this.options.height = size.outerHeight;

    elementStyle.width = size.outerWidth + "px", elementStyle.height = size.outerHeight + "px";
    contentStyle.width = size.innerWidth + "px", contentStyle.height = size.innerHeight + "px";

 	  return this;
  },

  /*
    Method: getBounds
      Returns window bounds (in pixels)

    Parameters
      innerSize: returns content size if true, window size otherwise

    Returns:
      an Hash {top:, left:, width:, height:}
  */
  getBounds: function(innerSize) {
    return Object.extend(this.getPosition(), this.getSize(innerSize));
  },

  /*
    Method: setBounds
      Sets window bounds (in pixels)

    Parameters
      bounds: Hash {top:, left:, width:, height:} where all values are optional
      innerSize: sets content size if true, window size otherwise

    Returns:
      Hash {top:, left:, width:, height:}
  */
  setBounds: function(bounds, innerSize) {
    return this.setPosition(bounds.top, bounds.left)
               .setSize(bounds.width, bounds.height, innerSize);
  },

  morph: function(bounds, innerSize) {
    bounds = Object.extend(this.getBounds(innerSize), bounds || {});

    if (this.centerOptions && this.centerOptions.auto)
       bounds = Object.extend(bounds, this.computeRecenter(bounds));

    if (innerSize) {
      bounds.width  += this.borderSize.width;
      bounds.height += this.borderSize.height;
    }

    this.animating = true;

    new UI.Window.Effects.Morph(this, bounds, {
      duration: 0.5,
      afterFinish: function() { this.animating = false }.bind(this)
    });

    Object.extend(this.options, bounds);

    return this;
  },

  /*
    Method: getAltitude
      Returns window altitude, an integer between 0 and the number of windows,
      the higher the altitude number - the higher the window position.
  */
  getAltitude: function() {
    return this.windowManager.getAltitude(this);
  },

  /*
    Method: setAltitude
      Sets window altitude, fires 'altitudeChanged' only if altitude was changed
  */
  setAltitude: function(altitude) {
    return this.windowManager.setAltitude(this, altitude) ?
           this.fire('altitudeChanged') :
           this;
  },

  setResizable: function(resizable) {
    this.options.resizable = resizable;
    var se = this.element.select("div.se").first();
    if (resizable) {
      this.element.select("div:[class*=_sizer]").invoke('show');
      se.addClassName("se_resize_handle");
    } else {
      this.element.select("div:[class*=_sizer]").invoke('hide');
      se.removeClassName("se_resize_handle");
    }
    return this;
  },

  // Group: Theme
  /*
    Method: getTheme
      Returns window theme name
  */
  getTheme: function() {
    return this.options.theme || this.windowManager.getTheme();
  },

  /*
    Method: setTheme
      Sets window theme
  */
  setTheme: function(theme, windowManagerTheme) {
    this.element.removeClassName(this.getTheme()).addClassName(theme);
    // window has it's own theme
    if (!windowManagerTheme)
      this.options.theme = theme;

    return this;
  },

  /*
    Method: getShadowTheme
      Returns shadow theme name
  */
  getShadowTheme: function() {
    return this.options.shadowTheme || this.windowManager.getShadowTheme();
  }
});


// FIXME
UI.Window.events =
  $w('create showing show hiding hide focus blur fold unfold ' +
      'maximize startMove endMove startResize endResize');

UI.Window.addMethods(UI.Window.Buttons);
UI.Window.addMethods(UI.Window.Shadow);
UI.Window.optionsAccessor($w("minWidth minHeight maxWidth maxHeight gridX gridY altitude"));
// Private functions for window.js
UI.Window.addMethods({
  style: "position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;",

  action: function(name) {
    var action = this.options[name];
    if (action)
      Object.isString(action) ? this[action]() : action(this);
  },

  create: function() {
    // Main div
    this.element = new Element("div", {
      id: this.options.id,
      className: "ui-window " + this.getTheme(),
      style: "top:-10000px; left:-10000px"
    });

    if (Prototype.Browser.Safari2)
      this.element.addClassName("_ui-window_safari2_fix_");

    // Create HTML window code
    this.header  = new Element("div", { className: "n" + (this.options.draggable ? " drag_handle" : "") });
    this.content = new Element("div", { className: "content" });
    this.footer  = new Element("div", { className: "s" + (this.options.draggable ? " drag_handle" : "") });

    this.header.dragPrefix = "header";
    this.footer.dragPrefix = "footer";

    var header   = new Element("div", { className: "nw" })
     .insert(new Element("div", { className: "ne" }).insert(this.header));

    var content  = new Element("div", { className: "w"  })
      .insert(new Element("div", { className: "e", style: "position:relative"  }).insert(this.content));

    var footer   = new Element("div", { className: "sw" })
      .insert(new Element("div", { className: "se" + (this.options.resizable ?  " se_resize_handle" : "")})
      .insert(this.footer));
    this.content.appendChild(document.createTextNode(' '));

    this.element.insert(header).insert(content).insert(footer);
    this.header.observe('mousedown', this.activate.bind(this));

    if (this.options.wired)
      this.wiredElement = new Element("div", {
        className: this.getTheme() + "_wired",
        style: "display:none; position:absolute; top:0; left:0"
      });

    // Resize handlers
    if (this.options.resizable) {
      $w(" n  e  w  s  se  sw  ne  nw ").each(function(id) {
        var elt = new Element("div", { className: id + "_sizer drag_handle" });
        elt.dragPrefix = id;
        this.element.insert(elt);
      }, this);
    }

    this.element.observe('drag:started', this.onStartDrag.bind(this))
                .observe('drag:updated', this.onDrag.bind(this))
                .observe('drag:ended',   this.onEndDrag.bind(this));

    this.loadIndicator = new Element("div", {
      className: "load_indicator",
      style: "display: none; position: absolute"
    });

    this.element.appendChild(this.loadIndicator);

    this.overlay = new Element('div', { style: this.style + "display: none" })
        .observe('mousedown', this.activate.bind(this));

    if (this.options.activeOnClick)
      this.content.parentNode.appendChild(this.overlay);

    // Default style position and ID
    this.element.style.position = 'absolute';
    this.element.identify("ui-window");
  },

  // First rendering, pre-compute window border size
  render: function() {
    this.addElements();

    this.computeBorderSize();
    this.updateButtonsOrder();
    this.element.hide().remove();

    // this.options contains top, left, width and height keys
    this.setBounds(this.options);
  },

  // Adds window elements to the DOM
  addElements: function() {
    this.windowManager.getContainer().appendChild(this.element);
  },

  // Set z-index to all window elements
  setZIndex: function(zIndex) {
    if (this.zIndex != zIndex) {
      this.zIndex = zIndex;
      [ this.element ].concat(this.element.childElements()).each(function(element) {
        element.style.zIndex = zIndex++;
      });
      this.lastZIndex = zIndex;
    }
    return this;
  },

  effect: function(name, element, options) {
    var effect = this.options[name] || Prototype.emptyFunction;
    effect(element || this.element, options || {});
  },

  // re-compute window border size
  computeBorderSize: function() {
    if (this.element) {
      if (Prototype.Browser.IEVersion >= 7)
        this.content.style.width = "100%";
      var dim = this.element.getDimensions(), pos = this.content.positionedOffset();
      this.borderSize = {  top:    pos[1],
                           bottom: dim.height - pos[1] - this.content.getHeight(),
                           left:   pos[0],
                           right:  dim.width - pos[0] - this.content.getWidth() };
      if (Prototype.Browser.Safari2) {
        var borderSize = this.borderSize;
        borderSize.left--; borderSize.right--; borderSize.bottom--; borderSize.top--;
      }
      this.borderSize.width  = this.borderSize.left + this.borderSize.right;
      this.borderSize.height = this.borderSize.top  + this.borderSize.bottom;
      if (Prototype.Browser.IEVersion >= 7)
        this.content.style.width = "auto";
    }
  },

  computeSize: function(width, height, innerSize) {
    var innerWidth, innerHeight, outerWidth, outerHeight;
	  if (innerSize) {
	    outerWidth  =  width  + this.borderSize.width;
	    outerHeight =  height + this.borderSize.height;
    } else {
	    outerWidth  =  width;
	    outerHeight =  height;
    }
    // Check grid value
    if (!this.animating) {
      outerWidth = outerWidth.snap(this.options.gridX);
      outerHeight = outerHeight.snap(this.options.gridY);

      // Check min size
      if (!this.folded) {
        if (outerWidth < this.options.minWidth)
          outerWidth = this.options.minWidth;

        if (outerHeight < this.options.minHeight)
          outerHeight = this.options.minHeight;
      }

      // Check max size
      if (this.options.maxWidth && outerWidth > this.options.maxWidth)
        outerWidth = this.options.maxWidth;

      if (this.options.maxHeight && outerHeight > this.options.maxHeight)
        outerHeight = this.options.maxHeight;
    }

    if (this.centerOptions && this.centerOptions.auto)
      this.recenter();

    innerWidth  = outerWidth - this.borderSize.width;
    innerHeight = outerHeight - this.borderSize.height;
    return {
      innerWidth: innerWidth, innerHeight: innerHeight,
      outerWidth: outerWidth, outerHeight: outerHeight
    };
  },

  computePosition: function(top, left) {
    if (this.centerOptions && this.centerOptions.auto)
      return this.computeRecenter(this.getSize());                                                                                                            ;

    return {
      top:  this.animating ? top  : top.snap(this.options.gridY),
      left: this.animating ? left : left.snap(this.options.gridX)
    };
  },

  computeRecenter: function(size) {
    var viewport   = this.windowManager.getViewport(),
        area       = viewport.getDimensions(),
        offset    = viewport.getScrollOffset(),
        center     = {
          top:  Object.isUndefined(this.centerOptions.top)  ? (area.height - size.height) / 2 : this.centerOptions.top,
          left: Object.isUndefined(this.centerOptions.left) ? (area.width  - size.width)  / 2 : this.centerOptions.left
        };

    return {
      top:  parseInt(center.top + offset.top),
      left: parseInt(center.left + offset.left)
    };
  },

  recenter: function(event) {
    var pos = this.computeRecenter(this.getSize());
    this.setPosition(pos.top, pos.left);
  }
});
UI.URLWindow = Class.create(UI.Window, {
  options: {
    url: 'about:blank'
  },

  afterClassCreate: function() {
    this.undefMethod('setAjaxContent');
  },

  initialize: function($super, options) {
    $super(options);
    this.setUrl(this.options.url);
  },

  destroy: function($super){
    this.iframe.src = null;
    $super();
  },

  getUrl: function() {
    return this.iframe.src;
  },

  setUrl: function(url, options) {
    this.iframe.src = url;
    return this;
  },

  create: function($super) {
    $super();

    this.iframe = new Element('iframe', {
      style: this.style,
      frameborder: 0,
      src: this.options.url,
      name: this.element.id + "_frame",
      id:  this.element.id + "_frame"
    });

    this.content.insert(this.iframe);
  }
});
if (!Object.isUndefined(window.Effect)) {
  UI.Window.Effects = UI.Window.Effects || {};
  UI.Window.Effects.Morph = Class.create(Effect.Base, {
    initialize: function(window, bounds) {
      this.window = window;
      var options = Object.extend({
        fromBounds: this.window.getBounds(),
        toBounds:   bounds,
        from:       0,
        to:         1
      }, arguments[2] || { });
      this.start(options);
    },

    update: function(position) {
      var t = this.options.fromBounds.top + (this.options.toBounds.top   - this.options.fromBounds.top) * position;
      var l = this.options.fromBounds.left + (this.options.toBounds.left - this.options.fromBounds.left) * position;

      var ow = this.options.fromBounds.width + (this.options.toBounds.width - this.options.fromBounds.width) * position;
      var oh = this.options.fromBounds.height + (this.options.toBounds.height - this.options.fromBounds.height) * position;

      this.window.setBounds({top: t,  left: l, width: ow, height: oh})
    }
  });
}
UI.Window.addMethods({
  onStartDrag: function(event) {
    var prefix = event.target.dragPrefix,
        mouseEvent = event.memo.mouseEvent;

    if (this.maximized)
      return;

    // alt + drag moves the window wherever you click
    if (mouseEvent.altKey) prefix = 'top';
    // shift + drag resizes the window from the south-east corner
    else if (mouseEvent.shiftKey) prefix = 'se';

    this.windowManager.startDrag(this);

    // This method will be called by onDrag
    this._drag = this[prefix + "Drag"];

    this.initBounds  = this.getBounds();
    this.activate();

    if (this.options.wired) {
      this.wiredElement.style.cssText = this.element.style.cssText;
      this.element.hide();
      this.saveElement = this.element;
      this.windowManager.getContainer().appendChild(this.wiredElement);
      this.element = this.wiredElement;
    }

    this.dragging = true;
  },

  onDrag: function(event) {
    this._drag(event.memo.dragX, event.memo.dragY);
  },

  onEndDrag: function(event) {
    this.windowManager.endDrag(this);

    if (this.options.wired) {
      this.saveElement.style.cssText = this.wiredElement.style.cssText;
      this.wiredElement.remove();
      this.element = this.saveElement;
    }

    this.dragging = false;
  },

  headerDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setPosition(initBounds.top + dy, initBounds.left + dx);
  },

  footerDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setPosition(initBounds.top + dy, initBounds.left + dx);
  },

  swDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setBounds(init)
        .setSize(initBounds.width - dx, initBounds.height + dy)
        .setPosition(initBounds.top,
                     initBounds.left + (initBounds.width - this.getSize().width));
  },

  seDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setSize(initBounds.width + dx, initBounds.height + dy);
  },

  nwDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setSize(initBounds.width - dx, initBounds.height - dy)
        .setPosition(initBounds.top + (initBounds.height - this.getSize().height),
                     initBounds.left + (initBounds.width - this.getSize().width));
  },

  neDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setSize(initBounds.width + dx, initBounds.height - dy)
        .setPosition(initBounds.top + (initBounds.height - this.getSize().height),
                     initBounds.left);
  },

  wDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setSize(initBounds.width - dx, initBounds.height)
        .setPosition(initBounds.top,
                     initBounds.left + (initBounds.width - this.getSize().width));
  },

  eDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setSize(initBounds.width + dx, initBounds.height);
  },

  nDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setSize(initBounds.width, initBounds.height - dy)
        .setPosition(initBounds.top + (initBounds.height - this.getSize().height),
                     initBounds.left);
  },

  sDrag: function(dx, dy) {
    var initBounds = this.initBounds;
    this.setSize(initBounds.width, initBounds.height + dy);
  }
});
UI.Window.addMethods({
  methodsAdded: function(base) {
    base.aliasMethodChain('create',  'buttons');
    base.aliasMethodChain('destroy', 'buttons');
  },

  createWithButtons: function() {
    this.createWithoutButtons();

    if (!this.options.resizable) {
      this.options.minimize = false;
      this.options.maximize = false;
    }

    this.buttons = new Element("div", { className: "buttons" })
      .observe('click',     this.onButtonsClick.bind(this))
      .observe('mouseover', this.onButtonsHover.bind(this))
      .observe('mouseout',  this.onButtonsOut.bind(this));

    this.element.insert(this.buttons);

    this.defaultButtons.each(function(button) {
      if (this.options[button] !== false)
        this.addButton(button);
    }, this);
  },

  destroyWithButtons: function() {
    this.buttons.stopObserving();
    this.destroyWithoutButtons();
  },

  defaultButtons: $w(' minimize maximize close '),

  getButtonElement: function(buttonName) {
    return this.buttons.down("." + buttonName);
  },

  // Controls close, minimize, maximize, etc.
  // action can be either a string or a function
  // if action is a string, it is the method name that will be called
  // else the function will take the window as first parameter.
  // if not given action will be taken in window's options
  addButton: function(buttonName, action) {
    this.buttons.insert(new Element("a", { className: buttonName }));

    if (action)
      this.options[buttonName] = action;

    return this;
  },

  removeButton: function(buttonName) {
    this.getButtonElement(buttonName).remove();
    return this;
  },

  disableButton: function(buttonName) {
    this.getButtonElement(buttonName).addClassName("disabled");
    return this;
  },

  enableButton: function(buttonName) {
    this.getButtonElement(buttonName).removeClassName("disabled");
    return this;
  },

  onButtonsClick: function(event) {
    var element = event.findElement('a:not(.disabled)');

    if (element) this.action(element.className);
  },

  onButtonsHover: function(event) {
    this.buttons.addClassName("over");
  },

  onButtonsOut: function(event) {
    this.buttons.removeClassName("over");
  },

  updateButtonsOrder: function() {
    var buttons = this.buttons.childElements();

    buttons.inject(new Array(buttons.length), function(array, button) {
      array[parseInt(button.getStyle("padding-top"))] = button.setStyle("padding: 0");
      return array;
    }).each(function(button) { this.buttons.appendChild(button) }, this);
  }
});
UI.Window.addMethods({
  methodsAdded: function(base) {
    (function(methods) {
      $w(methods).each(function(m) { base.aliasMethodChain(m, 'shadow') });
    })(' create addElements setZIndex setPosition setSize setBounds ');
  },

  showShadow: function() {
    if (this.shadow) {
      this.shadow.hide();
      this.effect('show', this.shadow.shadow);
    }
  },

  hideShadow: function() {
    if (this.shadow)
      this.effect('hide', this.shadow.shadow);
  },

  removeShadow: function() {
    if (this.shadow)
      this.shadow.remove();
  },

  focusShadow: function() {
    if (this.shadow)
      this.shadow.focus();
  },

  blurShadow: function() {
    if (this.shadow)
      this.shadow.blur();
  },

  // Private Functions
  createWithShadow: function() {
    this.createWithoutShadow();

    this.observe('showing', this.showShadow)
        .observe('hiding',  this.hideShadow)
        .observe('hidden',  this.removeShadow)
        .observe('focused', this.focusShadow)
        .observe('blurred', this.blurShadow);

    if (this.options.shadow)
      this.shadow = new UI.Shadow(this.element, {theme: this.getShadowTheme()});
  },

  addElementsWithShadow: function() {
    this.addElementsWithoutShadow();
    if (this.shadow)
      this.shadow.render();
  },

  setZIndexWithShadow: function(zIndex) {
    if (this.zIndex != zIndex) {
      if (this.shadow)
        this.shadow.setZIndex(zIndex - 1);
      this.setZIndexWithoutShadow(zIndex);
      this.zIndex = zIndex;
    }
    return this;
  },

  setPositionWithShadow: function(top, left) {
    this.setPositionWithoutShadow(top, left);
    if (this.shadow) {
      var pos = this.getPosition();
      this.shadow.setPosition(pos.top, pos.left);
    }
    return this;
  },

  setSizeWithShadow: function(width, height, innerSize) {
    this.setSizeWithoutShadow(width, height, innerSize);
    if (this.shadow) {
      var size = this.getSize();
      this.shadow.setSize(size.width, size.height);
    }

    return this;
  },

  setBoundsWithShadow: function(bounds) {
    this.setBoundsWithoutShadow(bounds);
    bounds = Object.extend(this.getSize(), this.getPosition());
    if (this.shadow) {
      this.shadow.setBounds(bounds);
    }
  }
});

/*
Class: UI.WindowManager
  Window Manager.
  A default instance of this class is created in UI.defaultWM.

  Example:
    > new UI.WindowManger({
    >   container: 'desktop',
    >   theme: 'mac_os_x'
    > });
*/

UI.WindowManager = Class.create(UI.Options, {

  options: {
    container:   null, // will default to document.body
    zIndex:      0,
    theme:       "alphacube",
    shadowTheme: "mac_shadow",
    showOverlay: Element.show,
    hideOverlay: Element.hide
  },

  initialize: function(options) {
    this.setOptions(options);

    this.stack = new UI.WindowManager.Stack();
    this.modalSessions = 0;

    this.createOverlays();

    Event.observe(window, "resize", this.resize.bind(this));
  },

  destroy: function() {
    // FIXME
    // stop observing container
    this.stack.destroy();
    this.windows().invoke('destroy');
    Event.stopObserving(window, "resize");
  },

  getContainer: function() {
    if (Object.isElement(this.options.container))
      return this.options.container;

    this.options.container = $(this.options.container || document.body);
    this.dragHelper = new UI.DragHelper(this.options.container, {
      selector: '.ui-window .drag_handle'
    });
    return this.options.container;
  },

  getViewport: function() {
    var container = this.getContainer();
    return container === document.body ? document.viewport : container;
  },

  getScrollContainer: function() {
    var container = this.getContainer();
    return container === document.body ? window : container;
  },

  /*
    Method: setTheme
      Changes window manager's theme, all windows that don't have a own theme
      will have this new theme.

    Parameters:
      theme - theme name

    Example:
      > UI.defaultWM.setTheme('bluelighting');
  */
  setTheme: function(theme) {
    this.stack.windows.select(function(w) {
      return !w.options.theme;
    }).invoke('setTheme', theme, true);
    this.options.theme = theme;
    return this;
  },

  register: function(win) {
    if (this.getWindow(win.id)) return;

    this.stack.add(win);
    this.restartZIndexes();
  },

  unregister: function(win) {
    this.stack.remove(win);

    if (win == this.focusedWindow)
      this.focusedWindow = null;
  },

  /*
    Method: getWindow
      Find the window containing a given element.

    Example:
      > $$('.ui-window a.close').invoke('observe', 'click', function() {
      >   UI.defaultWM.getWindow(this).close();
      > });

    Parameters:
      element - element or element identifier

    Returns:
      containing window or null
  */
  getWindow: function(element) {
    element = $(element);

    if (!element) return;

    if (!element.hasClassName('ui-window'))
      element = element.up('.ui-window');

    var id = element.id;
    return this.stack.windows.find(function(win) { return win.id == id });
  },

  /*
    Method: windows
      Returns an array of all windows handled by this window manager.
      First one is the back window, last one is the front window.

    Example:
      > UI.defaultWM.windows().invoke('destroy');
  */
  windows: function() {
    return this.stack.windows.clone();
  },

  /*
    Method: getFocusedWindow
      Returns the focused window
  */
  getFocusedWindow: function() {
    return this.focusedWindow;
  },

  // INTERNAL

  // Modal mode
  startModalSession: function(win) {
    if (this.modalSessions == 0) {
      this.removeOverflow();
      this.modalOverlay.className = win.getTheme() + "_overlay";
      this.getContainer().appendChild(this.modalOverlay);

      if (!this.modalOverlay.opacity)
        this.modalOverlay.opacity = this.modalOverlay.getOpacity();
      this.modalOverlay.setStyle("height: " + this.getViewport().getHeight() + "px");

      this.options.showOverlay(this.modalOverlay, {from: 0, to: this.modalOverlay.opacity})
    }
    this.modalOverlay.setStyle("z-index:" + (win.zIndex - 1));
    this.modalSessions++;
  },

  endModalSession: function(win) {
    this.modalSessions--;
    if (this.modalSessions == 0) {
      this.resetOverflow();
      this.options.hideOverlay(this.modalOverlay, { from: this.modalOverlay.opacity, to: 0 });
    } else {
      var w = this.stack.getPreviousWindow(win);
      this.modalOverlay.setStyle("z-index:" + (w.zIndex - 1));
    }
  },

  maximize: function(win) {
    this.removeOverflow();
    this.maximizedWindow = win;
    return true;
  },

  restore: function(win) {
    if (this.maximizedWindow) {
      this.resetOverflow();
      this.maximizedWindow = false;
    }
    return true;
  },

  removeOverflow: function() {
    var container = this.getContainer();
    // Remove overflow, save overflow and scrolloffset values to restore them when restore window
    container.savedOverflow = container.style.overflow || "auto";
    container.savedOffset = this.getViewport().getScrollOffset();
    container.style.overflow = "hidden";

    this.getViewport().setScrollOffset({ top:0, left:0 });

    if (this.getContainer() == document.body && Prototype.Browser.IE)
      this.cssRule = CSS.addRule("html { overflow: hidden }");
  },

  resetOverflow: function() {
    var container = this.getContainer();
    // Restore overflow ans scrolloffset
    if (container.savedOverflow) {
      if (this.getContainer() == document.body && Prototype.Browser.IE)
        this.cssRule.remove();

      container.style.overflow =  container.savedOverflow;
      this.getViewport().setScrollOffset(container.savedOffset);

      // delete container.savedOffset does not work on IE!!
      container.savedOffset = null;
      container.savedOverflow = null;
    }
  },

  hide: function(win) {
    var previous = this.stack.getPreviousWindow(win);
    if (previous)
      previous.focus();
  },

  startDrag: function(win) {
    if (win.modalSession)
      return;
    this.getContainer().appendChild(this.dragOverlay);
    this.dragOverlay.setStyle("z-index: " + this.getLastZIndex()).show();
  },

  endDrag: function(win) {
    this.dragOverlay.hide();
  },

  restartZIndexes: function(){
    // Reset zIndex
    var zIndex = this.getZIndex() + 1; // keep a zIndex free for overlay divs
    this.stack.windows.each(function(w) {
      w.setZIndex(zIndex);
      zIndex = w.lastZIndex + 1;
    });
  },

  getLastZIndex: function() {
    return this.stack.getFrontWindow().lastZIndex + 1;
  },

  overlayStyle: "position: absolute; top: 0; left: 0; display: none; width: 100%;",

  // we want to create thoses overlays once
  createOverlays: function() {
    this.modalOverlay = new Element("div", {
      style:     this.overlayStyle
    });

    this.dragOverlay = new Element("div", {
      style: this.overlayStyle + "height: 100%"
    });
  },

  focus: function(win) {
    // Blur the previous focused window
    if (this.focusedWindow)
      this.focusedWindow.blur();
    this.focusedWindow = win;
  },

  blur: function(win) {
    if (win == this.focusedWindow)
      this.focusedWindow = null;
  },

  setAltitude: function(win, altitude) {
    var stack = this.stack;

    if (altitude === "front") {
      if (stack.getFrontWindow() === win) return;
      stack.bringToFront(win);
    } else if (altitude === "back") {
      if (stack.getBackWindow() === win) return;
      stack.sendToBack(win);
    } else {
      if (stack.getPosition(win) == altitude) return;
      stack.setPosition(win, altitude);
    }

    this.restartZIndexes();
    return true;
  },

  getAltitude: function(win) {
    return this.stack.getPosition(win);
  },

  resize: function(event) {
    var area = this.getViewport().getDimensions();

    if (this.maximizedWindow)
      this.maximizedWindow.setSize(area.width, area.height);

    if (this.modalOverlay.visible())
      this.modalOverlay.setStyle("height:" + area.height + "px");
  }
});

UI.WindowManager.optionsAccessor('zIndex', 'theme', 'shadowTheme');

UI.WindowManager.Stack = Class.create(Enumerable, {
  initialize: function() {
    this.windows = [];
  },

  _each: function(iterator) {
    this.windows.each(iterator);
  },

  add: function(win, position) {
    this.windows.splice(position || this.windows.length, 0, win);
  },

  remove: function(win) {
    this.windows = this.windows.without(win);
  },

  sendToBack: function(win) {
    this.remove(win);
    this.windows.unshift(win);
  },

  bringToFront: function(win) {
    this.remove(win);
    this.windows.push(win);
  },

  getPosition: function(win) {
    return this.windows.indexOf(win);
  },

  setPosition: function(win, position) {
    this.remove(win);
    this.windows.splice(position, 0, win);
  },

  getFrontWindow: function() {
    return this.windows.last();
  },

  getBackWindow: function() {
    return this.windows.first();
  },

  getPreviousWindow: function(win) {
    return (win == this.windows.first()) ? null : this.windows[this.windows.indexOf(win) - 1];
  }
});

UI.defaultWM = new UI.WindowManager();
/*
  Class: UI.IframeShim
    Handles IE6 bug when <select> elements overlap other elements with higher z-index
  
  Example:
    > // creates iframe and positions it under "contextMenu" element
    > this.iefix = new UI.IframeShim().positionUnder('contextMenu');
    > ...
    > document.observe('click', function(e) {
    >   if (e.isLeftClick()) {
    >     this.contextMenu.hide();
    >     
    >     // hides iframe when left click is fired on a document
    >     this.iefix.hide();
    >   }
    > }.bind(this))
    > ...
*/

// TODO:
//  
// Maybe it makes sense to bind iframe to an element 
// so that it automatically calls positionUnder method 
// when the element it's binded to is moved or resized
// Not sure how this might affect overall perfomance...

UI.IframeShim = Class.create(UI.Options, {
  
  /*
    Method: initialize
    Constructor
      
      Creates iframe shim and appends it to the body.
      Note that this method does not perform proper positioning and resizing of an iframe.
      To do that use positionUnder method
      
    Returns:
      this
  */
  initialize: function() {
    this.element = new Element('iframe', {
      style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
      src: 'javascript:false;',
      frameborder: 0
    });
    $(document.body).insert(this.element);
  },
  
  /*
    Method: hide
      Hides iframe shim leaving its position and dimensions intact
      
    Returns:
      this
  */
  hide: function() {
    this.element.hide();
    return this;
  },
  
  /*
    Method: show
      Show iframe shim leaving its position and dimensions intact
      
    Returns:
      this
  */
  show: function() {
    this.element.show();
    return this;
  },
  
  /*
    Method: positionUnder
      Positions iframe shim under the specified element 
      Sets proper dimensions, offset, zIndex and shows it
      Note that the element should have explicitly specified zIndex
      
    Returns:
      this
  */
  positionUnder: function(element) {
    var element = $(element),
        offset = element.cumulativeOffset(),
        dimensions = element.getDimensions(),
        style = { 
          left: offset[0] + 'px', 
          top: offset[1] + 'px',
          width: dimensions.width + 'px',
          height: dimensions.height + 'px',
          zIndex: element.getStyle('zIndex') - 1
        };
    this.element.setStyle(style).show();
    
    return this;
  },
  
  /*
    Method: setBounds
      Sets element's width, height, top and left css properties using 'px' as units
    
    Returns:
      this
  */
  setBounds: function(bounds) {
    for (prop in bounds) {
      bounds[prop] += 'px';
    }
    this.element.setStyle(bounds);
    return this;
  },
  
  /*
    Method: destroy
      Completely removes the iframe shim from the document
      
    Returns:
      this
  */
  destroy: function() {
    if (this.element)
      this.element.remove();
    
    return this;
  }
});
/*
  Class: UI.ContextMenu
    Creates a context menu when instantiated.
    Shows menu when right button (ctrl + left in Opera) is clicked on a certain element.
    Hides menu when left button is cliked.
    Allows to attach certain behavior to certain menu elements (links).

  Example:
    > var contextLinks = [{
    >   name: 'Save',
    >   className: 'back',
    >   callback: Document.save
    > }, {
    >   name: 'Save as...',
    >   submenu: [{
    >     name: 'Excel (.xls)',
    >     className: 'xls',
    >     callback: Document.saveAsXls
    >   }, {
    >     name: 'Word (.doc)',
    >     className: 'doc',
    >     callback: Document.saveAsDoc
    >   }, {
    >     name: 'Acrobat Reader',
    >     className: 'pdf',
    >     callback: Document.saveAsPdf
    >   }]
    > }];
    >
    > ...
    >
    > new UI.ContextMenu({
    >   selector: '#context_area', // element to attach right click event to
    >   showEffect: true, // indicates whether Effect.Appear is used when menu is shown
    >   menuItems: contextLinks // array of links to be used when building menu
    > });
*/

UI.ContextMenu = Class.create(UI.Options, {
  // Group: Options
  options: {
    // Property: className
    //   class to be applied to menu element, default is 'ui-context_menu'
    className: 'ui-context_menu',

    // Property: beforeShow
    //   beforeShow: function to be called before menu element is shown,
    //   default is empty function.
    beforeShow: Prototype.emptyFunction,

    // Property: beforeHide
    //   function to be called before menu element is hidden,
    //   default is empty function.
    beforeHide: Prototype.emptyFunction,

    // Property: beforeSelect
    //   function to be called before menu item is clicked,
    //   default is empty function.
    beforeSelect: Prototype.emptyFunction,

    // Property: zIndex
    //  z-index to be applied to a menu element, default is 900
    zIndex: 900,

    pageOffset: 25,

    // Property: showEffect
    // showEffect: true will force menu to "fade in" when shown,
    // default is false
    showEffect: false,

    // Property: hideEffect
    // showEffect: true will force menu to "fade out" when hidden,
    // default is false
    hideEffect: false,

    // Property: shadow
    // true will force shadow under the menu, default is true
    shadow: "mac_shadow"
  },

  // Group: Constructor

  /*
    Method: initialize
      Constructor function, should not be called directly

    Parameters:
      options - (Hash) list of optional parameters

    Returns:
      this
  */
  initialize: function(options) {
    this.setOptions(options);

    if (Object.isUndefined(Effect)) {
      this.options.showEffect = this.options.hideEffect = false;
    }

    this.iframe = Prototype.Browser.IE ? new UI.IframeShim() : null;
    this.create();

    this.shadow = this.options.shadow
      ? UI.ContextMenu.shadow || new UI.Shadow(this.element, {theme: this.options.shadow}).focus().hide()
      : null;

    if (this.shadow) UI.ContextMenu.shadow = this.shadow;

    this.initObservers();
  },

  // Group: Methods

  create: function() {
    this.element = new Element('div', {
      className: this.options.className,
      style: 'display: none'
    });
    this.element.insert(this.createList(this.options.menuItems));
    $(document.body).insert(this.element.observe('contextmenu', Event.stop));
  },

  createList: function(items) {
    var list = new Element('ul');

    items.each(function(item){
      list.insert(
        new Element('li', {className: item.separator ? 'separator' : ''}).insert(
          !item.separator
            ? Object.extend(new Element('a', {
                href: '#',
                title: item.name,
                className: (item.className || '')
                  + (item.disabled ? ' disabled' : '')
                  + (item.submenu ? ' submenu' : '')
              }), { _callback: item.callback })
              .observe('click', item.callback ? this.onSelect.bind(this) : Event.stop)
              .observe('contextmenu', Event.stop)
              .update(item.name)
              .insert(
                item.submenu
                  ? this.createList(item.submenu).wrap({className: 'menu', style: 'display:none'})
                  : ''
              )
            : ''
        )
      )
    }.bind(this));

    return list;
  },

  initObservers: function() {
    var contextEvent = Prototype.Browser.Opera ? 'click' : 'contextmenu';

    document.observe('click', function(e) {
      if (this.element.visible() && !e.isRightClick()) {
        this.options.beforeHide();
        if (this.iframe)
          this.iframe.hide();
        this.hide();
      }
    }.bind(this));

    $$(this.options.selector).invoke('observe', contextEvent, function(e) {
      if (Prototype.Browser.Opera && !e.ctrlKey) return;
      this.show(e);
    }.bind(this))

    this.element.select('a.submenu')
      .invoke('observe', 'mouseover', function(e) {
        if (this.hasClassName('disabled')) return;
        this.down('.menu').setStyle({
          top: 0,
          left: this.getWidth() + 'px'
        }).show();
      })
      .invoke('observe', 'mouseout', function(e) {
        this.down('.menu').hide();
      })
  },

  /*
    Method: show

    Parameters:
      e - Event object (optional)

    Returns:
      this
  */
  show: function(e) {
    if (e) e.stop();

    this.options.beforeShow();
    this.fire('showing');

    if (UI.ContextMenu.shownMenu) {
      UI.ContextMenu.shownMenu.hide();
    }
    UI.ContextMenu.shownMenu = this;

    this.position(e);

    if (this.options.showEffect) {
      Effect.Appear(this.element, {
        duration: 0.25,
        afterFinish: function() { this.fire('shown') }.bind(this)
      })
    }
    else {
      this.element.show();
      this.fire('shown');
    }

    this.event = e;
    return this;
  },

  /*
    Method: position
      Takes event object and positions menu element to match event's pointer coordinates
      Optionally positions shadow and iframe elements

    Returns:
      this
  */
  position: function(e) {
    var x = Event.pointer(e).x,
        y = Event.pointer(e).y,
        vpDim = document.viewport.getDimensions(),
        vpOff = document.viewport.getScrollOffset(),
        elDim = this.element.getDimensions(),
        elOff = {
          left: ((x + elDim.width + this.options.pageOffset) > vpDim.width
            ? (vpDim.width - elDim.width - this.options.pageOffset) : x),
          top: ((y - vpOff.top + elDim.height) > vpDim.height && (y - vpOff.top) > elDim.height
            ? (y - elDim.height) : y)
          },
        elBounds = Object.clone(Object.extend(elOff, elDim));

    for (prop in elOff) {
      elOff[prop] += 'px';
    }
    this.element.setStyle(elOff).setStyle({zIndex: this.options.zIndex});

    if (this.iframe) {
      this.iframe.setBounds(elBounds).show();
    }

    if (this.shadow) {
      this.shadow.setBounds(elBounds).show();
    }

    return this;
  },

  /*
    Method: hide

    Returns:
      this
  */
  hide: function() {

    this.options.beforeHide();

    if (this.iframe)
      this.iframe.hide();

    if (this.shadow)
      this.shadow.hide();

    if (this.options.hideEffect) {
      Effect.Fade(this.element, {
        duration: 0.25,
        afterFinish: function() { this.fire('hidden') }.bind(this)
      })
    }
    else {
      this.element.hide();
      this.fire('hidden')
    }

    return this;
  },
  /*
    Method: onSelect

    Parameters:
      e - current Event object (left click on a menu item)
  */
  onSelect: function(e) {
    if (e.target._callback && !e.target.hasClassName('disabled')) {
      this.options.beforeSelect();
      this.fire('selected');
      this.hide();
      e.target._callback(e, this.event);
    }
  },

  fire: function(eventName) {
    this.element.fire('contextmenu:' + eventName);
  }
})
