export const EVENT_ADD = 'EVENT_ADD';
export const EVENT_DELETE = 'EVENT_DELETE';
export const EVENT_LIST = 'EVENT_LIST';
export const EVENT_EDIT = 'EVENT_EDIT';

export const addEventAction = (payload) => ({
    type: EVENT_ADD,
    payload
});

export const deleteEventAction = (payload) => ({
    type: EVENT_DELETE,
    payload
});

export const eventListAction = (payload) => ({
    type: EVENT_LIST,
    payload
});

export const editEventAction = (payload) => ({
    type: EVENT_EDIT,
    payload
});