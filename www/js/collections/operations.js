
define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/operation'
  ], function($, _, Backbone, Operation){
   var Operations = Backbone.Collection.extend({

    model : Operation,

    initialize: function(options) {

      if (options){
        this.dateDebut = options.dateDebut;
        this.dateFin = options.dateFin;
        this.maxOpe = options.maxOpe;
        this.typeOpe = options.typeOpe;
        this.accountId = options.accountId;
        this.payementType = options.payementType;
      }
    },
    url: function() {
      console.log("Id pour collection operations : ",this.accountId);
      if (this.accountId == undefined){
        return 'http://netmove.fr/ComptaQuick/api/index.php/operations/byUser/' + this.accountId + '/' + this.maxOpe + '/' + this.typeOpe + '/' + this.dateDebut + '/' + this.dateFin + '/' + this.payementType;
      }
      // default case
      return 'http://netmove.fr/ComptaQuick/api/index.php/operations/byAccount/' + this.accountId + '/' + this.maxOpe + '/' + this.typeOpe + '/' + this.dateDebut + '/' + this.dateFin + '/' + this.payementType;
    }
	

  });
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return Operations;
  // What we return here will be used by other modules
});

