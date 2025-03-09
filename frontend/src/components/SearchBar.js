import React, { useState } from 'react';
import DateFilter from './DateFilter';
import UserFilter from './UserFilter';
import PriorityFilter from './PriorityFilter';
import StatusFilter from './StatusFilter';
import '../css/SearchBar.css';

const SearchBar = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [users, setUsers] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [status, setStatus] = useState([]);
  
  const resetFilters = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setUsers([]);
    setPriorities([]);
    setStatus([]);
  };

  return (
    <div className="search-bar">
      <DateFilter date={date} setDate={setDate} />
      <UserFilter users={users} setUsers={setUsers} />
      <PriorityFilter priorities={priorities} setPriorities={setPriorities} />
      <StatusFilter status={status} setStatus={setStatus} />
      <button onClick={resetFilters} className="clear-button">Clear Filtering</button>
    </div>
  );
};

export default SearchBar;
