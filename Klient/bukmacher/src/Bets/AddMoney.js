import { Field, Form, Formik } from "formik"
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import * as Yup from 'yup';
import axios from "axios";
import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken';

const validateMoney = Yup.object({
    Amount : Yup.number("Nieprawidłowa wartość!").positive("Musi być większe od 0").integer("Musi być całkowite").required("Wymagane!"),
});

const AddMoney = (props) => {

    if (Cookies.get("token") === undefined){
        alert("Zaloguj się aby kontynuować")
        window.location.replace("http://localhost:3000/login");
    }

    const createOperation = async (values) => {
        try {
            const response = await axios.post(`http://localhost:5000/operations/`, values, {
                headers: {
                    "x-access-token": Cookies.get("token")
                }});
            if (response.status === 200)
            {
                alert("Pieniądze wpłacone!");
            }
        } catch (ex) {
            alert("Error");
            console.log(ex)
        }
    }

    const handleSubmit = (values) => {
        createOperation(values)
    }

    const InitialValues = () => {
        return {
            operationType: "wpłata",
            Amount: '',
            userid: `${jwt.decode(Cookies.get("token")).user_id}`,
        }
    }
    return (
        <div className="Karta">
        <h1>Wpłać pieniądze</h1>
        <Formik
            initialValues={InitialValues()}
            validationSchema={validateMoney}
            onSubmit={(values, actions) => {
                handleSubmit(values)
                actions.resetForm({
                    values: {
                        operationType: "wpłata",
                        Amount: '',
                        userid: `${jwt.decode(Cookies.get("token")).user_id}`,
                        },
                        })
                    }   
                }
            enableReinitialize={true}>
            {({ errors, touched }) => (
                <Form>
                    <div>
                        <Field name="Amount" placeholder="Ilość do wpłacenia" />
                        <div className="error">{errors.Amount && touched.Amount ? (<div>{errors.Amount}</div>) : null}</div>
                    </div>
                    <button type="submit">
                        <div>Wpłać</div>
                    </button>
                </Form>
            )}
        </Formik>
    </div>

    )
};

export default withRouter(connect(null, null)(AddMoney));