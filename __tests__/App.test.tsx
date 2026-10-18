/**
 * @format
 */

import React from 'react';

jest.mock('@notifee/react-native', () => require('@notifee/react-native/jest/mock'));
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
