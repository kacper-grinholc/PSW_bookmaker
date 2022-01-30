import { Field, Form, Formik } from "formik"
import { useEffect } from "react";
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import * as Yup from 'yup';
import axios from "axios";
import getData from "../Home/getData";
import {eventListAction } from "../Events/EventActions";
import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken';

const validateBet = Yup.object({
    betTeam: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    betAmount : Yup.number("Nieprawidłowa wartość!").positive("Musi być większe od 0").integer("Musi być całkowite").required("Wymagane!"),
});

const CreateBet = ({isEventLoaded, eventListAction, event, maybeID}, props) => {
    const user = jwt.decode(Cookies.get("token")).user_id
    useEffect(() => {
        getData(false, eventListAction)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getOdd = (team) =>{
        if (team === event.team1)
            return calculateodds(event.bett1, event.bett2)
        else
            return calculateodds(event.bett2, event.bett1)
    }

    const createBet = async (values) => {
        try {
            const odd = getOdd(values.betTeam)
            const response = await axios.post('http://localhost:5000/bets',  {
                userid: values.userid,
                eventId: values.eventId,
                betTeam: values.betTeam,
                betAmount: values.betAmount,
                odd: odd,
            }, {
                headers: {
                    "x-access-token": Cookies.get("token")
                }});
            if (response.status === 200)
            {
                createOperation(values)
                alert("Bet dodany!");
            }
        } catch (ex) {
            alert("Error");
            console.log(ex)
        }
    }

    const createOperation = async (values) => {
        try {
            const response = await axios.post('http://localhost:5000/operations', {
                operationType: 'bet',
                Amount: values.betAmount,
                userid: user
            }, {
                headers: {
                    "x-access-token": Cookies.get("token")
                }});
            if (response.status === 200)
            {
                getData(false, eventListAction)
            }
        } catch (ex) {
            console.log(ex)
        }
    }

    const handleSubmit = (values) => {
        createBet(values)
    }

    const calculateodds = (odd1, odd2) => {
        const odd = (1/(parseFloat(odd1)/(parseFloat(odd1) + parseFloat(odd2))))
        return odd.toFixed(2);
    }

    const InitialValues = () => {
        return {
            userid: user,
            eventId: `${maybeID}`,
            betTeam: '',
            betAmount: '',
            odd: ''
        }
    }

    return (
        <div className="Karta">
        <h1>Dodaj bet</h1>
        <Formik
            initialValues={InitialValues()}
            validationSchema={validateBet}
            onSubmit={(values, actions) => {
                handleSubmit(values)
                actions.resetForm({
                    values: {
                        userid: user,
                        eventId: `${maybeID}`,
                        betTeam: '',
                        betAmount: '',
                        odd: '',
                            },
                        })
                    }   
                }
            enableReinitialize={true}>
            {({ errors, touched }) => (
                <Form>
                    <div>
                        <Field type="radio" name="betTeam" value={event.team1} />  {event.team1} {calculateodds(event.bett1, event.bett2)}
                        <Field type="radio" name="betTeam" value={event.team2} />  {event.team2} {calculateodds(event.bett2, event.bett1)}
                        <div className="error">{errors.betTeam && touched.betTeam ? (<div>{errors.betTeam}</div>) : null}</div>
                    </div>
                    <div>
                        <Field name="betAmount" placeholder="Ile obstawiasz" />
                        <div className="error">{errors.betAmount && touched.betAmount ? (<div>{errors.betAmount}</div>) : null}</div>
                    </div>
                    <button type="submit">
                        <div>Dodaj bet</div>
                    </button>
                </Form>
            )}
        </Formik>
    </div>

    )
};

function getEvent(state, props) {
    if (!state.events.dataLoaded) {
        return {}
    }
    // eslint-disable-next-line eqeqeq
    return state.events.events.find(event => event.id == props.match.params.id)
}

const mapStateToProps = (state, props)  => {
    return {
        event: getEvent(state, props),
        maybeID: props.match.params.id,
        isEventLoaded: state.events.dataLoaded,
    };
}

const mapDispatchToProps = {
    eventListAction,
};


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateBet));