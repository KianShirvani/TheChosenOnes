import React from 'react';

// FILTER BY ID: TaskIDFilter component for filtering tasks by task ID
const TaskIDFilter = ({ taskId, setTaskId }) => {
  // FILTER BY ID: Handle input change and update the filter state
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only numeric input or empty string
    if (/^\d*$/.test(value)) {
      setTaskId(value); // Update the parent filter state directly
    }
  };

  return (
    <div className="filter-container">
      <label>Filter by Task ID</label>
      <input
        type="text"
        value={taskId || ''} // FILTER BY ID: Use taskId prop directly as the controlled value
        onChange={handleInputChange}
        placeholder="Enter Task ID (e.g., 1)"
        className="filter-input"
      />
    </div>
  );
};

export default TaskIDFilter;