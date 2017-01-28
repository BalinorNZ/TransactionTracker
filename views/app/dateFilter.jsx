import React from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

let DateFilter = ({startDate, endDate, updateStartDate, updateEndDate}) => (
  <div className="datePicker">
    <span>Start date: </span><DatePicker dateFormat="YYYY/MM/DD"
                                         selected={startDate}
                                         onChange={updateStartDate.bind(this)} />
    <br/>
    <span>End date: </span><DatePicker dateFormat="YYYY/MM/DD"
                                       selected={endDate}
                                       onChange={updateEndDate.bind(this)} />
  </div>
);
const mapStateToProps = (state, props) => ({
});
//const mapDispatchToProps = (dispatch) => ({ onTodoClick(id){ dispatch(toggleTodo(id)) }, });
DateFilter = connect(mapStateToProps)(DateFilter);

export default DateFilter;
