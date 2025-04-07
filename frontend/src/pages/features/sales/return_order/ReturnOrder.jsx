import './ReturnOrder.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import Formatting from '../../../../utils/format/Formatting';
import { useReturnOrder } from '../../../../context/sales/ReturnOrderContext';

const ReturnOrder = () => {
    const navigate = useNavigate();
    const { returnOrder, isLoading } = useReturnOrder();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === returnOrder.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(returnOrder.map((emp) => emp.id));
        }
    };

    const navigateToCreateMerk = () => {
        navigate('/sales/return-order/new');
    }

    const navigateToDetailMerk = (id) => {
        navigate(`/sales/return-order/${id}`);
    }

    const columns = [
        { header: "No. Returan", accessor: "code" },
        { header: "No. Faktur", accessor: "noInvoice" },
        { 
            header: "Tanggal Returan",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDate(value),
         },
        { header: "Keterangan Retur", accessor: "description" },
        { header: "Total Kuantitas", accessor: "totalQty"},
        {
            header: "Total Harga",
            accessor: "totalPrice",
            renderCell: (value) => Formatting.formatCurrencyIDR(value)
        },
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="returan" />

                <FilterValue placeholder={"Semua Status"} />

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
                data={returnOrder}
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

export default ReturnOrder;
