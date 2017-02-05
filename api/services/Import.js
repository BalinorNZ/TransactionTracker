/*
  Current behaviour:
    read combo.CSV from path
    format each row and push into transactions array
      format:
      set up 'transactor'
      set amount to positive or negative based on 'C' or 'D'
      parse dates
      do some crazy myData thing that I don't understand
    on end, loop over transactions array
    try to match with existing transaction by merchant, amount and date
    if not found, Transaction.create(row)
 */
module.exports.importTransactions = (transactions) => {
  // Detect categories automatically
  // Detect transfers between accounts
  return transactions;
};

module.exports.formatTransactions = (rows) => {
  //
  // TODO: deal with missing fields (empty Card field etc)
  // 4988-****-****-2726,D,8.06,Code 42 Software 6123334242 Au ,16/08/2015,20/08/2015,(AUD 7.00 @ 0.8895),(Incl Currency Conversion Charge - $0.19)
  // 4988-****-****-2726,C,38.01,Www.Aliexpress.Com     London        Gb ,01/01/2016,22/02/2016,(USD 26.00 @ 0.6670),(Incl Currency Conversion Charge - $0.97)
  // 4988-****-****-2726,D,65.17,Amazon Mktplace Pmts   Amzn.Com/Bill Wa ,05/08/2016,08/08/2016,(USD 45.27 @ 0.7119),(Incl Currency Conversion Charge - $1.58)
  // 4988-****-****-2726,D,104.17,Ali*Aliexpress.Com     Hangzhou      Cn ,27/12/2016,30/12/2016,(USD 69.99 @ 0.6887),(Incl Currency Conversion Charge - $2.54)
  //
  const creditFormat = [Card,Type,Amount,Details,TransactionDate,ProcessedDate];
  // 4988-****-****-2734,D,43.95,Lamington,15/01/2015,15/01/2015,,
  // 4988-****-****-2718,C,1979.24,Direct Debit Payment - Thank You ,11/05/2015,11/05/2015,

  const onlineFormat = [Type,Details,Particulars,Code,Reference,Amount,Date];
  // Transfer,01-0902-0104810-00,Debit,Transfer,081445,-1904.56,21/12/2016,,
  // Credit Interest Paid,,,,,0.04,31/01/2017,,
  // Withholding Tax,,,,,-0.01,31/01/2017,,
  // Direct Credit,Adinstruments,,,,1904.56,27/01/2017,,
  // Payment,Nic Westpac,,,,-200.00,09/01/2017,,
  // Debit Transfer,01-0902-0104810-00,Debit,Transfer,213232,-4283.07,13/05/2015,

  const flexiFormat = [Type,Details,Particulars,Code,Reference,Amount,Date];
  // Direct Debit,Onepath Insurance,Anz Life Ins,737178-001,Db3101,-17.90,31/01/2017,,
  // Eft-Pos,Musselburgh Takeaway,4988********,2726   C,030811,-24.00,15/05/2015,
  // Credit Transfer,01-0902-0104810-46,Credit,Transfer,213232,4283.07,13/05/2015,
  // Direct Debit,Anz Cashback Visa,,,00492718,-1979.24,12/05/2015,
  // Automatic Payment,Little Wonders,Elijahbathga,,Eb130,-112.50,11/05/2015,
  // Loan Payment,To: 88114417-1001,,,      004600,-350.00,11/05/2015,
  // Salary,Little Wonders St Ki,Wages,,000000000000,1145.23,05/05/2015,
  // Bank Fee,Monthly A/C Fee,,,,-12.50,30/04/2015,
  // Debit Interest,,,,,-209.60,30/04/2015,
  // Payment,Venturers,Firewood,Firewood,Firewood,-200.00,09/04/2015,

  const fixedFormat = [Date,Details,Amount,PrincipalBalance];
  // 01/01/2017,Loan Interest,-152.67,144368.92
  // 26/12/2016,Loan Payment,350.00,144216.25
  // 23/12/2014,Rate Change - New Rate 5.75% p.a.,,,
  // 23/12/2013,Loan Drawdown,-158096.82,158096.82,

  // detect column headings or ask user to define columns on client?
  // return standard transactions object (mapping?)
  return rows; // return processed rows
};

const transactionMap = {
  //id: { reqName: '', type: 'number', nullable: false },
  direction: { reqName: 'Type', type: 'string', nullable: false, default: 'D' },
  Merchant: { reqName: 'Details', type: 'string', nullable: false, default: '' },
  amount: { reqName: 'Amount', type: 'float', nullable: false, default: 0 },
  transactor: { reqName: 'Card', type: 'string', nullable: false, default: 'Direct' },
  date: { reqName: 'TransactionDate', type: 'datetime', nullable: false, default: new Date() },
  date1: { reqName: 'ProcessedDate', type: 'datetime', nullable: false, default: new Date() },
  category: { reqName: '', type: 'string', nullable: true, default: null },
  deleted: { reqName: '', type: 'boolean', nullable: false, default: false },
  createdAt: { reqName: '', type: 'datetime', nullable: true },
  updatedAt: { reqName: '', type: 'datetime', nullable: true },
}

module.exports.processCSV = (filepath) => {
  return new Promise((resolve, reject) => {
    const csv = require('fast-csv');
    let rows = [];
    csv.fromPath(filepath)
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('data-invalid', (err) => reject(err));
  })
};

// const co = require('co');
// const getCSVRows = co(function *(filepath){
//   const rows = yield fromPathAsync(filepath);
//   console.log("rows", rows);
//   return rows;
// });



module.exports.import = function(filename, cb){

  //var fs = require('fs');
  const csv = require("fast-csv");
  var transactions = [];
  csv.fromPath("transactions/combo.CSV").on("data", function(data){
    var row = formatTransaction(data);
    transactions.push(row);
  }).on("end", function(){

    _.each(transactions, function(row, key) {
      var match = { merchant: row.merchant,
                    amount: row.amount,
                    date: new Date(row.date).toISOString()
                  };
      Transaction.findOne(match, function(err, transaction){
        if(err) return cb(err);

        if(transaction != undefined) {
          sails.log.info("Transaction already exists.");
          return;
        } else {
          // create db record
          console.log('Saving transaction: '+row.merchant+' '+row.amount);
          Transaction.create(row).exec(function(err){
            if(err) console.log(err);
          });

        }
      });
    });
    sails.log.info('Import complete, unlocking the DB.');
    sails.config.globals.DB_LOCK = false;

  });

};

function myIndexOf(arr, o) {
    for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i].merchant != 'undefined' && arr[i].merchant == o) {
            return i;
        }
    }
    return -1;
}

function formatTransaction(data) {
  var myData = [];

  var transactor = 'n/a';
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

  var ind = myIndexOf(myData, data[3]);
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
    var myDatapoint = { merchant: data[3],
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

  return dataObj;
}


function getDate(dateStr, delimiter) {
  delimiter = typeof delimiter !== 'undefined' ? delimiter : '/';

  var dateArray = dateStr.split(delimiter);
  dateArray[0] = dateArray.splice(1, 1, dateArray[0])[0];

  return dateArray.join('/');
}
