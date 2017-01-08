/* global _ */
/* global ko */
function myViewmodel() {
	var self = this;

	self.title = 'Transactions Tracker';
	self.transactions = ko.observableArray();
	self.displayTransactions = ko.observableArray();
	self.displayVendors = ko.observableArray();
	self.categories = ko.observableArray();
	self.newCategory = ko.observable();
	self.tables = ['Transactions', 'Deleted', 'Vendors', 'Categories'];
	self.chosenTableId = ko.observable();
	self.showIncome = ko.observable(true);
	self.showExpenses = ko.observable(true);
	var today = new Date('today');
	self.startDate = ko.observable(getToday(-1));
	self.endDate = ko.observable(getToday());
	self.vendorSortProp = ko.observable();
	self.transactionSortProp = ko.observable();

	self.nicTotal = ko.computed(function() {
		return getTotal('Nic');
	}, self);

	self.katieTotal = ko.computed(function() {
		return getTotal('Katie');
	}, self);

	self.transactionsTotal = ko.computed(function() {
		return getTotal();
	}, self);

	self.vendorsCount = ko.computed(function() {
		var grouped = _.groupBy(self.displayTransactions(), function(transaction) {
			if(!transaction.deleted()) return transaction.vendor();
		});
		// 'undefined' is the group of deleted transactions
		delete grouped['undefined'];
		return Object.keys(grouped).length;
	});

	self.transactionsCount = ko.computed(function() {
		var transactionsCount = 0;
		if(typeof self.displayTransactions() != "undefined") {
			transactionsCount = _.countBy(self.displayTransactions(), function(transaction){
				if(!transaction.deleted()) return 'notDeleted';
			});
		}
		return transactionsCount.notDeleted;
	});
	self.deletedCount = ko.computed(function() {
		var deletedCount = 0;
		if(typeof self.displayTransactions() != "undefined") {
			deletedCount = _.countBy(self.displayTransactions(), function(transaction){
				if(transaction.deleted()) return 'deleted';
			});
		}
		return deletedCount.deleted;
	});
	self.bothCount = ko.computed(function() {
		return (self.transactionsCount() + self.deletedCount());
	});

	self.categoryTransactions = function(category) {
		var total = 0;
        _.each(self.displayTransactions(), function(transaction){
        	if(transaction.category() == category){
        		total ++;
        	}
        });
        return total;
	}
	self.categoryVendors = function(category) {
		var total = 0;
        _.each(self.displayVendors(), function(vendor){
        	if(vendor.category() == category){
        		total ++;
        	}
        });
        return total;
	}
	self.categoryTotal = function(category) {
		var total = 0;
        _.each(self.displayTransactions(), function(transaction){
        	if(transaction.category() == category){
        		//console.log(category+' total: '+total+' plus '+transaction.amount());
        		total += transaction.amount();
        	}
        });
        return total.toFixed(2);
	}

	self.deleteTransaction = function(transaction) {
		io.socket.delete('/transactions/delete', ko.mapping.toJS(transaction), function (data, jwres){});
		transaction.deleted(true);
		self.displayVendors(getVendors());
	}

	self.deleteVendor = function(vendor) {
        _.each(self.displayTransactions(), function(transaction){
        	if(transaction.vendor() == vendor.vendor()){
        		io.socket.delete('/transactions/delete', ko.mapping.toJS(transaction), function (data, jwres){});
        		transaction.deleted(true);
        	}
        });
        self.displayVendors(getVendors());
	}

	self.setCategory = function(vendor, event) {
        _.each(self.displayTransactions(), function(transaction){
        	if(transaction.vendor() == vendor.vendor()){
			io.socket.post('/categories/set',
			{ transaction: transaction.id(), category: vendor.category() },
			function (data, jwres){});
        		transaction.category(vendor.category());
        	}
        });
	}

	self.restoreTransaction = function(transaction) {
		io.socket.post('/transactions/restore', ko.mapping.toJS(transaction), function (data, jwres){});
		transaction.deleted(false);
		self.displayVendors(getVendors());
	}

	self.saveCategory = function(){
		// save category
		io.socket.post('/categories/add', { name: self.newCategory() }, function(res){
		});
		self.categories.push(self.newCategory());
		self.newCategory("");
	}

	self.removeCategory = function(category) {
		io.socket.delete('/categories/delete', { name: category }, function (data, jwres){});
		self.categories.remove(category);
	};

	ko.bindingHandlers.formatDate = {
	    update: function(element, valueAccessor) {
	        var rawDate = valueAccessor();
	        $(element).text(formatDate(rawDate));
	    }
	}

	// get categories list
	io.socket.get('/categories/get', function(data, res){
		_.each(data.categories, function(category){
			//if(!category.deleted) self.categories.push(ko.mapping.fromJS(category));
			if(!category.deleted) self.categories.push(category.name);
		});
	});

	// get transactions list
	io.socket.get('/transactions/get?limit=300', function(data, res){
	  // 450ms
		_.each(data.transactions, function(transaction){
			self.transactions.push(ko.mapping.fromJS(transaction));
		});
		//self.transactions(data.transactions);
    // 2500ms
		self.displayTransactions(self.transactions());
		// 800ms
		self.displayVendors(getVendors());
	});

	self.selectTable = function(table) {
		self.chosenTableId(table);
		$(".table").hide();
		$(".table."+table).show();
	};

	// initialize
	self.selectTable('Transactions');

	function getVendors() {
		var grouped = _.groupBy(self.displayTransactions(), function(transaction) {
			if(transaction.deleted() != true) return transaction.vendor();
		});
		var vendors = [];
		_.each(grouped, function(transactions, index, list) {
			if(index == 'undefined') return;
			var total = 0;
			_.each(transactions, function(transaction, index, list) {
				total += transaction.amount();
			});
			var vendor = ko.mapping.fromJS({
				vendor: index,
				count: _.size(transactions),
				total: parseFloat(total.toFixed(2)),
				category: transactions[0].category(),
			});
			vendors.push(vendor);
		});
		return vendors;
	}

	/*
	 *	Date functions
	 */
	function formatDate(rawDate) {
		var date = new Date(rawDate);

		return date.toDateString().substr(4);
	}

	function getDate(dateStr) {
		var year = parseInt(dateStr.substr(6, 9));
		var month = parseInt(dateStr.substr(3, 5))-1;
		var day = parseInt(dateStr.substr(0, 2));
		var date = new Date(year, month, day);
		return date;
	}

	function getToday(years){
		years = typeof years !== 'undefined' ? years : 0;
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; //January is 0!
		var yyyy = today.getFullYear()+years;

		if(dd<10) { dd='0'+dd }

		if(mm<10) { mm='0'+mm }

		today = dd+'/'+mm+'/'+yyyy;
		return today;
	}

	function dateFilter(transactions) {
		console.log('date filtering '+self.startDate()+' - '+self.endDate());

		filtered = _.reject(transactions, function(transaction){
			var date = new Date(transaction.date());
			var startDate = getDate(self.startDate());
			var endDate = getDate(self.endDate());

			if(date > endDate) { return true;}
			if(date < startDate) { return true; }

		    return false;
		});

		return filtered;
	}

	self.resetDates = function() {
		self.startDate(getToday(-1));
		self.endDate(getToday());
		self.filterTable();
		return true;
	}

	/*
	 *	Filtering & Sorting
	 */
	self.filterTable = function(data, event) {
		console.log('filtering table');

		var filtered = self.transactions();

		// filter out income if income not selected
		if(!self.showIncome()){
			filtered = _.reject(filtered, function(transaction){
			    return parseFloat(transaction.amount()) > 0 ? true : false;
			});
		}

		// filter out expenses if expenses not selected
		if(!self.showExpenses()){
			filtered = _.reject(filtered, function(transaction){
			    return parseFloat(transaction.amount()) > 0 ? false : true;
			});
		}

		self.displayTransactions(dateFilter(filtered));
		self.displayVendors(getVendors());

		// return true so the checkbox event isn't cancelled
		return true;
	}

	self.sortVendors = function(data, event) {
		// sort by selected property
		var prop = event.target.innerText.toLowerCase();
		console.log('sorting vendor table by '+prop);
		var sorted = _.sortBy(self.displayVendors(), function(transaction){
			var value = transaction[prop]();
			return value;
		});
		if(self.vendorSortProp() == prop){
			self.displayVendors(sorted.reverse());
		} else {
			self.displayVendors(sorted);
		}
		self.vendorSortProp(prop);
	};

	self.sortTransactions = function(data, event) {
		// sort by selected property
		var prop = event.target.innerText.toLowerCase();
		console.log('sorting table by '+prop);
		if(prop == 'date') {
			var sorted = _.sortBy(self.displayTransactions(), function(transaction){
				var date = new Date(transaction.date());
				return date;
			});
		} else {
			var sorted = _.sortBy(self.displayTransactions(), function(transaction){
				var value = transaction[prop]();
				return value;
			});
		}
		if(self.transactionSortProp() == prop){
			var reverse = dateFilter(sorted);
			self.displayTransactions(reverse.reverse());
		} else {
			self.displayTransactions(dateFilter(sorted));
		}
		self.transactionSortProp(prop);
	};

	self.groupTable = function(data, event) {
		// stub to use underscore _.groupBy later
	}

	function getTotal(transactor){
		var total = 0;
		_.each(self.displayTransactions(), function(transaction) {
			if(transaction.deleted()) return;
			if(transactor === undefined) total += parseFloat(transaction.amount());
			if(transaction.transactor() == transactor) total += parseFloat(transaction.amount());
		});
		return total.toFixed(2);
	}
};

ko.applyBindings(new myViewmodel());
