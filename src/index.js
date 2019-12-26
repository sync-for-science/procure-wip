import React from 'react';
import ReactDOM from 'react-dom';
import StoreContext from 'storeon/react/context'
//import 'bootstrap/dist/css/bootstrap.min.css';
//moved to index.html to avoid flash of unstyled content when using dev server
import store from "./store/store";
import App from './components/App';
import * as serviceWorker from './serviceWorker';

store.dispatch("config/load", "review");

ReactDOM.render(
	<StoreContext.Provider value={store}><App /></StoreContext.Provider>,
	document.getElementById('root')
);

serviceWorker.register();