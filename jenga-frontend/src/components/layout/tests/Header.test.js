jest.mock("react-markdown", () => () => <div />);
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';
import { AuthContext } from '../../../Router';

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  Link: ({ to, ...props }) => <a href={to} {...props} />,
}));

// Mock AuthContext
const userMock = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', role: 'regular' };
const logoutMock = jest.fn();


function renderHeader(user = userMock) {
  return render(
    <AuthContext.Provider value={{ user, logout: logoutMock }}>
      <Header />
    </AuthContext.Provider>
  );
}

test('renders header with user initials', () => {
  renderHeader();
  expect(screen.getByText('JengaStacks / Dashboard')).toBeInTheDocument();
  expect(screen.getByText('J')).toBeInTheDocument(); // User initials
});

test('shows profile dropdown and navigates to profile', () => {
  renderHeader();
  fireEvent.click(screen.getByText('J'));
  expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  expect(screen.getByText('(jane@example.com)')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Profile'));
  expect(mockedNavigate).toHaveBeenCalledWith('/profile');
});

test('logout navigates to /auth and triggers logout', () => {
  renderHeader();
  fireEvent.click(screen.getByText('J'));
  fireEvent.click(screen.getByText('Logout'));
  expect(logoutMock).toHaveBeenCalled();
  expect(mockedNavigate).toHaveBeenCalledWith('/auth');
});

test('shows New Project button if not admin', () => {
  renderHeader();
  expect(screen.getByText('New Project')).toBeInTheDocument();
});

test('does not show New Project button if user is admin', () => {
  renderHeader({ ...userMock, role: 'admin' });
  expect(screen.queryByText('New Project')).not.toBeInTheDocument();
});
