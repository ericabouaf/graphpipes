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
   this.build_me('nodeBox', 'node_repo')
  },
  
  new_nav_subgraph: function(as) {
   this.build_me('nodeBox', 'node_subgraph')
  },  
  
  new_nav_condition: function(as) {
    this.build_me('nodeBox', 'node_condition')    
  },

  new_nav_union: function(as) {
    this.build_me('nodeBox', 'node_union')    
  },

  new_nav_join: function(as) {
    this.build_me('nodeBox', 'node_join')    
  },
  
  new_nav_filter: function(as) {
    this.build_me('nodeBox', 'node_filter')    
  },
  
  new_nav_condition: function(as) {
    this.build_me('nodeBox', 'node_condition')    
  },  

  new_nav_construct: function(as) {
    this.build_me('nodeBox', 'node_construct')    
  },

  build_me: function(namespace, element) {
    var name = namespace 
    window[name].addModule(element, namespace);
  }
})


