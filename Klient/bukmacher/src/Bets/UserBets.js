import { connect } from "react-redux";
import { useState, useEffect } from "react";
import { withRouter } from "react-router";
import axios from "axios";
import Cookies from 'js-cookie'


const BetList = ({ ID }, props) => {
    const [bets, setBets] = useState([]);

    useEffect(() => {
        async function getBets(ID){
            try {
                const response = await axios.get(`http://localhost:5000/bets`, {
                    headers: {
                        "x-access-token": Cookies.get("token") 
                    }
                   });
                if (response.status === 200){
                    setBets(response.data)
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
        getBets(ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reformatDate = (date) => {
        var wynik = new Date(date).toLocaleString('en-GB')
        return <p>{wynik}</p>
    }

    return (
            <div className="Karta">
                <h1>Historia betów</h1>
                <div className="Wyniki">
                    {bets.sort((firstItem, secondItem) =>
                    (firstItem.id > secondItem.id) ? -1:1)
                     .map(bet => {
                        return (
                            <div className="Item" key={bet.id}>
                                <div>Drużyna: {bet.betteam}</div>
                                <div>Ilość: {bet.betamount}</div>
                                <div>Kurs: {bet.odd} </div>
                                <div>Data obstawienia: {reformatDate(bet.creationdate)}</div>
                            </div>
                            )
                        })}
                </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BetList));