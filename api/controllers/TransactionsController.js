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
	} else {
		transactor = data[0];
	}
	myData[0] = transactor;

	var ind = myIndexOf(myData, data[3])
	var amount = 0;
	if(data[1] == 'D'){
		amount = -Math.abs(parseFloat(data[2]));
	} else if(data[1] == 'C') {
		amount = parseFloat(data[2]);
	} else {
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

	var transactor = typeof myData[0] == 'undefined' ? '' : myData[0];
	var dataObj = { transactor: transactor,
					direction: data[1],
					amount: amount,
					vendor: data[3],
					date: data[4],
					date1: data[5], };

	return dataObj;
}

function myIndexOf(arr, o) {    
    for (var i = 0; i < arr.length; i++) {
    	if (typeof arr[i] == 'undefined') {
    		return -1;
    	}
        if (arr[i].vendor == o) {
            return i;
        }
    }
    return -1;
}

module.exports = {
	get: function(req, res) {

		var tab = 'credit';
		if(typeof req.param('tab') != 'undefined'){
			tab = req.param('tab').toLowerCase();
		}

		var fs = require('fs');
		var csv = require("fast-csv");
		var rawData = [];
<<<<<<< HEAD
		csv.fromPath("combo.CSV").on("data", function(data){
=======
		console.log('Retrieving '+tab+'.CSV');
		csv.fromPath(tab+'.CSV').on("data", function(data){
>>>>>>> origin/master

			var clean = cleanData(data);

			rawData.push(clean);
		}).on("end", function(){
			return res.json({ transactions: rawData });
		});

	},

	view: function (req, res) {

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
		    return res.view({ data: rawData,
		    				myData: myData,
	    					katie: katieTotal.toFixed(2),
	    					nic: nicTotal.toFixed(2) });
		});

	},
	index: function (req, res) {
		return res.view({item: "test2"});
	},
};