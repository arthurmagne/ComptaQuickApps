define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  // Using the Require.js text! plugin, we are loaded raw text
  // which will be used as our views primary template
  'text!../../templates/homePerso.html',
  'views/accountsTab',
  'collections/accounts',
  'collections/operations',
  'collections/paymentTypes',
  'views/graphs'
  ], function(bootstrap, holder, $, _, Backbone, homePersoTemplate, AccountsTabView, Accounts, Operations, PaymentTypes, GraphView){
  var HomePage = Backbone.View.extend({
    events: {
      'click #logout': 'logout',
      'click .drop-down-toggle': 'dropDownMenu',
      'click .display-menu-arrow': 'displayMenu',
      'click #username': 'preventLink',
      'click #sync': 'preventLink',
      'click #syncBtn': 'syncWithServer',
      'click #graph-btn.off, #import-btn.off': 'preventLink',
      'keypress #search-by-tag': 'logKeySearch'
    },

    el: '#page',

    render: function (options) {
      var template = _.template(homePersoTemplate, {user: window.userSession.attributes.model});
      this.$el.html(template);
      var that = this;
      this.accounts = new Accounts();
      var syncBtn = that.$el.find('#sync');

      // check for connection
      setInterval(function() {
        // Test for connection every 10 seconds
        if (navigator.onLine){
          if (syncBtn.html() != "Online"){
            syncBtn.html("Online");
            syncBtn.removeClass("offline");
            syncBtn.addClass("online");
          }
          $("#graph-btn").removeClass("off");
          $("#import-btn").removeClass("off");


        }else{
          if (syncBtn.html() != "Offline"){
            syncBtn.html("Offline");
            syncBtn.removeClass("online");
            syncBtn.addClass("offline");
          }
          $("#graph-btn").addClass("off");
          $("#import-btn").addClass("off");

        }

      }, 10000);

      window.deletedOperations = [];
      window.deletedAccounts = [];

      console.log("home perso avec comme model : ", window.userSession.attributes.model);


        that.fetchAccount();
      
      $("#background").removeClass("home-background");

    },

    preventLink: function (event) {
      event.preventDefault();
    },

    logKeySearch: function (event) {
      if (event.which == 13){
        event.preventDefault();
        if (!navigator.onLine){
            BootstrapDialog.alert("Cette partie du site n'est pas disponible sans connexion");
            return ;
          }

        // enter pressed
        console.log("Search by tag");
        var tag = $('#search-by-tag').val();
        tag = tag.trim();
        tag = tag.split(" ")[0];
        console.log("DEBUG tag : ",tag);
        // redirect to detail tag page
        var graphview = new GraphView();
        graphview.render({hashtagName : tag});
      }

    },

    syncWithServer: function (event) {
        console.log("Sync with server");
        // display loader
        $(".circle, .circle1").removeClass("hide");
        event.preventDefault();
         setTimeout(function(){
           if (!window.isOnline()){
              BootstrapDialog.alert('Échec de la connexion');
              $(".circle, .circle1").addClass("hide");
              return;
            }
            $(".circle, .circle1").addClass("hide");
          },500);

    },

    fetchAccount: function () {
          var that = this;
          this.accounts.fetch({
              success: function (accounts) {
                console.log("accounts fetch success");
                
                window.accounts = accounts;
                var accountsTabView = new AccountsTabView();
                accountsTabView.render();
                window.operationsTab = [];

                accounts.each(function (account) {
                  console.log( "accccccccccouuuuuut ",account);
                  var operations = new Operations({accountId: account.get('id')});
                  operations.fetch({
                    success: function (operations) {
                      console.log("Operation fetch with success", operations);
                      window.operationsTab[account.get('id')] = operations;

                    },
                    error: function () {
                      console.log("Operation fetch error");
                    }
                  })
                });

              },
              error: function() {
                console.log('Unbound server.');

              }
            });

            var payementList = new PaymentTypes();
            payementList.fetch({
              success: function (paymentList) {
                console.log("PayementList fetch with success");
                window.paymentList = paymentList;
              },
              error: function () {
                console.log("PayementList fetch error");
              }
            });
        },

    logout: function (event) {
      event.preventDefault(); 

      var that = this;
      $.ajax({
        url: "logout",
        type:'GET',
        statusCode: {
          200: function (response) {
            console.log("Déconnexion réussie.");
            //that.close();
            Backbone.View.prototype.goTo('/');

          },
          401: function (response) {
            that.error_msg.html("Erreur lors de la déconnexion.");
         }
        },
        success:function (data) {
          console.log(["Sign-up request details: ", data]);
        }
      });
    },

    dropDownMenu: function (event) {
      event.preventDefault();
      this.$el.find('.drop-down-menu').toggleClass('show');

    },

    displayMenu: function (event) {
      event.preventDefault();
      this.$el.find('.sidebar').toggleClass('disp');
      this.$el.find('.display-menu-arrow').toggleClass('disp');
    },


    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }

  });

  // Our module now returns our view
  return HomePage;
});