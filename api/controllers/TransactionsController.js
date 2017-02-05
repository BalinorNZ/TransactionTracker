/**
 * TransactionsController
 */

module.exports = {

  index: function (req, res) {
    return res.view('index', { layout: 'appLayout' });
  },

  react: function (req, res) {
    return res.view('react', { layout: 'tutorialLayout' });
  },

  import: (req, res) => {
    console.log("Importing CSV.");
    req.file('file').upload((err, files) => {
      if(err) console.log(err);
      if(files.length === 0) console.log("No files sent!");
      Import.processCSV(files[0].fd)
        .then(contents => Import.formatTransactions(contents))
        .then(transactions => Import.importTransactions(transactions))
        .then(transactions => res.json({ transactions }));
    });
  },

	get: function(req, res) {
    let params = {};
    if(req.param('limit')) params.limit = req.param('limit');
		console.time('Transaction.find (get transactions)');
		Transaction.find(params).exec(function(err, transactions) {
      console.timeEnd('Transaction.find (get transactions)');
      const transactionmap = transactions.map(t => Object.assign({}, t, { merchant: t.vendor} ));
			return res.json({ transactions: transactionmap });
		});
	},

	deleteTransaction: function(req, res) {
		const id = req.param('id');
		Transaction.findOne({ id: id }).exec(function(err, transaction) {
			sails.log.info('Marking transaction as deleted ', transaction.id);
			transaction.deleted = true;
			transaction.save(function(err) {
				if(err) console.log(err);
				return res.json({ id: id });
			});
		});
	},

  deleteTransactionsByMerchant: function(req, res) {
    const merchant = req.param('merchant');
    Transaction.update({merchant}, { deleted: true }, (e, result) => {
      if(e) console.log("deleteTransactionsByMerchant failed", e);
      sails.log.info('Marking', result.length, 'transactions as deleted.');
      return res.json({ transactions: result });
    });
  },

	restoreTransaction: function(req, res) {
		const id = req.param('id');
		Transaction.findOne({ id: id }).exec(function(err, transaction) {
			sails.log.info('Restoring transaction ', transaction.id);
			transaction.deleted = false;
			transaction.save(function(err) {
				if(err) console.log(err);
        return res.json({ id: id });
			});
		});
	},

	setCategory: function(req, res) {
		const transaction = req.param('transaction');
		const category = req.param('category');
		Transaction.findOne({ id: transaction }).exec(function(err, transaction) {
			sails.log.info('Setting category ', category, ' on transaction ', transaction.id);
			transaction.category = category;
			transaction.save(function(err) {
				if(err) console.log(err);
        return res.json({ transaction: transaction });
			});
		});
	},

  setCategoryByMerchant: function(req, res) {
    const merchant = req.param('merchant');
    const category = req.param('category');
    Transaction.update({merchant}, {category}, (e, result) => {
      if(e) console.log("setCategoryByMerchant failed", e);
      sails.log.info('Setting category on', result.length, 'transactions.');
      return res.json({ transactions: result });
    });
  },

	getCategories: function(req, res) {
    console.time('Category.find (get categories)');
		Category.find().exec(function(err, categories) {
      console.timeEnd('Category.find (get categories)');
			return res.json({ categories: categories });
		});
	},

	removeCategory: function(req, res) {
		const name = req.param('name');
		Category.findOne({ name: name }).exec(function(err, category) {
			if(err) return res.serverError(err);
			if(category){
				category.destroy(function(err){
					if(err) return res.serverError(err);
				 	sails.log.info('Deleting category ', category.name);
          return res.json({ category: category });
				});
			}
		});
	},

	saveCategory: function (req, res) {
		const name = req.param('name');
		Category.findOne({name: name}, function(err, category){
			if(err) return cb(err);
			if(category != undefined) {
				sails.log.info("Category already exists.");
				return;
			} else {
				// create db record
				sails.log.info('Saving category: ', name);
				Category.create({ name: name }).exec(function(err, newCategory){
					if(err) console.log(err);
          return res.json({ category: newCategory });
				});
			}
		});
	},

	view: function (req, res) {
		console.log('View route.');
		return res.view();
	},
};



/*
// OLD CODE FROM VIEW ROUTE
Transaction.find().exec(function(err, transactions) {
    return res.view({ data: transactions,
		myData: transactions,
		katie: katieTotal.toFixed(2),
		nic: nicTotal.toFixed(2),
	});
});
/*
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
		myDatapoint = { merchant: data[3],
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
		myDatapoint = { merchant: data[3],
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
 merchant: data[3],
					date: date,
					date1: date1, };

	// create db record
	//console.log('Saving transaction: '+dataObj.merchant+' '+dataObj.amount);
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
        if (arr[i].merchant == o) {
            return i;
        }
    }
    return -1;
}
*/
