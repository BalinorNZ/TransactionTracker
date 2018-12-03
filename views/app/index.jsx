import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom';
import 'index.less';
import Transactions from 'transactions';
import Merchants from 'merchants';
import Categories from 'categories';
import Details from 'details';
import Search from 'search';
import DateFilter from 'dateFilter';
import IncomeExpenditureFilter from 'incomeExpenditureFilter';
import { fetchTransactions, fetchCategories, importCSV } from 'actions';
import rootReducer from 'reducers';
import Dropzone from 'react-dropzone';
// window.Perf = require('react-addons-perf');

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
          <li><NavLink to="/" exact activeClassName="selected">
            Transactions
          </NavLink></li>
          <li><NavLink to="/deleted" activeClassName="selected">
            Deleted
          </NavLink></li>
          <li><NavLink to="/merchants" activeClassName="selected">
            Merchants
          </NavLink></li>
          <li><NavLink to="/categories" activeClassName="selected">
            Categories
          </NavLink></li>
          <li><NavLink to="/importer" activeClassName="selected">
            Import
          </NavLink></li>
        </ul>

        <Route exact path="/" render={() => <Transactions filter="ACTIVE" />} />
        <Route exact path="/deleted" render={() => <Transactions filter="DELETED" />} />
        <Route exact path="/merchants" render={() => <Merchants />} />
        <Route exact path="/categories" render={() => <Categories />} />
        <Route exact path="/importer" render={() => <Importer />} />
      </div>
    </Router>

  </div>
);

export default App;


let Importer = (props) => (
  <div>
    <Dropzone className="dropzone" onDrop={(acceptedFiles, rejectedFiles) => props.importCSV(acceptedFiles)}>
      <div className="dropzone-text">Drop CSV here</div>
    </Dropzone>
    <div className="import-dialog">Imported {store.getState().importTransactions.length} transactions!</div>
  </div>
);
const mapStateToProps = (state, props) => ({
  importTransactions: state.importTransactions,
});
const mapDispatchToProps = (dispatch) => ({
  importCSV: (files) => dispatch(importCSV(files)),
});
Importer = connect(mapStateToProps, mapDispatchToProps)(Importer);


const configureStore = () => {

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const persistedState = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
  const middlewares = [thunkMiddleware];
  return createStore(
    rootReducer,
    // persistedState,
    composeEnhancers(applyMiddleware(...middlewares)),
  );
};

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
