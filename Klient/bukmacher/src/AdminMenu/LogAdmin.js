import Cookies from 'js-cookie'
import {Link} from "react-router-dom";
import jwt from 'jsonwebtoken';
import { togglemode } from '../OthersFunctions/cssmode';

export const LogAdmin = () => {
  if(Cookies.get("token") !== undefined){
    if(jwt.decode(Cookies.get("token")).access_level === "admin"){
      return(
        <ul>
          <li>
              <Link className={"Link"+ togglemode()} to="/events/add">Dodaj wydarzenie</Link>
          </li>
        </ul>
      )
    }
  }
}