module.exports = {

  adapter: 'localDiskDb',

  attributes: {

  	name: {
  		type: 'string',
  	},

    deleted: {
      type: 'boolean',
      defaultsTo: false,
    },

  },
};
