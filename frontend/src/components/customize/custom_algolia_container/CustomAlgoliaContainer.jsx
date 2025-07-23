import { useEffect, useState } from 'react';
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
    enableImport = true,
    enableExport = true,
    enableCreate = true,
    filters,
    isSecondary = false,
    canEdit,
    canAdd,
}) => {
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [accessDenied, setAccessDenied] = useState(false);

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


    // ================================================================================

    return (
        <div className="main-container">
            <InstantSearch
                searchClient={searchClient}
                indexName={indexName}
            >

                <AlgoliaListener subscribeFn={subscribeFn} />
                <Configure
                    hitsPerPage={itemsPerPage}
                    filters={filters}
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