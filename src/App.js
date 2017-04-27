import React, { Component } from 'react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';

const DEFAULT_QUERY = 'react';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '50';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
  DATE: list => sortBy(list, 'created_at').reverse(),
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      result: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      isLoading: false,
    };

    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this); 
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }


  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
  }

  setSearchTopstories(result) {  
    const { hits, page } = result;
    const {searchKey, results } = this.state;

    const oldHits = results && results[searchKey] 
      ? results[searchKey].hits 
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      results: {
        ...results, 
        [searchKey]:{ hits: updatedHits, page }
      },
          isLoading: false
    });
  }

  fetchSearchTopstories(searchTerm, page) {
    this.setState({isLoading: true});

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopstories(result));
  }

  needsToSearchTopstories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value })
  }

  onSearchSubmit(event) {
    const {searchTerm } = this.state;
    this.setState({searchKey: searchTerm });

    if(this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }
    event.preventDefault();
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
      this.setState({
        results: {
          ...results,
          [searchKey]: { hits: updatedHits, page }
        }
    });
  }

  render() {
    const {
      searchTerm, 
      results,
      searchKey,
      isLoading

    } = this.state;

    const page = (
      results && 
      results[searchKey] &&
      results[searchKey].page
    ) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search 
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <Table 
          list={list}
          onDismiss={this.onDismiss}
          onSort={this.onSort}
        />
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
            More
          </ButtonWithLoading>
        </div>     
      </div>
    );
  }
}

// this was commented out b/c we are no longer using the isSearched filter to trigger the search stuff
// const isSearched = (searchTerm) => (item) => !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

const Search = ({
  value, 
  onChange, 
  onSubmit,
  children 
}) => 
    <form onSubmit={onSubmit}>
      <input 
        type="text" 
        value={value}
        onChange={onChange}
      />
      <button type="submit">
        {children} 
      </button>
    </form>


const largeColumn = {
  width: '40%',
};

const smallColumn = {
  width: '10%',
};


class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const { 
      list, 
      onDismiss
    } = this.props;

    const {
      sortKey,
      isSortReverse
    } = this.state;

    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

    return(
      <div className="table">
        <div className="table-header">
          <span style={largeColumn}>
            <Sort
              sortKey={'TITLE'}
              onSort={this.onSort}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            >
            Title
            </Sort>
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey={'DATE'}
              onSort={this.onSort}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            >
            Date
            </Sort>
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey={'AUTHOR'}
              onSort={this.onSort}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            >
            Author
            </Sort>
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey={'COMMENTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            >
            Comments
            </Sort>
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey={'POINTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            >
            Points
            </Sort>
          </span>
          <span style={smallColumn}>
            Archive
          </span>
        </div>
        { reverseSortedList.map(item => 
          <div key={item.objectID} className="table-row">
            <span style={largeColumn}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={smallColumn}>{item.created_at}</span>
            <span style={smallColumn}>{item.author}</span>
            <span style={smallColumn}>{item.num_comments}</span>
            <span style={smallColumn}>{item.points}</span>
            <span style={smallColumn}>
              <Button onClick={() => onDismiss(item.objectID)}
                className="button-inline"  
              >
                Dismiss
              </Button>
            </span>
          </div>
        )}
      </div>
    );
  }
}


