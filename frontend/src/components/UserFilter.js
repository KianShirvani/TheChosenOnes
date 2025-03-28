import React, { useState, useRef, useEffect } from 'react';

const UserFilter = ({ users, setUsers }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // CHANGE: Ensure that users is always an array.
  const selectedUsers = Array.isArray(users) ? users : [];

  // Fetch available users from the backend
  const [availableUsers, setAvailableUsers] = useState([]);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched users:", data.users);
        setAvailableUsers(data.users);
      })
      .catch(error => console.error("Error fetching users:", error));
  }, []);

  // CHANGE: When user checkbox changes, use user id (as string) instead of display name.
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    console.log("User checkbox changed:", value, e.target.checked);
    const newSelected = e.target.checked
      ? [...selectedUsers, value]
      : selectedUsers.filter(u => u !== value);
    setUsers(newSelected);
  };

  // CHANGE: Format the display value using availableUsers to map selected user IDs to display names.
  const displaySelected = selectedUsers.map(id => {
    const found = availableUsers.find(u => String(u.user_id) === id);
    return found ? found.display_name : id;
  });

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="filter-container">
      <label>Filter by User</label>
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
          {availableUsers.map(user => (
            <label key={user.user_id}>
              <input
                type="checkbox"
                value={String(user.user_id)} // CHANGE: Use user id as string
                onChange={handleCheckboxChange}
                checked={selectedUsers.includes(String(user.user_id))} // CHANGE: Compare using user id
              />
              {user.display_name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFilter;
