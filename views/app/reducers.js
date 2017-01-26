import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import {
  REQUEST_TRANSACTIONS,
  RECEIVE_TRANSACTIONS,
  REQUEST_CATEGORIES,
  RECEIVE_CATEGORIES,
  SEARCH,
  TOGGLE_INCOME_FILTER,
  TOGGLE_EXPENSES_FILTER,
  ADD_CATEGORY,
  REMOVE_CATEGORY,
  DELETE_TRANSACTION,
  RESTORE_TRANSACTION,
  CHANGE_CATEGORY,
} from 'actions';

// startDate: moment('20130101', 'YYYYMMDD'),
// endDate: moment(),
// transactionSort: 'id',
// transactionOrder: 'asc',
// vendorSort: 'vendor',
// vendorOrder: 'asc',
// categorySort: 'category',
// categoryOrder: 'asc',

const incomeFilter = (state = true, action) => {
  switch(action.type) {
    case TOGGLE_INCOME_FILTER:
      return !state;
    default:
      return state
  }
}
const expensesFilter = (state = true, action) => {
  switch(action.type) {
    case TOGGLE_EXPENSES_FILTER:
      return !state;
    default:
      return state
  }
}

// example of getting all transactions from a transactions hash using an array lookup table
//const getAllTransactions = (state) => state.transactionIds.map(id => state.byId[id]);

const transaction = (state = {}, action) => {
  switch (action.type) {
    case DELETE_TRANSACTION:
    case RESTORE_TRANSACTION:
      return +state.id === +action.id ? {...state, deleted: !state.deleted} : state;
    case CHANGE_CATEGORY:
      return state.vendor === action.vendor ? {...state, category: action.category } : state;
    default:
      return state;
  }
}

const transactions = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_TRANSACTIONS:
      return action.transactions;
    case DELETE_TRANSACTION:
    case RESTORE_TRANSACTION:
    case CHANGE_CATEGORY:
      return state.map(t => transaction(t, action));
    default:
      return state;
  }
};

const isFetchingTransactions = (state = false, action) => {
  switch(action.type) {
    case REQUEST_TRANSACTIONS:
      return true;
    case RECEIVE_TRANSACTIONS:
      return false;
    default:
      return state;
  }
}

const categories = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_CATEGORIES:
      return action.categories;
    case ADD_CATEGORY:
      return [...state, action.category];
    case REMOVE_CATEGORY:
      const index = _.findIndex(state, (c) => c.name === action.category);
      return [...state.slice(0, index), ...state.slice(index + 1)];
    default:
      return state;
  }
};

const isFetchingCategories = (state = false, action) => {
  switch(action.type) {
    case REQUEST_CATEGORIES:
      return true;
    case RECEIVE_CATEGORIES:
      return false;
    default:
      return state;
  }
}

const search = (state = { search: '' }, action) => {
  switch (action.type) {
    case SEARCH:
      return action.search;
    default:
      return '';
  }
};

const rootReducer = combineReducers({
  transactions,
  isFetchingTransactions,
  categories,
  isFetchingCategories,
  search,
  incomeFilter,
  expensesFilter,
});
export default rootReducer;


/*
 * SELECTORS
*/

// these are non-memoized selectors
const getTransactions = (state, props) => state.transactions;
const getCategoryNames = (state, props) => state.categories;
const getSearch = (state, props) => state.search;
const getIncomeFilter = (state) => state.incomeFilter;
const getExpensesFilter = (state) => state.expensesFilter;

export const getIsFetchingTransactions = (state) => state.isFetchingTransactions;
export const getIsFetchingCategories = (state) => state.isFetchingCategories;

const filterTransactionsByDeleted = (state, props) => {
  switch (props.filter) {
    case 'DELETED':
      return state.transactions.filter(t => t.deleted);
    case 'ACTIVE':
    default:
      return state.transactions.filter(t => !t.deleted);
  }
}

// this is a memoized reselect selector
const filterTransactionsBySearch = createSelector(
  [ getSearch, filterTransactionsByDeleted ],
  (search, transactions) => transactions.filter(t => t.vendor.toLowerCase().indexOf(search.toLowerCase()) > -1),
  //allTransactions.filter(t => t.vendor.toLowerCase().includes(this.state.search.toLowerCase()));
);

export const getVisibleTransactions = createSelector(
  [ getIncomeFilter, getExpensesFilter, filterTransactionsBySearch ],
  (income, expenses, transactions) => (
    transactions
      .filter(t => income ? true : t.amount < 0)
      .filter(t => expenses ? true : t.amount > 0)
  ),
);

export const getVendors = createSelector(
  [ getVisibleTransactions ],
  (transactions) => {
    const transactionGroups = _.groupBy(transactions, (t) => !t.deleted && t.vendor);
    const vendors = _.reduce(transactionGroups, (memo, transactions, vendor) => {
      if (vendor == 'undefined') return memo;
      const total = parseFloat(transactions
        .reduce((total, t) => total + t.amount, 0)
        .toFixed(2));
      return memo.concat([{ vendor, total, count: _.size(transactions), category: transactions[0].category }]);
    }, []);
    return vendors;
  }
);

export const getCategories = createSelector(
  [ getCategoryNames, getVisibleTransactions, getVendors ],
  (categoryNames, transactions, vendors) => categoryNames.map(c => ({
    id: c.id,
    name: c.name,
    vendorCount: vendors.reduce((total, v) => v.category === c.name ? total+1 : total, 0),
    transactionCount: transactions.reduce((total, t) => t.category === c.name ? total+1 : total, 0),
    categoryTotal: +(transactions.reduce((total, t) => t.category === c.name ? total+t.amount : total, 0).toFixed(2)),
  }))
);
