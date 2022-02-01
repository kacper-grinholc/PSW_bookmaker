import { connect } from "react-redux";
import { useState, useEffect } from "react";
import { withRouter } from "react-router";
import axios from "axios";
import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken';
import { togglemode } from "../OthersFunctions/cssmode";

const OperationList = (props) => {
    const [operations, setOperations] = useState([]);

    async function getOperations(){
        try {
            const response = await axios.get(`http://localhost:5000/transactions/${jwt.decode(Cookies.get("token")).user_id}`, {
                headers: {
                    "x-access-token": Cookies.get("token") 
                }
               });
            if (response.status === 200){
                setOperations(response.data)
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

    const [filter1, setfilter1] = useState("All")

    const handlefilter1Change = (event) => {
        setfilter1((event.target.value));
    }


    useEffect(() => {
        getOperations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reformatDate = (date) => {
        var wynik = new Date(date).toLocaleString('en-GB')
        return <p>{wynik}</p>
    }

    return (
            <div className="Karta">
                <h1 className={togglemode()}>Historia operacji</h1>
                <div className="operationfilter">
                    <select name="type" onChange={handlefilter1Change}>
                        <option value="All">Wszystkie</option>
                        <option value="bet">Bet</option>
                        <option value="wygrana">Wygrana</option>
                        <option value="wpłata">Wpłata</option>
                    </select>
                </div>
                <table className={"operationtable" + togglemode()} >
                    {operations
                    .filter(animal => animal.operationtype === filter1 || filter1 === "All")
                    .sort((firstItem, secondItem) =>
                    (firstItem.id > secondItem.id) ? -1:1)
                    .map(operation => {
                        return (
                                <tr className={"operationrow" + togglemode()} key={operation.id}>
                                    <th className={"operationelement" + togglemode()}>Typ operacji: {operation.operationtype}</th>
                                    <th className={"operationelement" + togglemode()}>Ilość: {operation.amount}</th>
                                    <th className={"operationelement" + togglemode()}>Data operacji: {reformatDate(operation.creationdate)}</th>
                                </tr>
                            )
                        })}
                </table>
            </div>
        )
};

const mapStateToProps = (state, props)  => {
    return {
        ID: props.match.params.id
    };
}

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OperationList));