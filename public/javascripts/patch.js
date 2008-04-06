var Patch = Class.create({
  initialize: function(element, options) {
    console.log(options.id)
    var kind = options.id || element.innerHTML.toLowerCase()
    this.run(kind)
  },
  run: function(func_name) {
    var operation = this["new_" + func_name]
    console.log("new_" + func_name)
    if (this["new_" + func_name] != undefined) { 
      this["new_" + func_name](func_name)
    } else {
      error('Operation: ' + func_name + ': Not implemented yet')
    }
  },
  
 new_nav_rdf_resource: function(as) {
   this.build_me('repositoryBox')
 },
  
  new_regex: function(as) {
    this.build_me('jsBox')  
  },
  
  new_union: function(as) {
    this.build_me('jsBox')  
  },
  
  build_me: function(namespace) {
    var name = namespace 
    window[name].addModule();
  }
})


