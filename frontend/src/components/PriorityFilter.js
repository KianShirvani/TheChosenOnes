import React, { useState, useRef, useEffect } from 'react';

const PriorityFilter = ({ priorities, setPriorities }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // UPDATE: Ensure that priorities is always an array.
  const selectedPriorities = Array.isArray(priorities) ? priorities : [];

  /**
   * Handles the event for checkbox selection
   */
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    console.log("Priority checkbox changed:", value, e.target.checked); // UPDATE: Debug log
    // UPDATE: Compute new selected priorities and pass the new array directly
    const newSelected = e.target.checked
      ? [...selectedPriorities, value]
      : selectedPriorities.filter(p => p !== value);
    setPriorities(newSelected);
  };

  // UPDATE: Fetch priorities from the backend
  const [priorityOptions, setPriorityOptions] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/priorities`)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched priorities:", data.priorities); // UPDATE: Debug log
        setPriorityOptions(Object.entries(data.priorities));
      })
      .catch(error => console.error("Error fetching priorities:", error));
  }, []);

  // UPDATE: Close dropdown when clicking outside using "mousedown"
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        inputRef.current && 
        !inputRef.current.contains(event.target)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // UPDATE: Use "mousedown"
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // UPDATE: Use "mousedown"
    };
  }, []);

  // UPDATE: Map the selected keys to their labels for display
  const displaySelected = selectedPriorities.map(val => {
    const matchingOption = priorityOptions.find(([key, label]) => key === val);
    return matchingOption ? matchingOption[1] : val;
  });

  return (
    <div className="filter-container">
      <label>Filter by Priority</label>
      <input 
        ref={inputRef}
        type="text"
        value={displaySelected.join(", ") || "All"}
        readOnly
        onClick={() => setDropdownVisible(!dropdownVisible)}
        className="filter-input"
      />
      {dropdownVisible && (
        <div className="dropdown" ref={dropdownRef}>
          {priorityOptions.map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                value={key}
                onChange={handleCheckboxChange}
                checked={selectedPriorities.includes(key)}
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriorityFilter;