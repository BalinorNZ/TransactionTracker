import React from 'react';
import { connect } from 'react-redux';
import { getVisibleTransactions, getMerchants, getCategories, getCategoryTransactions } from 'reducers';
import { addCategory, removeCategory, sortCategories, selectCategory } from 'actions';


class Categories extends React.Component {
  constructor(){
    super();
    this.state = {};
  }

  render(){
    if(this.props.isFetching) return(<div>Loading...</div>);

    // sort categories
    let categories = _.sortBy(this.props.categories, (c) => c[this.props.sort.field]);
    if(this.props.sort.order === 'DESC') categories = categories.reverse();

    return (
      <div>
        <form className="addCategoryForm"
              onSubmit={(e) => {
                e.preventDefault();
                this.props.addCategory(e.target.categoryName.value);
              }}>
          <input name="categoryName" type="text" />
          <button type="submit">Save</button>
        </form>
        <CategoryTable categories={categories}
                       removeCategory={this.props.removeCategory}
                       sort={this.props.sortCategories}
                       selectCategory={this.props.selectCategory}
        />
        <table className="selectedCategoryTable"><tbody>
          {this.props.categoryTransactions.map(t =>
            <tr key={t.createdAt}><td>{t.merchant}</td><td>{t.amount}</td><td>{t.date.substr(0, 9)}</td></tr>
          )}
        </tbody></table>
      </div>
    );
  }
}
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: getVisibleTransactions(state, props),
  categories: getCategories(state, props),
  merchants: getMerchants(state, props),
  sort: state.sort.categories,
  categoryTransactions: getCategoryTransactions(state, props),
});

const mapDispatchToProps = (dispatch) => ({
  addCategory: (category) => dispatch(addCategory(category)),
  removeCategory: (category) => dispatch(removeCategory(category)),
  sortCategories: (field) => dispatch(sortCategories(field)),
  selectCategory: (category) => dispatch(selectCategory(category)),
});
Categories = connect(mapStateToProps, mapDispatchToProps)(Categories);

export default Categories;


const CategoryTable = (props) => (
  <table className="Categories">
    <thead onClick={() => props.selectCategory(null)}>
    <tr>
      <th onClick={() => props.sort('name')} id="name">Category</th>
      <th onClick={() => props.sort('transactionCount')} id="transactionCount">Transactions</th>
      <th onClick={() => props.sort('merchantCount')} id="merchantCount">Merchants</th>
      <th onClick={() => props.sort('categoryTotal')} id="categoryTotal">Total</th>
      <th>Deleted</th>
    </tr>
    </thead>
    <tbody>
    {props.categories.map(c => <CategoryRow key={c.id}
                                            category={c}
                                            removeCategory={props.removeCategory}
                                            selectCategory={props.selectCategory}
    />)}
    </tbody>
  </table>
);

const CategoryRow = (props) => (
  <tr>
    <td onClick={() => props.selectCategory(props.category.name)}>{props.category.name}</td>
    <td>{props.category.transactionCount}</td>
    <td>{props.category.merchantCount}</td>
    <td>{props.category.categoryTotal}</td>
    <td>
      <span className="button" id={props.category.id} onClick={() => props.removeCategory(props.category.name)}>
        delete
      </span>
    </td>
  </tr>
);
