import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import EventForm from './Events/EventForm';
import EventList from './Events/EventList';
import AccountLogin from './Accounts/AccountLogin';
import Home from './Home/Home';
import AccountRegister from './Accounts/AccountRegister';
import CreateBet from './Bets/CreateBet';
import UserBets from './Bets/UserBets';
import AccountLogout from './Accounts/AccountLogout';
import { LogMenu } from './Home/LogMenu';
import { LogAdmin } from './Home/LogAdmin';
import UserForm from './Accounts/UserForm';

function App() {

  return (
    <Router>
      <div className="App">
      <nav>
          <ul className="Lista">
            <li>
              <Link className="Link" to="/">Strona główna</Link>
            </li>
            <li>
              <Link className="Link" to="/events">Wydarzenia</Link>
            </li>
            {LogAdmin()}
            {LogMenu()}

          </ul>
        </nav>
        <Switch>
          <Route exact path="/events/edit/:id">
            <EventForm />
          </Route>
          <Route path="/events/add">
            <EventForm />
          </Route>
          <Route exact path="/userbets/">
            <UserBets />
          </Route>
          <Route exact path="/bet/:id">
            <CreateBet />
          </Route>
          <Route exact path="/user/edit/:id">
            <UserForm />
          </Route>
          <Route path="/events">
            <EventList />
          </Route>
          <Route path="/register">
            <AccountRegister />
          </Route>
          <Route path="/login">
            <AccountLogin />
          </Route>
          <Route path ="/logout">
            <AccountLogout />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
