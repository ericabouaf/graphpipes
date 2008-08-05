# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  
  def link_button(name=Untitled, options={})
    url = options[:url] || "#"
    result = "<a class='button' href='#{url}' "
    result << "id='#{options[:id]}'" unless options[:id].blank?
    result << " onclick=#{options[:function]}" unless options[:function].blank?  
    result << "><span>#{name}</span></a>"
    result
  end
  
  
  # straight from edge rails - http://dev.rubyonrails.org/ticket/10802
  def label_tag(name, text = nil, options = {}) 
    content_tag :label, text || name.humanize, { "for" => name }.update(options.stringify_keys) 
  end
end
