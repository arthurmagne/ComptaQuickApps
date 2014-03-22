// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/home',
  'views/signIn',
  'views/signUp',
  'views/homePerso',
  'views/opeTab',
  'views/addAccount',
  'views/addDebit',
  'views/addCredit',
  'views/graphs',
  'views/accountsTab',
  'views/importCSV',
  'models/account',
  'models/operation'
  ], function($, _, Backbone, HomeView, SignInView, SignUpView, HomePersoView, OpeTabView, AddAccountView, AddDebitView, AddCreditView, GraphsView, AccountsTabView, ImportCSV, Account, Operation){

  var AppRouter = Backbone.Router.extend({
    routes: {
        '': 'home',
        'accountList': 'accountList',
        'sign-in': 'signIn',
        'sign-up': 'signUp',
        'perso': 'homePerso',
        'opeTab/:id': 'opeTab',
        'addAccount': 'addAccount',
    		'addDebit': 'addDebit',
        'addCredit': 'addCredit',
    		'graphs': 'graphs',
        'importCSV':'importCSV'
    }
  });

  var initialize = function(){

      $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
         options.url = 'http://netmove.fr/ComptaQuick/api/index.php/' + options.url;
         if (!options.crossDomain) {
            options.crossDomain = true;
         };
      });
      


    var app_router = new AppRouter;

    app_router.on('route:home', function() {
      console.log("route: home");
      homeView = new HomeView();
      homeView.render();
    });

    app_router.on('route:signIn', function() {
      console.log("route: sign-in");
      signInView = new SignInView();
      signInView.render();
    });

    app_router.on('route:signUp', function() {
      console.log("route: sign-up");
      signUpView = new SignUpView();
      signUpView.render();
    });

    app_router.on('route:homePerso', function() {
      console.log("route: home perso");
      homePersoView = new HomePersoView();
      homePersoView.render();
    });

    app_router.on('route:opeTab', function(id) {
      console.log("route: opeTab");
      opeTabView = new OpeTabView();
      opeTabView.render({account_id: id});
    });

    app_router.on('route:addAccount', function() {
      console.log("route: addAccount");
      addAccountView = new AddAccountView();
      addAccountView.render();
    });
	
	app_router.on('route:addDebit', function() {
	    console.log("route: addDebit");
      addDebitView = new AddDebitView();
      addDebitView.render();
    });
  
  app_router.on('route:addCredit', function() {
      console.log("route: addCredit");
      addCreditView = new AddCreditView();
      addCreditView.render();
    });      
  
  app_router.on('route:graphs', function() {
      console.log("route: graphs");
      graphsView = new GraphsView();
      graphsView.render();
    });

  app_router.on('route:accountList', function() {
      console.log("route: accountList");
      accountListView = new AccountsTabView();
      accountListView.render();
    });

  app_router.on('route:importCSV', function() {
      console.log("route: importCSV");
      importCSV = new ImportCSV();
      importCSV.render();
    });

    window.isSync = true;

    Backbone.View.prototype.goTo = function (loc) {
      app_router.navigate(loc, true);
    };

    /*window.isOnline = function() {
        if (navigator.onLine) {
          console.log("online");
          return true;
          /*$.ajax({
                  async: false,
                  url:"ping",
                  success: function(response){
                    console.log("DEBUG :",response);
                    if (response == "pong")
                      return true;
                    return false;
                
                  },
                  error: function() {
                    console.log("DEBUG : localStorage dirty");
                    return false;
                  }
              });
        }else{
          console.log("Offline ...");
          return false;

        }
      
    };*/

    window.onbeforeunload = function(e) {
      if (!window.isSync) 
        return 'Vous avez des modifications non enregistrées. Si vous quittez cette page elles seront perdues.';
    };



    window.isOnline = function() {
        if (navigator.onLine) {
          if (window.isSync == false){
            // server on : sync
            window.syncData();
            window.isSync = true;
          }
          console.log("online");
          $("#graph-btn").removeClass("off");
          $("#import-btn").removeClass("off");

          return true;
        }
        $("#graph-btn").addClass("off");
        $("#import-btn").addClass("off");
        window.isSync = false;
        $("#syncBtn").addClass("no-sync");
        console.log("Offline ...");
        return false;

        
    }

    window.syncData = function() {
        console.log("Sync Data");
        if (window.isSync == true){
          console.log("already sync");
          return ;
        }
        
        // save collections
        window.accounts.saveAll();
        console.log("DEBUG opTab BEFORE forEach ops : ", window.operationsTab);
        
        /*window.operationsTab.forEach(function(operations) {
          console.log("DEBUG opTab forEach ops : ", operations);
          operations.saveAll();
        });*/

        for (var key in window.operationsTab) {
          var operations = window.operationsTab[key];
          console.log("DEBUG opTab forEach ops : ", operations);
          operations.saveAll();
        }


        console.log("DEBUG : deletedAccounts", window.deletedAccounts);
        // delete deleted objects
        if (window.deletedAccounts){
          for (var i = 0; i < window.deletedAccounts.length ; i++) {
              console.log("DEBUG : id du compte à supprimer ",window.deletedAccounts[i]);
              var account = new Account({id: window.deletedAccounts[i]});
              account.destroy({
                success: function () {
                  console.log("Account deleted");

                },
                error: function () {
                  console.log("Account deletion failed");
                }
              });
          }
        }
        // empty tab
        window.deletedAccounts = [];
        console.log("DEBUG : deletedAccounts après ", window.deletedAccounts);


        if (window.deletedOperations){
          for (var i = 0; i < window.deletedOperations.length ; i++) {
              console.log(window.deletedOperations[i]);
              var operation = new Operation({id: window.deletedOperations[i]});
              operation.destroy({
                success: function () {
                  console.log("Operation deleted");

                },
                error: function () {
                  console.log("Operation deletion failed");
                }
              });
          }
        }
        window.deletedOperations = [];

        $("#syncBtn").removeClass("no-sync");

        // check if the server is online
          /*$.ajax({
                  async: false,
                  url:"ping",
                  success: function(response){
                    console.log("DEBUG :",response);
                    if (response == "pong")
                      return true;
                    return false;
                
                  },
                  error: function() {
                    console.log("DEBUG : localStorage dirty");
                    return false;
                  }
              });*/
        
      
    };

    console.log("initialize");

    app_router.bind('all', function(route, router) {
      if (route != 'route'){
        var routeName = route.split(':')[1];
        $('.nav-sidebar li').removeClass('active');
        if ((routeName == "addAccount") || (routeName == 'graphs') || (routeName == 'addCredit') || (routeName == 'addDebit') || (routeName == 'importCSV')){
          $('.nav-sidebar li.' + routeName).addClass('active');
        }else{
          $('.nav-sidebar li.perso').addClass('active');
        }
      }
    });

    /* AJAX CONFIGS */

    // Tell jQuery to watch for any 401 or 403 errors and handle them appropriately
    $.ajaxSetup({
      statusCode: {
          401: function(){
              // Redirec the to the login page.
              window.location.replace('/#login');
           
          },
          403: function() {
              // 403 -- Access denied
              window.location.replace('/#denied');
          }
      }
    });



    Backbone.history.start();
  };
  return {
    initialize: initialize
  };
});