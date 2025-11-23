import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '../AuthPage';

// Mock LoginForm and RegisterForm components simply by showing which one is rendered
jest.mock('../LoginForm', () => ({ switchToRegister }) => (
  <div>
    <span>LoginForm</span>
    <button onClick={switchToRegister}>Go to Register</button>
  </div>
));
jest.mock('../RegisterForm', () => ({ switchToLogin }) => (
  <div>
    <span>RegisterForm</span>
    <button onClick={switchToLogin}>Go to Login</button>
  </div>
));

test('shows LoginForm by default', () => {
  render(<AuthPage />);
  expect(screen.getByText('LoginForm')).toBeInTheDocument();
  expect(screen.queryByText('RegisterForm')).not.toBeInTheDocument();
});

test('switches to RegisterForm when Go to Register clicked', () => {
  render(<AuthPage />);
  fireEvent.click(screen.getByText('Go to Register'));
  expect(screen.getByText('RegisterForm')).toBeInTheDocument();
  expect(screen.queryByText('LoginForm')).not.toBeInTheDocument();
});

test('switches back to LoginForm when Go to Login clicked', () => {
  render(<AuthPage />);
  fireEvent.click(screen.getByText('Go to Register'));
  fireEvent.click(screen.getByText('Go to Login'));
  expect(screen.getByText('LoginForm')).toBeInTheDocument();
});
