# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  
  def link_button(name=123, options={})
    options.merge({
      :action => 'alert("No function set")'
    })
		"<a class='button' href='#' onclick='#{options[:action]}; return false;'><span>#{name}</span></a>"
  end
  
  # straight from edge rails - http://dev.rubyonrails.org/ticket/10802
  def label_tag(name, text = nil, options = {}) 
    content_tag :label, text || name.humanize, { "for" => name }.update(options.stringify_keys) 
  end
end
