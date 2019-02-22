import React from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updateStartDate, updateEndDate } from 'actions';

//<button type="button" onClick={this.resetDates.bind(this)}>Reset</button>
let DateFilter = ({startDate, endDate, updateStartDate, updateEndDate}) => (
  <div className="datePicker">
    <span>Start date: </span><DatePicker dateFormat="YYYY/MM/DD"
                                         todayButton={"Today"}
                                         selected={new Date(startDate)}
                                         disabledKeyboardNavigation
                                         showYearDropdown
                                         onChange={(date) => updateStartDate(date)}
                                         style={{ zIndex: 2 }} />
    <br/>
    <span>End date: </span><DatePicker dateFormat="YYYY/MM/DD"
                                       todayButton={"Today"}
                                       selected={new Date(endDate)}
                                       disabledKeyboardNavigation
                                       showYearDropdown
                                       onChange={(date) => updateEndDate(date)}
                                       style={{ zIndex: 2 }} />
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
