import React from 'react';
import { connect } from 'react-redux';
import { search } from 'actions';
import { getVisibleTransactionCount } from 'reducers';


let Search = (props) => (
  <div className="vendor-search">
    Search {props.transactionCount} transactions by vendor:&nbsp;
    <input type="text" onChange={(e) => props.doSearch(e)} />
  </div>
);

const mapStateToProps = (state, props) => ({ transactionCount: state.isFetchingTransactions ? [] :  getVisibleTransactionCount(state, props) });
const mapDispatchToProps = (dispatch, ownProps) => ({ doSearch: (e) => {dispatch(search(e.target.value))} });
Search = connect(mapStateToProps, mapDispatchToProps)(Search);

export default Search;
