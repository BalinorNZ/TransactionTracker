function myViewmodel() {
	var self = this;

	self.title = 'Transactions Tracker';
	self.transactions = ko.observable();
	self.displayTransactions = ko.observable();

	self.transactionsTotal = ko.computed(function() {
		var total = 0;
		_.each(self.displayTransactions(), function(transaction) {
			total += parseFloat(transaction.amount);
		});
		return total.toFixed(2);
	}, self);

	self.vendorsCount = ko.computed(function() {
		var grouped = _.groupBy(self.displayTransactions(), function(transaction) {
			return transaction.vendor;
		});
		return Object.keys(grouped).length;
	});

	self.transactionsCount = ko.computed(function() {
		var transactionsCount = 0;
		if(typeof self.displayTransactions() != "undefined") {
			transactionsCount = Object.keys(self.displayTransactions()).length;
		}
		return transactionsCount;
	});

	self.tables = ['Credit', 'Online', 'Flexi', 'Fixed', 'Table2', 'Table3'];
	self.chosenTableId = ko.observable();
	self.showIncome = ko.observable(true);
	self.showExpenses = ko.observable(true);
	var today = new Date('today');
	console.log('today: '+today);
	self.startDate = ko.observable(getToday(-1));
	self.endDate = ko.observable(getToday());

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

	// get transactions list
	//io.socket.get('/transactions/get', function(data, res){
	//	self.transactions(data.transactions);
	//	self.displayTransactions(self.transactions());
	//});

	function getDate(dateStr) {
		var date_a = dateStr.split("/");
		var date = new Date(parseInt(date_a[2]), parseInt(date_a[1])-1, parseInt(date_a[0]));
		return date;
	}

	function dateFilter(transactions) {
		console.log('date filtering '+self.startDate()+' - '+self.endDate());

		filtered = _.reject(transactions, function(transaction){
			var date = getDate(transaction.date);
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

	self.filterTable = function(data, event) {
		console.log('filtering table');

		var filtered = self.transactions();

		// filter out income if income not selected
		if(!self.showIncome()){
			filtered = _.reject(filtered, function(transaction){
			    return parseFloat(transaction.amount) > 0 ? true : false; 
			});
		}

		// filter out expenses if expenses not selected
		if(!self.showExpenses()){
			filtered = _.reject(filtered, function(transaction){
			    return parseFloat(transaction.amount) > 0 ? false : true; 
			});
		}

		self.displayTransactions(dateFilter(filtered));

		// return true so the checkbox event isn't cancelled
		return true;
	}

	self.sortTable = function(data, event) {
		// sort by selected property
		var prop = event.target.innerText.toLowerCase();
		console.log('sorting table by '+prop);
		if(prop == 'date') {
			var sorted = _.sortBy(self.displayTransactions(), function(transaction){
				var date = getDate(transaction.date);
				return date;
			});
		} else {
			var sorted = _.sortBy(self.displayTransactions(), prop);
		}

		self.displayTransactions(dateFilter(sorted));
	};

	self.groupTable = function(data, event) {
		// stub to use underscore _.groupBy later
	}

	self.selectTable = function(table) {
		self.chosenTableId(table);
		console.log(table);
		// get transactions list
		io.socket.get('/transactions/get?tab='+table, function(data, res){
			self.transactions(data.transactions);
			self.displayTransactions(self.transactions());
		});
		$(".table").hide();
		$(".table."+table).show();
	};

	// initialize
	self.selectTable('Credit');
};

ko.applyBindings(new myViewmodel());