// CustomSearchBox.jsx
import { Search, X } from 'lucide-react';
import { useSearchBox } from 'react-instantsearch';
import { useEffect, useState } from 'react';

const CustomSearchBox = ({
    placeholder,
    debounceDelay = 500
}) => {
    const { refine, query } = useSearchBox();
    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        const handler = setTimeout(() => {
            refine(inputValue);
        }, debounceDelay);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, refine, debounceDelay]);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    return (
        <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
                className="search-input"
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            {inputValue && (
                <X size={18}
                    className="input-leading-icon"
                    style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        cursor: 'pointer', color: 'var(--icon-color)'
                    }}
                    onClick={() => setInputValue('')}
                />
            )}
        </div>
    );
};

export default CustomSearchBox;