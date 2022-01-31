import { connect } from "react-redux";
import { useState, useEffect } from "react";
import { withRouter } from "react-router";
import axios from "axios";
import Cookies from 'js-cookie'
import { Field, Form, Formik } from "formik"
import * as Yup from 'yup';
import { togglemode } from "../Home/cssmode";

const validateEvent = Yup.object({
    email: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
    username: Yup.string("Nieprawidłowa wartość!").required("Wymagane!"),
});

const UserForm = ({ ID }, props) => {
    const [user, setUser] = useState([]);

    useEffect(() => {
        async function getUser(ID){
            try {
                const response = await axios.get(`http://localhost:5000/users/${ID}`, {
                    headers: {
                        "x-access-token": Cookies.get("token") 
                    }
                   });
                if (response.status === 200){
                    setUser(response.data)
                }
            } catch (ex) {
                if (ex.response.status === 401) {
                    alert("zaloguj się")
                    window.location.replace("http://localhost:3000/login");
                }
                if (ex.response.status === 403) {
                    alert("nie masz uprawnień")
                    window.location.replace("http://localhost:3000");
                }
                console.log(ex)
            }
        };
        getUser(ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const editAccount = async (values) => {
        try {
            const response = await axios.put(`http://localhost:5000/users/${ID}`, values);
            if (response.status === 200)
            {
                alert("Konto zedytowane!");
                window.location.reload(true);
            }
        } catch (ex) {
            console.log(ex)
            alert("Error, spróbuj ponownie");
        }
    }

    const handleSubmit = (values) => {
        editAccount(values)
    }

    const InitialValues = () => {
        if (user[0] !== undefined){
            return {
                email: `${user[0].email}`,
                username: `${user[0].username}`,
            }
        }
        else{
            return {
                email: ``,
                username: ``,
            }
        }
    }

    return (
        <div className={"Region-Page"+ togglemode()}>
           <h1 className={togglemode()}>Edytuj Konto</h1>
            <Formik
                initialValues={InitialValues()}
                validationSchema={validateEvent}
                onSubmit={(values, actions) => {
                    handleSubmit(values)
                    actions.resetForm({
                        values: {
                            email: '',
                            username: '',
                        },
                    })
                }

                }
                enableReinitialize={true}>
                {({ errors, touched }) => (
                    <Form>
                        <div>
                            <div>
                                Email: <Field name="email" placeholder="email" /> 
                                <div className="error">{errors.email && touched.email ? (<div>{errors.email}</div>) : null}</div>
                            </div>
                            <div>
                                Nazwa użytkownika: <Field name="username" placeholder="nazwa" />
                                <div className="error">{errors.username && touched.username ? (<div>{errors.username}</div>) : null}</div>
                            </div>
                        </div>
                        <button type="submit">
                            Zapisz
                        </button>
                    </Form>
                )}
            </Formik>
            </div>
    )
}



const mapStateToProps = (state, props)  => {
    return {
        ID: props.match.params.id
    };
}

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserForm));