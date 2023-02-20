import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from 'react-router-dom';

import App from "./App";
import ExperimentsPage from './pages/ExperimentsPage';
import InBrowser from './pages/InBrowser';
import ResetPage from './pages/ResetPage';

class Routes extends React.Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={App}/>
                    <Route exact path="/reset" component={ResetPage}/>
                    <Route exact path="/experiments" component={ExperimentsPage}/>
                    <Route exact path="/ffmpeg" component={InBrowser}/>
                </Switch>
            </Router>
        )
    }
}

export default Routes;