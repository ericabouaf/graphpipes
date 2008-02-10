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
