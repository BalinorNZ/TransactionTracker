import React from 'react';
import { connect } from 'react-redux';
import { getVisibleTransactions, getVendors, getCategories } from 'reducers';


class CategoryView extends React.Component {
  constructor(){
    super();
    this.state = {};
  }
  render(){
    if(this.props.isFetching) return(<div>Loading...</div>);
    return (
      <div>
        <form className="addCategoryForm" onSubmit={this.props.addCategory.bind(this)}>
          <input name="categoryName" type="text" />
          <button type="submit">Save</button>
        </form>
        <CategoryTable categories={this.props.categories}
                       removeCategory={this.props.removeCategory}
                       sort={this.props.sort} />
      </div>
    );
  }
}
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: getVisibleTransactions(state, props),
  categories: getCategories(state, props),
  vendors: getVendors(state, props),
});
//const mapDispatchToProps = (dispatch) => ({ onTodoClick(id){ dispatch(toggleTodo(id)) }, });
export const Categories = connect(mapStateToProps)(CategoryView);

const CategoryTable = (props) => (
  <table className="Categories">
    <thead>
    <tr>
      <th onClick={props.sort.bind(this)} id="name">Category</th>
      <th onClick={props.sort.bind(this)} id="transactionCount">Transactions</th>
      <th onClick={props.sort.bind(this)} id="vendorCount">Vendors</th>
      <th onClick={props.sort.bind(this)} id="categoryTotal">Total</th>
      <th>Deleted</th>
    </tr>
    </thead>
    <tbody>
    {props.categories.map(c => <CategoryRow key={c.id}
                                            category={c}
                                            removeCategory={props.removeCategory}
    />)}
    </tbody>
  </table>
);

const CategoryRow = (props) => (
  <tr>
    <td>{props.category.name}</td>
    <td>{props.category.transactionCount}</td>
    <td>{props.category.vendorCount}</td>
    <td>{props.category.categoryTotal}</td>
    <td>
      <span className="button" id={props.category.id} onClick={props.removeCategory.bind(this)}>
        delete
      </span>
    </td>
  </tr>
);
