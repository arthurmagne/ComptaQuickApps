define([
	'bootstrap',
	'holder',
	'jquery',
	'underscore',
	'backbone',
	'bootstrap-dialog.min',
	'text!../../templates/accountsTab.html',
	'collections/accounts',
	'models/account'
	], 
	function(bootstrap, holder, $, _, Backbone, dialog, accountsTabTemplate, Accounts, Account){
		var AccountsTab = Backbone.View.extend({
			events: {
				'click .clickableRow': 'detailAccount',
				'click .delete-account': 'deleteAccount',
				'click .edit-account': 'editAccount',
				'click .valid-edit': 'validEdit',
				'click .account-name-col input': 'preventLink'
			},

			el: '#center-page',

			render: function () {
				console.log("Account tab view");
				this.accounts = new Accounts();
				var that = this;

		        this.accounts.fetch({
		        	success: function (accounts) {
		        		console.log("accounts fetch success");
		        		var template = _.template(accountsTabTemplate, {accounts: accounts.models});
		        		that.$el.html(template);
		        	}
		        });


    		},

    		detailAccount: function (event) {
            	this.close();
            	Backbone.View.prototype.goTo($(event.currentTarget).attr("href"));

    		},

    		deleteAccount: function (event) {
    			event.stopImmediatePropagation();

    			var that = this;
    			BootstrapDialog.confirm('Voulez vous vraiment supprimer ce compte?', function(result){
		            if(result) {
		                var accountId = $(event.currentTarget).data('value');
		    			console.log("Delete account with id : ", accountId);
		    			// remove model (from server and collection by bubbling)
		    			that.accounts.get(accountId).destroy();

		    			// remove row from tab
		    			that.$el.find('.clickableRow[data-value='+accountId+']').remove();
		            
		            }else {
		                console.log("Suppression annulée");
		            }
		        });  

    		},

    		editAccount: function (event) {
    			event.stopImmediatePropagation();
    			// Ajouter un input à la place du nom avec un bouton valider
    			console.log("editAccount");
		        var accountId = $(event.currentTarget).data('value');
		    	var accountNameTag = this.$el.find('.clickableRow[data-value='+accountId+'] .account-name-col');
		    	var editAccountBtn = this.$el.find('.edit-account[data-value='+accountId+']');
		    	var accountName = accountNameTag.html();

		    	accountNameTag.html("<input class='form-control' type='text' value='"+accountName+"'/>");
		    	editAccountBtn.html("Valider");
		    	editAccountBtn.removeClass("edit-account");
		    	editAccountBtn.addClass("valid-edit");

    		},

    		validEdit: function (event) {
    			event.stopImmediatePropagation();
    			console.log("validEdit");
    			var that = this;
    			var accountId = $(event.currentTarget).data('value');
		    	var accountNameTag = this.$el.find('.clickableRow[data-value='+accountId+'] .account-name-col');
		    	var accountNameInput = this.$el.find('.clickableRow[data-value='+accountId+'] .account-name-col input');
		    	var editAccountBtn = this.$el.find('.valid-edit[data-value='+accountId+']');
		    	// On récupère la valeur de l'input
		    	var accountName = accountNameInput.val();
      			$(".error-msg").html();

		    	var error_msg = '';
		    	if (accountName == ''){
		    		error_msg += 'Le nom du compte ne peut être vide.<br>';
     			    accountNameInput.addClass("form-error");
      				
		    	}

      			$(".error-msg").html(error_msg);


		    	if (error_msg != ''){
		    		return ;
		    	}
		    	// on update l'account sur le serveur

		    	var account = new Account({id: accountId, account_name: accountName});
		    	account.save(null, {
			        success: function (account){

			          console.log("Account push au serveur avec succès");
			          console.log(account);			          
			          

			        },
			        error: function (){
			          console.log("Ann error occured");
			        }
			      });

		    	accountNameTag.html(accountName);
		    	editAccountBtn.html("Éditer");
		    	editAccountBtn.removeClass("valid-edit");
		    	editAccountBtn.addClass("edit-account");
    		},
    		preventLink: function (event) {
    			// prevent navigation from click into an input
    			event.stopImmediatePropagation();

    		},
	
		    close: function () {
		      $(this.el).unbind();
		      $(this.el).empty();
		    }
});

  // Our module now returns our view
  return AccountsTab;

});