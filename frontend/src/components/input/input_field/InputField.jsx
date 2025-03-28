import './InputField.css';
import React from "react";

const InputField = ({
    type = "text",
    label,
    icon,
    value = "",
    onChange = () => {}, // Default function jika tidak diberikan
    isDisabled,
}) => {
    return (
        <div className="input-wrapper">
            {icon}
            <input 
                type={type} 
                placeholder={label} 
                className='input-text' 
                value={value} 
                onChange={onChange}
                disabled={isDisabled}
            />
        </div>
    );
}

export default InputField;