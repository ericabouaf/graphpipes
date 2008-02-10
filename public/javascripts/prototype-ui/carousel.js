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
