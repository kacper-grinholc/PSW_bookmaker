import { EVENT_ADD, EVENT_DELETE, EVENT_EDIT, EVENT_LIST } from "./EventActions";

const eventReducer = (state = {dataLoaded : false, events : [] }, action) => {
    switch(action.type) {
        case EVENT_LIST: 
            return {dataLoaded : true, events : [...action.payload] }
        case EVENT_ADD: 
            return {dataLoaded : state.dataLoaded, events : [...state.events, action.payload] };
        case EVENT_DELETE:
            // eslint-disable-next-line eqeqeq
            return {dataLoaded : state.dataLoaded, events : [...state.events.filter(el => el.id != action.payload.id)] };
        case EVENT_EDIT:
            // eslint-disable-next-line eqeqeq
            return {dataLoaded : state.dataLoaded, events : [...state.events.filter(el => el.id != action.payload.id), action.payload] }
        default:
            return state;
    }
}

export default eventReducer