import './SalesOrder.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import { useSalesOrder } from '../../../../context/sales/SalesOrderContext';
import Formatting from '../../../../utils/format/Formatting';

const SalesOrder = () => {
    const navigate = useNavigate();
    const { salesOrder, isLoading } = useSalesOrder();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === salesOrder.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(salesOrder.map((emp) => emp.id));
        }
    };

    const navigateToCreateMerk = () => {
        navigate('/sales/sales-order/new');
    }

    const navigateToDetailMerk = (id) => {
        navigate(`/sales/sales-order/${id}`);
    }

    const columns = [
        { header: "No. Pesanan", accessor: "code" },
        {
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDate(value),
        },
        { header: "Nama Pelanggan", accessor: "customerName" },
        { header: "Keterangan", accessor: "description" },
        {
            header: "Harga",
            accessor: "price",
            renderCell: (value) => Formatting.formatCurrencyIDR(value),
        },
        { header: "Status", accessor: "status" }
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="pesanan" />

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
                data={salesOrder}
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

export default SalesOrder;
