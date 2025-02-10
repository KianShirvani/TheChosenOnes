import React from "react";
import { Draggable } from "react-beautiful-dnd";

const TaskCard = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={styles.card}
        >
          <h4>{task.title}</h4>
          <p>{task.description}</p>
        </div>
      )}
    </Draggable>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "5px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  },
};

export default TaskCard;
