import Cookies from 'js-cookie'
import {Link} from "react-router-dom";
import jwt from 'jsonwebtoken';
import axios from "axios";

const deleteAccount = async () => {
  const id = jwt.decode(Cookies.get("token")).user_id
  try {
      const response = await axios.delete(`http://localhost:5000/users/${id}`, {
          headers: {
              "x-access-token": Cookies.get("token")
          }
      });
      if (response.status === 200) {
          alert("Usunięto konto");
          Cookies.remove("token")
          window.location.reload(true);
      }
  } catch (ex) {
      console.log(ex)
  }
}

export const LogMenu = () => {
    if(Cookies.get("token") === undefined){
      return(
        <ul>
          <li>
            <Link className="Link" to="/register">Zarejestruj się</Link>
          </li>
          <li>
            <Link className="Link" to="/login">Login</Link>
          </li>
        </ul>
      )
    }
    else{
      return(
        <div className="dropdown">
        <div className="dropbtn">Konto</div>
            <div className="dropdown-content">
          <li>
            <Link className="Link" to="/logout">Wyloguj</Link>
          </li>
          <li>
            <Link className="Link" to="/userbets">Historia betów</Link>
          </li>
          <li>
            <Link className="Link" to={`/user/edit/${jwt.decode(Cookies.get("token")).user_id}`}>Edytuj konto</Link>
          </li>
          <li>
            <Link className="Link" to="/charge">Doładuj konto</Link>
          </li>
          <li>
          <button onClick={() => deleteAccount()}>Usuń konto</button>
          </li>
          </div>
      </div>
      )
    }
}