import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, Match, Miss, Link } from 'react-router';
import 'index.less';
import Transactions from 'transactions';
import Vendors from 'vendors';
import Categories from 'categories';
import Details from 'details';
import Search from 'search';
import DateFilter from 'dateFilter';
import IncomeExpenditureFilter from 'incomeExpenditureFilter';
import { fetchTransactions, fetchCategories } from 'actions';
import rootReducer from 'reducers';
window.Perf = require('react-addons-perf');


const App = () => (
  <div>
    <h2>Transaction Tracker</h2>

    <DateFilter />

    <Details />

    <div className="filter-container">
      <Search />
      <IncomeExpenditureFilter />
    </div>

    <Router>
      <div className="tabs" id="navcontainer">
        <ul id="navlist" className="tables">
          <Link to="/" activeOnlyWhenExact>
            {({isActive, onClick}) => <li className={isActive ? 'selected' : ''} onClick={onClick}>Transactions</li>}
          </Link>
          <Link to="/deleted">
            {({isActive, onClick}) => <li className={isActive ? 'selected' : ''} onClick={onClick}>Deleted</li>}
          </Link>
          <Link to="/vendors">
            {({isActive, onClick}) => <li className={isActive ? 'selected' : ''} onClick={onClick}>Vendors</li>}
          </Link>
          <Link to="/categories">
            {({isActive, onClick}) => <li className={isActive ? 'selected' : ''} onClick={onClick}>Categories</li>}
          </Link>
        </ul>

        <Match exactly pattern="/" component={() => <Transactions filter="ACTIVE" />} />
        <Match exactly pattern="/deleted" component={() => <Transactions filter="DELETED" />} />
        <Match exactly pattern="/vendors" component={() => <Vendors />} />
        <Match exactly pattern="/categories" component={() => <Categories />} />
      </div>
    </Router>

  </div>
)

const configureStore = () => {
  const persistedState = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
  const middlewares = [thunkMiddleware];
  return createStore(
    rootReducer,
    persistedState,
    applyMiddleware(...middlewares),
  );
}

const store = configureStore();
store.dispatch(fetchCategories(store.getState)).then(() => store.getState());
store.dispatch(fetchTransactions(store.getState)).then(() => store.getState());
render(<Provider store={store}><App /></Provider>, document.getElementById('main'));

/* SAGAS
 import createSagaMiddleware from 'redux-saga';
 const useReduxDevTools = __DEV__ && window.devToolsExtension;

 const sagaMiddleware = createSagaMiddleware();

 const store = Redux.createStore(reducer,
 useReduxDevTools ? window.devToolsExtension() : f => f,
 Redux.applyMiddleware(sagaMiddleware)
 );

 sagas.forEach(saga => sagaMiddleware.run(saga));

 */
