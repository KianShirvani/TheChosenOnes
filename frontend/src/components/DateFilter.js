import React from 'react';


/**
 * Handles filtering of tasks by the date (deadline)
 * @param {string} date the current date
 * @param {Function} setDate function to update the selected date 
 * @returns {JSX.Element} The DateFilter component
 */
const DateFilter = ({ date, setDate }) => {

  /**
   * Handles date selection
   * @param {Event} e event trigger for user selecting date
   */
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <div className="filter-container">
      <label>Filter by Due Date</label>
      <input 
        type="date" 
        value={date} 
        onChange={handleDateChange} 
        className="filter-input" 
      />
    </div>
  );
};

export default DateFilter;