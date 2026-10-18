import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import axios from 'axios';

jest.mock('axios');

test('renders weather app heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /weather app/i })).toBeInTheDocument();
});

test.each([
  ['Clear', 'text-black'],
  ['Rain', 'text-white'],
])('uses %s weather text color', async (condition, expectedTextColor) => {
  axios.mockResolvedValueOnce({
    data: {
      weather: [{ main: condition, description: condition.toLowerCase() }],
      main: { temp: 293.15 },
      name: 'London',
    },
  });
  axios.get.mockResolvedValueOnce({ data: { query: { pages: {} } } });

  render(<App />);
  fireEvent.change(screen.getByLabelText(/city name/i), { target: { value: 'London' } });
  fireEvent.click(screen.getByRole('button', { name: /get weather/i }));

  expect(await screen.findByText(condition, { exact: true })).toHaveClass(expectedTextColor);
  expect(screen.getByText(/^Weather\s*:/)).toHaveClass(expectedTextColor);
});
