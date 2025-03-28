import InputField from '../input_field/InputField';
import './InputLabel.css'
import React from "react";

const InputLabel = ({ type, label, icon, value, onChange, isDisabled }) => {
    return (
        <div className="input-label">
            <label className='input-text-label'>{label}:</label>
            <InputField
                type={type}
                label={label}
                icon={icon}
                value={value}
                onChange={onChange}
                isDisabled={isDisabled}
            />
        </div>
    )
}

export default InputLabel;