import React from 'react';
// import ReactDOM from 'react-dom';
import TestRender from  'react-test-renderer';
import { act } from 'react-dom/test-utils';
import App from '../components/App';
import Store from "../store/store";

test('renders without crashing', () => {
    TestRender.create(
      <Store.ContextProvider><App /></Store.ContextProvider>
    )
});
