import React from 'react';
import * as _ from 'lodash';

export const Details = ({transactions}) => {
    return(
      <ul className="stuff-list">
        <Count label={'Transactions'} transactions={transactions.filter(t => !t.deleted)} />
        <Count label={'Deleted'} transactions={transactions.filter(t => t.deleted)} />
        <Count label={'Transactions'} transactions={transactions} />
        <Count label={'Vendors'} transactions={_.uniqBy(transactions.filter(t => !t.deleted), 'vendor')} />
        <Add label={'Nic total'} transactions={_.filter(transactions, t => t.transactor == 'Nic')} />
        <Add label={'Katie total'} transactions={_.filter(transactions, t => t.transactor == 'Katie')} />
        <Add label={'Total'} transactions={transactions} />
      </ul>
    );
};

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

const Count = ({label, transactions}) => {
    return(
      <li>{label}: <span>{transactions.length}</span></li>
    );
};
