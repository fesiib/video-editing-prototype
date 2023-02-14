const INCREASE = "INCREASE";
const DECREASE = "DECREASE";

export const increaseCounter = () => ({
    type: INCREASE,
});


export const decreaseCounter = () => ({
    type: DECREASE,
});

const initialState = {
    cnt: 0,
};


const counter = (state = initialState, action) => {
    switch (action.type) {
        case INCREASE: {
            return {
                ...state,
                cnt: state.cnt + 1,
            }
        }
        case DECREASE: {
            return {
                ...state,
                cnt: state.cnt - 1,
            }
        }
        default:
                return state;
    }
}

export default counter;