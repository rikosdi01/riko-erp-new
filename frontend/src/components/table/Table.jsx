import { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import "./Table.css";
import AccessAlertModal from "../modal/access_alert_modal/AccessAlertModal";

const Table = ({
    isAlgoliaTable = false,
    columns = [],
    data = [],
    isLoading,
    onFilterClick, // Tambahkan fungsi untuk menangani filter
    isSecondary,
    canEdit,
    onTableClick,
}) => {
    // Hooks
    const location = useLocation();
    const navigate = useNavigate();
    console.log('Data: ', data);
    const [currentPage, setCurrentPage] = useState(1);
    const [accessDenied, setAccessDenied] = useState(false);

    const [itemsPerPage, setItemsPerPage] = useState(8);

    const safeData = Array.isArray(data) ? data : [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = isAlgoliaTable ? data : safeData.slice(startIndex, startIndex + itemsPerPage);


    // Navigation
    // Navigation to Detail
    const navigateToDetail = (id) => {
        navigate(`${location.pathname}/${id}`);
    }

    const handleRestricedAction = () => {
        setAccessDenied(true);
    }

    return (
        <div className={!isAlgoliaTable ? 'table-wrapper' : ''}>
            <table>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>
                                <div className="table-header">
                                    {col.header}
                                    <button
                                        className="filter-btn"
                                        onClick={() => onFilterClick(col.accessor)}
                                    >
                                        {/* <Filter size={16} /> */}
                                    </button>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '10px' }}>
                                Sedang memuat...
                            </td>
                        </tr>
                    ) : (
                        currentData.length > 0 ? (
                            currentData.map((item) => (
                                <tr
                                    key={item.id || item.objectID}
                                    onClick={() => {
                                        if (onTableClick) {
                                            onTableClick(item); // atau kirim item.id jika hanya ID yang diperlukan
                                        } else {
                                            if (canEdit) {
                                                isSecondary ? navigateToDetail(item.id || item.objectID + ' - ' + item.secondaryId) : navigateToDetail(item.id || item.objectID)
                                            } else {
                                                handleRestricedAction();
                                            }
                                        }
                                    }
                                    }
                                >
                                    {columns.map((col) => (
                                        <td key={`${item.id}-${col.accessor}`}>
                                            {col.renderCell
                                                ? col.renderCell(
                                                    col.accessor.includes(".")
                                                        ? col.accessor.split('.').reduce((obj, key) => obj?.[key], item)
                                                        : item[col.accessor],
                                                    item
                                                )
                                                : (col.accessor.includes(".")
                                                    ? col.accessor.split('.').reduce((obj, key) => obj?.[key], item)
                                                    : item[col.accessor])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '10px' }}>
                                    Tidak ada data
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {!isAlgoliaTable && (
                <div className="pagination">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                        &laquo; Awal
                    </button>
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                        &lt; Prev
                    </button>
                    {/* <span>Hal. {currentPage} | {totalPages}</span> */}
                    <span>Hal. {currentPage} | {1}</span>
                    {/* <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}> */}
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={true}>
                        Next &gt;
                    </button>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={true}>
                        Akhir &raquo;
                    </button>
                    
                    <div className="items-per-page">
                        <select value={itemsPerPage} onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}>
                            <option value={8}>8</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span> per halaman</span>
                    </div>
                </div>
            )}

            <AccessAlertModal
                isOpen={accessDenied}
                onClose={() => setAccessDenied(false)}
            />
        </div>
    );
};

export default Table;
