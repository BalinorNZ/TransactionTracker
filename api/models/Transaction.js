/**
* Transaction.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  adapter: 'localDiskDb',

  attributes: {

  	direction: {
  		type: 'string',
  		enum: ['D', 'C', 'M'],
  		defaultsTo: 'D',
  	},

  	vendor: {
  		type: 'string',
  	},

  	amount: {
  		type: 'float',
  	},

  	transactor: {
  		type: 'string',
  		enum: ['Nic', 'Katie', 'Direct'],
  		defaultsTo: 'Direct',
  	},

  	date: {
  		type: 'date',
  	},

  	date1: {
  		type: 'date',
  	},

    category: {
      type: 'string',
    },

    deleted: {
      type: 'boolean',
      defaultsTo: false,
    },

  },
};
