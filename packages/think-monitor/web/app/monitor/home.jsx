import {Component} from 'react';
import './style.css';
import 'antd/dist/antd.css';
import TopMenu from 'monitor/components/top-menu';

export default class extends Component {
  state = {menus: []};
  render() {
    return (
      <div>
        <div>
        <TopMenu {...this.props} menus={this.state.menus}/>
        </div>
        <div>
          <div>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
};