import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/welcome to the chosen ones/i);
  expect(headingElement).toBeInTheDocument();
});