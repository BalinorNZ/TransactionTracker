import React from 'react';

export class Tabs extends React.Component {
  constructor(){
    super();
    this.state = {selected: 0};
  }
  selectTab(index){
    this.setState({selected: index});
  }
  render() {
    return (
      <div className="tabs" id="navcontainer">
        <ul id="navlist" className="tables">
          {this.props.children.map((tab, index) =>
            <li key={index}
                onClick={this.selectTab.bind(this, index)}
                className={this.state.selected === index ? 'selected' : ''}>
              {tab.props.label}
            </li>
          )}
        </ul>
        <div className="tab-content">{this.props.children[this.state.selected]}</div>
      </div>
    );
  }
}
Tabs.propTypes = { selected: React.PropTypes.number.isRequired };
Tabs.defaultProps = { selected: 0 };
