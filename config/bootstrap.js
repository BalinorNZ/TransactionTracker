/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  function scanCsv(){
    var fs = require('fs');
    
    fs.watch('./combo.CSV', function(event, filename){
      if(filename === null){
        filename = 'combo.CSV';
      }
      sails.log.info(event, 'detected for file', filename);
      if(event == 'change'){
        Import.import(filename, function(err){
          if(err){
            sails.log.error(err);
          }
        });
      }
    });
  }
  
  scanCsv();

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};