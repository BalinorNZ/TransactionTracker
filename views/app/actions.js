/*
 deleteTransaction
 restoreTransaction
 deleteVendor
 changeCategory
 addCategory
 removeCategory
 income
 expenses
 resetDates
 updateStartDate
 updateEndDate
 transactionSort
 vendorSort
 categorySort
 datefilter
 income/expense filter
 */

//export const LOAD_VENDORS = 'LOAD_VENDORS';
//export const loadVendors = (res) => ({ type: LOAD_VENDORS, transactions: res.transactions });

export const REQUEST_TRANSACTIONS = 'REQUEST_TRANSACTIONS';
export const requestTransactions = () => ({ type: REQUEST_TRANSACTIONS });

export const RECEIVE_TRANSACTIONS = 'RECEIVE_TRANSACTIONS';
export const receiveTransactions = (res) => ({
  type: RECEIVE_TRANSACTIONS, transactions: res.transactions, receivedAt: Date.now()
});

export const fetchTransactions = () => {
  return (dispatch) => {
    dispatch(requestTransactions());
    return fetch('/transactions/get?limit=300')
            .then(res => res.json())
            .then(res => dispatch(receiveTransactions(res)));
  }
}

export const REQUEST_CATEGORIES = 'REQUEST_CATEGORIES';
export const requestCategories = () => ({ type: REQUEST_CATEGORIES });

export const RECEIVE_CATEGORIES = 'RECEIVE_CATEGORIES';
export const receiveCategories = (res) => ({
  type: RECEIVE_CATEGORIES, categories: res.categories, receivedAt: Date.now()
});

export const fetchCategories = () => {
  return (dispatch) => {
    dispatch(requestCategories());
    return fetch('/categories/get')
      .then(res => res.json())
      .then(res => dispatch(receiveCategories(res)));
  }
}

export const SEARCH = 'SEARCH';
export const search = (term) => ({ type: SEARCH, search: term });

export const TOGGLE_INCOME_FILTER = 'TOGGLE_INCOME_FILTER';
export const toggleIncomeFilter = () => ({ type: TOGGLE_INCOME_FILTER });

export const TOGGLE_EXPENSES_FILTER = 'TOGGLE_EXPENSES_FILTER';
export const toggleExpensesFilter = () => ({ type: TOGGLE_EXPENSES_FILTER });

//export const INVALIDATE_VIEW = 'INVALIDATE_VIEW';
//export const invalidateView = (view) => ({ type: INVALIDATE_VIEW, view});

// REDUX STATE PLAN:
// {
//   selectedTab: 'transactions',
//   entities: {
//     transactions: {
//       0: {...}
//     },
//     vendors: {
//       0: {...}
//     },
//   }
//   transactionList: {
//     isFetching: true,
//     didInvalidate: false,
//     transactions: [0, 42],
//     lastUpdated: 1439478405547,
//   },
//   deletedList: {
//     isFetching: true,
//     didInvalidate: false,
//     transactions: [0, 42],
//     lastUpdated: 1439478405547,
//   }
// }
