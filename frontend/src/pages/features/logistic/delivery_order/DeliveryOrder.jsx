import './DeliveryOrder.css';
import { Download, Plus, Upload } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";
import SearchValue from '../../../../components/input/search_value/SearchValue';
import FilterValue from '../../../../components/filter/FilterValue/FilterValue';
import IconButton from '../../../../components/button/icon_button/IconButton';
import Table from '../../../../components/table/Table';
import { useState } from 'react';
import Formatting from '../../../../utils/format/Formatting';
import { useDeliveryOrder } from '../../../../context/logistic/DeliveryOrderContext';

const DeliveryOrder = () => {
    const navigate = useNavigate();
    const { deliveryOrder, isLoading } = useDeliveryOrder();
    const [selectedItems, setSelectedItems] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleSelectAllChange = () => {
        if (selectedItems.length === deliveryOrder.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(deliveryOrder.map((emp) => emp.id));
        }
    };

    const navigateToDetailMerk = (id) => {
        navigate(`/logistic/delivery-order/${id}`);
    }

    const columns = [
        { header: "No. Pengiriman", accessor: "code" },
        { 
            header: "Tanggal",
            accessor: "createdAt",
            renderCell: (value) => Formatting.formatDate(value),
         },
        { header: "Pelanggan", accessor: "customerName" },
        { header: "Keterangan", accessor: "description" },
        { header: "Status Pesanan", accessor: "statusDO"},
        { header: "Status", accessor: "status"}
    ]

    return (
        <div className="main-container">
            <div className="main-container-header">
                <SearchValue label="pesanan" />

                <FilterValue placeholder={"Semua Status Pesanan"} />
                <FilterValue placeholder={"Semua Status"} />

            </div>

            <Table
                columns={columns}
                data={deliveryOrder}
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

export default DeliveryOrder;
