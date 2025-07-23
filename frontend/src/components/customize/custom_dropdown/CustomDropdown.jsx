import Select from 'react-select';
import { useMenu } from 'react-instantsearch';

const customStyles = (hasIcon) => ({
  control: (provided, state) => ({
    ...provided,
    display: "flex",
    alignItems: "center",
    paddingLeft: hasIcon ? "30px" : undefined, // Beri ruang untuk ikon
    border: "1px solid #ccc",
    boxShadow: "none",
    borderRadius: "10px",
    fontFamily: "Poppins",
    fontSize: "14px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "black", // teks terpilih
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1000, // Tambahkan z-index tinggi agar muncul di atas ikon
    fontSize: "14px",
    fontWeight: 400,
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected
      ? "linear-gradient(to top right, #0d82ff, #50a5fa)"   // warna saat terpilih
      : state.isFocused
        ? "#edeff1"  // warna saat hover/fokus
        : "white",    // warna default
    color: state.isSelected ? "white" : "black",
    cursor: "pointer",
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    fontSize: "14px",
    textAlign: "left",
    fontWeight: 400,
  }),
});

const CustomAlgoliaDropdown = ({ attribute, hasIcon = false }) => {
  const {
    items,
    refine,
    canRefine,
  } = useMenu({ attribute });

  const options = items.map(item => ({
    value: item.value,
    label: `${item.label} (${item.count})`,
  }));

  const currentRefinement = items.find(item => item.isRefined)?.value || '';

  const selectedOption = options.find(opt => opt.value === currentRefinement) || null;

  const handleChange = (selected) => {
    console.log('Selected value:', selected?.value);
    refine(selected?.value || '');
  };

  if (!canRefine) return null;

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={handleChange}
      placeholder="Semua"
      isSearchable
      isClearable={true}
      styles={customStyles(hasIcon)}
      classNamePrefix="react-select"
    />
  );
};

export default CustomAlgoliaDropdown;
