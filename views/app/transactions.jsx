import React from 'react';
//import { compose } from 'redux';
import { connect } from 'react-redux';

class TransactionView extends React.Component {
  constructor(){
    super();
    this.state = {};
  }
  render(){
    let transactions = this.props.transactions
      .map(t => {
        var date = new Date(t.date);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return Object.assign(t, {date: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`});
      });
    return (
      <TransactionTable transactions={transactions}
                        delRestTransaction={this.props.delRestTransaction}
                        sort={this.props.sort} />
    );
  }
}
const mapStateToProps = (state) => ({
  transactions: state.transactions.transactions,
  categories: state.categories.categories,
  vendors: state.vendors.vendors
});
//const mapDispatchToProps = (dispatch) => ({ onTodoClick(id){ dispatch(toggleTodo(id)) }, });
export const Transactions = connect(mapStateToProps)(TransactionView);

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

const TransactionRow = (props) => {
  return (
    <tr>
      <td>{props.transaction.id}</td>
      <td>{props.transaction.transactor}</td>
      <td>{props.transaction.amount}</td>
      <td>{props.transaction.vendor}</td>
      <td>{props.transaction.date}</td>
      <td>{props.transaction.category}</td>
      <td>
        <span className="button" id={props.transaction.id} onClick={props.delRestTransaction.bind(this)}>
          {props.transaction.deleted ? 'restore' : 'delete'}
        </span>
      </td>
    </tr>
  );
};
