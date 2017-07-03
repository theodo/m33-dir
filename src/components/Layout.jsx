import React, { Component } from 'react';
import {Tab, Tabs, List, ListItem, ListDivider, Link, Input} from 'react-toolbox';
import AuthorizeButton from './Authorize.jsx';
import People from '../services/People';
import { removeAccents, computeLegend } from '../services/Email';
import map from 'lodash/map';
import itemStyle from './item.scss';
import tabStyle from './tabs.scss';
import inputStyle from './input.scss';

class Layout extends Component {
  searchText = '';

  constructor(props) {
    super(props);

    const companies = JSON.parse(window.localStorage.getItem('ta_dir_companies')) || [];
    const isAuthenticated = window.localStorage.getItem('ta_dir_trello_token') !== null;

    this.state = {
      companyId: companies[0].id,
      isAuthenticated,
      companies,
    };
  }

  componentDidMount() {
    if (this.state.isAuthenticated) {
      const token = window.localStorage.getItem('ta_dir_trello_token');
      window.Trello.setToken(token)
      People.getCompanies((companies) => {
        const companyEmails = {}
        this.state.companies.map(company => {
          companyEmails[company.id] = company.name.split('|')[1];
        });
        this.setState({companies, companyEmails});
      });
    }
  }

  handleTabChange = (index) => {
    this.setState({
      companyId: this.state.companies[index].id,
    });
  };

  handleSearchChange = (value) => {
    this.setState({
      companies: People.searchPeople(value)
    });
  }

  onSignInSuccess() {
    this.setState({
      isAuthenticated: true,
    });
    this.getTabs()
  }

  renderList(people) {
    const items = people.map(someone => {
      const phoneCallToAction = <Link href={'tel:' + someone.phone} icon='phone' theme={itemStyle} />
      const legend = computeLegend(someone, this.state.companyEmails);
      return (
        <ListItem
          key={someone.name}
          avatar={someone.avatar}
          caption={someone.name}
          legend={legend}
          rightIcon={phoneCallToAction}
        />
      )
    })

    return (
      <List ripple>
        {items}
      </List>
    )
  }

  renderTabs() {
    if (this.state.companies.length === 0) {
      return (<div className={inputStyle.noResults}>No results</div>);
    }

    const tabs = this.state.companies.map(company => {
      return (
        <Tab key={company.id} label={company.name.split('|')[0]}>
          <Link href='https://trello.com/b/JLBMh7wp'>Add someone</Link>
          {this.renderList(company.people)}
        </Tab>
      )
    });

    const selectedCompanyIndex = this.state.companies
      .map(company => company.id)
      .indexOf(this.state.companyId);

    return (
      <Tabs index={selectedCompanyIndex} onChange={this.handleTabChange} inverse theme={tabStyle}>
        {tabs}
      </Tabs>
    );
  }

  render () {
    if (!this.state.isAuthenticated) {
      return (
        <AuthorizeButton
          onSignInSuccess={this.onSignInSuccess.bind(this)}
        />
      )
    }
    else {
      const tabs = this.renderTabs()
      return (
        <div>
          <Input
            type="text"
            placeholder="Search a name or a phone number"
            onChange={this.handleSearchChange.bind(this)}
            theme={inputStyle}
          />
          {tabs}
        </div>
      )
    }
  }
}

export default Layout;
