import React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { getVisibleTransactions } from 'reducers';
import { deleteTransaction, restoreTransaction, sortTransactions } from 'actions';


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

    // transaction sort
    let transactions = this.props.transactions;
    const { field, order } = this.props.sort;
    if(field === 'date') transactions = _.sortBy(transactions, (t) => new Date(t[field]));
    else transactions = _.sortBy(transactions, (t) => t[field]);
    if(order === 'DESC') transactions = transactions.reverse();

    let fields = ['id', 'card', 'amount', 'merchant', 'date', 'category'];
    let delRestTransaction = this.props.filter === 'ACTIVE'
      && this.props.deleteTransaction
      || this.props.restoreTransaction;
    return (
      <TransactionTable transactions={transactions}
                        delRestTransaction={delRestTransaction}
                        fields={fields}
                        sortTransactions={this.props.sortTransactions} />
    );
  }
}
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: state.isFetchingTransactions ? [] : getVisibleTransactions(state, props),
  sort: state.sort.transactions,
});
const mapDispatchToProps = (dispatch) => ({
  deleteTransaction: (id) => dispatch(deleteTransaction(id)),
  restoreTransaction: (id) => dispatch(restoreTransaction(id)),
  sortTransactions: (field) => dispatch(sortTransactions(field)),
});
Transactions = connect(mapStateToProps, mapDispatchToProps)(Transactions);

export default Transactions;


const TransactionTable = (props) => (
  <table className="Transactions">
    <thead>
    <tr>
      {props.fields.map(field =>
        <TransactionTableHeader key={field} sortTransactions={props.sortTransactions} field={field} />
      )}
      <th>Deleted</th>
    </tr>
    </thead>
    <tbody>
    {props.transactions.map(t =>
      <TransactionRow key={t.id} transaction={t} delRestTransaction={props.delRestTransaction} />
    )}
    </tbody>
  </table>
);

const TransactionTableHeader = (props) => (
  <th onClick={() => props.sortTransactions(props.field)}>{props.field}</th>
);

const TransactionRow = (props) => {
  /* TODO: try using shouldComponentUpdate here */
  const date = new Date(props.transaction.date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  return (
  <tr>
    <td>{props.transaction.id}</td>
    <td>{props.transaction.card ? props.transaction.card.substr(-4, 4) : ''}</td>
    <td>{props.transaction.amount}</td>
    <td>{props.transaction.merchant}</td>
    <td>{formattedDate}</td>
    <td>{props.transaction.category}</td>
    <td>
      <span className="button" id={props.transaction.id} onClick={() => props.delRestTransaction(props.transaction.id)}>
        {props.transaction.deleted ? 'restore' : 'delete'}
      </span>
    </td>
  </tr>
  )
};
