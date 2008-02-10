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
