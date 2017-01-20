import React from 'react';
import { connect } from 'react-redux';
import { getVisibleTransactions } from 'reducers';


class CategoryView extends React.Component {
  constructor(){
    super();
    this.state = {};
  }
  render(){
    if(this.props.isFetching) return(<div>Loading...</div>);
    // build categories list
    const { vendors, transactions} = this.props;
    let categories = [];
    _.each(this.props.categories, c => {
      c.vendorCount = vendors.reduce((total, v) => v.category === c.name ? total+1 : total, 0);
      c.transactionCount = transactions.reduce((total, t) => t.category === c.name ? total+1 : total, 0);
      c.categoryTotal = +(transactions.reduce((total, t) => t.category === c.name ? total+t.amount : total, 0).toFixed(2));
      categories.push(c);
    });
    return (
      <div>
        <form className="addCategoryForm" onSubmit={this.props.addCategory.bind(this)}>
          <input name="categoryName" type="text" />
          <button type="submit">Save</button>
        </form>
        <CategoryTable categories={categories}
                       removeCategory={this.props.removeCategory}
                       sort={this.props.sort} />
      </div>
    );
  }
}
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: getVisibleTransactions(state, props),
  categories: state.categoryView.categories.map(id => _.find(state.categories, c => c.id === id)),
  vendors: state.vendors
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
      <span className="button" id={props.category.name} onClick={props.removeCategory.bind(this)}>
        delete
      </span>
    </td>
  </tr>
);
