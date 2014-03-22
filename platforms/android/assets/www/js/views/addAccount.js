define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/addAccount.html',
  'models/account',
  'collections/operations'
  ], function(bootstrap, holder, $, _, Backbone, addAccountTemplate, Account, Operations){
  var HomePage = Backbone.View.extend({
    events: {
      'submit .add-account-form': 'createAccount'
    },

    el: '#center-page',
  	el2: '#list_account',
  	el3: '#list_type',
  	el4: '#form_operation',
	
    render: function (options) {
	  $(this.el).empty();
	  $(this.el2).empty();
	  $(this.el3).empty();
	  $(this.el4).empty();
      var template = _.template(addAccountTemplate);
      this.$el.html(template);
      this.number = $(".add-account-form input[name='number']");
      this.name = $(".add-account-form input[name='name']");
      this.balance = $(".add-account-form input[name='balance']");
      this.error_msg = $(".error-msg");
    },

    attributes: function () {
      return {
        // account_number to avoid this model to have an id and send a put request to the serveur
        account_number: this.number.val(),
        account_name: this.name.val(),
        balance: this.balance.val()
       };
    },

    createAccount: function (event) {
      event.preventDefault(); 
      console.log("creating account ...");
      var that = this;
      var error_msg = '';

      // error handling
      this.number.removeClass("form-error");
      this.name.removeClass("form-error");
      this.balance.removeClass("form-error");
      this.error_msg.html();

      var _data = this.attributes();
      console.log(_data);


      if (!_data.account_name){
        error_msg += 'Veuillez indiquer un nom de compte.<br>';
        this.name.addClass("form-error");
      }
      // check if the number is an integer
      var intRegex = /^\+?[0-9]\d*$/;
      if( (_data.account_number != "" ) && !(intRegex.test(_data.account_number))) {
        error_msg += 'Le numéro de compte doit être un entier positif.<br>';
        this.number.addClass("form-error");
      }

      if (!_data.account_number){
        error_msg += 'Veuillez indiquer un numéro de compte.<br>';
        this.number.addClass("form-error");
      }
      // ckeck if the balance is a number
      if( (_data.balance != "") && (isNaN(_data.balance))) {
        error_msg += 'Le solde du compte doit être un nombre.<br>';
        this.balance.addClass("form-error");
      }
      if (_data.balance == ''){
        _data.balance = 0;
      }

      this.error_msg.html(error_msg);

      if (error_msg != ''){
        return ;
      }

      var account = new Account(_data);
      if (window.isOnline()){
        account.save(null, {
          success: function (account){

            console.log("Account push au serveur avec succès");
            console.log(account);
            $(that.el).empty();
            
            $(that.el).html("<h2 class='text-center text-muted add-feedback'>Compte ajouté avec succès</h2><hr>");
            var operations = new Operations({accountId: account.get("id")});
            window.operationsTab[account.get("id")] = operations;
            window.accounts.add(account);
            
            setTimeout(function(){
              that.close();
              Backbone.View.prototype.goTo('#/accountList');
            },2000);
          },
          error: function (){
            console.log("Ann error occured");
              error_msg += 'Une erreur est survenue.<br>';
              that.error_msg.html(error_msg);
          }
        });
      }else{
        // set temporary id to work with this new model like it was real
        var uniqueId = new Date();
        uniqueId = uniqueId.getTime();
        console.log("UniqueId : ",uniqueId);
        account.set("id",uniqueId);
        // create an empty collection for this model
        var operations = new Operations({accountId: uniqueId});
        window.operationsTab[uniqueId] = operations;
        window.accounts.add(account);
        $(that.el).empty();
            
        $(that.el).html("<h2 class='text-center text-muted add-feedback'>Compte ajouté avec succès</h2><hr>");
        setTimeout(function(){
          that.close();
          Backbone.View.prototype.goTo('#/accountList');
        },2000);
      }

      
    },

    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }

  });

  // Our module now returns our view
  return HomePage;
});