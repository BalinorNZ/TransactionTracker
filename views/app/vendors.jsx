import React from 'react';
import { connect } from 'react-redux';
import { getVisibleTransactions, getVendors } from 'reducers';
import { changeCategory, deleteVendor, sortVendors } from 'actions';


class Vendors extends React.Component {
  constructor(){
    super();
    this.state = {};
  }
  render(){
    if(this.props.isFetching) return(<div>Loading...</div>);

    // sort vendors
    let vendors = _.sortBy(this.props.vendors, (v) => v[this.props.sort.field]);
    if(this.props.sort.order === 'DESC') vendors = vendors.reverse();

    return (
      <VendorTable vendors={vendors}
                   deleteVendor={this.props.deleteVendor}
                   categories={this.props.categories}
                   changeCategory={this.props.changeCategory}
                   sort={this.props.sortVendors} />
    );
  }
}
const mapStateToProps = (state, props) => ({
  isFetching: state.isFetchingTransactions,
  transactions: getVisibleTransactions(state, props),
  categories: state.categories,
  vendors: getVendors(state, props),
  sort: state.sort.vendors,
});
const mapDispatchToProps = (dispatch) => ({
  changeCategory: (vendor, category) => dispatch(changeCategory(vendor, category)),
  deleteVendor: (vendor) => dispatch(deleteVendor(vendor)),
  sortVendors: (field) => dispatch(sortVendors(field)),
});
Vendors = connect(mapStateToProps, mapDispatchToProps)(Vendors);

export default Vendors;

const VendorTable = (props) => (
  <table className="Vendors">
    <thead>
    <tr>
      <th onClick={() => props.sort('vendor')}>Vendor</th>
      <th onClick={() => props.sort('count')}>Count</th>
      <th onClick={() => props.sort('total')}>Total</th>
      <th onClick={() => props.sort('category')}>Category</th>
      <th>Deleted</th>
    </tr>
    </thead>
    <tbody>
    {props.vendors.map(v => <VendorRow key={v.vendor}
                                       vendor={v}
                                       deleteVendor={props.deleteVendor}
                                       categories={props.categories}
                                       changeCategory={props.changeCategory} />)}
    </tbody>
  </table>
);

const VendorRow = (props) => (
  <tr>
    <td>{props.vendor.vendor}</td>
    <td>{props.vendor.count}</td>
    <td>{props.vendor.total}</td>
    <td>
      <CategorySelect categories={props.categories}
                      vendor={props.vendor}
                      changeCategory={props.changeCategory} />
    </td>
    <td>
      <span className="button" id={props.vendor.vendor} onClick={(e) => props.deleteVendor(props.vendor.vendor)}>
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
    this.setState({ categories: this.props.categories.filter(c => !(c.name === this.props.vendor.category)) });
  }
  //props.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)
  render() {
    const { vendor, changeCategory } = this.props;
    return (
      <select value={vendor.category ? vendor.category : ''}
              onChange={(e) => this.props.changeCategory(vendor.vendor, e.target.value)}
              onClick={this.handleClick.bind(this)}>
        {vendor.category ? <option>{vendor.category}</option> : <option></option>}
        {this.state.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
    );
  }
}
