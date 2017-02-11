import React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { getVisibleTransactions, getMerchants } from 'reducers';


let Details = ({transactions = [], merchants = [], isFetching = true}) => {
    if(isFetching) return (<div>Loading...</div>);
    return(
      <ul className="stuff-list">
        <Count label={'Transactions'} items={transactions} />
        <Count label={'Merchants'} items={merchants} />
        <Add label={'Nic total'} transactions={_.filter(transactions, t => t.card && t.card.substr(-4, 4) === '2726')} />
        <Add label={'Katie total'} transactions={_.filter(transactions, t => t.card && t.card.substr(-4, 4) === '2734')} />
        <Add label={'Total'} transactions={transactions} />
      </ul>
    );
};
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: state.isFetchingTransactions ? [] : getVisibleTransactions(state, props),
  merchants: state.isFetchingTransactions ? [] : getMerchants(state, props),
});
Details = connect(mapStateToProps)(Details);

export default Details;


const Add = ({label, transactions}) => {
  const total = transactions
    .filter(t => !t.deleted)
    .filter(t => !(t.card === undefined))
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
