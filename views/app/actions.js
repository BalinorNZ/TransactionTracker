import { getIsFetchingTransactions, getIsFetchingCategories } from 'reducers';
/*
 updateStartDate
 updateEndDate
 datefilter
 resetDates
 */

//export const LOAD_MERCHANTS = 'LOAD_MERCHANTS';
//export const loadMerchants = (res) => ({ type: LOAD_MERCHANTS, transactions: res.transactions });
export const IMPORT_CSV = 'IMPORT_CSV';
export const importCSV = (files) => (dispatch) => {
  let data = new FormData();
  data.append('file', files[0]);
  return fetch(`/transactions/import`, {method: 'POST', body: data })
    .then(res => res.json())
    .then(json => dispatch({ type: IMPORT_CSV, transactions: json.transactions }));
};

export const CHANGE_CATEGORY = 'CHANGE_CATEGORY';
export const changeCategory = (merchant, category) => (dispatch) =>
  fetch(`/categories/setbymerchant?merchant=${merchant}&category=${category}`, {method: 'POST'})
   .then(res => res.json())
   .then(json => dispatch({ type: CHANGE_CATEGORY, merchant, category }));

export const RESTORE_TRANSACTION = 'RESTORE_TRANSACTION';
export const restoreTransaction = (id) => (dispatch) =>
  fetch(`/transactions/restore?id=${id}`, {method: 'POST'})
    .then(res => res.json())
    .then(json => dispatch({ type: RESTORE_TRANSACTION, id: json.id }));

export const DELETE_TRANSACTION = 'DELETE_TRANSACTION';
export const deleteTransaction = (id) => (dispatch) =>
  fetch(`/transactions/delete?id=${id}`, {method: 'DELETE'})
    .then(res => res.json())
    .then(json => dispatch({ type: DELETE_TRANSACTION, id: json.id }));

export const DELETE_MERCHANT= 'DELETE_MERCHANT';
export const deleteMerchant = (merchant) => (dispatch) =>
  fetch(`/transactions/deletebymerchant?merchant=${merchant}`, {method: 'POST'})
    .then(res => res.json())
    .then(json => dispatch({ type: DELETE_MERCHANT, merchant }));

export const ADD_CATEGORY = 'ADD_CATEGORY';
export const addCategory = (categoryName) => (dispatch) =>
  fetch(`/categories/add?name=${categoryName}`, {method: 'POST'})
    .then(res => res.json())
    .then(json => dispatch({type: ADD_CATEGORY, category: json.category}));

export const REMOVE_CATEGORY = 'REMOVE_CATEGORY';
export const removeCategory = (category) => (dispatch) =>
  fetch(`/categories/delete?name=${category}`, {method: 'DELETE'})
    .then(res => res.json())
    .then(json => dispatch({type: REMOVE_CATEGORY, category}));

export const REQUEST_TRANSACTIONS = 'REQUEST_TRANSACTIONS';
export const requestTransactions = () => ({ type: REQUEST_TRANSACTIONS });

export const RECEIVE_TRANSACTIONS = 'RECEIVE_TRANSACTIONS';
export const receiveTransactions = (res) => ({
  type: RECEIVE_TRANSACTIONS, transactions: res.transactions, receivedAt: Date.now()
});

// thunk - returns a function that takes dispatch as an arg
export const fetchTransactions = (getState) => {
  if(getIsFetchingTransactions(getState())) Promise.resolve();
  return (dispatch) => {
    dispatch(requestTransactions());
    return fetch('/transactions/get?limit=3000')
            .then(res => res.json())
            .then(res => dispatch(receiveTransactions(res)),
                  err => console.log("Error fetching transactions:", err));
  }
}

export const REQUEST_CATEGORIES = 'REQUEST_CATEGORIES';
export const requestCategories = () => ({ type: REQUEST_CATEGORIES });

export const RECEIVE_CATEGORIES = 'RECEIVE_CATEGORIES';
export const receiveCategories = (res) => ({
  type: RECEIVE_CATEGORIES, categories: res.categories, receivedAt: Date.now()
});

// thunk - returns a function that takes dispatch as an arg
export const fetchCategories = (getState) => {
  if(getIsFetchingCategories(getState())) Promise.resolve();
  return (dispatch) => {
    dispatch(requestCategories());
    return fetch('/categories/get')
      .then(res => res.json())
      .then(res => dispatch(receiveCategories(res)),
            err => console.log("Error fetching categories:", err));
  }
}

export const SEARCH = 'SEARCH';
export const search = (term) => ({ type: SEARCH, search: term });

export const TOGGLE_INCOME_FILTER = 'TOGGLE_INCOME_FILTER';
export const toggleIncomeFilter = () => ({ type: TOGGLE_INCOME_FILTER });

export const TOGGLE_EXPENSES_FILTER = 'TOGGLE_EXPENSES_FILTER';
export const toggleExpensesFilter = () => ({ type: TOGGLE_EXPENSES_FILTER });

export const UPDATE_START_DATE = 'UPDATE_START_DATE';
export const updateStartDate = (date) => ({ type: UPDATE_START_DATE, date });

export const UPDATE_END_DATE = 'UPDATE_END_DATE';
export const updateEndDate = (date) => ({ type: UPDATE_END_DATE, date });

export const TRANSACTION_SORT = 'TRANSACTION_SORT';
export const sortTransactions = (field) => ({ type: TRANSACTION_SORT, field });

export const MERCHANT_SORT = 'MERCHANT_SORT';
export const sortMerchants = (field) => ({ type: MERCHANT_SORT, field });

export const CATEGORY_SORT = 'CATEGORY_SORT';
export const sortCategories = (field) => ({ type: CATEGORY_SORT, field });

//export const INVALIDATE_VIEW = 'INVALIDATE_VIEW';
//export const invalidateView = (view) => ({ type: INVALIDATE_VIEW, view});

// REDUX STATE PLAN:
// {
//   selectedTab: 'transactions',
//   entities: {
//     transactions: {
//       0: {...}
//     },
//     merchants: {
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
