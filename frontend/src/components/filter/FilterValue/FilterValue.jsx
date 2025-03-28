import { Search } from 'lucide-react';
import './FilterValue.css';

const FilterValue = ({ placeholder }) => {
    return (
        <select className="filter-select">
            <option value="">{placeholder}</option>
        </select>
    )
}

export default FilterValue;