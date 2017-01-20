import React from 'react';
import { connect } from 'react-redux';
import { search } from 'actions';


const SearchBox = (props) => (
  <div className="vendor-search">
    Search {props.transactionCount} transactions by vendor:&nbsp;
    <input type="text" onChange={(e) => props.doSearch(e)} />
  </div>
);

const mapStateToProps = (state, props) => ({ transactionCount: state.transactions.length });
const mapDispatchToProps = (dispatch, ownProps) => ({ doSearch: (e) => {dispatch(search(e.target.value))} });
export const Search = connect(mapStateToProps, mapDispatchToProps)(SearchBox);
