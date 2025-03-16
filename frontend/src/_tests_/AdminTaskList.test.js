import React from "react";
import AdminTaskList from "../components/AdminTaskList";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockOnEditTask = jest.fn();
const mockOnDeleteTask = jest.fn();
const mockOnToggleLock = jest.fn();
const mockOnMoveTask = jest.fn();

const sampleTasks = [
  { id: "1", title: "Task A", description: "Desc A", priority: 5, dueDate: "2025-02-10", locked: false },
  { id: "2", title: "Task B", description: "Desc B", priority: 3, dueDate: "2025-02-15", locked: true },
];

const renderAdminTaskList = (tasks = sampleTasks, title = "To-Do") => {
  render(
    <AdminTaskList
      title={title}
      tasks={tasks}
      onEditTask={mockOnEditTask}
      onDeleteTask={mockOnDeleteTask}
      onMoveTask={mockOnMoveTask}
      onToggleLock={mockOnToggleLock}
    />
  );
};

const getButtons = (testId) => screen.getAllByTestId(testId);

describe("AdminTaskList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders tasks correctly", () => {
    renderAdminTaskList();

    sampleTasks.forEach(({ title, description }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  test("locks and unlocks a task", async () => {
    renderAdminTaskList();
    const lockButtons = getButtons("lock-button");

    await userEvent.click(lockButtons[0]); 
    expect(mockOnToggleLock).toHaveBeenCalledWith("1");

    await userEvent.click(lockButtons[1]); 
    expect(mockOnToggleLock).toHaveBeenCalledWith("2");
  });

  test("prevents editing/deleting locked tasks", async () => {
    renderAdminTaskList();
    const editButtons = getButtons("edit-button");
    const deleteButtons = getButtons("delete-button");

    await userEvent.click(editButtons[1]);
    await userEvent.click(deleteButtons[1]);

    expect(mockOnEditTask).not.toHaveBeenCalled();
    expect(mockOnDeleteTask).not.toHaveBeenCalled();
  });

  test("moves task left and right", async () => {
    const modifiableTasks = sampleTasks.map((task) => ({ ...task, locked: false }));
    renderAdminTaskList(modifiableTasks, "In Progress");

    const moveLeftButtons = getButtons("move-left-button");
    const moveRightButtons = getButtons("move-right-button");

    await userEvent.click(moveLeftButtons[0]);
    expect(mockOnMoveTask).toHaveBeenCalledWith(modifiableTasks[0], "left");

    await userEvent.click(moveRightButtons[0]);
    expect(mockOnMoveTask).toHaveBeenCalledWith(modifiableTasks[0], "right");
  });
});
