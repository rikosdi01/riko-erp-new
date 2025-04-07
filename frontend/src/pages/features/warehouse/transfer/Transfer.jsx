import './Transfer.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import Formatting from '../../../../utils/format/Formatting';
import { useTransfer } from '../../../../context/warehouse/TransferContext';

const Transfer = () => {
    const navigate = useNavigate();
    const { transfer, isLoading } = useTransfer();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === transfer.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(transfer.map((emp) => emp.id));
        }
    };

    const navigateToCreateCategory = () => {
        navigate('/inventory/transfer/new');
    }

    const navigateToDetailsCategory = (id) => {
        navigate(`/inventory/transfer/${id}`);
    }

    const columns = [
        { header: "No. Transferan", accessor: "code" },
        { header: "Keterangan", accessor: "description" },
        { header: "Gudang Dari", accessor: "warehouseFrom" },
        { header: "Gudang Ke", accessor: "warehouseTo" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDate(value)
        },
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="merek" />

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
                    tooltipLabel="Tambah Kategori"
                    icon={<Plus size={18} />}
                    onclick={navigateToCreateCategory}
                    background='#0d82ff'
                    color='white'
                />
            </div>

            <Table
                columns={columns}
                data={transfer}
                isLoading={isLoading}
                selectedItems={selectedItems}
                onCheckboxChange={handleCheckboxChange}
                onSelectAllChange={handleSelectAllChange}
                handleDeleteItems={() => { }}
                title="Merek"
                onclick={(id) => navigateToDetailsCategory(id)}
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

export default Transfer;
