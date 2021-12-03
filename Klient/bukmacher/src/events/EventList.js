import { useEffect} from "react";
import { connect } from "react-redux";
import { getEventList} from "./EventActions";

const EventList = ({ events, getEventList, loading} ,props) => {
    useEffect(() => {
        getEventList();
    }, [getEventList]);

    return (
        <div>
            {loading ?
                <div>Trwa poberanie eventów</div>
                :
                events.map(event => {
                    return (
                        <table key={event.id}>
                            <tbody>
                                <tr>
                                    <td>{event.kind}</td>
                                    <td>{event.team1}</td>
                                    <td>{event.team2}</td>
                                    <td>{event.betteam1}</td>
                                    <td>{event.betteam2}</td>
                                    <td>{event.winner}</td>
                                    <td>{event.betstatus}</td>
                                </tr>
                            </tbody>
                        </table>
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


export default connect(mapStateToProps, mapDispatchToProps)(EventList);
