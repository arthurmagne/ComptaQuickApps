	
	define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  'views/paymentTypeList',
  'views/accountList',
  'views/addOperationForm',
  'collections/operations',
  'models/operation'
  ], function(bootstrap, holder, $, _, Backbone, PaymentTypeListView, AccountListView, AddOperationFormView, Operations, Operation){
    var addDebitPage = Backbone.View.extend({
  	  events: {
        'click #submit_btn': 'validerOp'
      },
	
	el: '#center-page', 
	
	render: function (options) {
		console.log("addDebit view");
		$(this.el).empty();
		$(this.el).append("<h1 class='page-header'>Effectuer une Opération de Débit</h1>");
		$(this.el).append("<form class='add-operation-form'><p class='error-msg'></p>"+
							"<select type='number' placeholder='Compte à débiter' name='list_account' id='list_account' class='form-control' required></select>"+
							"<select type='text' placeholder='Type de payment' name='list_type'  id='list_type' class='form-control' required></select>" + 
							"<p id='form_operation'></p></form>");

		this.accountListView = new AccountListView();
		this.paymentTypeListView = new PaymentTypeListView();
		this.addOperationFormView = new AddOperationFormView();

		if (options){
			console.log("ICI");
			this.accountListView.render({account_id: options.account_id});
		}else{
			console.log("LA");
			this.accountListView.render();
		}
		this.paymentTypeListView.render();
		this.addOperationFormView.render();
		
		this.error_msg = $(".error-msg");
		
    },
	
	attributes: function () {
      return {
    	  account_id: this.accountListView.getAccount(),
    		type_id: this.paymentTypeListView.getType(),
    		operation_date: this.addOperationFormView.getOpDate(),
    		operation_name: this.addOperationFormView.getOpName(),
    		operation_desc: this.addOperationFormView.getOpDesc(),
    		is_credit: "0",
    		value: this.addOperationFormView.getOpValue()
      };
    },

    validerOp: function (event) {
      event.preventDefault(); 
      console.log("creating debit op ... ");

	  
	    var that = this;
      var error_msg = '';

      // error handling
      this.addOperationFormView.setErrorOpName(false);
      this.addOperationFormView.setErrorOpDate(false);
	    this.addOperationFormView.setErrorOpValue(false);
	  
      this.error_msg.html();
	  
      var _data = this.attributes();
      console.log(_data);
	
	  // check the operation name 
      if (_data.operation_name ==""){
        error_msg += "Veuillez indiquer le nom de l'opération.<br>";
		this.addOperationFormView.setErrorOpName(true);
      }  
      // check the operation date
	  var dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
      if (_data.operation_date == "" ) {
		var date = new Date();
        var month = (date.getMonth() + 1); 
		if (month < 10) {
			month = '0' + month; 
		}
        var day = date.getDate(); 
		if (day < 10) {
			day = '0' + day; 
		}
		_data.operation_date = date.getFullYear() + "-" + month + "-" + day; 
		console.log(_data.operation_date);
	  }
	  if (!(dateRegex.test(_data.operation_date))) {
        error_msg += "La date de l'opération n'est pas valide. <br>";
		this.addOperationFormView.setErrorOpDate(true);
		console.log("problème de date");
      }	       
      // ckeck the operation value
	  var intRegex = /^\+?[1-9]\d*$/;
      if(_data.value == ""){ 
	    error_msg += "Le montant de l'opération doit obligatoirement être saisis . <br>";
		this.addOperationFormView.setErrorOpValue(true);
		console.log("problème de valeur vide");
	  }
	  else if(isNaN(_data.value)) {
        error_msg += "Le montant de l'opération doit être un nombre. <br>";
		this.addOperationFormView.setErrorOpValue(true);
		console.log("problème de valeur autre que nombre");
      }

      this.error_msg.html(error_msg);

      if (error_msg != ''){
        return ;
      }
	  	  
      var operation = new Operation(_data);
	  operation.save(null, {
		success: function () {
			  console.log("Operation POST avec succès");
			  console.log(operation);
			  $(that.el).empty();			  
			  $(that.el).html("<h2 class='text-center text-muted add-feedback'>Operation de débit ajouté avec succès</h2><hr>");

			  setTimeout(function(){
				that.close();
				Backbone.View.prototype.goTo('#/accountList');
			  },2000);
			},
        error: function (){
          console.log("Ann error occured");
        }

	  });

    },
	
    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }

	});

  return addDebitPage;
});
