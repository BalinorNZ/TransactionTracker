import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import {
  REQUEST_TRANSACTIONS, RECEIVE_TRANSACTIONS, REQUEST_CATEGORIES, RECEIVE_CATEGORIES, SEARCH, TOGGLE_INCOME_FILTER, TOGGLE_EXPENSES_FILTER
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

// const transactionsView = (state = { transactions: [], isFetching: false, didInvalidate: false }, action) => {
//   switch (action.type) {
//     //case INVALIDATE_VIEW:
//     //  return Object.assign({}, state, { didInvalidate: true });
//     case REQUEST_TRANSACTIONS:
//       return Object.assign({}, state, { isFetching: true, didInvalidate: false });
//     case RECEIVE_TRANSACTIONS:
//     return Object.assign({}, state, {
//       isFetching: false,
//       didInvalidate: false,
//       transactions: action.transactions.filter(t => !t.deleted).map(t => t.id),
//       lastUpdated: action.receivedAt
//     });
//     default:
//       return state;
//   }
// }

// const deletedView = (state = { transactions: [], isFetching: false, didInvalidate: false }, action) => {
//   switch (action.type) {
//     //case INVALIDATE_VIEW:
//     //  return Object.assign({}, state, { didInvalidate: true });
//     case REQUEST_TRANSACTIONS:
//       return Object.assign({}, state, { isFetching: true, didInvalidate: false });
//     case RECEIVE_TRANSACTIONS:
//       return Object.assign({}, state, {
//         isFetching: false,
//         didInvalidate: false,
//         transactions: action.transactions.filter(t => t.deleted).map(t => t.id),
//         lastUpdated: action.receivedAt
//       });
//     default:
//       return state;
//   }
// }

const vendorView = (state = { vendors: [], isFetching: false, didInvalidate: false }, action) => {
  switch (action.type) {
    //case INVALIDATE_VIEW:
    //  return Object.assign({}, state, { didInvalidate: true });
    case REQUEST_TRANSACTIONS:
      return Object.assign({}, state, { isFetching: true, didInvalidate: false });
    case RECEIVE_TRANSACTIONS:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        vendors: action.vendors ? action.vendors.map(v => v.id) : [],
        lastUpdated: action.receivedAt
      });
    default:
      return state;
  }
}

const categoryView = (state = { categories: [], isFetching: false, didInvalidate: false }, action) => {
  switch (action.type) {
    //case INVALIDATE_VIEW:
    //  return Object.assign({}, state, { didInvalidate: true });
    case REQUEST_CATEGORIES:
      return Object.assign({}, state, { isFetching: true, didInvalidate: false });
    case RECEIVE_CATEGORIES:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        categories: action.categories.map(c => c.id),
        lastUpdated: action.receivedAt
      });
    default:
      return state;
  }
}

const vendors = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_TRANSACTIONS:
      const transactionGroups = _.groupBy(action.transactions, (t) => !t.deleted && t.vendor);
      const vendors = _.reduce(transactionGroups, (memo, transactions, vendor) => {
        if (vendor == 'undefined') return memo;
        const total = parseFloat(transactions
          .reduce((total, t) => total + t.amount, 0)
          .toFixed(2));
        return memo.concat([{ vendor, total, count: _.size(transactions), category: transactions[0].category }]);
      }, []);
      return vendors;
    default:
      return state;
  }
};

// example of getting all transactions from a transactions hash using an array lookup table
//const getAllTransactions = (state) => state.transactionIds.map(id => state.byId[id]);

const transactions = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_TRANSACTIONS:
      return action.transactions;
    default:
      return state;
  }
};

const categories = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_CATEGORIES:
      return action.categories;
    default:
      return state;
  }
};

const search = (state = { search: '' }, action) => {
  switch (action.type) {
    case SEARCH:
      return action.search;
    default:
      return '';
  }
};

/*
 * SELECTORS
*/

// these are non-memoized selectors
const getTransactions = (state, props) => state.transactions;
const getSearch = (state, props) => state.search;
const getIncomeFilter = (state) => state.incomeFilter;
const getExpensesFilter = (state) => state.expensesFilter;

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


const rootReducer = combineReducers({
  transactions,
  isFetchingTransactions,
  categories,
  vendors,
  //transactionsView,
  //deletedView,
  vendorView,
  categoryView,
  search,
  incomeFilter,
  expensesFilter,
});

export default rootReducer;
