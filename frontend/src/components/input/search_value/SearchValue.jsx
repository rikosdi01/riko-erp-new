import { Search } from 'lucide-react';
import './SearchValue.css';

const SearchValue = ({ label }) => {
    return (
        <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input className="search-input" placeholder={`Cari ${label} dengan nama atau kata kunci...`} />
        </div>
    )
}

export default SearchValue;