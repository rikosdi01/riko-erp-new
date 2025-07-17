import './MainContainer.css';
import { Download, Plus, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from 'react';
import SearchValue from '../../input/search_value/SearchValue';
import CustomTooltip from '../../customize/custom_tooltip/CustomTooltip';
import IconButton from '../../button/icon_button/IconButton';
import Table from '../../table/Table';

const MainContainer = ({
    pageLabel,
    setSearchValue,
    createOnclick,
    columns,
    data,
    isLoading,
    canEdit,
}) => {
    // Hooks
    const navigate = useNavigate();
    const location = useLocation();


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


    // Navigation
    // Navigation to Detail
    const navigateToDetail = (id) => {
        navigate(`${location.pathname}/${id}`);
    }


    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue
                    label={pageLabel}
                    setSearchValue={setSearchValue}
                />

                {/* Import */}
                <IconButton
                    tooltipLabel={`Impor ${pageLabel}`}
                    icon={<Download size={18} />}
                />

                {/* Export */}
                <IconButton
                    tooltipLabel={`Ekspor ${pageLabel}`}
                    icon={<Upload size={18} />}
                />

                {/* Create */}
                <IconButton
                    tooltipLabel={`Tambah ${pageLabel}`}
                    icon={<Plus size={18} />}
                    onclick={createOnclick}
                    background='#0d82ff'
                    color='white'
                />
            </div>

            <Table
                columns={columns}
                data={data}
                isLoading={isLoading}
                selectedItems={selectedItems}
                onCheckboxChange={handleCheckboxChange}
                onSelectAllChange={handleSelectAllChange}
                handleDeleteItems={() => { }}
                title={pageLabel}
                onclick={(id) => navigateToDetail(id)}
                canEdit={canEdit}
            />

            {/* Tooltip dengan efek fade-in dan muncul di bawah */}
            <CustomTooltip />
        </div>
    );
}

export default MainContainer;
