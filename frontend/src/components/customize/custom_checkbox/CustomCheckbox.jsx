
import { useToggleRefinement } from 'react-instantsearch';
import './CustomCheckbox.css';

const CustomCheckbox = ({ attribute, title }) => {
  const { value, refine } = useToggleRefinement({
    attribute: attribute,
    on: false,
    off: true,
  });

  const handleChange = (e) => {
    refine({ isRefined: !e.target.checked }); // Toggle refinement
    console.log('Refine: ', refine);
  };

  return (
    <div className="main-container-checkbox">
      <input
        id={`main-container-${attribute}`}
        type="checkbox"
        checked={value.isRefined}
        onChange={handleChange}
      />
      <label htmlFor={`main-container-${attribute}`}>{title}</label>
    </div>
  );
};

export default CustomCheckbox;
