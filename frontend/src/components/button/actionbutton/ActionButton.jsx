import { PenOff } from 'lucide-react';
import './ActionButton.css'
import React from "react";

const ActionButton = ({
    title,
    icon,
    onclick,
    background,
    color,
    disabled,
    padding = "10px 18px",
    fontSize = "16px",
    classname,
}) => {
    return (
        <button
            type="button"
            onClick={onclick}
            className={classname || "action-button"}
            style={{
                background: disabled ? "gray" : background, 
                color: disabled ? "white" : color,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                padding: padding,
                fontSize: fontSize,
                gap: icon ? "8px" : "0"
            }}
            disabled={disabled}
        >
            <span>{disabled ? <PenOff /> : icon}</span>
            {title}
        </button>
    );
};

export default ActionButton