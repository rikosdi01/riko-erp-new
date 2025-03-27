import Select from "react-select";
import './Dropdown.css'
import React from "react";

const customStyles = {
    control: (provided) => ({
        ...provided,
        display: "flex",
        alignItems: "center",
        paddingLeft: "30px", // Beri ruang untuk ikon
        border: "1px solid #ccc",
        borderRadius: "10px",
        fontFamily: "Poppins",
        fontSize: "14px",
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 1000, // Tambahkan z-index tinggi agar muncul di atas ikon
    }),
};

function Dropdown({ values, selectedId, setSelectedId, label, icon, width }) {
    // Konversi data ke format `react-select`
    const valuesOption = values.map(value => ({
        value: value.id,
        label: value.name,
    }));

    // Temukan karyawan yang dipilih saat ini
    const selectedValue = valuesOption.find(opt => opt.value === selectedId) || null;

    return (
        <div className="input-label">
            <label className="input-text-label">{label}</label>
            <div className="input-wrapper" style={{ width: width }}>
                {icon}
                <Select
                    options={valuesOption}
                    value={selectedValue}
                    onChange={(selectedOption) => setSelectedId(selectedOption.value)}
                    placeholder={label}
                    isSearchable // Mengaktifkan fitur pencarian
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={customStyles}
                />
            </div>
        </div>
    );
}

export default Dropdown;