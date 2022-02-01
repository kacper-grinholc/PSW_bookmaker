import { connect } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import { eventListAction, addEventAction, deleteEventAction, editEventAction } from "./EventActions";
import getData from "../OthersFunctions/getData";
import { AdminEvent } from "../AdminMenu/AdminEvent";
import usingMqtt from "../mqtt/mqtt";
import { togglemode } from "../OthersFunctions/cssmode";

const EventList = ({ events, isEventLoaded, eventListAction, addEventAction, editEventAction, deleteEventAction, query }, props) => {

    useEffect(() => {
        getData(false, eventListAction, query)
        usingMqtt({
            "EVENT_ADDED": addEventAction,
            "EVENT_EDITED": editEventAction,
            "EVENT_DELETED": deleteEventAction
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [filter, setfilter] = useState(query)

    const handlefilterChange = (event) => {
        isEventLoaded = false
        setfilter((event.target.value));
    }


    const calculateodds = (odd1, odd2) => {
        const odd = (1 / (parseFloat(odd1) / (parseFloat(odd1) + parseFloat(odd2))))
        return odd.toFixed(2);
    }
    
    const searchQuery = (filter) => {
        if (filter !== undefined){
            window.location.replace(`http://localhost:3000/events?query=${filter}`);
        }
    }

    const queryResult = (query) => {
        if (query !== undefined && query !== null){
            return(
                <h3>Znaleziono wyniki dla: {query}</h3>
            )
        }
    }

    return (
        <div className="Karta">
            <h1 className={togglemode()}>Lista wydarzeń</h1>
            {queryResult(query)}
            <div className="Wyniki">
            <div><input type="text" onChange={handlefilterChange}/></div>
            <button onClick={() => searchQuery(filter)}>Szukaj {filter}</button>
                {events
                .sort((firstItem, secondItem) =>
                (firstItem.id > secondItem.id) ? -1:1)
                .sort((firstItem, secondItem) =>
                (firstItem.eventstatus > secondItem.eventstatus) ? 1:-1)
                .map(event => {
                    return (
                        <div className={"Item" + togglemode()} key={event.id}>
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

const mapStateToProps = (state, props) => {
    return {
        events: state.events.events,
        isEventLoaded: state.events.dataLoaded,
        query: new URLSearchParams(props.location.search).get("query"),
    };
}

const mapDispatchToProps = {
    eventListAction,
    addEventAction,
    editEventAction,
    deleteEventAction
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EventList));