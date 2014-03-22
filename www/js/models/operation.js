define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone'    // lib/backbone/backbone
  ],

  function($, _, Backbone){
    var Operation = Backbone.Model.extend({
    
      initialize: function(options) {

        this.on('change', 
          function(){
            this.updated_at = new Date();
          }
          , this);
        if (options){
          this.operationId = options.id;
        }
      },

      url: function() {
        if (this.operationId){
            return 'account/operation/' + this.operationId;
        }
        if (this.get("id")){
            return 'account/operation/' + this.get("id");
        }
		    return 'editOperation';
        console.log("Aucun id");
      } 	
    });
    // Above we have passed in jQuery, Underscore and Backbone
    // They will not be accessible in the global scope
    return Operation;
    // What we return here will be used by other modules
});

