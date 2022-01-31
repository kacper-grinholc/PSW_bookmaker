import Cookies from 'js-cookie'
import {Link} from "react-router-dom";
import jwt from 'jsonwebtoken';
import axios from "axios";
import { togglemode } from './cssmode';

const deleteAnimal = async (event) => {
    try {
        const response = await axios.delete(`http://localhost:5000/events/${event.id}`, {
            headers: {
                "x-access-token": Cookies.get("token")
            }
        });
        if (response.status === 200) {
            alert("Usunięto");
        }
    } catch (ex) {
        console.log(ex)
    }
}

export const AdminEvent = (event) => {
  if(Cookies.get("token") !== undefined){
    if(jwt.decode(Cookies.get("token")).access_level === "admin"){
      return(
        <div>
            <Link className={"Link"+ togglemode()} to={`/events/edit/${event.id}`}>Edytuj wydarzenie</Link>
            <button onClick={() => deleteAnimal(event)}>Usuń</button>
        </div>
      )
    }
  }
}