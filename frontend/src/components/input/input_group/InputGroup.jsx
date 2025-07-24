const InputGroup = ({
    label,
    icon,
    value,
    handleChange,
    type,
    name,
    isRequired = true,
    leadingIcon = null, // Optional leading icon
}) => {
    return (
        <div className="input-group">
            <label>{label}</label>
            <div className="input-wrapper">
                {icon}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={label}
                    className="signin-input"
                    style={{ padding: "0.75rem 2.8rem" }}
                    required={isRequired}
                />
                {leadingIcon}
            </div>
        </div>

    )
}

export default InputGroup;