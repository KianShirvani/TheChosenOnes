import React from "react";
import AdminTaskList from "../components/AdminTaskList";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockOnEditTask = jest.fn();
const mockOnDeleteTask = jest.fn();
const mockOnToggleLock = jest.fn();
const mockOnMoveTask = jest.fn();

const sampleTasks = [
  { id: "1", title: "Task A", description: "Desc A", priority: "High", dueDate: "2025-02-10", locked: false },
  { id: "2", title: "Task B", description: "Desc B", priority: "Medium", dueDate: "2025-02-15", locked: true },
];

const renderAdminTaskList = () => {
  render(
    <AdminTaskList
      title="To-Do"
      tasks={sampleTasks}
      onEditTask={mockOnEditTask}
      onDeleteTask={mockOnDeleteTask}
      onMoveTask={mockOnMoveTask}
      onToggleLock={mockOnToggleLock}
    />
  );
};

describe("AdminTaskList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders tasks correctly", () => {
    renderAdminTaskList();

    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
    expect(screen.getByText("Desc A")).toBeInTheDocument();
    expect(screen.getByText("Desc B")).toBeInTheDocument();
  });

  test("locks and unlocks a task", async () => {
    renderAdminTaskList();

    const lockButtons = screen.getAllByTestId("lock-button");

    await userEvent.click(lockButtons[0]); // Lock first task
    expect(mockOnToggleLock).toHaveBeenCalledWith("1"); 

    await userEvent.click(lockButtons[1]); // Unlock second task
    expect(mockOnToggleLock).toHaveBeenCalledWith("2");
  });

  test("prevents editing/deleting locked tasks", async () => {
    renderAdminTaskList();

    const editButtons = screen.getAllByTestId("edit-button");
    const deleteButtons = screen.getAllByTestId("delete-button");

    await userEvent.click(editButtons[1]); // Try editing locked task
    expect(mockOnEditTask).not.toHaveBeenCalled();

    await userEvent.click(deleteButtons[1]); // Try deleting locked task
    expect(mockOnDeleteTask).not.toHaveBeenCalled();
  });

  test("moves task left and right", async () => {
    renderAdminTaskList();

    const moveLeftButtons = screen.getAllByTestId("move-left-button");
    const moveRightButtons = screen.getAllByTestId("move-right-button");

    await userEvent.click(moveLeftButtons[0]);
    expect(mockOnMoveTask).toHaveBeenCalledWith(sampleTasks[0], "left");

    await userEvent.click(moveRightButtons[0]);
    expect(mockOnMoveTask).toHaveBeenCalledWith(sampleTasks[0], "right");
  });
});
