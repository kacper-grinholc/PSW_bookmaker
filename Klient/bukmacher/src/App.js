import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { useEffect, useState } from "react";
import EventForm from './Events/EventForm';
import EventList from './Events/EventList';
import AccountLogin from './Accounts/AccountLogin';
import Home from './Home/Home';
import AccountRegister from './Accounts/AccountRegister';
import CreateBet from './Bets/CreateBet';
import UserBets from './Accounts/UserBets';
import AccountLogout from './Accounts/AccountLogout';
import { LogMenu } from './AdminMenu/LogMenu';
import { LogAdmin } from './AdminMenu/LogAdmin';
import UserForm from './Accounts/UserForm';
import AddMoney from './Bets/AddMoney';
import Chat from './Chat/Chat';
import { connectToFinished } from './mqtt/mqttFinished'
import Cookies from 'js-cookie'
import { togglemode } from './OthersFunctions/cssmode'
import UserOperations from './Accounts/UserOperations';

function App() {

  useEffect(() => {
    connectToFinished()
    togglemode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [toggle, setToggle] = useState(Cookies.get("mode"));

  const triggerToggle = () => {
    if (toggle === "dark"){
      setToggle("light")
      Cookies.remove("mode")
      Cookies.set("mode", "light", { expires: 1 })
      window.location.reload(true);
    }
    else {
      setToggle("dark")
      Cookies.remove("mode")
      Cookies.set("mode", "dark", { expires: 1 })
      window.location.reload(true);
    }
  }

  const ifchecked = () => {
    if (toggle === "dark"){
      return "checked"
    }
    else{

    }
  } 

  return (
    <Router>
      <div className={"App" + togglemode()}>
      <nav className={"navbar"+ togglemode()}>
          <ul className="Lista">
          <input className = "imputmode" defaultChecked={ifchecked()} type="checkbox" onClick={() => triggerToggle()} />
            <li>
              <Link className={"Link"+ togglemode()} to="/">Strona główna</Link>
            </li>
            <li>
              <Link className={"Link"+ togglemode()} to="/events">Wydarzenia</Link>
            </li>
            <li>
              <Link className={"Link"+ togglemode()} to="/chat">Chat</Link>
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
          <Route exact path="/useroperations/">
            <UserOperations />
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
          <Route path="/charge">
            <AddMoney />
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
          <Route path ="/chat">
            <Chat />
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
