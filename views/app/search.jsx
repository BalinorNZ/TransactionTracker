import React from 'react';
import { connect } from 'react-redux';
import { search } from 'actions';
import { getVisibleTransactions } from 'reducers';


let Search = (props) => (
  <div className="vendor-search">
    Search {props.transactions.length} transactions by vendor:&nbsp;
    <input type="text" onChange={(e) => props.doSearch(e)} />
  </div>
);

const mapStateToProps = (state, props) => ({ transactions: getVisibleTransactions(state, props) });
const mapDispatchToProps = (dispatch, ownProps) => ({ doSearch: (e) => {dispatch(search(e.target.value))} });
Search = connect(mapStateToProps, mapDispatchToProps)(Search);

export default Search;
