/**
* Transaction.js
*/

module.exports = {

  adapter: 'localDiskDb',

  attributes: {

    account: {
      type: 'string',
      defaultsTo: null,
    },

    type: {
      type: 'string',
      defaultsTo: null,
    },

    card: {
      type: 'string',
      defaultsTo: null,
    },

  	direction: {
  		type: 'string',
  		enum: ['D', 'C', 'M'],
  		defaultsTo: 'D',
  	},

    amount: {
      type: 'float',
    },

    merchant: {
  		type: 'string',
      defaultsTo: null,
  	},

  	date: {
  		type: 'date',
  	},

  	details: {
  		type: 'string',
      defaultsTo: null,
  	},

    category: {
      type: 'string',
      defaultsTo: null,
    },

    deleted: {
      type: 'boolean',
      defaultsTo: false,
    },

  },
};
