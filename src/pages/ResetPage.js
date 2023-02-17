import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetApp } from "../reducers";
import { increaseCounter } from "../reducers/counter";

function ResetPage() {
    const dispatch = useDispatch();

    const { cnt } = useSelector(state => state.counter);

    const clickHandler = () => {
        dispatch(resetApp());
    }
    const counterHandler = () => {
        dispatch(increaseCounter());
    }

    return (<div>
        <button onClick={clickHandler}> Reset </button>
        <div>
            Counter: {cnt}
        </div>
        <button onClick={counterHandler}> +1 </button>
    </div>)
}

export default ResetPage;