// This entire thing is now pre-lifted state where we make the App unaware of the props that the table has:
/*const Table = ({
  list, 
  sortKey,
  isSortReverse,
  onSort,
  onDismiss
}) => { // <-- optional object in case you need to add return like we now do with the const we just created on pg 118.

const sortedList = SORTS[sortKey](list);
const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

  return ( // <-- can be omitted unless you need to do stuff between the function and the return
    <div className="table">
      <div className="table-header">
      <span style={largeColumn}>
        <Sort
          sortKey={'TITLE'}
          onSort={onSort}
          activeSortKey={sortKey}
        >
        Title
        </Sort>
      </span>
      <span style={smallColumn}>
        <Sort
          sortKey={'DATE'}
          onSort={onSort}
          activeSortKey={sortKey}
        >
        Date
        </Sort>
      </span>
      <span style={smallColumn}>
        <Sort
          sortKey={'AUTHOR'}
          onSort={onSort}
          activeSortKey={sortKey}
        >
        Author
        </Sort>
      </span>
      <span style={smallColumn}>
        <Sort
          sortKey={'COMMENTS'}
          onSort={onSort}
          activeSortKey={sortKey}
        >
        Comments
        </Sort>
      </span>
      <span style={smallColumn}>
        <Sort
          sortKey={'POINTS'}
          onSort={onSort}
          activeSortKey={sortKey}
        >
        Points
        </Sort>
      </span>
      <span style={smallColumn}>
        Archive
      </span>
      </div>
      { reverseSortedList.map(item => 
        <div key={item.objectID} className="table-row">
          <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={smallColumn}>{item.created_at}</span>
          <span style={smallColumn}>{item.author}</span>
          <span style={smallColumn}>{item.num_comments}</span>
          <span style={smallColumn}>{item.points}</span>
          <span style={smallColumn}>
            <Button onClick={() => onDismiss(item.objectID)}>
              Dismiss
            </Button>
          </span>
        </div>
      )}
    </div>


    // New old table component before adding the Sorting feature to it
    /*<div className="table">
      { list.map(item => 
        <div key={item.objectID} className="table-row">
          <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={smallColumn}>{item.created_at}</span>
          <span style={smallColumn}>{item.author}</span>
          <span style={smallColumn}>{item.num_comments}</span>
          <span style={smallColumn}>{item.points}</span>
          <span style={smallColumn}>
            <Button onClick={() => onDismiss(item.objectID)}>
              Dismiss
            </Button>
          </span>
        </div>
      )}
    </div>*/

/*
 ); //<-- this would be commented out if there was no scoped return/const in the above table const
} //<-- Same for this, it would be commented out b./c there would be no need for an object containing a return*/


//original table class kept in state to see how an in-state class works vs a stateless one (above)
//Keep in mind all this is doing is removing the render and this.props
/*class Table extends Component {
  render() {
    const {list, pattern, onDismiss} = this.props;
    return (
      <div>
        { list.filter(isSearched(pattern)).map(item => 
          <div key={item.objectID}>
            <span>
              <a href={item.url}>{item.title}</a>
            </span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <span>
              <Button onClick={() => onDismiss(item.objectID)}>
                Dismiss
              </Button>
            </span>
          </div>
        )}
      </div>
    );
  }
}*/

const Sort = ({ 
  sortKey, 
  activeSortKey,
  onSort, 
  isSortReverse,
  children 
}) => {

  const sortClass = classNames(
    'button-inline',
    {'button-active': sortKey === activeSortKey }
  );

  const filterClass = classNames(
    {'fa fa-arrow-up': sortKey === activeSortKey },
    {'fa-arrow-down': sortKey === activeSortKey  && isSortReverse }
  );

  return (
    <Button 
      onClick={() => onSort(sortKey)}
      className={sortClass}
    >
      {children} <i className={ filterClass } ></i>
    </Button>
  );
}

// Pre-ClassName library inclusion way of sorting and assigning class:
/*const Sort = ({ 
  sortKey, 
  activeSortKey,
  onSort, 
  children 
}) => {

  const sortClass = ['button-inline'];

  if (sortKey === activeSortKey) {
    sortClass.push('button-active');
  }

  return (
    <Button 
      onClick={() => onSort(sortKey)}
      className={sortClass.join(' ')}
    >
      {children}
    </Button>
  );
}*/

const Button = ({
  onClick, 
  className = '', 
  children 
}) => // put the object{} in if you need to put in a return()
    <button 
      onClick={onClick}
      className={className}
      type="button"
    >
    {children}
    </button>
//Old Button classs hanging around to see pre-stateless functional components
  /*function Button(onClick, className = '', children) {
    // const {
    //   onClick,
    //   className = '', //This sets a default value if there is no classname
    //   children,
    // } = props;
    return (
      <button 
        onClick={onClick}
        className={className}
        type="button"
      >
      {children}
      </button>
    )
  }*/


const Loading = () => <div><i className="fa fa-spinner fa-pulse fa-5x"></i></div>

const withLoading = (Component) => ({isLoading, ...rest }) =>
  isLoading ? <Loading /> : <Component { ...rest } />

//older variation without using isLoading in th spread op:
//const withLoading = (Component) => (props) =>
//  props.isLoading ? <Loading /> : <Component { ...props } />

const ButtonWithLoading = withLoading(Button);

export default App;

export {
  Button,
  Search,
  Table,
};