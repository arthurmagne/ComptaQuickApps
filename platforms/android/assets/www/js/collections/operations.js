
define([
  // These are path alias that we configured in our bootstrap
  'jquery',                 // lib/jquery/jquery
  'underscore',             // lib/underscore/underscore
  'backbone',               // lib/backbone/backbone
  'models/operation'
  ], 

  function($, _, Backbone, Operation){
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
        this.tag = options.tag;
      }
    },
    saveAll: function( ) {
        // Loop over my collection...
        _(this.models).each( function(op) {
            // And POST for each object in the collection
            console.log("Iterate : ",op);
            op.save();
        } );
    },

    url: function() {
      console.log("Id pour collection operations : ",this.accountId);
      if (this.accountId == undefined){
        return 'operations/byUser/' + this.accountId + '/' + this.maxOpe + '/' + this.typeOpe + '/' + this.dateDebut + '/' + this.dateFin + '/' + this.payementType + '/' + this.tag;
      }
      // default case
      return 'operations/byAccount/' + this.accountId + '/' + this.maxOpe + '/' + this.typeOpe + '/' + this.dateDebut + '/' + this.dateFin + '/' + this.payementType + '/' + this.tag;

    }
	

  });
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return Operations;
  // What we return here will be used by other modules
});

