define([
  'bootstrap',
  'holder',
  'jquery',
  'underscore',
  'backbone',
  'text!../../templates/importCSV.html',
  'collections/operations',
  'models/operation',
  'collections/accounts',
  'models/account'
  ], function(bootstrap, holder, $, _, Backbone, importCSVTemplate, Operations, Operation, Accounts, Account){
    var importfile = Backbone.View.extend({
	events: {
        'change #importFile': 'handleFileSelect',
        'click #validImport': 'saveImport'
    },

	el: '#center-page', 

	render: function () {
	  	console.log("importCSV view");
	  	this.accounts = new Accounts();
	  	this.operations = new Operations();
      	console.log("account list :" + this.accounts);
      	console.log("operations :" + this.operations);
      	var that = this;
      	this.accounts.fetch({
	        success: function (accounts) {
	          console.log("accounts fetch success");
	          var template = _.template(importCSVTemplate, {accounts: accounts.models});
	          that.$el.html(template);  
	        }
      	});  
    },

    saveImport: function(event) {
    	event.preventDefault();
    	this.operations.each(function(operation){
      		console.log(operation);
      		operation.save(null, {
			  success: function() {
			    console.log("Operation POST avec succès");
			  	console.log(operation);
			  	$(that.el).empty();
			  	$(that.el).html("<h2 class='text-center text-muted add-feedback'>Import des opérations réussis</h2><hr>");
			  	setTimeout(function(){
					that.close();
					Backbone.View.prototype.goTo('#/importCSV');
		 		},2000);
			  },
			  error: function() {
			    console.log("oupss");
			  }
			});
      	});
    },

    saveOperation: function(date, name, desc, op) {
		var idacc = this.$el.find('select[name=list_account]').val();
		console.log(isNaN(parseInt(op)));
		if(isNaN(parseInt(op))==false){
			var operation =  parseInt(op);
			if(operation < 0){
				var credit = 0;
				operation= Math.abs(operation);
			}else{
				var credit = 1;
			}
			var dateparsed = this.parseDate(date);
			console.log(credit);
		}else{
			this.error_msg += " La valeur de l'opération <"+ name + "> n'est pas un nombre <br>";
		}
      	if (this.error_msg != ''){
      		this.error_html.html("<div class='bs-callout bs-callout-danger'><h4>ERREUR</h4>" + this.error_msg + "</div>");
      	}else{
			var data = {
					account_id: idacc,
		    		operation_date: dateparsed,
		    		operation_name: name,
		    		operation_desc: desc,
		    		is_credit: credit,
		    		value: operation,
		    		type_id: 3
			};
	    	var operation = new Operation(data);
	    	console.log(operation);	
	    	this.operations.add(operation);
    	}
    },

 	parseDate: function(date) {
 		var dateRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
	    if (date == "" ) {
	    	this.error_msg+="Insérer une date <br>";
		}else if (!(dateRegex.test(date))) {
			this.error_msg+="Format de date invalide <br>";
      	} else {
      		dd = date.substring(0,2);
			mm = date.substring(3,5);
			yyyy = date.substring(6,10);

			d = yyyy+"-"+mm+"-"+dd
			return d;  
      	}	
      	return null;  		
 	},

    parseCSV: function(text, lineTerminator, cellTerminator) {
    	var table = this.$el.find('#import-table');	 
		var lines = text.split(lineTerminator);
		this.error_html = $(".error-msg");
	    this.error_msg='';
		for(var j = 0; j<lines.length; j++){
			if(lines[j] != ""){
				var information = lines[j].split(cellTerminator);
					if (information.length == 3){
						table.append("<tr><td>"+information[0]+"</td><td>"+information[1]+"</td><td>"+information[2]+"</td></tr>");
						this.saveOperation(information[0], information[1], "", information[2]);
					}else if(information.length == 4){
						table.append("<tr><td>"+information[0]+"</td><td>"+information[1]+"</td><td>"+information[2]+"</td><td>"+information[3]+"</td></tr>");
						this.saveOperation(information[0], information[1], information[2], information[3]);
					} else {
						this.error_msg+= " Les données du fichier sont non conformes (trop ou pas assez d'informations) " ;
						this.error_html.html("<div class='bs-callout bs-callout-danger'><h4>ERREUR</h4>" + this.error_msg + "</div>");
						setTimeout(function(){
							that.close();
							Backbone.View.prototype.goTo('#/importCSV');
		 				},5000);
		 				return;
					}
			}
		}
		if(this.error_msg!=''){
			setTimeout(function(){
				that.close();
				Backbone.View.prototype.goTo('#/importCSV');
		 	},5000);
		}else{
			this.enableBtn();
		}
	},

	handleFileSelect: function(event) {
		event.preventDefault(); 		
		that = this;
		var filename = $('input[name=importFile]').val();
		this.error_html = $(".error-msg");
		this.error_msg='';
		if (this.extensionCheck(filename) < 0){    
	      this.error_msg+="Extension non autorisée";  
	      this.error_html.html("<div class='bs-callout bs-callout-danger'><h4>ERREUR</h4>" + this.error_msg + "</div>");
						setTimeout(function(){
							that.close();
							Backbone.View.prototype.goTo('#/importCSV');
		 				},2500);
		   return;
	    }  
		var files = event.target.files; // FileList object
		for (var i = 0, f; f = files[i]; i++) { // Loop through the FileList 
			var reader = new FileReader();
			reader.onload = (function(theFile) { // Closure to capture the file information.
				return function(e) {
					var cellterminator = $('select[name=delimiteur]').val();	
					if(cellterminator=="tab"){
						that.parseCSV(e.target.result, '\n', '\t');
					}else if(cellterminator==";"){
						that.parseCSV(e.target.result, '\n', '\;'); 
					}		
				};
			})(f);
		reader.readAsText(f); // Read the file as text
		}
	},

	//Gestion des erreurs 
	extensionCheck: function(filename) {
		var allowedExtensions = ["txt", "csv", "exl"]; 
		var extension = filename.split('.').pop();
		console.log(extension);
	    return allowedExtensions.indexOf(extension);
	},

	disableBtn: function()  {
		var loginButton = $("#validImport");
  		loginButton.attr("disabled", "true");
  	},

	enableBtn: function(){
		var loginButton = $("#validImport");
    	loginButton.removeAttr("disabled");
  	},

    close: function () {
      $(this.el).unbind();
      $(this.el).empty();
    }

	});

  return importfile;
});
