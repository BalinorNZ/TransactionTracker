import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, Match, Miss, Link } from 'react-router';
import moment from 'moment';
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


class App extends React.Component {
  constructor(){
    super();
    this.state = {
      startDate: moment('20130101', 'YYYYMMDD'),
      endDate: moment(),
    };
  }
  resetDates(e){
    //startDate(getToday(-1)); //endDate(getToday()); //self.filterTable(); //return true;
  }
  updateStartDate(date){
    this.setState({startDate: date});
  }
  updateEndDate(date){
    this.setState({endDate: date});
  }
  render(){
    // date filter
    // allTransactions = _.reject(allTransactions, (t) => {
    //   if(moment(t.date, 'D MMM YYYY') > this.state.endDate) { return true;}
    //   if(moment(t.date, 'D MMM YYYY') < this.state.startDate) { return true; }
    //   return false;
    // });

    //<button type="button" onClick={this.resetDates.bind(this)}>Reset</button>
    //onChange={this.search.bind(this)} />
    return (
      <div>
        <h2>Transaction Tracker</h2>

        <DateFilter startDate={this.state.startDate} endDate={this.state.EndDate} updateStartDate={this.updateStartDate} updateEndDate={this.updateEndDate} />

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
  }
}

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

const mapStateToProps = (state) => ({ state });
App = connect(mapStateToProps)(App);

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
