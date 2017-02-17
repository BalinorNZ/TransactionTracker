/**
 * TransactionsController
 */
const runGenerator = (g) => {
  var it = g(), ret;

  // asynchronously iterate over generator
  (function iterate(val){
    ret = it.next( val );

    if (!ret.done) {
      // poor man's "is it a promise?" test
      if ("then" in ret.value) {
        // wait on the promise
        ret.value.then( iterate );
      }
      // immediate value: just send right back in
      else {
        // avoid synchronous recursion
        setTimeout( function(){
          iterate( ret.value );
        }, 0 );
      }
    }
  })();
};

module.exports = {

  index: function (req, res) {
    return res.view('index', { layout: 'appLayout' });
  },

  react: function (req, res) {
    return res.view('react', { layout: 'tutorialLayout' });
  },

  import: (req, res) => {
    console.log("Importing CSV.");
    const co = require('co');
    co(function *() {
      console.time("import");
      const files = yield Import.receiveUpload(req);
      const rows = yield Import.processCSV(files[0].fd);
      const transactions = Import.formatTransactions(rows);
      const dbTransactions = yield Import.findTransactionsAsync({});
      const dbMerchants = yield Import.findMerchantsAsync({});
      const transactionsToCreate = transactions
        .filter(t =>
          t.direction && t.amount && t.date
        ).filter(t =>
          !(t != undefined && dbTransactions.some(dbt =>
            dbt.date.toISOString() === t.date
            && dbt.amount === t.amount
            && dbt.merchant === t.merchant
            && dbt.direction === t.direction))
        ).map(t => {
          const merchant = _.findWhere(dbMerchants, {name: t.merchant});
          return merchant ? Object.assign({}, t, {category: merchant.defaultCategory}) : t;
        });

      sails.log.warn((transactions.length - transactionsToCreate.length), "transactions already exist.");
      sails.log.info(`Saving ${transactionsToCreate.length} new transactions.`);
      const createdTransactions = yield Import.createTransactionAsync(transactionsToCreate);
      console.timeEnd("import");
      res.json({ transactions: createdTransactions });
    }).catch(e => {
      console.log(e);
      res.json({e});
    });
  },

	get: function(req, res) {
    let params = {};
    if(req.param('limit')) params.limit = req.param('limit');
		console.time('Transaction.find (get transactions)');
		Transaction.find(params).exec(function(err, transactions) {
      console.timeEnd('Transaction.find (get transactions)');
			return res.json({ transactions });
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

		// add merchant row with transaction.merchant, transaction.type, category
    // if one doesn't already exist
    const merchant = {
      name: transaction.merchant,
      defaultType: transaction.type,
      defaultCategory: category,
    };
    Merchant.findOrCreate({ name: merchant.name }, merchant).exec((e, m) => {
      if(e) console.log(e);
      sails.log.info('Found or created merchant', m.name);
    });

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

    // add merchant row with transaction.merchant, transaction.type, category
    // if one doesn't already exist
    const merchantObj = {
      name: merchant,
      defaultCategory: category,
    };
    Merchant.findOrCreate({ name: merchantObj.name }, merchantObj).exec((e, m) => {
      if(e) console.log(e);
      sails.log.info('Found or created merchant', m.name);
    });

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
