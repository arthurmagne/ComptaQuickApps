
define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone', // lib/backbone/backbone
  'models/paymentType'    
  ], function($, _, Backbone, PaymentType){
   var PaymentTypes = Backbone.Collection.extend({

    model: PaymentType,

    initialize: function(options) {    
      if (options){
        this.type_id = options.type_id;
        this.type_name = options.type_name;
      }
    },
	
	url: function() {
      console.log("On va chercher l'url"); 
      return 'paymentTypes';
	}
	
  });
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return PaymentTypes;
  // What we return here will be used by other modules
});

