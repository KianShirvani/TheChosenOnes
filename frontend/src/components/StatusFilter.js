import React, { useState, useRef, useEffect } from 'react';

// UPDATE: Removed the unused hardcoded statusList

const StatusFilter = ({ status, setStatus }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // UPDATE: Ensure that status is always an array.
  const selectedStatus = Array.isArray(status) ? status : [];

  /**
   * Handles the event for checkbox selection of status
   */
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    console.log("Status checkbox changed:", value, e.target.checked); // UPDATE: Debug log
    // UPDATE: Compute new selected statuses and pass the new array directly
    const newSelected = e.target.checked
      ? [...selectedStatus, value]
      : selectedStatus.filter(s => s !== value);
    setStatus(newSelected);
  };

  // UPDATE: Fetch statuses dynamically from backend
  const [statusOptions, setStatusOptions] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/statuses`)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched statuses:", data.statuses); // UPDATE: Debug log
        setStatusOptions(data.statuses);
      })
      .catch(error => console.error("Error fetching statuses:", error));
  }, []);
  
  // UPDATE: Close dropdown when clicking outside using mousedown for better UX
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
  
    document.addEventListener("mousedown", handleClickOutside); // UPDATE: Use mousedown
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="filter-container">
      <label>Filter by Status</label>
      <input 
        ref={inputRef}
        type="text"
        value={selectedStatus.join(", ") || "All"}
        readOnly
        onClick={() => setDropdownVisible(!dropdownVisible)}
        className="filter-input"
      />
      {dropdownVisible && (
        <div className="dropdown" ref={dropdownRef}>
          {statusOptions.length > 0 ? (
            statusOptions.map((stat) => (
              <label key={stat}>
                <input 
                  type="checkbox" 
                  value={stat} 
                  onChange={handleCheckboxChange} 
                  checked={selectedStatus.includes(stat)}
                />
                {stat}
              </label>
            ))
          ) : (
            <p className="no-options">No statuses available</p> // UPDATE: Fallback display
          )}
        </div>
      )}
    </div>
  );
};

export default StatusFilter;