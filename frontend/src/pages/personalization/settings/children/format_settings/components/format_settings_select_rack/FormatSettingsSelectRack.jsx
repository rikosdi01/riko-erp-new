import { useEffect, useState } from "react";
import { useRacks } from "../../../../../../../context/warehouse/RackWarehouseContext";

const FormatSettingsSelectRack = ({
    title,
    defaultValue,
    onChange,
}) => {
    const [prefix, setPrefix] = useState('');
    const { racks } = useRacks();

    useEffect(() => {
        if (defaultValue != null) {
            setPrefix(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        onChange?.(prefix);
    }, [prefix]);

    return (
        <div className='settings-format-field'>
            <label>{title}</label>
            <div className='settings-format-code'>
                <select
                    className='settings-select'
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                >
                    {racks.map((rack) => (
                        <option key={rack.id} value={rack.id}>
                            {rack.name + ' - ' + rack.location}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default FormatSettingsSelectRack;