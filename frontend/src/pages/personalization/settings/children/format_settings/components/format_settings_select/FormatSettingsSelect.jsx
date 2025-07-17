const FormatSettingsSelect = ({
    title,
    options,
    valueFormat,
    setValueFormat,
    min,
    max,
    value,
    setValue,
}) => {
    return (
        <div className="settings-format-field">
            <label>{title}</label>
            <div className='settings-format-code'>
                <select value={valueFormat} onChange={(e) => setValueFormat(e.target.value)}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <input
                    className='settings-input'
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                />
            </div>
        </div>
    )
}

export default FormatSettingsSelect;