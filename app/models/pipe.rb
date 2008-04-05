class Pipe < ActiveRecord::Base
  belongs_to :user
  
  # def to_param
  #   "#{id}-#{title.downcase.gsub(/[^[:alnum:]]/,'-')}".gsub(/-{2,}/,'-')
  # end  
  
  validates_presence_of     :title
  
  has_many :nodes
  has_many :edges
  belongs_to :node
  
  # container:
    # type
    # postition (array) x,y
    # content (hash) name*:value
  # wire:
    # from (array) id, nodeid
    # to (array) id, nodeid
    
    
  # containers: [
  #    {xtype: jsBox, position: [300,250], codeText: "function() {\n return 'graph';\n}"},
  #    {xtype: jsBox, position: [530,250], codeText: "function() {\n return 'pipes';\n}"},
  #    {xtype: jsBox, position: [430,380], codeText: "function(a,b) {\n   return a + b;\n}"},
  #    {xtype: jsBox, position: [500,540], codeText: "function(result) {\n error('The result is: ' + result)}"}
  # ],
  # 
  # wires: [
  #    {src: {moduleId: 0, terminalId: 0}, tgt: {moduleId: 2, terminalId: 0}},
  #    {src: {moduleId: 1, terminalId: 0}, tgt: {moduleId: 2, terminalId: 1}},
  #    {src: {moduleId: 2, terminalId: 2}, tgt: {moduleId: 3, terminalId: 0}}
  # ]
end
