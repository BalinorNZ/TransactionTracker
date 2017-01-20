import React from 'react';
import { connect } from 'react-redux';
import { toggleIncomeFilter, toggleExpensesFilter } from 'actions';

const IncomeExpenditureFilterBox = (props) => (
  <div className="type-filter">
    <label>
      <input type="checkbox"
             checked={props.income}
             onChange={() => props.toggleIncomeFilter()} />
      Income
    </label>
    <label>
      <input type="checkbox"
             checked={props.expenses}
             onChange={() => props.toggleExpensesFilter()}/>
      Expenses
    </label>
  </div>
);

const mapStateToProps = (state, props) => ({
  income: state.incomeFilter,
  expenses: state.expensesFilter,
});
const mapDispatchToProps = (dispatch, ownProps) => ({
  toggleIncomeFilter: () => dispatch(toggleIncomeFilter()),
  toggleExpensesFilter: () => dispatch(toggleExpensesFilter()),
});
export const IncomeExpenditureFilter = connect(mapStateToProps, mapDispatchToProps)(IncomeExpenditureFilterBox);
