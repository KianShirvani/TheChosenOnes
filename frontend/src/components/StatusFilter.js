import React, { useState, useRef, useEffect } from 'react';

/* Temporary list for all status as demo in frontend UI */
const statusList = ["All", "To-Do", "In Progress", "Done"];


/**
 * PriorityFilter component to filter tasks by the priority
 * @param {Array} status The status list
 * @param {Function} setStatus The function to update the selected status 
 * @returns {JSX.Element} The StatusFilter component with checkbox
 */
const StatusFilter = ({ status, setStatus }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null); // Reference for the input textbox
  
  /**
   * Handles the event for checkbox selection of status
   * @param {*} e change event that triggered by checkbox selection
   * @returns {void}
   */
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    setStatus(prev => 
      e.target.checked ? [...prev, value] : prev.filter(stat => stat !== value)
    );
  };

  // Close dropdown when clicking outside of both the dropdown and the input
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown only if the click is outside both the input and dropdown
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        inputRef.current && 
        !inputRef.current.contains(event.target)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="filter-container">
      <label>Filter by Status</label>
      <input 
        ref={inputRef}  // Add reference to input box
        type="text" 
        value={status.join(", ") || "All"} 
        readOnly
        onClick={() => setDropdownVisible(!dropdownVisible)} 
        className="filter-input" 
      />
      {dropdownVisible && (
        <div className="dropdown" ref={dropdownRef}>
          {statusList.map((stat) => (
            <label key={stat}>
              <input 
                type="checkbox" 
                value={stat} 
                onChange={handleCheckboxChange} 
                checked={status.includes(stat)} 
              />
              {stat}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusFilter;