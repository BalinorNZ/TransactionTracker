import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import moment from 'moment';
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
  DELETE_MERCHANT,
  TRANSACTION_SORT,
  MERCHANT_SORT,
  CATEGORY_SORT,
  UPDATE_START_DATE,
  UPDATE_END_DATE,
  IMPORT_CSV,
} from 'actions';


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


const defaultDateFilter = {
  startDate: moment('20170101', 'YYYYMMDD'),
  endDate: moment(),
}
const dateFilter = (state = defaultDateFilter, action) => {
  switch(action.type){
    //case RESET_DATES:
    //  return Object.assign({}, state, { startDate: getToday(-1), endDate: getToday() });
    case UPDATE_START_DATE:
      return Object.assign({}, state, { startDate: action.date });
    case UPDATE_END_DATE:
      return Object.assign({}, state, { endDate: action.date });
    default:
      return state;
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
      return state.merchant === action.merchant ? {...state, category: action.category } : state;
    case DELETE_MERCHANT:
      return state.merchant === action.merchant ? {...state, deleted: true } : state;
    default:
      return state;
  }
}

const transactions = (state = [], action) => {
  switch (action.type) {
    case RECEIVE_TRANSACTIONS:
      return action.transactions;
    case IMPORT_CSV:
      return [...state, ...action.transactions];
    case DELETE_TRANSACTION:
    case RESTORE_TRANSACTION:
    case CHANGE_CATEGORY:
    case DELETE_MERCHANT:
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

const search = (state = '', action) => {
  switch (action.type) {
    case SEARCH:
      return action.search;
    default:
      return state;
  }
};

const defaultSort = {
  transactions: { field: 'date', order: 'ASC' },
  deleted: { field: 'date', order: 'ASC' },
  merchants:  { field: 'merchant', order: 'ASC' },
  categories:  { field: 'name', order: 'ASC' },
}
const sort = (state = defaultSort, action) => {
  let order = 'ASC', field = action.field, type = 'transactions';
  switch(action.type) {
    case TRANSACTION_SORT:
      type = 'transactions';
      break;
    case MERCHANT_SORT:
      type = 'merchants';
      break;
    case CATEGORY_SORT:
      type = 'categories';
      break;
    default:
      return state;
  }
  if(state[type].field === field && state[type].order === 'ASC') order = 'DESC';
  return Object.assign({}, state, { [type]: { field, order }});
};

const importTransactions = (state = [], action) => {
  switch(action.type) {
    case IMPORT_CSV:
      return action.transactions ? action.transactions : [];
    default:
      return state;
  }
};


const rootReducer = combineReducers({
  transactions,
  isFetchingTransactions,
  categories,
  isFetchingCategories,
  search,
  sort,
  incomeFilter,
  expensesFilter,
  dateFilter,
  importTransactions,
});
export default rootReducer;


/*
 * SELECTORS
*/

const getTransactions = (state, props) => state.transactions;
const getCategoryNames = (state, props) => state.categories;
const getSearch = (state, props) => state.search;
const getIncomeFilter = state => state.incomeFilter;
const getExpensesFilter = state => state.expensesFilter;
const getDateFilter = state => state.dateFilter;
export const getIsFetchingTransactions = (state) => state.isFetchingTransactions;
export const getIsFetchingCategories = (state) => state.isFetchingCategories;

const getFilterProp = (state, props) => props.filter;
export const getVisibleTransactions = createSelector(
  [ getTransactions, getDateFilter, getSearch, getIncomeFilter, getExpensesFilter, getFilterProp ],
  (transactions, dateFilter, search, income, expenses, filterProp) => {
    return _.reject(transactions, (t) => {
      if(new Date(t.date) > dateFilter.endDate) return true;
      if(new Date(t.date) < dateFilter.startDate) return true;
      return false;
    }).filter(t => filterProp === 'DELETED' ? t.deleted : !t.deleted)
      .filter(t => income ? true : t.amount < 0)
      .filter(t => expenses ? true : t.amount > 0)
      .map(t => t.merchant ? t : Object.assign({}, t, { merchant: 'N/A' }))
      .filter(t => t.merchant && t.merchant.toLowerCase().indexOf(search.toLowerCase()) > -1);
      //allTransactions.filter(t => t.merchant.toLowerCase().includes(this.state.search.toLowerCase()));
  },
);

export const getVisibleTransactionCount = createSelector(
  [ getVisibleTransactions ],
  (transactions) => transactions.length,
);

export const getMerchants = createSelector(
  [ getVisibleTransactions ],
  (transactions) => {
    const transactionGroups = _.groupBy(transactions, (t) => !t.deleted && t.merchant);
    const merchants = _.reduce(transactionGroups, (memo, transactions, merchant) => {
      if (merchant == 'undefined') return memo;
      const transactionList = transactions.map(t => ({ date: t.date.substr(0, 9), details: t.details, amount: t.amount }));

      // get the mose common type for transactions with this merchant to display as merchant's type
      const allTypes = transactions
        .reduce((types, t) => {
          if(t.type && t.type.length > 0) {
            t.type in types ? types[t.type]++ : types[t.type] = 1;
            return types;
          } else {
            return {};
          }
        }, {});
      const types = Object.keys(allTypes);
      const type = types.length > 0 ? types.reduce((a, b) => allTypes[a] > allTypes[b] ? a : b) : '';

      const total = parseFloat(transactions
        .reduce((total, t) => total + t.amount, 0)
        .toFixed(2));
      //
      // TODO: use merchant.defaultCategory from merchant table instead of transactions[0].category
      //
      return memo.concat([{ merchant, type, total, count: _.size(transactions), category: transactions[0].category, transactionList }]);
    }, []);
    return merchants;
  }
);

export const getCategories = createSelector(
  [ getCategoryNames, getVisibleTransactions, getMerchants ],
  (categoryNames, transactions, merchants) => categoryNames.map(c => ({
    id: c.id,
    name: c.name,
    merchantCount: merchants.reduce((total, m) => m.category === c.name ? total+1 : total, 0),
    transactionCount: transactions.reduce((total, t) => t.category === c.name ? total+1 : total, 0),
    categoryTotal: +(transactions.reduce((total, t) => t.category === c.name ? total+t.amount : total, 0).toFixed(2)),
  }))
);
