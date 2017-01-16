import { combineReducers } from 'redux';
import {
  REQUEST_TRANSACTIONS, RECEIVE_TRANSACTIONS, REQUEST_CATEGORIES, RECEIVE_CATEGORIES
} from 'actions';

// income: true,
// expenses: true,
// startDate: moment('20130101', 'YYYYMMDD'),
// endDate: moment(),
// transactionSort: 'id',
// transactionOrder: 'asc',
// vendorSort: 'vendor',
// vendorOrder: 'asc',
// categorySort: 'category',
// categoryOrder: 'asc',

const transactionsView = (state = { transactions: [], isFetching: false, didInvalidate: false }, action) => {
  switch (action.type) {
    //case INVALIDATE_VIEW:
    //  return Object.assign({}, state, { didInvalidate: true });
    case REQUEST_TRANSACTIONS:
      return Object.assign({}, state, { isFetching: true, didInvalidate: false });
    case RECEIVE_TRANSACTIONS:
    return Object.assign({}, state, {
      isFetching: false,
      didInvalidate: false,
      transactions: action.transactions.filter(t => !t.deleted).map(t => t.id),
      lastUpdated: action.receivedAt
    });
    default:
      return state;
  }
}

const deletedView = (state = { transactions: [], isFetching: false, didInvalidate: false }, action) => {
  switch (action.type) {
    //case INVALIDATE_VIEW:
    //  return Object.assign({}, state, { didInvalidate: true });
    case REQUEST_TRANSACTIONS:
      return Object.assign({}, state, { isFetching: true, didInvalidate: false });
    case RECEIVE_TRANSACTIONS:
      return Object.assign({}, state, {
        isFetching: false,
        didInvalidate: false,
        transactions: action.transactions.filter(t => t.deleted).map(t => t.id),
        lastUpdated: action.receivedAt
      });
    default:
      return state;
  }
}

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

const vendors = (state = { vendors: [] }, action) => {
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

const transactions = (state = { transactions: [] }, action) => {
  switch (action.type) {
    case RECEIVE_TRANSACTIONS:
      return action.transactions;
    default:
      return state;
  }
};

const categories = (state = { categories: [] }, action) => {
  switch (action.type) {
    case RECEIVE_CATEGORIES:
      return action.categories;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  transactions,
  categories,
  vendors,
  transactionsView,
  deletedView,
  vendorView,
  categoryView,
});

export default rootReducer;
