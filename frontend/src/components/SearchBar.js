import React, { useState } from 'react';
import DateFilter from './DateFilter';
import UserFilter from './UserFilter';
import PriorityFilter from './PriorityFilter';
import StatusFilter from './StatusFilter';
import TaskIDFilter from './TaskIDFilter';
import '../css/SearchBar.css';

const SearchBar = ({ filters = {}, setFilters = () => {} }) => {
  const resetFilters = () => {
    setFilters({ date: "", users: [], priorities: [], status: [], taskId: "" });
  };


  return (
    <div className="search-bar">
      <DateFilter 
        date={filters.date} 
        setDate={(date) => setFilters(prev => ({ ...prev, date }))}
      />
      <UserFilter 
        users={filters.users} 
        setUsers={(users) => setFilters(prev => ({ ...prev, users }))}
      />
      <PriorityFilter 
        priorities={filters.priorities} 
        setPriorities={(priorities) => setFilters(prev => ({ ...prev, priorities }))}
      />
      <StatusFilter 
        status={filters.status} 
        setStatus={(status) => setFilters(prev => ({ ...prev, status }))}
      />
      <TaskIDFilter 
        taskId={filters.taskId} 
        setTaskId={(taskId) => setFilters(prev => ({ ...prev, taskId }))}
      />
      <button onClick={resetFilters} className="clear-button">Clear Filtering</button>
    </div>
  );
};

export default SearchBar;
