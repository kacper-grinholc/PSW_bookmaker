import './App.css';
import EventForm from './events/EventForm';
import EventList from './events/EventList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <EventList />
        <EventForm />
      </header>
    </div>
  );
}

export default App;
