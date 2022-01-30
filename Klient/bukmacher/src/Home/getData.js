import axios from "axios";

const getData = async (isDataLoaded, dispatch) => {

    if (!isDataLoaded) {
        try {
            if (!isDataLoaded) {
                const response = await axios.get('http://localhost:5000/events');
                if (response.status === 200)
                    dispatch(response.data);
            }
        } catch (ex) {
            console.log(ex)
        }
    } else {
    }
};

export default getData