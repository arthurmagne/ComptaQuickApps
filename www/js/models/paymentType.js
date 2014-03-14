
define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone'    // lib/backbone/backbone
], function($, _, Backbone){
	var paymentType = Backbone.Model.extend({
	
	initialize: function(options) {
        if (options){
            this.type_id = options.type_id;
        }
		this.set('type_id', this.get("type_id"));
    },
	url: function() {
		if (this.type_id){
			return 'http://netmove.fr/ComptaQuick/api/index.php/paymentType' + this.type_id;
		}
		console.log("Aucun id");
	}
	
 });
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
    return paymentType;
  // What we return here will be used by other modules
});