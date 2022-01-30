import { Field, Form, Formik } from "formik"
import { useEffect } from "react";
import { addEventAction, eventListAction, editEventAction } from "./EventActions";
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import * as Yup from 'yup';
import axios from "axios";
import getData from "../Home/getData";
import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken';

const validateEvent = Yup.object({
    // name: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    // image: Yup.string("Nieprawidłowa wartość!").url("Musi być linkiem").required("Wymagane!"),
    // type: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    // eats: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
});

const EventForm = ({ isEventLoaded, eventListAction, addEventAction, event, editEventAction, maybeID }, props) => {

    useEffect(() => {
        getData(false, eventListAction)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    const addInitalBet = async (values, team) => {try {
        console.log("id", values[0].id, "team", team)
        const response = await axios.post('http://localhost:5000/bets', {
            userid: 0,
            eventId: values[0].id,
            betTeam: team,
            betAmount: 10,
            odd: 2.00,
        }, {
            headers: {
                "x-access-token": Cookies.get("token")
            }
        });
        if (response.status === 200){
            addEventAction(response.data);
        }
    } catch (ex) {
        console.log(ex)
    }
}
    const createEvent = async (values) => {
        try {
            const response = await axios.post('http://localhost:5000/events', values, {
                headers: {
                    "x-access-token": Cookies.get("token")
                }
            });
            if (response.status === 200){
                addEventAction(response.data);
                addInitalBet(response.data, values.team1)
                addInitalBet(response.data, values.team2)
            }
        } catch (ex) {
            console.log(ex)
        }
    }

    const editEvent = async (values) => {
        try {
            const response = await axios.put(`http://localhost:5000/events/${event.id}`, values, {
                headers: {
                    "x-access-token": Cookies.get("token")
                }
            });
            if (response.status === 200)
                editEventAction(response.data);
        } catch (ex) {
            console.log(ex)
        }
    }

    const handleSubmit = (values) => {
        if (maybeID === undefined) {
            createEvent(values)
        }
        else {
            editEvent(values)
        }
        alert("Wydarzenie" + alertForm(maybeID));
        window.location.reload(true);
    }

    const InitialValues = () => {
        if (maybeID === undefined) {
            return {
                kind: '',
                team1: '',
                team2: '',
                winner: 'None',
                eventStatus: 'W trakcie',
            }
        }
        else {
            return {
                kind: `${event.kind}`,
                team1: `${event.team1}`,
                team2: `${event.team2}`,
                winner: `${event.winner}`,
                eventStatus: `${event.eventstatus}`,
            }
        }
    }

    const Title = (maybeID) => {
        if (maybeID === undefined) {
            return <h1>Dodaj event</h1>
        }
        else {
            return <h1>Edytuj event</h1>
        }
    }

    const Button = (maybeID) => {
        if (maybeID === undefined) {
            return <div>Dodaj event</div>
        }
        else {
            return <div>Edytuj event</div>
        }
    }

    const alertForm = (maybeID) => {
        if (maybeID === undefined) {
            return " dodane!"
        }
        else {
            return " zedytowane!"
        }
    }

    if (Cookies.get("token") !== undefined) {

        if (jwt.decode(Cookies.get("token")).access_level === "admin") {
            return (
                <div className="Region-Page">
                    {Title(maybeID)}
                    <Formik
                        initialValues={InitialValues()}
                        validationSchema={validateEvent}
                        onSubmit={(values, actions) => {
                            handleSubmit(values)
                            actions.resetForm({
                                values: {
                                    kind: '',
                                    team1: '',
                                    team2: '',
                                    winner: '',
                                    eventStatus: '',
                                },
                            })
                        }
                        }
                        enableReinitialize={true}>
                        {({ errors, touched }) => (
                            <Form>
                                <div>
                                    <div>
                                        <Field name="kind" placeholder="Rodzaj" />
                                        <div className="error">{errors.kind && touched.kind ? (<div>{errors.kind}</div>) : null}</div>
                                    </div>
                                    <div>
                                        <Field name="team1" placeholder="Drużyna1" />
                                        <div className="error">{errors.team1 && touched.team1 ? (<div>{errors.team1}</div>) : null}</div>
                                    </div>
                                    <div>
                                        <Field name="team2" placeholder="Drużyna2" />
                                        <div className="error">{errors.team2 && touched.team2 ? (<div>{errors.team2}</div>) : null}</div>
                                    </div>
                                    <div>
                                        <Field name="winner" placeholder="Zwycięzca" />
                                        <div className="error">{errors.winner && touched.winner ? (<div>{errors.winner}</div>) : null}</div>
                                    </div>
                                    <div>
                                        <Field name="eventStatus" placeholder="Status" />
                                        <div className="error">{errors.eventStatus && touched.eventStatus ? (<div>{errors.eventStatus}</div>) : null}</div>
                                    </div>
                                </div>
                                <button type="submit">
                                    {Button(maybeID)}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            )
        }
        else{
            return (
                <h1>Brak uprawnień</h1>
            )
        }
    }
    else if (Cookies.get("token") === undefined) {
        return (
            <h1>Brak uprawnień</h1>
        )
    }
}

function getEvent(state, props) {
    if (!state.events.dataLoaded) {
        return {}
    }
    // eslint-disable-next-line eqeqeq
    return state.events.events.find(event => event.id == props.match.params.id)
}

const mapStateToProps = (state, props) => {
    return {
        isEventLoaded: state.events.dataLoaded,
        maybeID: props.match.params.id,
        event: getEvent(state, props),
    }
};

const mapDispatchToProps = {
    addEventAction,
    eventListAction,
    editEventAction
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EventForm));