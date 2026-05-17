import {Component} from 'react';
import {Link} from 'react-router';
import './style.css';

export default class extends Component {
  static defaultProps = {
    menus: [],
    logo: ''
  };

  handleClick = (e, item)=> {
    if(item.subMenus && item.subMenus.length > 0){
      e.preventDefault();
      var subMenu = item.subMenus[0];
      this.props.history.pushState(null, subMenu.to || subMenu.menus[0].to);
    }
  };

  render () {
    return (
      <header className="top-menu-component">
        <div className="top-menu__logo">dashboard</div>
        <div className="top-menu__content">
          {this.props.menus.map((item, i) =>
            <div key={i} className="top-menu__content__menu">
              <Link activeClassName="active-menu" onClick={e=>this.handleClick(e, item)} to={item.to}>{item.label}</Link>
            </div>
          )}
        </div>
        <div className="top-menu__right">
        </div>
      </header>
    );
  }
}