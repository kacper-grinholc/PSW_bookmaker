import { useEffect } from "react";
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import Cookies from 'js-cookie'
import { togglemode } from "../OthersFunctions/cssmode";


const AccountLogout = ({history}, props) => {
    useEffect(() => {
    }, [])

    const handleSubmit = () => {
        Cookies.remove("token")
        window.location.reload(true);
        history.push(`/`);
    }

    return (
        <div className={"Region-Page" + togglemode()}>
           <h1 className={togglemode()}>Wylogować?</h1>
            <button type="submit" onSubmit={handleSubmit()}>
                Wyloguj
            </button>
        </div>
    )
}

export default withRouter(connect(null, null)(AccountLogout));