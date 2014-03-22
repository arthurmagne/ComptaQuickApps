define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  // Using the Require.js text! plugin, we are loaded raw text
  // which will be used as our views primary template
  'text!../../templates/home.html',
  'models/user',
  'views/homePerso'
  ], function(bootstrap, holder, $, _, Backbone, homeTemplate, User, HomePersoView){
  var HomePage = Backbone.View.extend({
    events: {
      'click .sign-up-btn': 'showConnexionForm',
      'click .login-btn': 'connectionAuto'
    },

    el: '#page',

    render: function () {
      var template = _.template(homeTemplate);
      this.$el.html(template);
      $("#background").addClass("home-background");
    },

    showConnexionForm: function () {
      console.log("add class show");
      $('#home-header, #home-footer').addClass('show');
    },

    connectionAuto: function () {
      event.preventDefault(); // Don't let this button go to the login page
      console.log("Try to connect auto");
      var url = 'loginAuto';
      var that = this;
      $.ajax({
            url:url,
            type:'GET',
            crossDomain: true,
            statusCode: {
              200: function (response) {
                console.log("connection automatique réussie");
                that.close();
                 //on crée notre model user qu'on va passer à la vue suivante
                var user = new User({model: response});
                window.userSession = user;
                
                //on lance la vue suivante avec le modèle en paramètre
                var homePersoView = new HomePersoView();
                homePersoView.render();
                //on change l'url sans appeler la fonction correspondante du router
                window.history.pushState(null, null,  "#/perso");

              },
              401: function (response) {
                console.log("connection automatique échouée");
                that.showConnexionForm();
                Backbone.View.prototype.goTo('#/sign-in');
                
              }
            },
            success:function (data) {
                console.log(["Login request details: ", data]);

            }
        });
    },

    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }
    

  });

  // Our module now returns our view
  return HomePage;
});