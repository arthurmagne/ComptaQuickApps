define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  // Using the Require.js text! plugin, we are loaded raw text
  // which will be used as our views primary template
  'text!../../templates/signUp.html',
  'models/user',
  'views/homePerso'
  ],

  function(bootstrap, holder, $, _, Backbone, signUpTemplate, User, HomePersoView){
    var HomePage = Backbone.View.extend({
    events: {
      'click .close-sign-up': 'close',
      'click #subscribeBtn': 'registration'
    },

    el: '#connexion-form',
    
    render: function () {
      var template = _.template(signUpTemplate);
      this.$el.html(template);
      setTimeout(function() {
        $("#sign-up-form").addClass("disp");
      }, 1000);   
      this.firstname = $(".sign-up-form input[name='firstname']");
      this.lastname = $(".sign-up-form input[name='lastname']");
      this.email = $(".sign-up-form input[name='email']");
      this.password = $(".sign-up-form input[name='password']");
      this.passwordv = $(".sign-up-form input[name='passwordv']");
      this.captcha = $(".sign-up-form input[name='captcha']");
      this.error_msg = $(".error-msg");
    },

    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    },

    attributes: function() {
      return {
        lastname: this.lastname.val(),
        firstname: this.firstname.val(),
        email: this.email.val(),
        password: this.password.val(),
        passwordv: this.passwordv.val(),
        captcha: this.captcha.val()
       };
     },

    registration: function (event) {
      event.preventDefault(); // Don't let this button submit the form
      this.email.removeClass("form-error");
      this.password.removeClass("form-error");
      this.passwordv.removeClass("form-error");
      this.firstname.removeClass("form-error");
      this.lastname.removeClass("form-error");
      this.captcha.removeClass("form-error");
      this.error_msg.html();
      var url = 'http://netmove.fr/ComptaQuick/api/index.php/subscribe';
      console.log('Subscribing ... ');
      var that = this;

      var _data = this.attributes();
      var error_msg = '';
      if (!_data.email){
        error_msg += 'Veuillez indiquer un email.<br>';
        this.email.addClass("form-error");
      }
      if (!_data.password){
        error_msg += 'Veuillez indiquer un mot de passe.<br>';
        this.password.addClass("form-error");
      }
      if (!_data.firstname){
        error_msg += 'Veuillez indiquer un prénom.<br>';
        this.firstname.addClass("form-error");
      }
      if (!_data.lastname){
        error_msg += 'Veuillez indiquer un nom.<br>';
        this.lastname.addClass("form-error");
      }
      if (!_data.passwordv || _data.passwordv != _data.password){
        error_msg += 'Confirmation du mot de passe incorrect.<br>';
        this.passwordv.addClass("form-error");
      }
      if (!_data.captcha || _data.captcha != 'captcha'){
        error_msg += 'Captcha incorrect.';
        this.captcha.addClass("form-error");
      }
      this.error_msg.html(error_msg);

      if (error_msg != ''){
        return ;
      }

      _data = JSON.stringify(_data);
      console.log(_data);
     
      $.ajax({
        url:url,
        type:'POST',
        dataType:"json",
        data: _data,
        statusCode: {
          200: function (response) {
            console.log("Enregistrement réussie.");
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
            that.error_msg.html("Erreur lors de l'enregistrement.<br>Email déjà utilisé.");
         }
        },
        success:function (data) {
          console.log(["Sign-up request details: ", data]);
        }
      });
    }
  });

  // Our module now returns our view
  return HomePage;
});
