import { render, screen, fireEvent, waitFor,userEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';  // Add this import
import AdminDashboard from '../components/AdminDashboard';
import '@testing-library/jest-dom';

describe('AdminDashboard', () => {

  // Wrap each test with BrowserRouter
  const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

  it('renders Admin Dashboard title', () => {
    renderWithRouter(<AdminDashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders task statistics correctly', () => {
    renderWithRouter(<AdminDashboard />);
    expect(screen.queryAllByText('To-Do').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Done').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Completion Rate').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Upcoming Due').length).toBeGreaterThan(0);
  });

  it('opens the add task modal when the "+ Add Task" button is clicked', () => {
    renderWithRouter(<AdminDashboard />);
    const addButton = screen.getByText('+ Add Task');
    fireEvent.click(addButton);
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('adds a new task when the form is filled and submitted', async () => {
    renderWithRouter(<AdminDashboard />);
    fireEvent.click(screen.getByText('+ Add Task'));
    const titleInput = screen.getByPlaceholderText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.click(screen.getByText('Add Task'));
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

 
  

  it('deletes a task when the delete button is clicked', async () => {
    renderWithRouter(<AdminDashboard />);
    const deleteButtons = screen.getAllByTestId('delete-button');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText('Design UI')).not.toBeInTheDocument();
    });
  });



});
