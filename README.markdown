## About graphpipes

graphpipes is a simple and easy way to aggregate semantic data.
      
By using drag'n'dropin a web-based application you are able to create
SPARQL-queries and reuse them later in your networked graphs.

graphpipes is a proof of concept, developed at 
University of Koblenz-Landau, Germany

### Requirements
  * Ruby 1.8.6+
  * Rails 2.2.2
  * Linux / Windows may work but has not been tested
  * A well written Browser like Firefox - Safari and Opera are currently now supported

### Quick Install
  0. Download and install all needed gems
      - git://github.com/pjlegato/ruby-sesame.git
      - hoe
      - curb
      using % sudo gem install %name
  1. Download graphpipes (master branch on github: http://github.com/tomfarm/graphpipes/tree/master )
  2. cd into the graphpipes directory
  3. Rename config/database.sample.yml to database.yml (you may want to change to config to your needs)
  4. rake db:migrate 
  5. ./script/server -e production  
  6. visit http://localhost:3000
  7. You may login using 'admin/secret'


Thomas Winkler - Koblenz, 03/30/2008 
tomfarm@gmail.com