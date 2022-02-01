import Cookies from 'js-cookie'

export const togglemode = () => {
    if (Cookies.get("mode") !== "dark"){
      return ""
    }
    else{
      return "dark"
    }
}
  