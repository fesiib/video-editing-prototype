import React from 'react';
import ReactDOM from 'react-dom';

import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import configureStore from './config/store';
import Routes from './Routes';

import './index.css';
import reportWebVitals from './reportWebVitals';

// import {db, storage, auth, analytics, firebaseApp, firebase} from './services/firebase';

const {store, persistor} = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Routes/>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
