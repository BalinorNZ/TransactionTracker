import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
//import { BrowserRouter, Match, Miss, Link } from 'react-router'
import 'index.less';
import { Transactions } from 'transactions';
import { Vendors } from 'vendors';
import { Categories } from 'categories';
import { Details } from 'details';
import { Tabs } from 'tabs';
window.Perf = require('react-addons-perf')

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      transactions: [],
      vendors: [],
      categories: [],
      income: true,
      expenses: true,
      startDate: moment('20130101', 'YYYYMMDD'),
      endDate: moment(),
      transactionSort: 'id',
      transactionOrder: 'asc',
      vendorSort: 'vendor',
      vendorOrder: 'asc',
      categorySort: 'category',
      categoryOrder: 'asc',
    };
  }
  deleteTransaction(e){
    let transactions = this.state.transactions;
    transactions[e.target.id-1].deleted = true;
    fetch('/transactions/delete?id=' + e.target.id, {method: 'DELETE'})
      .then(res => res.json())
      .then(() => this.setState({transactions}))
      .then(this.forceUpdate());
  }
  restoreTransaction(e){
    let transactions = this.state.transactions;
    transactions[e.target.id-1].deleted = false;
    fetch('/transactions/restore?id=' + e.target.id, {method: 'POST'})
      .then(res => res.json())
      .then(() => this.setState({transactions}))
      .then(this.forceUpdate());
  }
  deleteVendor(e){
    let transactions = this.state.transactions;
    _.each(transactions, t => {
      if(t.vendor == e.target.id){
        t.deleted = true;
        fetch('/transactions/delete?id=' + t.id, {method: 'DELETE'})
          .then(res => res.json())
          .then(() => this.setState({transactions}));
      }
    });
    this.forceUpdate();
  }
  changeCategory(vendor, category){
    console.log("vendor:", vendor, 'category:', category);
    let transactions = this.state.transactions;
    _.each(transactions, t => {
      if(t.vendor === vendor){
        t.category = category;
        fetch('/categories/set?transaction='+t.id+'&category='+category, {method: 'POST'})
          .then(res => res.json())
          .then(() => this.setState({transactions}));
      }
    });
    const vendors = this.state.vendors
      .map(v => v.vendor === vendor ? Object.assign(v, { category }) : v);
    this.setState({vendors});
    this.forceUpdate();
  }
  addCategory(e){
    let categories = this.state.categories;
    categories.push({name: e.target.categoryName.value});
    fetch('/categories/add?name=' + e.target.categoryName.value, {method: 'POST'})
      .then(() => this.setState({categories}));
    e.preventDefault();
    this.forceUpdate();
  }
  removeCategory(e){
    let categories = this.state.categories;
    categories.splice(_.indexOf(categories, e.target.id));
    fetch('/categories/delete?name=' + e.target.id, {method: 'DELETE'})
      .then(() => this.setState({categories}));
    this.forceUpdate();
  }

  componentWillMount(){
    fetch('/transactions/get?limit=300')
      .then(res => res.json())
      .then(({ transactions: transactions }) => {
        const transactionGroups = _.groupBy(transactions, (t) => !t.deleted && t.vendor);

        const vendors = _.reduce(transactionGroups, (memo, transactions, vendor) => {
          if (vendor == 'undefined') return memo;
          const total = parseFloat(transactions
            .reduce((total, t) => total + t.amount, 0)
            .toFixed(2));
          return memo.concat([{ vendor, total, count: _.size(transactions), category: transactions[0].category }]);
        }, []);

        return {transactions, vendors};
      })
      .then(({ transactions: transactions, vendors: vendors }) => this.setState({transactions, vendors}));
    fetch('/categories/get')
      .then(res => res.json())
      .then(({ categories: categories }) => this.setState({categories}));
  }

  search(e){
    this.setState({search: e.target.value});
  }
  income(){ this.state.income ? this.setState({income: false}) : this.setState({income: true}) }
  expenses(){ this.state.expenses ? this.setState({expenses: false}) : this.setState({expenses: true}) }
  resetDates(e){
    console.log("reset dates");
    //startDate(getToday(-1)); //endDate(getToday()); //self.filterTable(); //return true;
  }
  updateStartDate(date){
    this.setState({startDate: date});
  }
  updateEndDate(date){
    this.setState({endDate: date});
  }
  transactionSort(e){
    console.log("transaction sort", e.target.innerHTML, this.state.transactionSort, this.state.transactionOrder);
    let order = 'asc';
    if(this.state.transactionSort === e.target.innerHTML.toLowerCase() && this.state.transactionOrder === 'asc')
      order = 'desc';
    this.setState({transactionSort: e.target.innerHTML.toLowerCase(), transactionOrder: order});
  }
  vendorSort(e){
    console.log("vendor sort", e.target.innerHTML, this.state.vendorSort, this.state.vendorOrder);
    let order = 'asc';
    if(this.state.vendorSort === e.target.innerHTML.toLowerCase() && this.state.vendorOrder === 'asc')
      order = 'desc';
    this.setState({vendorSort: e.target.innerHTML.toLowerCase(), vendorOrder: order});
  }
  categorySort(e){
    console.log("category sort", e.target.id, this.state.categorySort, this.state.categoryOrder);
    let order = 'asc';
    if(this.state.categorySort === e.target.id && this.state.categoryOrder === 'asc')
      order = 'desc';
    this.setState({categorySort: e.target.id, categoryOrder: order});
  }

  render(){
    let allTransactions = this.state.transactions;

    // search filter
    if(this.state.search) {
      allTransactions = allTransactions.filter(t => t.vendor.toLowerCase()
        .includes(this.state.search.toLowerCase()));
    }

    // date filter
    allTransactions = _.reject(allTransactions, (t) => {
      if(moment(t.date, 'D MMM YYYY') > this.state.endDate) { return true;}
      if(moment(t.date, 'D MMM YYYY') < this.state.startDate) { return true; }
      return false;
    });

    // filter income/expenses
    if(!this.state.income) allTransactions = allTransactions.filter(t => t.amount < 0);
    if(!this.state.expenses) allTransactions = allTransactions.filter(t => t.amount > 0);

    // transaction sort
    if(this.state.transactionSort === 'date')
      allTransactions = _.sortBy(allTransactions, (t) => new Date(t[this.state.transactionSort]));
    else
      allTransactions = _.sortBy(allTransactions, (t) => t[this.state.transactionSort]);
    if(this.state.transactionOrder === 'desc') allTransactions = allTransactions.reverse();

    // filter out deleted
    let transactions = allTransactions.filter(t => !t.deleted);

    // sort vendors
    let vendors = _.sortBy(this.state.vendors, (v) => v[this.state.vendorSort]);
    if(this.state.vendorOrder === 'desc') vendors = vendors.reverse();

    // build categories list
    let categories = [];
    _.each(this.state.categories, c => {
      let vendorCount = vendors.reduce((total, v) => v.category === c.name ? total+1 : total, 0);
      c.vendorCount = vendorCount;
      let transactionCount = transactions.reduce((total, t) => t.category === c.name ? total+1 : total, 0);
      c.transactionCount = transactionCount;
      let categoryTotal = transactions.reduce((total, t) => t.category === c.name ? total + t.amount : total, 0);
      c.categoryTotal = +categoryTotal.toFixed(2);
      categories.push(c);
    });

    // sort categories
    categories = _.sortBy(categories, (c) => c[this.state.categorySort]);
    if(this.state.categoryOrder === 'desc') categories = categories.reverse();

    //<button type="button" onClick={this.resetDates.bind(this)}>Reset</button>
    return (
      <div>

        <h2>Transaction Tracker</h2>

        <div className="datePicker">
        <span>Start date: </span><DatePicker dateFormat="YYYY/MM/DD"
                                             selected={this.state.startDate}
                                             onChange={this.updateStartDate.bind(this)} />
        <br/>
        <span>End date: </span><DatePicker dateFormat="YYYY/MM/DD"
                                             selected={this.state.endDate}
                                             onChange={this.updateEndDate.bind(this)} />
        </div>

        <Details transactions={allTransactions} />

        <div className="filter-container">
          <div className="vendor-search">Search {transactions.length} transactions by vendor: <input type="text" onChange={this.search.bind(this)} /></div>
          <div className="type-filter">
            <label>
              <input type="checkbox"
                     checked={this.state.income}
                     onChange={this.income.bind(this)} />
              Income
            </label>
            <label>
              <input type="checkbox"
                     checked={this.state.expenses}
                     onChange={this.expenses.bind(this)}/>
              Expenses
            </label>
          </div>
        </div>

        <Tabs selected={0}>
          <div label="Transactions">
            <Transactions transactions={transactions}
                          delRestTransaction={this.deleteTransaction.bind(this)}
                          sort={this.transactionSort.bind(this)} />
          </div>
          <div label="Deleted">
            <Transactions transactions={allTransactions.filter(t => t.deleted)}
                          delRestTransaction={this.restoreTransaction.bind(this)}
                          sort={this.transactionSort.bind(this)} />
          </div>
          <div label="Vendors">
            <Vendors vendors={vendors}
                     deleteVendor={this.deleteVendor.bind(this)}
                     categories={this.state.categories}
                     changeCategory={this.changeCategory.bind(this)}
                     sort={this.vendorSort.bind(this)} />
          </div>
          <div label="Categories">
            <Categories categories={categories}
                        vendors={vendors}
                        transactions={transactions}
                        addCategory={this.addCategory.bind(this)}
                        removeCategory={this.removeCategory.bind(this)}
                        sort={this.categorySort.bind(this)} />
          </div>
        </Tabs>

      </div>
    )
  }
}

render(<App />, document.getElementById('main'));
