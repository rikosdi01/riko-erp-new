import InputField from '../input_field/InputField';
import './InputLabel.css'

const InputLabel = ({
    type,
    label,
    icon,
    surfixIcon,
    value,
    onChange,
    isDisabled,
    errorMessage
}) => {
    return (
        <div className="input-label">
            <label className='input-text-label'>{label}:</label>
            <InputField
                type={type}
                label={label}
                icon={icon}
                surfixIcon={surfixIcon}
                value={value}
                onChange={onChange}
                isDisabled={isDisabled}
            />
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
    )
}

export default InputLabel;