import React, { useState, useRef, useEffect } from 'react';

/* Subject to change, only below demo list, will connect to backend database in the future */
const usersList = ["All", "Rheiley", "Liz", "Ivy", "Kian", "Nade"];

/**
 * Filter task by the assigned users
 * @param {Array} users the array of a list of users in the database
 * @param {Function} setUsers function to update the selected user 
 * @returns 
 */

const UserFilter = ({ users, setUsers }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null); // Reference for the input textbox
  
  /**
   * Handles change of event for checkbox selection of assigned users
   * @param {Event} e event for user to check the checkbox 
   * @returns {void}
   */
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    setUsers(prev =>
      e.target.checked ? [...prev, value] : prev.filter(user => user !== value)
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
      <label>Filter by User</label>
      <input 
        ref={inputRef}  // Add reference to input box
        type="text" 
        value={users.join(", ") || "All"} 
        readOnly
        onClick={() => setDropdownVisible(!dropdownVisible)} 
        className="filter-input" 
      />
      {dropdownVisible && (
        <div className="dropdown" ref={dropdownRef}>
          {usersList.map((user) => (
            <label key={user}>
              <input 
                type="checkbox" 
                value={user} 
                onChange={handleCheckboxChange} 
                checked={users.includes(user)} 
              />
              {user}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFilter;