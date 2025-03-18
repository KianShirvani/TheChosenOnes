import React, { useState, useEffect } from 'react';

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

  // Fetch available due dates from the backend
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/dates`)
      .then(response => response.json())
      .then(data => setAvailableDates(data.dates))
      .catch(error => console.error("Error fetching due dates:", error));
  }, []);

  return (
    <div className="filter-container">
      <label>Filter by Due Date</label>
      <select value={date} onChange={handleDateChange} className="filter-input">
        <option value="">All</option>
        {availableDates.map(rawDate => {
          // CHANGE: Format the date for both display and value so it matches task.dueDate
          const formattedDate = new Date(rawDate).toISOString().split("T")[0];
          return (
            <option key={rawDate} value={formattedDate}>
              {formattedDate}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default DateFilter;
