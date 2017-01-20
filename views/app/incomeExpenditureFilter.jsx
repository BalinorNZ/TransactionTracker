import React from 'react';
import { connect } from 'react-redux';
import { toggleIncomeFilter, toggleExpensesFilter } from 'actions';


let IncomeExpenditureFilter = (props) => (
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
IncomeExpenditureFilter = connect(mapStateToProps, mapDispatchToProps)(IncomeExpenditureFilter);

export default IncomeExpenditureFilter;
