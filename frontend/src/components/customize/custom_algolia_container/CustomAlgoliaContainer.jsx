import { useEffect, useMemo, useState } from 'react';
import Table from '../../table/Table';
import './CustomAlgoliaContainer.css';
import { Configure, InstantSearch, useHits } from 'react-instantsearch';
import CustomPagination from '../custom_pagination/CustomPagination';
import CustomSearchBox from '../custom_searchbox/CustomSearchBox';
import IconButton from '../../button/icon_button/IconButton';
import { Download, Plus, Upload } from 'lucide-react';
import AlgoliaListener from '../custom_listener/CustomListener';
import CustomAlgoliaDropdown from '../custom_dropdown/CustomDropdown';
import AccessAlertModal from '../../modal/access_alert_modal/AccessAlertModal';
import { history } from 'instantsearch.js/es/lib/routers';
import { singleIndex } from 'instantsearch.js/es/lib/stateMappings';
import CustomCheckbox from '../custom_checkbox/CustomCheckbox';

const CustomAlgoliaContainer = ({
    pageLabel,
    searchClient,
    indexName,
    columns,
    subscribeFn,
    createOnclick,
    enableDropdown = false,
    dropdownAttribute,
    enableDropdown2 = false,
    dropdownAttribute3,
    enableDropdown3 = false,
    dropdownAttribute2,
    enableCheckbox1 = false,
    checkbox1Label,
    checkbox1Attribute,  // Add ID prop
    enableCheckbox2 = false,
    checkbox2Label,
    checkbox2Attribute,  // Add ID prop
    enableImport = true,
    enableExport = true,
    enableCreate = true,
    filters,
    isSecondary = false,
    canEdit,
    canAdd,
    onTableClick,
    tableType = 'default',
    enableDateRange = false,
}) => {
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [accessDenied, setAccessDenied] = useState(false);
    const [selectedValue, setSelectedValue] = useState(null);


    const toLocalDateString = (date) =>
        date.toLocaleDateString('sv-SE'); // menghasilkan 'YYYY-MM-DD'

    const initialStartDate = toLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const initialEndDate = toLocalDateString(new Date());


    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);




    useEffect(() => {
        console.log('Selected Value adasd:', selectedValue);
    }, [selectedValue]);

    useEffect(() => {
        console.log('itemsPerPage:', itemsPerPage);
    }, [itemsPerPage]);

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    const ItemsHit = () => {
        const { items } = useHits();

        return (
            <Table
                isAlgoliaTable={true}
                columns={columns}
                data={items}
                isLoading={false}
                selectedItems={selectedItems}
                onCheckboxChange={handleCheckboxChange}
                onSelectAllChange={handleSelectAllChange}
                handleDeleteItems={() => { }}
                title={pageLabel}
                canEdit={canEdit}
                onclick={(id) => navigateToDetail(id)}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                enableCheckbox={false}
                isSecondary={isSecondary}
                onTableClick={onTableClick}
                selectedValue={selectedValue}
                setSelectedValue={setSelectedValue}
                tableType={tableType}
            />
        )
    }


    // ================================================================================


    // Variables
    const [selectedItems, setSelectedItems] = useState([]);


    // ================================================================================


    // Logic
    // Checkbox Checked
    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    // Checkbox Selected All
    const handleSelectAllChange = () => {
        if (selectedItems.length === merks.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(merks.map((emp) => emp.id));
        }
    };

    const formattedDateFilter = useMemo(() => {
        if (!enableDateRange) return filters; // ⬅️ kunci solusi

        if (!startDate && !endDate) return filters;

        const start = startDate ? new Date(startDate).getTime() : null;
        const end = endDate ? new Date(endDate + 'T23:59:59.999').getTime() : null;

        let dateFilter = "";

        if (start && end) {
            dateFilter = `createdAt >= ${start} AND createdAt <= ${end}`;
        } else if (start) {
            dateFilter = `createdAt >= ${start}`;
        } else if (end) {
            dateFilter = `createdAt <= ${end}`;
        }

        return filters ? `${filters} AND ${dateFilter}` : dateFilter;
    }, [enableDateRange, startDate, endDate, filters]);




    // ================================================================================

    return (
        <div className="main-container">
            <InstantSearch
                searchClient={searchClient}
                indexName={indexName}
                routing={{
                    router: history(),
                    stateMapping: singleIndex(indexName),
                }}
            >

                <AlgoliaListener subscribeFn={subscribeFn} />
                <Configure
                    hitsPerPage={itemsPerPage}
                    filters={enableDateRange ? formattedDateFilter : filters}
                />


                <div className="main-container-header">
                    <CustomSearchBox
                        placeholder={`Cari ${pageLabel} dengan nama atau kata kunci...`}
                    />

                    {enableDropdown && (
                        <CustomAlgoliaDropdown
                            attribute={dropdownAttribute}
                        />
                    )}

                    {enableDropdown2 && (
                        <CustomAlgoliaDropdown
                            attribute={dropdownAttribute2}
                        />
                    )}

                    {enableDropdown3 && (
                        <CustomAlgoliaDropdown
                            attribute={dropdownAttribute3}
                        />
                    )}

                    {enableDateRange && (
                        <div className="date-range-filter">
                            <input
                                type="date"
                                value={startDate || ""}
                                onChange={(e) => setStartDate(e.target.value)}
                                className='date-range-filter-container'
                            />
                            <span> - </span>
                            <input
                                type="date"
                                value={endDate || ""}
                                onChange={(e) => setEndDate(e.target.value)}
                                className='date-range-filter-container'
                            />
                        </div>
                    )}


                    {/* Import */}
                    {enableImport && (
                        <IconButton
                            tooltipLabel={`Impor ${pageLabel}`}
                            icon={<Download size={18} />}
                        />
                    )}

                    {/* Export */}
                    {enableExport && (
                        <IconButton
                            tooltipLabel={`Ekspor ${pageLabel}`}
                            icon={<Upload size={18} />}
                        />
                    )}

                    {/* Create */}
                    {enableCreate && (
                        <IconButton
                            tooltipLabel={`Tambah ${pageLabel}`}
                            icon={<Plus size={18} />}
                            onclick={() => canAdd ? createOnclick() : handleRestricedAction()}
                            background='#0d82ff'
                            color='white'
                        />
                    )}
                </div>

                {/* Checkbox */}
                <div className='checkbox-container'>
                    {enableCheckbox1 && (
                        <CustomCheckbox
                            key={`checkbox-${checkbox1Attribute}`} // Tambahkan key unik
                            attribute={checkbox1Attribute}
                            title={checkbox1Label} // Berikan title agar terlihat di UI
                        />
                    )}
                    {enableCheckbox2 && (
                        <CustomCheckbox
                            key={`checkbox-${checkbox2Attribute}`} // Tambahkan key unik
                            attribute={checkbox2Attribute}
                            title={checkbox2Label} // Berikan title agar terlihat di UI
                        />
                    )}

                    {/* <CustomCheckbox /> */}
                </div>

                <div className='table-wrapper'>
                    <ItemsHit />

                    <CustomPagination
                        itemsPerPage={itemsPerPage}
                        setItemsPerPage={setItemsPerPage}
                    />
                </div>

            </InstantSearch>

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />
        </div>
    )
}

export default CustomAlgoliaContainer;