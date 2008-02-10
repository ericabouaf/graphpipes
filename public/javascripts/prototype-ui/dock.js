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
