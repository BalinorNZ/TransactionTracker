/**
 * TransactionsController
 *
 * @description :: Server-side logic for managing transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

function cleanData (data) {
	var myData = [];

	var transactor;
	if(data[0] == '4988-****-****-2726'){
		//nicTotal += parseFloat(data[2]);
		transactor = 'Nic';
	} else if (data[0] == '4988-****-****-2734') {
		//katieTotal += parseFloat(data[2]);
		transactor = 'Katie';
	} else if (data[0] == '4988-****-****-2718') {
		transactor = 'Direct';
	}
	myData[0] = transactor;

	var ind = myIndexOf(myData, data[3])
	var amount = 0;
	if(data[1] == 'D'){
		amount = -Math.abs(parseFloat(data[2]));
	} else if(data[1] == 'C') {
		amount = parseFloat(data[2]);
	}
	if(ind > -1) {
		myData[ind].amount += amount;
		myData[ind].count++;
	} else {
		myDatapoint = { vendor: data[3], 
						amount: amount,
						count: 1,
						};
		myData.push(myDatapoint);
	}

	var date = new Date(getDate(data[4]));
	var date1 = new Date(getDate(data[5]));

	var dataObj = { transactor: myData[0],
					direction: data[1],
					amount: amount,
					vendor: data[3],
					date: date,
					date1: date1, };

	// create db record
	//console.log('Saving transaction: '+dataObj.vendor+' '+dataObj.amount);
	//Transaction.create(dataObj).exec(function(err){
	//	if(err) {
	//		console.log(err);
	//		return res.serverError(err);
	//	}
	//});

	return dataObj;
}

function getDate(dateStr, delimiter) {
	delimiter = typeof a !== 'undefined' ? delimiter : '/';

	var dateArray = dateStr.split(delimiter);
	dateArray[0] = dateArray.splice(1, 1, dateArray[0])[0];

	return dateArray.join('/');
}

function myIndexOf(arr, o) {    
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].vendor == o) {
            return i;
        }
    }
    return -1;
}

module.exports = {
	get: function(req, res) {

		//var fs = require('fs');
		//var csv = require("fast-csv");
		//var rawData = [];
		//csv.fromPath("combo.CSV").on("data", function(data){
		//console.log('Retrieving '+tab+'.CSV');
		//csv.fromPath(tab+'.CSV').on("data", function(data){
		//	var clean = cleanData(data);
		//	rawData.push(clean);
		//}).on("end", function(){
		//	return res.json({ transactions: rawData });
		//});
		Transaction.find().exec(function(err, transactions) {
			return res.json({ transactions: transactions });
		});
	},

	deleteTransaction: function(req, res) {
		var id = req.param('id');
		Transaction.findOne({ id: id }).exec(function(err, transaction) {
			sails.log.info('Marking transaction as deleted ', transaction.id);
			transaction.deleted = true;
			transaction.save(function(err) {
				if(err) console.log(err);
			});
		});
	},

	getCategories: function(req, res) {
		Category.find().exec(function(err, categories) {
			return res.json({ categories: categories });
		});
	},

	removeCategory: function(req, res) {
		var name = req.param('name');
		Category.findOne({ name: name }).exec(function(err, category) {
			if(err) return res.serverError(err);
			if(category){
				category.destroy(function(err){
					if(err) return res.serverError(err);
				 	sails.log.info('Deleting category ', category.name);
				});
			}
		});
	},

	saveCategory: function (req, res) {
		var name = req.param('name');
		Category.findOne({name: name}, function(err, category){
			if(err) return cb(err);
			if(category != undefined) {
				sails.log.info("Category already exists.");
				return;
			} else {
				// create db record
				sails.log.info('Saving category: ', name);
				Category.create({ name: name }).exec(function(err){
					if(err) console.log(err);
				});
			}
		});
	},

	view: function (req, res) {

		Transaction.find().exec(function(err, transactions) {
		    return res.view({ data: transactions,
				myData: transactions,
				katie: katieTotal.toFixed(2),
				nic: nicTotal.toFixed(2),
			});
		});

		var fs = require('fs');

		var myData = [];
		var rawData = [];
		var katieTotal = 0;
		var nicTotal = 0;
		var csv = require("fast-csv");
		csv.fromPath("credit.CSV").on("data", function(data){
			var transactor;
			if(data[0] == '4988-****-****-2726'){
				nicTotal += parseFloat(data[2]);
				transactor = 'Nic';
			} else if (data[0] == '4988-****-****-2734') {
				katieTotal += parseFloat(data[2]);
				transactor = 'Katie';
			} else if (data[0] == '4988-****-****-2718') {
				transactor = 'Direct';
			}
			data[0] = transactor;

			var ind = myIndexOf(myData, data[3])
			var amount = 0;
			if(data[1] == 'D'){
				amount = -Math.abs(parseFloat(data[2]));
			} else if(data[1] == 'C') {
				amount = parseFloat(data[2]);
			}
			if(ind > -1) {
				myData[ind].amount += amount;
				myData[ind].count++;
			} else {
				myDatapoint = { vendor: data[3], 
								amount: amount,
								count: 1,
								};
				myData.push(myDatapoint);
			}

		    rawData.push(data);
		}).on("end", function(){
		    //return res.view({ data: rawData,
		    //				myData: myData,
	    	//				katie: katieTotal.toFixed(2),
	    	//				nic: nicTotal.toFixed(2) });
		});

	},
	index: function (req, res) {
		return res.view({item: "test2"});
	},
};