import { Search } from 'lucide-react';
import './FilterValue.css';

const FilterValue = ({ placeholder }) => {
    return (
        <select className="filter-select">
            <option value="">{placeholder}</option>
            <option value="1">Tercetak</option>
            <option value="2">Belum Tercetak</option>
        </select>
    )
}

export default FilterValue;