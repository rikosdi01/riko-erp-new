import { useState, useEffect } from 'react';
import { useInstantSearch } from 'react-instantsearch';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './PriceFilter.css'
import Formatting from '../../../../utils/format/Formatting';

const PriceFilter = ({ indexName, searchClient, onFilterChange }) => {
    const { setUiState, indexUiState } = useInstantSearch();

    const [rangeMin, setRangeMin] = useState(0);
    const [rangeMax, setRangeMax] = useState(100000);
    const [priceRange, setPriceRange] = useState([0, 100000]);

    const minPriceIndex = searchClient.initIndex('ItemsRMP80RIKO_price_asc');
    const maxPriceIndex = searchClient.initIndex('ItemsRMP80RIKO_price_desc');

    useEffect(() => {
        const fetchPriceRange = async () => {
            try {
                const minRes = await minPriceIndex.search('', {
                    hitsPerPage: 1,
                    page: 0,
                    filters: 'salePrice > 0',
                });
                const maxRes = await maxPriceIndex.search('', {
                    hitsPerPage: 1,
                    page: 0,
                    filters: 'salePrice > 0',
                });

                const min = minRes.hits[0]?.salePrice ?? 0;
                const max = maxRes.hits[0]?.salePrice ?? 100000;

                setRangeMin(min);
                setRangeMax(max);
                setPriceRange([min, max]);
            } catch (err) {
                console.error('Fetch price range error:', err);
            }
        };

        fetchPriceRange();
    }, []);


    useEffect(() => {
        const fakeMin = 0;
        const fakeMax = 100000;
        setRangeMin(fakeMin);
        setRangeMax(fakeMax);
        setPriceRange([fakeMin, fakeMax]);
    }, []);

    useEffect(() => {
        const filterString = indexUiState?.configure?.filters || '';
        const matchMin = filterString.match(/salePrice\s*>=\s*(\d+)/);
        const matchMax = filterString.match(/salePrice\s*<=\s*(\d+)/);

        const min = matchMin ? Number(matchMin[1]) : rangeMin;
        const max = matchMax ? Number(matchMax[1]) : rangeMax;
        setPriceRange([min, max]);
    }, [indexUiState]);

    const applyFilter = () => {
        const [min, max] = priceRange;
        const filters = [`salePrice >= ${min}`, `salePrice <= ${max}`].join(' AND ');

        setUiState((prevUiState) => ({
            ...prevUiState,
            [indexName]: {
                ...prevUiState[indexName],
                configure: {
                    ...prevUiState[indexName]?.configure,
                    filters: filters || undefined,
                },
            },
        }));

        if (onFilterChange) {
            onFilterChange(filters || null);
        }
    };

    return (
        <div className='filter-container'>
            <div className="price-filter-container">
                <label>Rentang Harga</label>
                <div className="price-values" style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <input
                        type="text"
                        value={Formatting.formatCurrencyIDR(priceRange[0])}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, ''); // hanya angka
                            const parsed = Number(raw);
                            if (!isNaN(parsed)) {
                                setPriceRange([parsed, priceRange[1]]);
                            }
                        }}
                    />
                    <span> - </span>
                    <input
                        type="text"
                        value={Formatting.formatCurrencyIDR(priceRange[1])}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, ''); // hanya angka
                            const parsed = Number(raw);
                            if (!isNaN(parsed)) {
                                setPriceRange([priceRange[0], parsed]);
                            }
                        }}
                    />

                </div>
                <Slider
                    range
                    min={rangeMin}
                    max={rangeMax}
                    value={priceRange}
                    onChange={setPriceRange}
                    allowCross={false}
                    styles={{
                        track: { backgroundColor: '#007bff' },
                        handle: { borderColor: '#007bff' }
                    }}
                />

                <button onClick={applyFilter} style={{ marginTop: 10 }}>Terapkan</button>
            </div>
        </div>
    );
};

export default PriceFilter;
