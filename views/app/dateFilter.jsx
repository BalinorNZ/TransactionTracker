import React from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updateStartDate, updateEndDate } from 'actions';

//<button type="button" onClick={this.resetDates.bind(this)}>Reset</button>
let DateFilter = ({startDate, endDate, updateStartDate, updateEndDate}) => (
  <div className="datePicker">
    <span>Start date: </span><DatePicker dateFormat="YYYY/MM/DD"
                                         selected={startDate}
                                         onChange={(date) => updateStartDate(date)} />
    <br/>
    <span>End date: </span><DatePicker dateFormat="YYYY/MM/DD"
                                       selected={endDate}
                                       onChange={(date) => updateEndDate(date)} />
  </div>
);
const mapStateToProps = (state, props) => ({
  startDate: state.dateFilter.startDate,
  endDate: state.dateFilter.endDate,
});
const mapDispatchToProps = (dispatch) => ({
  updateStartDate: (date) => dispatch(updateStartDate(date)),
  updateEndDate: (date) => dispatch(updateEndDate(date)),
});
DateFilter = connect(mapStateToProps, mapDispatchToProps)(DateFilter);

export default DateFilter;
