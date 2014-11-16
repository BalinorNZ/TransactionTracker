/**
 * TransactionsController
 *
 * @description :: Server-side logic for managing transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	get: function(req, res) {

		var fs = require('fs');
		var csv = require("fast-csv");
		var rawData = [];
		csv.fromPath("credit.CSV").on("data", function(data){
			var dataObj = { transactor: data[0],
							direction: data[1],
							amount: data[2],
							vendor: data[3],
							date: data[4],
							date1: data[5], };

			rawData.push(dataObj);
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

		function myIndexOf(arr, o) {    
		    for (var i = 0; i < arr.length; i++) {
		        if (arr[i].vendor == o) {
		            return i;
		        }
		    }
		    return -1;
		}
	
	},
	index: function (req, res) {
		return res.view({item: "test2"});
	},
};