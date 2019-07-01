import React from "react";
import TestRender from  "react-test-renderer";
import StoreContext from "storeon/react/context"
import App from "../components/App";
import store from "../store/store";

test('renders without crashing', () => {
  TestRender.create(
    <StoreContext.Provider value={store}><App /></StoreContext.Provider>
  )
});

