//function *(filepath){
//   const rows = yield fromPathAsync(filepath);
//   console.log("rows", rows);
//   return rows;
// });

module.exports.receiveUpload = (req) => {
  return new Promise((resolve, reject) => {
    req.file('file').upload((err, files) => {
      if(err) return reject(err);
      if(files.length === 0) return reject('No files were sent!');
      resolve(files);
    });
  });
};

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

module.exports.findTransactionAsync = (query) => {
  return new Promise((resolve, reject) => {
    Transaction.find(query, (e, dbTransactions) => {
      if(e) return reject(e);
      resolve(dbTransactions);
    });
  });
};

module.exports.createTransactionAsync = (transactions) => {
  return new Promise((resolve, reject) => {
    Transaction.create(transactions).exec((e, newTransactions) => {
      if(e) return reject(e);
      resolve(newTransactions);
    });
  });
};

// detect column headings or ask user to define columns on client?
module.exports.formatTransactions = (rows) => {
  // New transaction schema:
  // account, type, card, direction, amount, merchant, date, details (particulars/code/reference), category, deleted
  // TODO: use column headers along with regex to recognise account and format of row
  // TODO: manually add column headers to old CSV files
  const transactions = rows.filter(row => !checkIfHeaderRow(row) || row.length < 1).map(row => {
    let transaction = {};
    const types = ['Credit Interest Paid', 'Withholding Tax', 'Direct Credit', 'Payment',
                  'Debit Transfer', 'Direct Debit', 'Eft-Pos', 'Credit Transfer', 'Automatic Payment',
                  'Loan Payment', 'Salary', 'Bank Fee', 'Debit Interest', 'Atm Debit', 'Transfer',
                  'Bill Payment', 'Loan Drawdown'];
    switch(true){
      case (((/^\d{4}-\*{4}-\*{4}-\d{4}$/).test(row[0])
            || row[0] === '' && (/[D|C]/).test(row[1]))
            && row.length === 8):
        transaction = {
          account: 'Visa',
          type: row[0] ? '' : row[3],
          card: row[0],
          direction: row[1],
          amount: row[1] === 'D' ? -Math.abs(+row[2]) : +row[2],
          merchant: row[3],
          date: getISODate(row[4]),
          details: null,
          deleted: false,
        };
        break;
      case ((/^\d\d\/\d\d\/\d{4}$/i).test(row[0]) && row.length === 4):
        transaction = {
          account: 'Fixed loan',
          type: row[1],
          card: null,
          direction: Math.sign(+row[2]) < 0 ? 'D' : 'C',
          amount: +row[2],
          merchant: null,
          date: getISODate(row[0]),
          details: null,
          deleted: false,
        };
        break;
      case ((types.indexOf(row[0]) >= 0) && row.length === 9):
        const details = { particulars: row[2], code: row[3], reference: row[4] };
        transaction = {
          account: 'Chequing', // online/flexi loan
          type: row[0],
          card: null,
          direction: Math.sign(+row[5]) < 0 ? 'D' : 'C',
          amount: +row[5],
          merchant: row[1],
          date: getISODate(row[6]),
          details: JSON.stringify(details),
          deleted: false,
        };
        break;
      default:
        console.log("Row didn't match expected formats", row.length, row);
    }
    return transaction;
  });
  console.log("CSV rows:", rows.length, 'Formatted rows:', transactions.length);
  return transactions;
};

const checkIfHeaderRow = row => {
  return (_.isEqual(row, ['Card', 'Type', 'Amount', 'Details', 'TransactionDate', 'ProcessedDate', 'ForeignCurrencyAmount', 'ConversionCharge'])
    || _.isEqual(row, ['Type', 'Details', 'Particulars', 'Code', 'Reference', 'Amount', 'Date', 'ForeignCurrencyAmount', 'ConversionCharge'])
    || _.isEqual(row, ['Date', 'Details', 'Amount', 'PrincipalBalance']));
};

