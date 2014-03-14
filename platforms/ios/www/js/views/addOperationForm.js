define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/addOperationForm.html'
  ], function(bootstrap, holder, $, _, Backbone, addOperationFormTemplate){
    var addOperationForm = Backbone.View.extend({
	
	el: '#form_operation',

	
	render: function () {
		var template = _.template(addOperationFormTemplate);
		this.$el.html(template);
		this.date = $("input[name='date']");
		this.name = $("input[name='name']");
		this.desc = $("input[name='description']");
		this.value = $("input[name='value']");
    },
	
	//Recupérer les valeurs du formulaire
	getOpDate: function() {
		return this.date.val();
	},
	getOpName: function() {
		return this.name.val();
	},
	getOpDesc: function() {
		return this.desc.val();
	},
	getOpValue: function() {
		return this.value.val();
    },
	
	//Gestion des erreurs 
	setErrorOpDate: function(set) { 
	    if(!set){
			this.date.removeClass("form-error");
		}else{
			this.date.addClass("form-error");
		};
	},
	setErrorOpName: function(set) {
	    if(!set){
			this.name.removeClass("form-error");
		}else{
			this.name.addClass("form-error");
		};
	},
	setErrorOpValue: function(set) {
	    if(!set){
			this.value.removeClass("form-error");
		}else{
			this.value.addClass("form-error");
		};
    },
	
    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }

	});

  return addOperationForm;
});
