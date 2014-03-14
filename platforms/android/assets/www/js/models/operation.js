define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone'    // lib/backbone/backbone
], function($, _, Backbone){
	var Operation = Backbone.Model.extend({
 
    initialize: function(options) {

        if (options){
          this.operationId = options.id;
        }
        // set the id of this model !! (no need for operation)
        //this.set('id', this.get("account_id"));


        
    },
    url: function() {
        if (this.operationId){
            return 'http://netmove.fr/ComptaQuick/api/index.php/account/operation/' + this.operationId;
        }
        if (this.get("id")){
            return 'http://netmove.fr/ComptaQuick/api/index.php/account/operation/' + this.get("id");
        }
		return 'http://netmove.fr/ComptaQuick/api/index.php/editOperation';
        console.log("Aucun id");
    } 	
    });
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
    return Operation;
  // What we return here will be used by other modules
});

