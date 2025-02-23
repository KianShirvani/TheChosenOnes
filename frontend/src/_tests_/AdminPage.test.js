import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../components/AdminDashboard';
import '@testing-library/jest-dom';

describe('AdminDashboard', () => {

  it('renders Admin Dashboard title', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders task statistics correctly', () => {
    render(<AdminDashboard />);
    expect(screen.queryAllByText('To-Do').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Done').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Completion Rate').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Upcoming Due').length).toBeGreaterThan(0);
  });

  it('opens the add task modal when the "+ Add Task" button is clicked', () => {
    render(<AdminDashboard />);
    const addButton = screen.getByText('+ Add Task');
    fireEvent.click(addButton);
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('adds a new task when the form is filled and submitted', async () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('+ Add Task'));
    const titleInput = screen.getByPlaceholderText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.click(screen.getByText('Add Task'));
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  it('moves a task from To-Do to In Progress when the move button is clicked', async () => {
    render(<AdminDashboard />);
    const moveButtons = screen.getAllByTestId('move-right-button');
    fireEvent.click(moveButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    });
  });

  it('deletes a task when the delete button is clicked', async () => {
    render(<AdminDashboard />);
    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Design UI')).not.toBeInTheDocument();
    });
  });

  it('opens the edit task modal when edit button is clicked', async () => {
    render(<AdminDashboard />);
    const editButtons = screen.getAllByTestId('edit-button');
    fireEvent.click(editButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });
  });

});
