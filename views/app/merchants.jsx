import React from 'react';
//import onClickOutside from 'react-onclickoutside';
// import 'react-select/dist/react-select.css';
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
      <th onClick={() => props.sort('type')}>Type</th>
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
    <td title={TransactionsTooltip(props.merchant.transactionList)}>{props.merchant.merchant}</td>
    <td>{props.merchant.type}</td>
    <td>{props.merchant.count}</td>
    <td>{props.merchant.total}</td>
    <td>
      <CategorySelect categories={props.categories}
                      merchant={props.merchant}
                      changeCategory={props.changeCategory} />
    </td>
    {/*<td><Select name="categorySelector"*/}
                {/*value={props.merchant.category}*/}
                {/*options={_.sortBy(props.categories.map(c => ({ value: c.name, label: c.name })), 'label')}*/}
                {/*onChange={(category) => props.changeCategory(props.merchant.merchant, category.value)} />*/}
    {/*</td>*/}
    <td>
      <span className="button" id={props.merchant.merchant} onClick={(e) => props.deleteMerchant(props.merchant.merchant)}>
        delete
      </span>
    </td>
  </tr>
);

const TransactionsTooltip = (transactionList) => {
  const tooltip = transactionList.map(t => (
    `${t.date}\t${t.details}\t${t.amount}`
  )).join('\n');
  return tooltip;
};

class CategorySelect extends React.Component {
  constructor(){
    super();
    this.state = {
      categories: [],
      listVisible: false,
    }
  }
  select(merchant, category){
    this.props.changeCategory(merchant, category);
    this.setState({ listVisible: false });
    document.removeEventListener("click", this.hide);
  }
  show(){
    this.setState({ listVisible: true });
    document.addEventListener("click", this.hide);
  }
  hide(){
    this.setState({ listVisible: false });
  }
  handleClick(){
    this.state.listVisible ? document.removeEventListener("click", this.hide): document.addEventListener("click", this.hide);
    this.state.listVisible ? this.setState({ listVisible: false }) : this.setState({ listVisible: true });
    this.setState({ categories: _.sortBy(this.props.categories.filter(c => !(c.name === this.props.merchant.category)), 'name')});
  }
  //props.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)
  render() {
    const { merchant } = this.props;
    return (
      <div className={"select-container" + (this.state.listVisible ? " show" : "")}>
        <div className={"select-display" + (this.state.listVisible ? " clicked" : "")}
             onClick={this.handleClick.bind(this)}>
          {merchant.category ? <span>{merchant.category}</span> : <span className="select-default">Select...</span>}
          <span className="select-arrow">&#9662;</span>
        </div>
         <div className={"select-options" + (this.state.listVisible ? " active" : "")}>
           <div>{this.state.categories.map(c => (
             <span key={c.name}
                   value={c.name}
                   onClick={() => this.select(merchant.merchant, c.name)}>
               {c.name}
             </span>
           ))}</div>
         </div>
      </div>
    );
  }
}
