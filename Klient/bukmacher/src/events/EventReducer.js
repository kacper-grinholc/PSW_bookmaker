import { EVENT_LIST_REQUEST, EVENT_LIST_REQUEST_FAILED, EVENT_LIST_REQUEST_START } from "./EventActions";

const initState = {
    events: [],
    loading: false,
    error: ''
}

const eventReducer = (state = initState, action) => {
    switch(action.type) {
        case EVENT_LIST_REQUEST_START: 
            return { ...state, loading: true }
        case EVENT_LIST_REQUEST_FAILED:
            return { ...state, loading: false, error: action.payload }
        case EVENT_LIST_REQUEST:
            return {...state, events: [...action.payload], loading: false };
        default:
            return state;
    }
}

export default eventReducer;
