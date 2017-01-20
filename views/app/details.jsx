import React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { getVisibleTransactions, getVendors } from 'reducers';


let Details = ({transactions = [], vendors = [], isFetching = true}) => {
    if(isFetching) return (<div>Loading...</div>);
    return(
      <ul className="stuff-list">
        <Count label={'Transactions'} items={transactions} />
        <Count label={'Vendors'} items={vendors} />
        <Add label={'Nic total'} transactions={_.filter(transactions, t => t.transactor == 'Nic')} />
        <Add label={'Katie total'} transactions={_.filter(transactions, t => t.transactor == 'Katie')} />
        <Add label={'Total'} transactions={transactions} />
      </ul>
    );
};
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: getVisibleTransactions(state, props),
  vendors: getVendors(state, props),
});
//const mapDispatchToProps = (dispatch) => ({ onTodoClick(id){ dispatch(toggleTodo(id)) }, });
Details = connect(mapStateToProps)(Details);

export default Details;


const Add = ({label, transactions}) => {
  const total = transactions
    .filter(t => !t.deleted)
    .filter(t => !(t.transactor === undefined))
    .reduce((c, t) => c + t.amount, 0)
    .toFixed(2);
  return (
    <li>{label}: <span>{total}</span></li>
  );
};

const Count = ({label, items}) => {
    return(
      <li>{label}: <span>{items.length}</span></li>
    );
};
