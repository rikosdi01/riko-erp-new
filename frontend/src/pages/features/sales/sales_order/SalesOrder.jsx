import './SalesOrder.css';
import MainContainer from '../../../../components/container/main_container/MainContainer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSalesOrder } from '../../../../context/sales/SalesOrderContext';
import Formatting from '../../../../utils/format/Formatting';

const SalesOrder = () => {
    // Hooks
    const navigate = useNavigate();


    // ================================================================================


    // Context
    const { salesOrder, isLoading } = useSalesOrder();


    // ================================================================================


    // Variables
    const [searchTerm, setSearchTerm] = useState("");


    // ================================================================================


    // Data
    // Columns Data
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

    // Filter Data
    const filteredSalesOrders = salesOrder.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Formatting.formatDate(order.createdAt).toLowerCase().includes(searchTerm.toLowerCase())
    );


    // ================================================================================


    // Navigation
    // Navigation to Create
    const navigateToCreateSalesOrder = () => {
        navigate('/sales/sales-order/new');
    }


    // ================================================================================


    // Logic


    // ================================================================================


    // Page Container
    return (
        <MainContainer
            pageLabel="Pesanan"
            setSearchValue={setSearchTerm}
            createOnclick={navigateToCreateSalesOrder}
            columns={columns}
            data={filteredSalesOrders}
            isLoading={isLoading}
        />
    );
}

export default SalesOrder;
