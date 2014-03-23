define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone'    // lib/backbone/backbone
], function($, _, Backbone){
	var Account = Backbone.Model.extend({
 
    initialize: function(options) {

      this.on('change', 
        function(){
          this.updated_at = new Date();
        }
        , this);

      if (options.id){
        this.accountId = options.id;
        this.set('id', options.id);

      }
        
    },
    url: function() {
        if (this.get("account_id")){
            return 'account/' + this.get("account_id");
        }


        // update
        if (this.get("id")){
            return 'account/' + this.get("id");
        }

        console.log("Aucun accountId");
        return 'editAccount';
		
    } 	
    });
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
    return Account;
  // What we return here will be used by other modules
});

