import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';

import App from "./App";
import ExperimentsPage from './pages/ExperimentsPage';
import ResetPage from './pages/ResetPage';

class Routes extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={App}/>
                    <Route exact path="/reset" component={ResetPage}/>
                    <Route exact path="/experiments" component={ExperimentsPage}/>
                </Switch>
            </Router>
        )
    }
}

export default Routes;