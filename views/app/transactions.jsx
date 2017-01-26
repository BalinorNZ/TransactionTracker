import React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { getVisibleTransactions, getVendors } from 'reducers';
import { deleteTransaction, restoreTransaction } from 'actions';


class Transactions extends React.Component {
  constructor(){
    super();
    this.state = {};
  }
  shouldComponentUpdate(newProps) {
    return this.props.transactions !== newProps.transactions;
  }
  render(){
    if(this.props.isFetching) return(<div>Loading...</div>);
    let transactions = this.props.transactions
      .map(t => {
        var date = new Date(t.date);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return Object.assign(t, {date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`});
      });
    let delRestTransaction = this.props.filter === 'ACTIVE'
      && this.props.deleteTransaction
      || this.props.restoreTransaction;
    return (
      <TransactionTable transactions={transactions}
                        delRestTransaction={delRestTransaction}
                        sort={this.props.sort} />
    );
  }
}
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: getVisibleTransactions(state, props),
  vendors: getVendors(state, props),
});
const mapDispatchToProps = (dispatch) => ({
  deleteTransaction: (id) => dispatch(deleteTransaction(id)),
  restoreTransaction: (id) => dispatch(restoreTransaction(id)),
});
Transactions = connect(mapStateToProps, mapDispatchToProps)(Transactions);

export default Transactions;


const TransactionTable = (props) => (
  <table className="Transactions">
    <thead>
    <tr>
      <th onClick={props.sort.bind(this)}>Id</th>
      <th onClick={props.sort.bind(this)}>Transactor</th>
      <th onClick={props.sort.bind(this)}>Amount</th>
      <th onClick={props.sort.bind(this)}>Vendor</th>
      <th onClick={props.sort.bind(this)}>Date</th>
      <th onClick={props.sort.bind(this)}>Category</th>
      <th>Deleted</th>
    </tr>
    </thead>
    <tbody>
    {props.transactions.map(t => <TransactionRow key={t.id}
                                                 transaction={t}
                                                 delRestTransaction={props.delRestTransaction} />)}
    </tbody>
  </table>
);

const TransactionRow = (props) => (
  <tr>
    <td>{props.transaction.id}</td>
    <td>{props.transaction.transactor}</td>
    <td>{props.transaction.amount}</td>
    <td>{props.transaction.vendor}</td>
    <td>{props.transaction.date}</td>
    <td>{props.transaction.category}</td>
    <td>
      <span className="button" id={props.transaction.id} onClick={() => props.delRestTransaction(props.transaction.id)}>
        {props.transaction.deleted ? 'restore' : 'delete'}
      </span>
    </td>
  </tr>
);

