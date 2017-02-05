import React from 'react';
import { connect } from 'react-redux';
import { getVisibleTransactions, getMerchants } from 'reducers';
import { changeCategory, deleteMerchant, sortMerchants } from 'actions';


class Merchants extends React.Component {
  constructor(){
    super();
    this.state = {};
  }
  render(){
    if(this.props.isFetching) return(<div>Loading...</div>);

    // sort merchants
    let merchants = _.sortBy(this.props.merchants, (v) => v[this.props.sort.field]);
    if(this.props.sort.order === 'DESC') merchants = merchants.reverse();

    return (
      <MerchantTable merchants={merchants}
                   deleteMerchant={this.props.deleteMerchant}
                   categories={this.props.categories}
                   changeCategory={this.props.changeCategory}
                   sort={this.props.sortMerchants} />
    );
  }
}
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: getVisibleTransactions(state, props),
  categories: state.categories,
  merchants: getMerchants(state, props),
  sort: state.sort.merchants,
});
const mapDispatchToProps = (dispatch) => ({
  changeCategory: (merchant, category) => dispatch(changeCategory(merchant, category)),
  deleteMerchant: (merchant) => dispatch(deleteMerchant(merchant)),
  sortMerchants: (field) => dispatch(sortMerchants(field)),
});
Merchants = connect(mapStateToProps, mapDispatchToProps)(Merchants);

export default Merchants;

const MerchantTable = (props) => (
  <table className="Merchants">
    <thead>
    <tr>
      <th onClick={() => props.sort('merchant')}>Merchant</th>
      <th onClick={() => props.sort('count')}>Count</th>
      <th onClick={() => props.sort('total')}>Total</th>
      <th onClick={() => props.sort('category')}>Category</th>
      <th>Deleted</th>
    </tr>
    </thead>
    <tbody>
    {props.merchants.map(v => <MerchantRow key={v.merchant}
                                         merchant={v}
                                         deleteMerchant={props.deleteMerchant}
                                         categories={props.categories}
                                         changeCategory={props.changeCategory} />)}
    </tbody>
  </table>
);

const MerchantRow = (props) => (
  <tr>
    <td>{props.merchant.merchant}</td>
    <td>{props.merchant.count}</td>
    <td>{props.merchant.total}</td>
    <td>
      <CategorySelect categories={props.categories}
                      merchant={props.merchant}
                      changeCategory={props.changeCategory} />
    </td>
    <td>
      <span className="button" id={props.merchant.merchant} onClick={(e) => props.deleteMerchant(props.merchant.merchant)}>
        delete
      </span>
    </td>
  </tr>
);

class CategorySelect extends React.Component {
  constructor(){
    super();
    this.state = {
      categories: [],
    }
  }
  handleClick(){
    this.setState({ categories: this.props.categories.filter(c => !(c.name === this.props.merchant.category)) });
  }
  //props.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)
  render() {
    const { merchant, changeCategory } = this.props;
    return (
      <select value={merchant.category ? merchant.category : ''}
              onChange={(e) => this.props.changeCategory(merchant.merchant, e.target.value)}
              onClick={this.handleClick.bind(this)}>
        {merchant.category ? <option>{merchant.category}</option> : <option></option>}
        {this.state.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
    );
  }
}
