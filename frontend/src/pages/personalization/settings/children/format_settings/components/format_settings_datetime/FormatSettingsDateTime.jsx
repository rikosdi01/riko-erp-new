import { useState } from "react";

const FormatSettingsDateTime = ({
    valueFormat,
    setValueFormat,
    handleValueFormatChange,
    handleFormatToday,
}) => {
    const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');

    const handleDateFormatChange = (value) => {
        const isValid = /^[dmy/-]+$/i.test(value);
        if (isValid) setDateFormat(value);
    };

    const formatToday = (format) => {
        const today = new Date();

        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yy = String(today.getFullYear()).slice(-2);
        const yyyy = String(today.getFullYear());

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const MMM = monthNames[today.getMonth()].slice(0, 3); // Jul
        const MMMM = monthNames[today.getMonth()]; // July

        return format
            .replace(/yyyy/i, yyyy)
            .replace(/mmmm/i, MMMM)
            .replace(/mmm/i, MMM)
            .replace(/mm/i, mm)
            .replace(/dd/i, dd)
            .replace(/yy/i, yy);
    };

    return (
        <div className="settings-format-field">
            <label>Format Tanggal</label>

            <div className='settings-format-ex'>
                <div className='settings-format-code'>
                    <input
                        className='settings-input'
                        type="text"
                        placeholder="Contoh: dd/mm/yyyy"
                        value={dateFormat}
                        onChange={(e) => handleDateFormatChange(e.target.value)}
                    />
                </div>

                <div className="settings-format-field-preview">
                    <div>Contoh Kode:</div>
                    <div>{formatToday(dateFormat)}</div>
                </div>
            </div>
        </div>
    )
}

export default FormatSettingsDateTime;