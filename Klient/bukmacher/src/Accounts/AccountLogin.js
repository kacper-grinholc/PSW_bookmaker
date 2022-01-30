import { Field, Form, Formik } from "formik"
import { useEffect } from "react";
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import * as Yup from 'yup';
import axios from "axios";
import Cookies from 'js-cookie'

const validateEvent = Yup.object({
    email: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    password: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
});

const AccountLogin = ({history}, props) => {
    useEffect(() => {
    }, [])

    const login = async (values) => {
        try {
            const response = await axios.post('http://localhost:5000/login', values);
            if (response.status === 200)
            {
                Cookies.set("token", response.data.token, { expires: 1/24 })
                alert("Zalogowano");
                history.push(`/`);
                window.location.reload(true);
                
            }
        } catch (ex) {
            if (ex.response.status === 400) {
                alert("błędne dane logowania")
            }
            console.log(ex)
        }
    }
    const handleSubmit = (values) => {
        login(values)
    }

    const InitialValues = () => {
        return {
            email: '',
            password: ''
        }
    }

    return (
        <div className="Region-Page">
           <h1>Logowanie</h1>
            <Formik
                initialValues={InitialValues()}
                validationSchema={validateEvent}
                onSubmit={(values, actions) => {
                    handleSubmit(values)
                    actions.resetForm({
                        values: {
                            email: '',
                            password: ''
                        },
                    })
                }

                }
                enableReinitialize={true}>
                {({ errors, touched }) => (
                    <Form>
                        <div>
                            <div>
                                <Field name="email" placeholder="email" />
                                <div className="error">{errors.email && touched.email ? (<div>{errors.email}</div>) : null}</div>
                            </div>
                            <div>
                                <Field name="password" type="password" placeholder="hasło" />
                                <div className="error">{errors.password && touched.password ? (<div>{errors.password}</div>) : null}</div>
                            </div>
                        </div>
                        <button type="submit">
                            Zaloguj
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default withRouter(connect(null, null)(AccountLogin));