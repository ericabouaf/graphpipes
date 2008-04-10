class SourcesController < ApplicationController
  before_filter :login_required
  
  layout 'site'

  # GET /sources
  # GET /sources.xml
  def index
    @sources = current_user.sources.find(:all)

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @sources }
    end
  end

  # GET /sources/1
  # GET /sources/1.xml
  def show
    @source = current_user.sources.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @source }
    end
  end

  # GET /sources/new
  # GET /sources/new.xml
  def new
    @source = current_user.sources.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @source }
    end
  end

  # GET /sources/1/edit
  def edit
    @source = current_user.sources.find(params[:id])
  end

  # POST /sources
  # POST /sources.xml
  def create
    @source = current_user.sources.new(params[:source])
    @source.user_id = current_user.id
    
    respond_to do |format|
      if @source.save
        flash[:notice] = 'Source was successfully created.'
        format.html { redirect_to(user_sources_path(current_user)) }
        format.xml  { render :xml => @source, :status => :created, :location => @source }
        format.js { render :json => {
            :object => "source", 
            :success => true, 
            :iri => @source.iri,
            :name => @source.name,
            :error_message => 'Source was successfully created.'
          } 
        }
          
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @source.errors, :status => :unprocessable_entity }
         format.js { render :json => {
            :object => "source", 
            :success => false, 
            :error_message => '' } }        
      end
    end
  end

  # PUT /sources/1
  # PUT /sources/1.xml
  def update
    @source = current_user.sources.find(params[:id])

    respond_to do |format|
      if @source.update_attributes(params[:source])
        flash[:notice] = 'Source was successfully updated.'
        format.html { redirect_to(user_source_path(current_user, @source)) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @source.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /sources/1
  # DELETE /sources/1.xml
  def destroy
    @source = current_user.sources.find(params[:id])
    @source.destroy

    respond_to do |format|
      format.html { redirect_to(user_sources_url) }
      format.xml  { head :ok }
    end
  end
end