// input format: 03/02/2017, output format: 2017-02-03T12:00:00.000Z
const getISODate = (dateStr, delimiter) => {
  delimiter = typeof delimiter !== 'undefined' ? delimiter : '/';
  const date = dateStr.split(delimiter);
  return `${date[2]}-${date[1]}-${date[0]}T12:00:00.000Z`;
};


// const transactionMap = {
//   //id: { reqName: '', type: 'number', nullable: false },
//   direction: { reqName: 'Type', type: 'string', nullable: false, default: 'D' },
//   Merchant: { reqName: 'Details', type: 'string', nullable: false, default: '' },
//   amount: { reqName: 'Amount', type: 'float', nullable: false, default: 0 },
//   transactor: { reqName: 'Card', type: 'string', nullable: false, default: 'Direct' },
//   date: { reqName: 'TransactionDate', type: 'datetime', nullable: false, default: new Date() },
//   date1: { reqName: 'ProcessedDate', type: 'datetime', nullable: false, default: new Date() },
//   category: { reqName: '', type: 'string', nullable: true, default: null },
//   deleted: { reqName: '', type: 'boolean', nullable: false, default: false },
//   createdAt: { reqName: '', type: 'datetime', nullable: true },
//   updatedAt: { reqName: '', type: 'datetime', nullable: true },
// }

// const co = require('co');
// const getCSVRows = co(function *(filepath){
//   const rows = yield fromPathAsync(filepath);
//   console.log("rows", rows);
//   return rows;
// });


// module.exports.import = function(filename, cb){
//
//   //var fs = require('fs');
//   const csv = require("fast-csv");
//   var transactions = [];
//   csv.fromPath("transactions/combo.CSV").on("data", function(data){
//     var row = formatTransaction(data);
//     transactions.push(row);
//   }).on("end", function(){
//
//     _.each(transactions, function(row, key) {
//       var match = { merchant: row.merchant,
//                     amount: row.amount,
//                     date: new Date(row.date).toISOString()
//                   };
//       Transaction.findOne(match, function(err, transaction){
//         if(err) return cb(err);
//
//         if(transaction != undefined) {
//           sails.log.info("Transaction already exists.");
//           return;
//         } else {
//           // create db record
//           console.log('Saving transaction: '+row.merchant+' '+row.amount);
//           Transaction.create(row).exec(function(err){
//             if(err) console.log(err);
//           });
//
//         }
//       });
//     });
//     sails.log.info('Import complete, unlocking the DB.');
//     sails.config.globals.DB_LOCK = false;
//
//   });
//
// };
//
// function myIndexOf(arr, o) {
//     for (var i = 0; i < arr.length; i++) {
//         if (typeof arr[i].merchant != 'undefined' && arr[i].merchant == o) {
//             return i;
//         }
//     }
//     return -1;
// }
//
// function formatTransaction(data) {
//   var myData = [];
//
//   var transactor = 'n/a';
//   if(data[0] == '4988-****-****-2726'){
//     //nicTotal += parseFloat(data[2]);
//     transactor = 'Nic';
//   } else if (data[0] == '4988-****-****-2734') {
//     //katieTotal += parseFloat(data[2]);
//     transactor = 'Katie';
//   } else if (data[0] == '4988-****-****-2718') {
//     transactor = 'Direct';
//   }
//   myData[0] = transactor;
//
//   var ind = myIndexOf(myData, data[3]);
//   var amount = 0;
//   if(data[1] == 'D'){
//     amount = -Math.abs(parseFloat(data[2]));
//   } else if(data[1] == 'C') {
//     amount = parseFloat(data[2]);
//   }
//   if(ind > -1) {
//     myData[ind].amount += amount;
//     myData[ind].count++;
//   } else {
//     var myDatapoint = { merchant: data[3],
//             amount: amount,
//             count: 1,
//             };
//     myData.push(myDatapoint);
//   }
//
//   var date = new Date(getISODate(data[4]));
//   var date1 = new Date(getISODate(data[5]));
//
//   var dataObj = { transactor: myData[0],
//           direction: data[1],
//           amount: amount,
//           merchant: data[3],
//           date: date,
//           date1: date1, };
//
//   return dataObj;
// }
