var Patch = Class.create({
  initialize: function(element, options) {
    var kind = element.innerHTML.toLowerCase()
    this.run(kind)
  },
  run: function(func_name) {
    console.log('Created Node in DB')
    var operation = this["new_" + func_name]
    if (this["new_" + func_name] != undefined) { 
      this["new_" + func_name](func_name)
    } else {
      error('Operation: ' + func_name + ': Not implemented yet')
    }
  },

  new_regex: function(as) {
    this.build_me(as)  
  },
  
  new_union: function(as) {
    this.build_me(as)  
  },
  
  build_me: function(namespace) {
    window.jsBox.addModule();
  }
})


