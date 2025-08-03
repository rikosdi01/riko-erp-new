// import Select from 'react-select';
// import { useMenu, useRefinementList } from 'react-instantsearch';
// import { useState } from 'react';

// const customStyles = (hasIcon) => ({
//   control: (provided, state) => ({
//     ...provided,
//     display: "flex",
//     alignItems: "center",
//     paddingLeft: hasIcon ? "30px" : undefined,
//     border: "1px solid #ccc",
//     boxShadow: "none",
//     borderRadius: "10px",
//     fontFamily: "Poppins",
//     fontSize: "14px",
//     transition: "border-color 0.2s ease, box-shadow 0.2s ease",
//     width: "100%",        // hanya ini yang diatur di dalam, lainnya dikontrol dari luar
//   }),
//   singleValue: (provided) => ({
//     ...provided,
//     color: "black",
//   }),
//   menu: (provided) => ({
//     ...provided,
//     zIndex: 1000,
//     fontSize: "14px",
//     fontWeight: 400,
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     background: state.isSelected
//       ? "linear-gradient(to top right, #0d82ff, #50a5fa)"
//       : state.isFocused
//         ? "#edeff1"
//         : "white",
//     color: state.isSelected ? "white" : "black",
//     cursor: "pointer",
//   }),
//   noOptionsMessage: (provided) => ({
//     ...provided,
//     fontSize: "14px",
//     textAlign: "left",
//     fontWeight: 400,
//   }),
//   menuPortal: base => ({
//     ...base,
//     zIndex: 9999,  // agar dropdown tidak ketutup modal atau elemen lain
//   }),
// });

// const CustomAlgoliaDropdown = ({ attribute, hasIcon = false }) => {
//   const { items, refine, searchForItems, canRefine } = useRefinementList({
//     attribute,
//     searchable: true,
//   });

//   const options = items.map(item => ({
//     value: item.value,
//     label: `${item.label} (${item.count})`,
//   }));

//   console.log('Items: ', items);

//   const currentRefinement = items.find(item => item.isRefined)?.value || '';
//   const [selectedOption, setSelectedOption] = useState(null);

//   console.log(`Refinement ${attribute}: ${currentRefinement}`);
//   const handleChange = (selected) => {
//     setSelectedOption(selected); // Update UI secara langsung
//     refine(selected?.value || '');
//   };

//   const handleInputChange = (input) => {
//     searchForItems(input); // 🔍 Ini yang penting
//     return input;
//   };

//   console.log('Selected Option: ', selectedOption);

//   if (!canRefine) return null;

//   return (
//     <div style={{ width: '100%', maxWidth: '250px', minWidth: '180px' }}>
//       <Select
//         options={options}
//         value={selectedOption}
//         onChange={handleChange}
//         onInputChange={handleInputChange}
//         placeholder="Semua"
//         isSearchable
//         isClearable={true}
//         styles={customStyles(hasIcon)}
//         classNamePrefix="react-select"
//         menuPortalTarget={document.body}
//         filterOption={null} // ⚠️ Jangan pakai filter lokal, agar pakai data dari Algolia
//       />
//     </div>
//   );
// };

// export default CustomAlgoliaDropdown;


import { useRefinementList } from 'react-instantsearch';
import { useState, useRef, useEffect } from 'react';
import './CustomDropdown.css';
import { Filter } from 'lucide-react';

const CustomDropdownCheckbox = ({ attribute, title }) => {
  const {
    items,
    refine,
    canRefine,
    searchForItems,
    isShowingMore,
    toggleShowMore,
    showMore
  } = useRefinementList({
    attribute,
    searchable: true,
    limit: 10, // limit awal
    showMore: true, // Aktifkan fitur showMore
    showMoreLimit: 100, // Batas maksimum item ketika diperluas
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!canRefine) return null;

  const sortedItems = [...items].sort((a, b) => {
    if (a.isRefined && !b.isRefined) return -1;
    if (!a.isRefined && b.isRefined) return 1;
    return a.label.localeCompare(b.label); // sort alphabetically
  });

  return (
    <div className="custom-dropdown-wrapper" ref={dropdownRef}>
      <div
        className="custom-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className='custom-dropdown-title'>
          <span><Filter size={16} color='grey' /></span> {title || 'Filter'}
        </div>
      </div>
      {isOpen && (
        <div className="custom-checkbox-filter">
          <input
            type="text"
            placeholder="Cari..."
            onChange={(e) => searchForItems(e.target.value)}
            className="search-box"
          />
          <ul className="checkbox-list">
            {sortedItems.map((item) => (
              <li key={item.label}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.isRefined}
                    onChange={() => refine(item.value)}
                  />
                  {item.label} {item.merk} ({item.count})
                </label>
              </li>
            ))}
          </ul>
          {items.length >= 10 && (
            <button onClick={toggleShowMore} className='show-more-button'>
              {isShowingMore ? 'Tampilkan lebih sedikit' : 'Tampilkan semua'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdownCheckbox;