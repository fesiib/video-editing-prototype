import reducers from '../reducers';
import {createStore, applyMiddleware, compose} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';

import {persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createStateSyncMiddleware, initStateWithPrevTab } from 'redux-state-sync';

const persistConfig = {
    key: 'root',
    storage
}

const reduxStateSyncConfig = {
    blacklist: ["persist/PERSIST", "persist/REHYDRATE"],
};

const enhancedReducer = persistReducer(persistConfig, reducers);

export default function configureStore() {
    const store = createStore(
        enhancedReducer,
        undefined,
        composeWithDevTools(
            applyMiddleware(createStateSyncMiddleware(reduxStateSyncConfig))
        ),
    );
    initStateWithPrevTab(store);
    const persistor = persistStore(store);
    return {store, persistor};
} 