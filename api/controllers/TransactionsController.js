/**
 * TransactionsController
 *
 * @description :: Server-side logic for managing transactions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	view: function (req, res) {
		return res.view({item: "test"});
	},
	index: function (req, res) {
		return res.view({item: "test2"});
	},
};

