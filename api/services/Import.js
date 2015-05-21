module.exports.import = function(filename, cb){

  var fs = require('fs');
  var csv = require("fast-csv");
  var transactions = [];
  csv.fromPath("combo.CSV").on("data", function(data){
    var row = formatTransaction(data);
    transactions.push(row);

    // first try to match on kuraCloudInstanceId
    Transaction.findOne({vendor: row.vendor, amount: row.amount, date: row.date})
    .exec(function(err, transaction){
      if(err) return cb(err);
      
      if(transaction) {
        sails.log.info("Transaction already exists.");
        return;
      } else {
        // create db record
        console.log('Saving transaction: '+row.vendor+' '+row.amount);
        Transaction.create(transaction).exec(function(err){
          if(err) console.log(err);
        });
      }

    });
  }).on("end", function(){
    sails.log.info("Transactions imported.");
  });

}


function formatTransaction(data) {
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