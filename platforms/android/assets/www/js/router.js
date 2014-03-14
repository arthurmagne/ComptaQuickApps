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
  'views/importCSV'
  ], function($, _, Backbone, HomeView, SignInView, SignUpView, HomePersoView, OpeTabView, AddAccountView, AddDebitView, AddCreditView, GraphsView, AccountsTabView, ImportCSV){

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

    Backbone.View.prototype.goTo = function (loc) {
      app_router.navigate(loc, true);
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