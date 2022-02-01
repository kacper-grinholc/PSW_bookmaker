import { Field, Form, Formik } from "formik"
import { useEffect } from "react";
import { addEventAction, eventListAction, editEventAction } from "./EventActions";
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import * as Yup from 'yup';
import axios from "axios";
import getData from "../OthersFunctions/getData";
import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken';
import { sendAlert } from "../mqtt/mqttFinished";
import { togglemode } from "../OthersFunctions/cssmode";

const validateEvent = Yup.object({
    kind: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    team1: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    team2: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
});

const EventForm = ({ eventListAction, addEventAction, event, editEtAction, maybeID }, props) => {

    useEffect(() => {
        getData(false, eventListAction)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    const createEvent = async (values) => {
        try {
            const response = await axios.post('http://localhost:5000/events', values, {
                headers: {
                    "x-access-token": Cookies.get("token")
                }
            });
            if (response.status === 200){

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
            {  
                var odd = 0
                var b1 = parseFloat(values.bett1)
                var b2 = parseFloat(values.bett2)

                if (values.winner === values.team1){
                    odd = 1/(b1/(b1+b2))
                }
                else if (values.winner === values.team2){
                    odd = 1/(b2/(b1+b2))
                }
                sendAlert(values.team1, values.team2, values.winner, odd.toFixed(2))
            }
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
    }

    const InitialValues = () => {
        if (maybeID === undefined) {
            return {
                kind: '',
                team1: '',
                team2: '',
                winner: 'None',
                eventStatus: 'W trakcie',
                bett1: 10,
                bett2: 10
            }
        }
        else {
            return {
                kind: `${event.kind}`,
                team1: `${event.team1}`,
                team2: `${event.team2}`,
                winner: `${event.winner}`,
                eventStatus: 'Zakończone',
                bett1: `${event.bett1}`,
                bett2: `${event.bett2}`
            }
        }
    }

    const Title = (maybeID) => {
        if (maybeID === undefined) {
            return <h1 className={togglemode()}>Dodaj event</h1>
        }
        else {
            return <h1 className={togglemode()}>Edytuj event</h1>
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
                <div className={"Region-Page" + togglemode()}>
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
                <h1 className={togglemode()}>Brak uprawnień</h1>
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