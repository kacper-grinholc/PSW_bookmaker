import axios from "axios";

export const EVENT_CREATE = 'EVENT_CREATE';
export const EVENT_LIST_REQUEST = 'EVENT_LIST_REQUEST';
export const EVENT_LIST_REQUEST_START = 'EVENT_LIST_REQUEST_START';
export const EVENT_LIST_REQUEST_FAILED = 'EVENT_LIST_REQUEST_FAILED';

export const createEventAction = (newEvent) => ({
    type: EVENT_CREATE,
    payload: newEvent
});

export const eventsListRequestAction = (Events) => ({
    type: EVENT_LIST_REQUEST,
    payload: Events
})

export const eventsListRequestStartAction = ({
    type: EVENT_LIST_REQUEST_START
});

export const eventsListRequestFailAction = (error) => ({
    type: EVENT_LIST_REQUEST_FAILED,
    payload: error
})

export const getEventList = () => {
    return async dispatch => {
        dispatch(eventsListRequestStartAction);
        setTimeout(async () => {
            try{
                const response = await axios.get('http://localhost:5000/events');
                dispatch(eventsListRequestAction(response.data));        
            }catch(ex) {
                dispatch(eventsListRequestFailAction(ex));
            }
        },)
    }
}
