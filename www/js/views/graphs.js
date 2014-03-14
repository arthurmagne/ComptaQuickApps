	
	define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  'collections/operations',
  'models/operation',
  'text!../../templates/graphs.html',
  'collections/accounts',
  'models/account',
  'views/paymentTypeList',
  'views/accountList'
  ], function(bootstrap, holder, $, _, Backbone, Operations, Operation, graphsTemplate, Accounts, Account, PaymentTypeListView, AccountListView){
    var addDebitPage = Backbone.View.extend({
  	  events: {
        'submit .graph-form': 'switchType',
        'click .display-cal': 'displayCal',
        'click .display-op-form': 'displayOpForm',
        'click .hide-cal': 'hideCal',
        'click .hide-op-form': 'hideOpForm'
      },
	
  	el: '#center-page',
  	
  	render: function (options) {
      console.log("graphs view");
      console.log(options);
      this.accounts = new Accounts();
      console.log("account list :");
      console.log(this.accounts);
      var that = this;
      this.accounts.fetch({
        success: function (accounts) {
          console.log("accounts fetch success");
          var template = _.template(graphsTemplate, {accounts: accounts.models});
          that.$el.html(template);   
          that.typeOp = that.$el.find('select[name=select-op-type]');
          that.calendars = that.$el.find('.calendars');
          that.opForm = that.$el.find('.graph-op-form');
          that.accountListView = new AccountListView();
          that.accountListView.render({allOptions: true});
          that.payementTypeListView = new PaymentTypeListView();
          that.payementTypeListView.render({allOptions: true});
        }
      });
    },

    switchType: function (event) {
      event.preventDefault(); 
      var graphType = this.$el.find('input[name=graphType]:checked').val();
      switch (graphType) {
        case 'op':
          this.generateOpGraph();
          break;
        case 'pie':
          this.generateTagGraph();
          break;
        case 'balance':
          this.generateBalanceGraph();
          break;
      }
    },

    displayCal: function (event) {
      this.calendars.addClass("show");
    },

    hideCal: function (event) {
      this.calendars.removeClass("show");
    },

    displayOpForm: function (event) {
      this.opForm.addClass("show");
    },

    hideOpForm: function (event) {
      this.opForm.removeClass("show");
    },

   generateOpGraph: function (event) {
      console.log("generate operations graphs ...");

      var that = this;
      var begin, end, type;

      var account_id = this.$el.find('select[name=list_account]').val();
      if (account_id == 'all')
        account_id = undefined;

      // get the duration
      var duration = this.$el.find('input[name=duration]:checked').val();
      if (duration == 'current')
        duration = undefined;
      if (duration == 'future'){
        begin = new Date().toJSON();
      }
      if (duration == 'all'){
        begin = 'all';
      }
      if (duration == 'manuel'){
        
        begin =  this.$el.find('input[name=begin]').val();
        end   =  this.$el.find('input[name=end]').val();

        if (begin == '')
          begin = undefined;
        if (end == '')
         end = undefined;
      }

      var payementType = this.$el.find('select[name=list_type]').val();
      if (payementType == 'all')
        payementType = undefined;

      var limit = this.$el.find('input[name=limit]').val();
      if (limit == '')
        limit = undefined;

      var type = this.typeOp.val();
      if (type == 'all')
        type = undefined;
      

      var operations = new Operations({accountId: account_id, maxOpe: limit, dateDebut: begin, dateFin: end, typeOpe: type, payementType: payementType});
      var that = this;
      operations.fetch({
        success: function (operations) {
          console.log("operations recupérées : ",operations);
          that.operations = operations;
          that.initGraphOptions(operations);
          
        },
        error: function() {
          console.log("Error during fetch account operation");
        }
      });       
    },

    

    generateBalanceGraph: function () {
      console.log("generate balance graph");
      var that = this;
      var begin, end, type;
      
      var account_id = this.$el.find('select[name=list_account]').val();
      if (account_id == 'all')
        account_id = undefined;

      // get the duration
      var duration = this.$el.find('input[name=duration]:checked').val();
      if (duration == 'current')
        duration = undefined;
      if (duration == 'future'){
        begin = new Date().toJSON();
      }
      if (duration == 'all'){
        begin = 'all';
      }
      if (duration == 'manuel'){
        
        begin =  this.$el.find('input[name=begin]').val();
        end   =  this.$el.find('input[name=end]').val();

        if (begin == '')
          begin = undefined;
        if (end == '')
         end = undefined;
      }

      var operations = new Operations({accountId: account_id, dateDebut: begin, dateFin: end});
      var account = new Account({account_id: account_id});

      account.fetch({
        success: function (account) {
          console.log("account recupéré : ",account);
          that.account = account;
          that.accountBalance = account.get("balance");
          operations.fetch({
                success: function (operations) {
                  console.log("operations recupérées : ",operations);
                  that.operations = operations;
                  that.initBalanceGraphOptions(operations);
                  
                },
            error: function() {
              console.log("Error during fetch account operation");
            }
              });
        },
        error: function() {
          console.log("Error during fetch account operation");
        }
      });

    },

    initBalanceGraphOptions: function (operations) {
      // options for graph
      var graphOptions = {
          chart: {
              type: 'spline'
          },
          title: {
              text: 'Évolution du solde du compte'
          },
          xAxis: {
              type: 'datetime'
          },
          yAxis: {
              title: {
                  text: 'Montant (euros)'
              }
          },
         plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
          series: [{
            name: 'solde'
           }]
          };


        var balance   = this.accountBalance;
        var listOpe   = operations.toArray();
        var evolutionX  = []; 
        var evolutionY  = []; 
        var evolutionOp = [];

        listOpe = listOpe.reverse();
        
        for(var i = 0; i < listOpe.length; i++){
          // we put the previous balance in the tab
          evolutionY.push(parseInt(balance));
          if(listOpe[i].get("is_credit") == 1){
            balance = parseInt(balance) - parseInt(listOpe[i].get("value"));
          }else{
            balance = parseInt(balance) + parseInt(listOpe[i].get("value"));
          }
          evolutionX.push(Date.parse(listOpe[i].get("operation_date")));
          evolutionOp.push(listOpe[i].get("operation_name"));
        }

        evolutionX.reverse();
        evolutionY.reverse();
        evolutionOp.reverse();

        var jsonArray = [];
        for(var i = 0; i < evolutionX.length; i++){
            jsonArray.push({
              x: evolutionX[i],
              name: evolutionOp[i],
              color: '#483D8B',
              y: parseInt(evolutionY[i])
          });
        };

        graphOptions.series[0].data = jsonArray;
        console.log(graphOptions);
        this.$el.find('#graphs').highcharts(graphOptions);
      },

    initGraphOptions: function (object) {
       var graphOptions = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Opérations'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Montant (euros)'
            }
        },
        series: [{
          name: 'Opérations'
         }]
      };
     var jsonArray = [];
      object.each(function(op) {
          jsonArray.push({
            x: Date.parse(op.get("operation_date")),
            name: op.get("operation_name"),
            color: '#483D8B',
            y: ((op.get("is_credit") == 1) ? parseInt(op.get("value")) : (- parseInt(op.get("value"))))
        });
      }); 
      // don't forget to reverse it
      graphOptions.series[0].data = jsonArray;
      this.$el.find('#graphs').highcharts(graphOptions);
  
    },
      
    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }

  	});

  return addDebitPage;
});
