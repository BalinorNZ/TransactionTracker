import React from 'react';
import { connect } from 'react-redux';

class VendorView extends React.Component {
  constructor(){
    super();
    this.state = {};
  }
  render(){
    let vendors = this.props.vendors;
    return (
      <VendorTable vendors={vendors}
                   deleteVendor={this.props.deleteVendor}
                   categories={this.props.categories}
                   changeCategory={this.props.changeCategory}
                   sort={this.props.sort} />
    );
  }
}
const mapStateToProps = (state) => ({
  transactions: state.transactions.transactions,
  categories: state.categories.categories,
  vendors: state.vendors.vendors
});
//const mapDispatchToProps = (dispatch) => ({ onTodoClick(id){ dispatch(toggleTodo(id)) }, });
export const Vendors = connect(mapStateToProps)(VendorView);

const VendorTable = (props) => (
  <table className="Vendors">
    <thead>
    <tr>
      <th onClick={props.sort.bind(this)}>Vendor</th>
      <th onClick={props.sort.bind(this)}>Count</th>
      <th onClick={props.sort.bind(this)}>Total</th>
      <th onClick={props.sort.bind(this)}>Category</th>
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
      <select value={props.vendor.category ? props.vendor.category : ''}
              onChange={(e) => props.changeCategory(props.vendor.vendor, e.target.value)}>
        <option></option>
        {props.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
    </td>
    <td>
      <span className="button" id={props.vendor.vendor} onClick={props.deleteVendor.bind(this)}>
        delete
      </span>
    </td>
  </tr>
);
