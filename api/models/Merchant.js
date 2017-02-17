module.exports = {

  adapter: 'localDiskDb',

  attributes: {

    name: {
      type: 'string',
    },

    defaultType: {
      type: 'string',
      defaultsTo: null,
    },

    defaultCategory: {
      type: 'string',
      defaultsTo: null,
    },

  },
};
