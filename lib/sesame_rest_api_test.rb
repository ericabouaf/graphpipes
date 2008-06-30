require 'rest-client-0.4/lib/rest_client'


def request
  header = {:accept => 'application/sparql-results+n3'}
  query = URI.escape 'select x from {x} <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> {<http://www.w3.org/2002/07/owl#Class>}'
  json = RestClient.get "http://k-sems.uni-koblenz.de/openrdf-sesame/repositories/k-sems?query=#{query}&queryLn=serql", header
end 

def add_data
  data = <<EOF
<?xml version="1.0"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:contact="http://www.w3.org/2000/10/swap/pim/contact#">

  <contact:Person rdf:about="http://www.w3.org/People/EM/contact#me">
    <contact:fullName>Eric Miller</contact:fullName>
    <contact:mailbox rdf:resource="mailto:em@w3.org"/>
    <contact:personalTitle>Dr.</contact:personalTitle> 
  </contact:Person>

</rdf:RDF>
EOF
  header = {:accept => 'application/sparql-results+json', :content_type => 'application/rdf+xml;charset=UTF-8'}

  RestClient.post "http://k-sems.uni-koblenz.de/openrdf-sesame/repositories/networkedGraphs/statements?context=%3Curn:x-local:test%3E&baseURI=%3Curn:x-local:test%3E", data, header
end

# puts request

# puts URI.unescape "%3Curn:x-local:graph1%3E&context=%3Curn:x-local:graph1%3E"
puts add_data