
define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone'    // lib/backbone/backbone
], function($, _, Backbone){
	var User = Backbone.Model.extend({

    
  
  url: 'http://netmove.fr/ComptaQuick/api/index.php/login'
 	
});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return User;
  // What we return here will be used by other modules
});

