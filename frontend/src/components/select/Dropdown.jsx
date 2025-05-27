import Select from "react-select";
import './Dropdown.css'

const customStyles = {
    control: (provided) => ({
        ...provided,
        display: "flex",
        alignItems: "center",
        paddingLeft: "30px", // Beri ruang untuk ikon
        border: "1px solid rgb(212, 212, 212)",
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
    const valuesOption = values.map(value => {
        if (value.value && value.label) return value;
        return {
            value: value.id,
            label: value.name,
        };
    });
    console.log("Dropdown valuesOption:", valuesOption);

    // Temukan karyawan yang dipilih saat ini
    const selectedValue = valuesOption.find(opt => opt.value === selectedId) || null;
    console.log("Dropdown selectedValue:", selectedValue);

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