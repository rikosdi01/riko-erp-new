import { Search } from 'lucide-react';
import './SearchValue.css';

const SearchValue = ({ label, onSearchChange }) => {
    return (
        <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input 
                className="search-input" 
                placeholder={`Cari ${label} dengan nama atau kata kunci...`} 
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
};

export default SearchValue;
