import React from 'react';
import { connect } from 'react-redux';
import { search } from 'actions';
import { getVisibleTransactionCount } from 'reducers';


let Search = (props) => (
  <div className="merchant-search">
    Search {props.transactionCount} transactions by merchant:&nbsp;
    <input type="text" onChange={(e) => e.target.value.length > 1 && props.doSearch(e)} />
  </div>
);

const mapStateToProps = (state, props) => ({ transactionCount: state.isFetchingTransactions ? [] :  getVisibleTransactionCount(state, props) });
const mapDispatchToProps = (dispatch, ownProps) => ({ doSearch: (e) => {dispatch(search(e.target.value))} });
Search = connect(mapStateToProps, mapDispatchToProps)(Search);

export default Search;
