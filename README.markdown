## About graphpipes

graphpipes is a simple and easy way to aggregate semantic data.
      
By using drag'n'dropin a web-based application you are able to create
SPARQL-queries and reuse them later in your networked graphs.

graphpipes  is a proof of concept, developed at 
University of Koblenz-Landau, Germany

### Requirements
  * Ruby 1.8.2+
  * Rails 2.0.2+
  * Linux
  * A well written Browser (Firefox, Safari, Opera)

### Quick Install
  1. Download graphpipes (master branch on github: http://github.com/tomfarm/graphpipes/tree/master )
  2. cd into the graphpipes directory
  3. Rename config/database.sample.yml to database.yml (you may want to change to config to your needs)
  4. rake db:migrate 
  5. ./script/server -e production  
  6. visit http://localhost:3000
  7. You may login using 'admin/secret'


Thomas Winkler - Koblenz, 03/30/2008 
tomfarm@gmail.com