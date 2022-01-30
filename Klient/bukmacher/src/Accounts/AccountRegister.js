import { Field, Form, Formik } from "formik"
import { useEffect } from "react";
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import * as Yup from 'yup';
import axios from "axios";

const validateEvent = Yup.object({
    email: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    username: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    password: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    password2: Yup.string().oneOf([Yup.ref('password'), null], 'Hasła muszą być takie same'),
});

const AccountRegister = ({history}, props) => {
    useEffect(() => {
    }, [])

    const register = async (values) => {
        try {
            const response = await axios.post('http://localhost:5000/register', values);
            if (response.status === 200)
            {
                alert("Zarejestrowano, zaloguj się");
                window.location.reload(true);
                history.push(`/login`);
            }
        } catch (ex) {
            console.log(ex)
            alert("Podany adres email już zarejestrowany");
        }
    }

    const handleSubmit = (values) => {
        register(values)
    }

    const InitialValues = () => {
        return {
            email: '',
            username: '',
            password: '',
            password2: ''
        }
    }

    return (
        <div className="Region-Page">
           <h1>Rejestracja</h1>
            <Formik
                initialValues={InitialValues()}
                validationSchema={validateEvent}
                onSubmit={(values, actions) => {
                    handleSubmit(values)
                    actions.resetForm({
                        values: {
                            email: '',
                            username: '',
                            password: '',
                            password2: ''
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
                                <Field name="username" placeholder="nazwa" />
                                <div className="error">{errors.username && touched.username ? (<div>{errors.username}</div>) : null}</div>
                            </div>
                            <div>
                                <Field name="password" type="password" placeholder="hasło" />
                                <div className="error">{errors.password && touched.password ? (<div>{errors.password}</div>) : null}</div>
                            </div>
                            <div>
                                <Field name="password2" type="password" placeholder="powtórz hasło" />
                                <div className="error">{errors.password2 && touched.password2 ? (<div>{errors.password2}</div>) : null}</div>
                            </div>
                        </div>
                        <button type="submit">
                            Zarejestruj się
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default withRouter(connect(null, null)(AccountRegister));