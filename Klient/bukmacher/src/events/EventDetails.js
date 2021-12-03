import { useEffect} from "react";
import { connect } from "react-redux";
import { getEventList } from "./EventActions";

const EventDetails = ({ events, getEventList, loading} ,props) => {
    useEffect(() => {
        getEventList();
    }, [getEventList]);

    return (
        <div>
            <h3>Events list</h3>
            {loading ?
                <div>Trwa poberanie eventów</div>
                :
                events.map(event => {
                    return (
                        <div key={event.id}>{event.kind}</div>
                        )})
            }
        </div>
    )
};

const mapStateToProps = (state) => {
    return {
        events: state.events.events,
        loading: state.events.loading
    };
}

const mapDispatchToProps = {
    getEventList
}


export default connect(mapStateToProps, mapDispatchToProps)(EventDetails);
