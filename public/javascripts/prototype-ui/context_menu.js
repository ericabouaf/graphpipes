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
