import {Component} from 'react';
import {Link} from 'react-router';
import './style.css';

export default class extends Component {
  static defaultProps = {
    menuGroups: []
  };

  state = {
    hideGroup: {}
  };

  handleExpand = (i)=> {
    this.state.hideGroup[i] = !this.state.hideGroup[i];
    this.forceUpdate();
  };

  render () {
    return (
      <header className="left-menu-component">
        <div className="left-menu__content">
          {this.props.menuGroups.map((group, i) =>
            <div key={i} className="left-menu__group">
              <div className="left-menu__item left-menu__item--group"
                  onClick={()=>this.handleExpand(i)}
              >
                {group.to ?  
                  <Link activeClassName="active-menu" to={group.to}>
                    <span className={`first-menu-item icon icon-${'atom'}`}></span>
                    <span className="text">
                      <span>{group.label}</span>
                    </span>
                  </Link> : 
                  <a className="group-expander">
                    <span className={`first-menu-item icon icon-${'atom'}`}></span>
                    <span>{group.label}</span>
                    <span className={'glyphicon glyphicon-chevron-right' + (this.state.hideGroup[i] ? ' glyphicon-rotate' : '')}></span>
                  </a>
                }
              </div>
              {((!this.state.hideGroup[i] && group.menus) || []).map((menu, j)=>
                <div key={j} className="left-menu__item left-menu__item--menu">
                  <Link activeClassName="active-menu" to={menu.to}>
                    <span className="first-menu-item icon icon-atom"></span>
                    <span className="menu-label">{menu.label}</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }
}