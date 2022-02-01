import axios from "axios";

const getData = async (isDataLoaded, dispatch, query = undefined) => {

    if (!isDataLoaded) {
        try {
            if (!isDataLoaded) {
                var params = ""
                if (query !== undefined && query !== null) {
                    params = `?query=${query}`
                }
                const response = await axios.get(`http://localhost:5000/events${params}`);
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