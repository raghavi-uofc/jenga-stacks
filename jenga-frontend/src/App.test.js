import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./Router', () => () => <div data-testid="app-router" />);

test('renders AppRouter component inside App', () => {
  render(<App />);
  expect(screen.getByTestId('app-router')).toBeInTheDocument();
});
