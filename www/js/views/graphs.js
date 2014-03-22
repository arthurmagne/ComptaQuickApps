
	define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  'collections/operations',
  'models/operation',
  'text!../../templates/graphs.html',
  'text!../../templates/opeTab.html',
  'collections/accounts',
  'models/account',
  'views/paymentTypeList',
  'views/accountList'
  ], function(bootstrap, holder, $, _, Backbone, Operations, Operation, graphsTemplate, opeTabTemplate, Accounts, Account, PaymentTypeListView, AccountListView){
    var addDebitPage = Backbone.View.extend({
  	  events: {
        'submit .graph-form': 'switchType',
        'click .display-cal': 'displayCal',
        'click .display-op-form': 'displayOpForm',
        'click .hide-cal': 'hideCal',
        'click .hide-op-form': 'hideOpForm',
        'click .hashtag-opetab': 'graphHashtag',
        'click .account-name-ope-tab .name': 'renameAccount',
        'click  #opeTab .delete-op': 'deleteOp',
        'click  #opeTab .edit-op': 'editOp',
        'click  #opeTab .valid-op-edit': 'validEdit',
        'click .tag-form': 'showDetailBtn',
        'click .hide-detail-tag': 'hideDetailBtn',
        'click .detail-tag': 'tagsLinks'
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
          that.detailBtn = that.$el.find('.detail-tag');
          that.accountListView = new AccountListView();
          that.accountListView.render({allOptions: true});
          that.payementTypeListView = new PaymentTypeListView();
          that.payementTypeListView.render({allOptions: true});
        }
      });
      if(options){
        if (options.hashtagName){
          console.log("hashtag graph");
          this.generateOpTagGraph(options);
        }
      }
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

    showDetailBtn: function (event) {
      this.detailBtn.removeClass("hide");
    },

    hideDetailBtn: function (event) {
      this.detailBtn.addClass("hide");
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
          var template = _.template(opeTabTemplate, {operations: operations.models});
          that.$el.find('#opeTab').html(template);
          
        },
        error: function() {
          console.log("Error during fetch account operation");
        }
      });       
    },

    

    generateBalanceGraph: function () {
      console.log("generate balance graph");
      var that = this;
      var win = this;
      var begin, end, type;
      
      var account_id = this.$el.find('select[name=list_account]').val();

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

      if (account_id == 'all'){
        var allAccOp;
        var i = 1;
        this.accounts = new Accounts(); 
        console.log(this.accounts);
        this.accounts.fetch({
              success: function (accounts) {
                console.log(accounts.models);
                win.initGraphAllAccOptions(accounts, begin, end);
                },
              error: function() {
                  console.log("Error during fetch account operation");
              }
        }); 
      
      }else{  
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
      }
    },

    generateTagGraph: function () {
      console.log("generate tag graph");
      var that = this;
      var begin, end;
      
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
      var that = this;
      operations.fetch({
        success: function (operations) {
          console.log("operations recupérées : ",operations);
          that.operations = operations;
          that.initTagGraphOptions(operations);
          var template = _.template(opeTabTemplate, {operations: operations.models});
          that.$el.find('#opeTab').html(template);
          
        },
        error: function() {
          console.log("Error during fetch account operation");
        }
      });  
      
    },

    initTagGraphOptions: function (operations) {
      var graphOptions = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Détail des opérations'
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
            series: {
                allowPointSelect: true
            }
        },
        series: [{
          name: 'Opérations'
         }]
      };

      // create an array from operations with only the name of the tag and the number (no need to calculate the percentage)
      var tagArray = {};
      operations.each(function(op) {
        console.log("Une op avec comme desc :",op.get("operation_desc"));
        var tags =  op.get("operation_desc").match(/(^#|[^&]#)([a-z0-9]+)/gi);
        var value = op.get("value");
        console.log(tags);
        if (tags == null) {
          if (tagArray['autres'] != null){
           tagArray['autres'] += parseInt(value);
         }else{
            tagArray['autres'] = parseInt(value);
         }
        }else{
          tags.forEach(function (t) {
            t = t.trim();
             if (tagArray[t] != null){
              tagArray[t] += parseInt(value);
            }else{
              tagArray[t] = parseInt(value);
            }
          });
        }
      });
      console.log("notre tableau est donc :",tagArray);


     var jsonArray = [];
      for (var key in tagArray) {
          jsonArray.push({
            name: key,
            y: tagArray[key]
        });
        }
      // don't forget to reverse it
      graphOptions.series[0].data = jsonArray;
      if (this.operations.length != 0){
          this.$el.find('#graphs').highcharts(graphOptions);
        }else{
          this.$el.find('#graphs').html("<h2 class='text-center text-muted'>Aucune opération n'a été trouvée</h2>");
        }
    },

    generateOpTagGraph: function (options) {      
      var operations   = new Operations({accountId : options.accountId, tag : options.hashtagName, dateDebut : 'all' });
      var that = this;
      operations.fetch({
        success: function (operations) {
          console.log("operations recupérées : ",operations);
          that.operations = operations;
          that.initOpTagGraphOptions({operations : that.operations, tag : options.hashtagName});
          
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
        var today = new Date();

        listOpe = listOpe.reverse();

        evolutionY.push(parseInt(balance));
        evolutionX.push(Date.parse(today));
        evolutionOp.push("Nouveau solde");

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


        evolutionY.push(parseInt(balance));
        today.setTime(today.getTime()-30*24*3600*1000);
        evolutionX.push(Date.parse(today));
        evolutionOp.push("Ancien solde");
        evolutionX.reverse();
        evolutionY.reverse();
        evolutionOp.reverse();

        var jsonArray = [];
        for(var i = 0; i < evolutionX.length; i++){
          if(evolutionY[i] < 0){
                jsonArray.push({
                  x: evolutionX[i],
                  name: evolutionOp[i],
                  color: 'red',
                  y: parseInt(evolutionY[i])
              });
            }else {
                jsonArray.push({
                  x: evolutionX[i],
                  name: evolutionOp[i],
                  color: '#483D8B',
                  y: parseInt(evolutionY[i])
              });
          }
        };

        graphOptions.series[0].data = jsonArray;
        console.log(graphOptions);
        this.$el.find('#graphs').highcharts(graphOptions);
      },

      initOpTagGraphOptions: function (opAndTag) {
      // options for graph
      var graphOptions = {
          chart: {
              type: 'column'
          },
          title: {
              text: 'Graphe hashtag ' + opAndTag.tag
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
      var operations = opAndTag.operations;

      operations.each(function(op) {
          jsonArray.push({
            x: Date.parse(op.get("operation_date")),
            name: op.get("operation_name"),
            color: (op.get("is_credit") == 1) ? 'green' : 'red',
            y: ((op.get("is_credit") == 1) ? parseInt(op.get("value")) : (- parseInt(op.get("value"))))
        });
      }); 
      // don't forget to reverse it
      graphOptions.series[0].data = jsonArray;
      if (operations.length != 0){
          this.$el.find('#graphs').highcharts(graphOptions);
        }else{
          this.$el.find('#graphs').html("<h2 class='text-center text-muted'>Aucune opération n'a été trouvée</h2>");
        }

        

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
          console.log("DEBUG DATE ",op.get("operation_date"));
          jsonArray.push({
            x: Date.parse(op.get("operation_date")),
            name: op.get("operation_name"),
            color: (op.get("is_credit") == 1) ? 'green' : 'red',
            y: ((op.get("is_credit") == 1) ? parseInt(op.get("value")) : (- parseInt(op.get("value"))))
        });
      }); 
      // don't forget to reverse it
      graphOptions.series[0].data = jsonArray;
      if (this.operations.length != 0){
          this.$el.find('#graphs').highcharts(graphOptions);
        }else{
          this.$el.find('#graphs').html("<h2 class='text-center text-muted'>Aucune opération n'a été trouvée</h2>");
        }
  
    },


    initGraphAllAccOptions: function (accounts, begin , end) {
       var series_name = [];
       var win = this;
      _.each(accounts.models, function(account, cpt) {
                    var accname = account.get("account_name");
                    console.log("account name : ",name);
                    series_name.push({name: accname});
      }); 


      var graphOptions = {
        chart: {
            type: 'spline'
        },
        title: {
            text: 'Évolution du solde de tous les comptes'
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
        series: series_name
      };
      
      var k = 0;

      var size = accounts.length;
       _.each(accounts.models, function(account, cpt) {
                var id = account.get("id");
                var balance = account.get("balance");
                var operations = new Operations({accountId: id, dateDebut: begin, dateFin: end});
                operations.fetch({
                  async: false,
                  success: function (operations) {   
                    console.log(operations.toArray());
                    var listOpe   = operations.toArray();
                    var evolutionX  = []; 
                    var evolutionY  = []; 
                    var evolutionOp = [];
                    var today = new Date();

                    listOpe = listOpe.reverse();

                    evolutionY.push(parseInt(balance));
                    evolutionX.push(Date.parse(today));
                    evolutionOp.push("Nouveau solde");

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


                    evolutionY.push(parseInt(balance));
                    today.setTime(today.getTime()-30*24*3600*1000);
                    evolutionX.push(Date.parse(today));
                    evolutionOp.push("Ancien solde");
                    evolutionX.reverse();
                    evolutionY.reverse();
                    evolutionOp.reverse();



                    var colorrandom = win.generateColor();
                    var jsonArray = [];
                    for(var i = 0; i < evolutionX.length; i++){
                        jsonArray.push({
                          x: evolutionX[i],
                          name: evolutionOp[i],
                          color: colorrandom,
                          y: parseInt(evolutionY[i])
                      });
                    };

                    console.log(k);
                    console.log("jsonArray :");
                    console.log(jsonArray);
                    console.log("graphOptions :");
                    console.log(graphOptions);
                    console.log(graphOptions.series[k]);
                    graphOptions.series[k].data = jsonArray;
                    console.log("DEBUG jsonarray ",JSON.stringify(jsonArray));
                    console.log(graphOptions);
                    k++;
                    console.log(size);
                    if(size==k){
                       console.log(graphOptions);
                       win.$el.find('#graphs').highcharts(graphOptions);
                    }
                   }                 
                })
      });
    },

    generateColor: function() {
      var green = Math.floor(Math.random()*255);
      var red = Math.floor(Math.random()*255);
      return color = '0x'+green.toString(16)+red.toString(16)+'ff';
    },
      
    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    },

    renameAccount: function (event) {
          event.preventDefault();
          var accountNameTag = $('.account-name-ope-tab');
          var accountName = accountNameTag.find('.name').html();

          accountNameTag.html("<input class='form-control' type='text' value='"+accountName+"'/>");
        },

    graphHashtag: function(event){
      event.preventDefault();
      var hashtagName = $(event.currentTarget).attr("href");
      //console.log(hashtagName);


      var graphview = new GraphView();
      graphview.render({hashtagName : hashtagName, accountId : this.accountId});

    },

    deleteOp: function (event) {
      //event.stopImmediatePropagation();

      var that = this;
      BootstrapDialog.confirm('Voulez vous vraiment supprimer cette opération?', function(result){
            if(result) {
                var opId = $(event.currentTarget).data('value');
          console.log("Delete op with id : ", opId);
          // remove model (from server and collection by bubbling)
         // window.deletedOperations.push(opId);
          //window.operationsTab[that.accountId].remove(window.operationsTab[that.accountId].get(opId));

            that.operations.get(opId).destroy({ 
              success: function () {
                that.$el.find('.op-row[data-value='+opId+']').remove();
              },
              error: function () {
                console.log("DEBUG : Error during destroy deleteOp");
              }
            });
          

          // remove row from tab
          
            
            }else {
                console.log("Suppression annulée");
            }
        });  

    },

    editOp: function (event) {
      //event.stopImmediatePropagation();
      // Ajouter un input à la place du nom avec un bouton valider
      console.log("editOp");
        var opId = $(event.currentTarget).data('value');
      var opNameTag = this.$el.find('.op-row[data-value='+opId+'] .op-name');
      //var opDescTag = this.$el.find('.op-row[data-value='+opId+'] .op-desc');
      var editOpBtn = this.$el.find('.edit-op[data-value='+opId+']');
      var opName = opNameTag.html();
      //var opDesc = opDescTag.html();

      opNameTag.html("<input class='form-control' type='text' value='"+opName+"'/>");
      //opDescTag.html("<input class='form-control' type='text' value='"+opDesc+"'/>");
      editOpBtn.html("Valider");
      editOpBtn.removeClass("edit-op");
      editOpBtn.addClass("valid-op-edit");

    },

    validEdit: function (event) {
      //event.stopImmediatePropagation();
      console.log("validEdit");
      var that = this;
      var opId = $(event.currentTarget).data('value');
      var opNameTag = this.$el.find('.op-row[data-value='+opId+'] .op-name');
      var opNameInput = this.$el.find('.op-row[data-value='+opId+'] .op-name input');
      var editOpBtn = this.$el.find('.valid-op-edit[data-value='+opId+']');
      // On récupère la valeur de l'input
      var opName = opNameInput.val();


        $(".error-msg").html();

      var error_msg = '';
      if (opName == ''){
        error_msg += "Le nom de l'opération ne peut être vide.<br>";
          opNameInput.addClass("form-error");
          
      }

        $(".error-msg").html(error_msg);


      if (error_msg != ''){
        return ;
      }
      // on update l'account sur le serveur

      var operation = this.operations.get(opId);
      operation.set('operation_name', opName);
      operation.save(null, {
          success: function (operation){

            console.log("Operation push au serveur avec succès");
            console.log(operation);               
            

          },
          error: function (){
            console.log("An error occured");
          }
        });
      

      opNameTag.html(opName);
      console.log(opName);
      editOpBtn.html("Éditer");
      editOpBtn.removeClass("valid-op-edit");
      editOpBtn.addClass("edit-op");
    },

    tagsLinks: function(event) {
        event.preventDefault();
        var chart = this.$el.find('#graphs').highcharts();
        var selectedPoints = chart.getSelectedPoints();
        console.log('You selected '+ selectedPoints.length +' points');
        if (selectedPoints.length != 1){
          BootstrapDialog.alert('Vous devez sélectionner un unique tag dans le graphe');
        }else{
          console.log(selectedPoints[0].name);
          this.render({hashtagName : (selectedPoints[0].name).slice(1)});
        }
    }

  	});

  return addDebitPage;
});
