import { connect } from "react-redux";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { eventListAction } from "./EventActions";
import getData from "../Home/getData";
import { AdminEvent } from "../Home/AdminEvent";

const EventList = ({ events, isEventLoaded, eventListAction }, props) => {

    useEffect(() => {
        getData(isEventLoaded, eventListAction)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calculateodds = (odd1, odd2) => {
        const odd = (1/(parseFloat(odd1)/(parseFloat(odd1) + parseFloat(odd2))))
        return odd.toFixed(2);
    }
    return (
        <div className="Karta">
            <h1>Lista wydarzeń</h1>
            <div className="Wyniki">
                {events.map(event => {
                    return (
                        <div className="Item" key={event.id}>
                            <div>Dyscyplina: {event.kind}</div>
                            <Link className="LinkBet" to={`/bet/${event.id}`}>
                                <div>Drużyna1: {event.team1} Kurs: {calculateodds(event.bett1, event.bett2)}</div>
                            </Link>
                            <Link className="LinkBet" to={`/bet/${event.id}`}>
                                <div>Drużyna2: {event.team2} Kurs: {calculateodds(event.bett2, event.bett1)}</div>
                            </Link>
                            <div>Zwycięzca: {event.winner}</div>
                            <div>Status: {event.eventstatus}</div>
                            {AdminEvent(event)}
                        </div>
                    )
                })
                }
            </div>
        </div>
    )
};

const mapStateToProps = (state) => {
    return {
        events: state.events.events,
        isEventLoaded: state.events.dataLoaded,
    };
}

const mapDispatchToProps = {
    eventListAction,
}


export default connect(mapStateToProps, mapDispatchToProps)(EventList);