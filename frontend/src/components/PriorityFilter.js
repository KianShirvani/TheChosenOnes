import React, { useState, useRef, useEffect } from 'react';

/* A pseudo list for priority for temporary frontend UI */
const prioritiesList = ["All", "High", "Medium", "Low"];


/**
 * PriorityFilter component to filter tasks by the priority
 * @param {Array} priorities The priority list
 * @param {Function} setPriorities The function to update the selected priorities 
 * @returns {JSX.Element} The PriorityFilter component with checkbox
 */
const PriorityFilter = ({ priorities, setPriorities }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null); // Reference for the input textbox
  
  /**
   * Handles the event for checkbox selection
   * @param {*} e change event that triggered by checkbox selection
   * @returns {void}
   */
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    setPriorities(prev => 
      e.target.checked ? [...prev, value] : prev.filter(priority => priority !== value)
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
      <label>Filter by Priority</label>
      <input 
        ref={inputRef}  // Add reference to input box
        type="text" 
        value={priorities.join(", ") || "All"} 
        readOnly
        onClick={() => setDropdownVisible(!dropdownVisible)} 
        className="filter-input" 
      />
      {dropdownVisible && (
        <div className="dropdown" ref={dropdownRef}>
          {prioritiesList.map((priority) => (
            <label key={priority}>
              <input 
                type="checkbox" 
                value={priority} 
                onChange={handleCheckboxChange} 
                checked={priorities.includes(priority)} 
              />
              {priority}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityFilter;