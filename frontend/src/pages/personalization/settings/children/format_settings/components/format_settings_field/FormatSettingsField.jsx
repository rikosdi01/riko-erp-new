import { useEffect, useState } from 'react';
import './FormatSettingsField.css';
import Formatting from '../../../../../../../utils/format/Formatting';

const FormatSettingsField = ({
    title,
    year,
    month,
    unique,
    yearFormat,
    monthFormat,
    uniqueFormat,
    defaultValue,
    onChange,
}) => {
    const [prefix, setPrefix] = useState('');

    useEffect(() => {
        if (defaultValue != null) {
            setPrefix(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        onChange?.(prefix);
    }, [prefix]);

    const getFormattedUnique = () => {
        if (!unique) return '';
        if (uniqueFormat === 'roman') {
            return Formatting.toRoman(unique);
        }
        return unique.toString().padStart(4, '0');
    };

    const generateCode = () => {
        return `${prefix}${Formatting.getFormattedYear(year, yearFormat)}${Formatting.getFormattedMonth(month, monthFormat)}${getFormattedUnique()}`;
    };

    useEffect(() => {
        console.log('Format Year: ', year);
        console.log('Format Year: ', yearFormat);
    }, [year, yearFormat]);

    return (
        <div className="settings-format-field">
            <label>Prefix Kode {title}</label>
            <div className='settings-format-ex'>
                <input
                    className='settings-input'
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                />
                <div className="settings-format-field-preview">
                    <div>Contoh Kode:</div>
                    <div>{generateCode()}</div>
                </div>
            </div>
        </div>
    )
}

export default FormatSettingsField;