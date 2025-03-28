import './CSO.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import { useCSO } from '../../../../context/sales/CSOContext';

const CSO = () => {
    const navigate = useNavigate();
    const { cso, isLoading } = useCSO();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === cso.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cso.map((emp) => emp.id));
        }
    };

    const navigateToCreateMerk = () => {
        navigate('/warehouse/cso/new');
    }

    const navigateToDetailMerk = (id) => {
        navigate(`/warehouse/cso/${id}`);
    }

    const columns = [
        { header: "Kode CSO", accessor: "code" },
        { header: "Nama CSO", accessor: "name" },
        { header: "Sales", accessor: "salesName"}
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="merek" />

                <FilterValue placeholder={"Semua Kategori"} />

                {/* Import */}
                <IconButton
                    tooltipLabel="Impor"
                    icon={<Download size={18} />}
                />

                {/* Export */}
                <IconButton
                    tooltipLabel="Ekspor"
                    icon={<Upload size={18} />}
                />

                {/* Create */}
                <IconButton
                    tooltipLabel="Tambah Merek"
                    icon={<Plus size={18} />}
                    onclick={navigateToCreateMerk}
                    background='#0d82ff'
                    color='white'
                />
            </div>

            <Table
                columns={columns}
                data={cso}
                isLoading={isLoading}
                selectedItems={selectedItems}
                onCheckboxChange={handleCheckboxChange}
                onSelectAllChange={handleSelectAllChange}
                handleDeleteItems={() => { }}
                title="Merek"
                onclick={(id) => navigateToDetailMerk(id)}
            />

            {/* Tooltip dengan efek fade-in dan muncul di bawah */}
            <Tooltip
                id="tooltip"
                place="bottom"
                effect="solid"
                delayShow={200}
                className="custom-tooltip"
            />
        </div>
    );
}

export default CSO;
