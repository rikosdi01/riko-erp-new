import Select from "react-select";
import AsyncSelect from "react-select/async";
import './Dropdown.css'

const customStyles = (hasIcon) => ({
    control: (provided, state) => ({
        ...provided,
        display: "flex",
        alignItems: "center",
        paddingLeft: hasIcon ? "30px" : undefined, // Beri ruang untuk ikon
        paddingTop: "5px",
        paddingBottom: "5px",
        border: "1px solid #ccc",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        fontFamily: "Poppins",
        fontSize: "14px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "#333", // teks terpilih
    }),
    menu: (provided) => ({
        ...provided,
        fontSize: "14px",
        fontWeight: 400,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 1100, // lebih tinggi dari modal (1000)
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? "#007bff"   // warna saat terpilih
            : state.isFocused
                ? "#d9ebfc"  // warna saat hover/fokus
                : "white",    // warna default
        color: state.isSelected ? "white" : "#3c3c3c",
        cursor: "pointer",
        zIndex: 10000000,
    }),
    noOptionsMessage: (provided) => ({
        ...provided,
        fontSize: "14px",
        textAlign: "left",
        fontWeight: 400,
    }),
});

function Dropdown({
    values,
    selectedId,
    setSelectedId,
    label,
    icon,
    width,
    isRequired = false,
    isAlgoliaDropdown = false,
    key,
    marginBottom = "10px",
}) {
    // Konversi data ke format `react-select`
    let valuesOption = [];
    let selectedValue = null;

    if (!isAlgoliaDropdown) {
        valuesOption = values.map(value => ({
            value: value.id,
            label: value.label || `${value.name}${value.location ? ' - ' + value.location : ''}`,
            code: value.code,
        }));



        // Temukan nilai yang dipilih saat ini
        selectedValue = valuesOption.find(opt => opt.value === selectedId) || null;
    }

    const styles = customStyles(!!icon);

    return (
        <div className="input-label" style={{ marginBottom: marginBottom }}>
            {label && (
                <div>
                    {isRequired && <label className="required-field">*</label>}
                    <label className="input-text-label">{label}</label>
                </div>
            )}
            <div className="input-wrapper" style={{ width: width }}>
                {icon}
                {isAlgoliaDropdown ? (
                    <AsyncSelect
                        key={key}
                        getOptionLabel={(e) => e.name}
                        getOptionValue={(e) => e.id}
                        cacheOptions
                        loadOptions={values}
                        defaultOptions
                        value={selectedId}
                        onChange={(selectedOption) => setSelectedId(selectedOption)}
                        placeholder={label}
                        noOptionsMessage={() => "Tidak ada hasil, coba ketik kata kunci lain..."}
                        styles={styles}
                        isClearable={true}
                        menuPosition="fixed"
                        // menuPortalTarget={document.body}
                    />
                ) : (
                    <Select
                        options={valuesOption}
                        value={valuesOption.find(opt => opt.value === selectedId) || null}
                        onChange={(selectedOption) => setSelectedId(selectedOption.value)}
                        placeholder={label}
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={styles}
                        menuPosition="fixed"
                        // menuPortalTarget={document.body}
                    />
                )}
            </div>
        </div>
    );
}

export default Dropdown;