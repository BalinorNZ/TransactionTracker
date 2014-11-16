function myViewmodel() {
	var self = this;

	self.title = 'Transactions';
	self.transactions = ko.observable();

	// get transactions list
	io.socket.get('/transactions/get', function(data, res){
		console.log(data);
		self.transactions(data.transactions);
		//self.transactions();
	});
};

ko.applyBindings(new myViewmodel());