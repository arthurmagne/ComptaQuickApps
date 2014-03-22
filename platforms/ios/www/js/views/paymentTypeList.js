define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/paymentTypeList.html',
  'collections/paymentTypes',
  'models/paymentType'
  ], function(bootstrap, holder, $, _, Backbone, paymentTypeListTemplate, PaymentTypes, PaymentType){
    var addDebitPage = Backbone.View.extend({
			
	el: '#list_type',
	
	render: function (options) {
		console.log("Payment List View : ");
		this.paymentTypes = new PaymentTypes();
		var that = this;
		console.log("Le type list :");
		console.log(this.paymentTypes);
		console.log(this.paymentTypes.id);		
		if (navigator.onLine){
			this.paymentTypes.fetch({
				success: function (paymentTypes) {
					console.log("Payment Types fetch success");
					if (options) {
						var concatObject = {
							allOptions: options.allOptions,
							payementTypes: paymentTypes.models
						};
					}else{
						var concatObject = {
							allOptions: undefined,
							payementTypes: paymentTypes.models
						};				
					}
					var template = _.template(paymentTypeListTemplate, {object: concatObject});
					that.$el.html(template);
					
				},
				error: function () {
					console.log("DEBUG: Payment Types list error online");
				}
			});
		}else{
			if (options) {
				var concatObject = {
					allOptions: options.allOptions,
					payementTypes: window.paymentList.models
				};
			}else{
				var concatObject = {
					allOptions: undefined,
					payementTypes: window.paymentList.models
				};				
			}
			var template = _.template(paymentTypeListTemplate, {object: concatObject});
			that.$el.html(template);
		}

    },

	getType: function () {
		console.log("type:"+ $('select[name=list_type]').val());
		this.type = $('select[name=list_type]').val();
		return this.type;	
    },

    getTypeName: function () {
    	console.log("typeName:"+ $('select[name=list_type] option:selected').text());
		this.typeName = $('select[name=list_type] option:selected').text();
		return this.typeName;
    },
	
    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }

	});

  return addDebitPage;
});
