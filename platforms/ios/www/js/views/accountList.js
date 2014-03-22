define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/accountList.html',
  'collections/accounts',
  'models/account'
  ], function(bootstrap, holder, $, _, Backbone, accountListTemplate, Accounts, Account){
    var addDebitPage = Backbone.View.extend({
	
	el: '#list_account',

	render: function (options) {
		console.log("Account list view");
		console.log(options);

		this.accounts = new Accounts();
		console.log("account list :");
		console.log(this.accounts);
		var that = this;

		if (navigator.onLine){
			this.accounts.fetch({
				success: function (accounts) {
					console.log("accounts fetch success");
					if (options){
						if (options.account_id){
							var object1 = {
								allOptions: undefined,
								account_id: options.account_id,
								accounts: accounts.models
							};				
						}else if (options.allOptions){
							var object1 = {
								allOptions: true,
								account_id: "",
								accounts: accounts.models
							};
						}
					}else{
						var object1 = {
							allOptions: undefined,
							account_id: "",
							accounts: accounts.models
						};
					}
					console.log(object1);
					var template = _.template(accountListTemplate, {object: object1});
					that.$el.html(template);	
				},
				error: function () {
					console.log("DEBUG: Error fetch account_list Online");
				}
			});
		}else{

			if (options){
				if (options.account_id){
					var object1 = {
						allOptions: undefined,
						account_id: options.account_id,
						accounts: window.accounts.models
					};				
				}else if (options.allOptions){
					var object1 = {
						allOptions: true,
						account_id: "",
						accounts: window.accounts.models
					};
				}
			}else{
				var object1 = {
					allOptions: undefined,
					account_id: "",
					accounts: window.accounts.models
				};
			}
			console.log(object1);
			var template = _.template(accountListTemplate, {object: object1});
			that.$el.html(template);
		}
    },
	
	getAccount: function () {
	  console.log("get account from account list :"+ $('#list_account').val());
	  this.account = $('select[name=list_account]').val();		
      return this.account;
    },
	
    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }

	});

  return addDebitPage;
});
