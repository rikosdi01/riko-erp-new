import React, { useState } from "react";
import GPSMap from "../../../../service/GPSService";
import { Search, ChevronDown, Circle, Truck } from "lucide-react";
import './TrackingOrder.css';

const orders = [
    {
        id: 1,
        name: "#DO25C0001",
        lat: -6.200000,
        lng: 106.816666,
        status: "Dikirim",
        tracking: [
            { date: "30 Maret 2024, 12:46", status: "Pesanan diproses", completed: true },
            { date: "30 Maret 2024, 14:27", status: "Pesanan dikirim", completed: true },
            { date: "30 April 2024, 16:45", status: "Pesanan sampai tujuan", completed: false }
        ]
    },
    // {
    //     id: 2,
    //     name: "#DO25C0002",
    //     lat: -6.210000,
    //     lng: 106.820000,
    //     status: "Dikirim",
    //     tracking: [
    //         { date: "2024-03-29", status: "Pesanan diproses", completed: true },
    //         { date: "2024-03-30", status: "Pesanan dikirim", completed: false }
    //     ]
    // },
    {
        id: 2,
        name: "#DO25C0004",
        lat: -6.220000,
        lng: 106.830000,
        status: "Menunggu",
        tracking: [
            { date: "2024-03-28", status: "Pesanan diproses", completed: false },
            { date: "30 Maret 2024, 14:27", status: "Pesanan dikirim", completed: false },
            { date: "30 April 2024, 16:45", status: "Pesanan sampai tujuan", completed: false }
        ]
    }
];

const TrackingOrder = () => {
    const [orderLocation, setOrderLocation] = useState(orders[0]); // Default ke order pertama
    const [expandedOrder, setExpandedOrder] = useState(null); // Simpan ID order yang terbuka

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Selesai":
                return "status-completed"; // Hijau
            case "Dikirim":
                return "status-shipped"; // Kuning
            case "Menunggu":
                return "status-pending"; // Abu-abu (default)
            default:
                return "";
        }
    };

    return (
        <div className="tracking-container">
            {/* Sidebar Order */}
            <div className="tracking-panel">
                <div className="input-wrapper">
                    <Search className="input-icon" size={16} />
                    <input placeholder="Cari Orderan..." className="tracking-search" />
                </div>
                <ul className="order-list">
                    {/* {orders.map((order) => (
                        <li key={order.id} className={`order-item ${orderLocation.id === order.id ? "active" : ""}`}>
                            <div className="order-header" onClick={() => {
                                setOrderLocation(order);
                                toggleExpand(order.id);
                            }}>
                                <div className="order-info">
                                    <Truck size={20} className="order-info-icon" />
                                    <div>
                                        <span className="order-info-title">No. Pengiriman</span>
                                        <span className="order-info-value">{order.name}</span>
                                    </div>
                                </div>
                                <div className="order-info-right">
                                    <div className={`order-info-status ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </div>
                                    <ChevronDown
                                        className={`dropdown-icon ${expandedOrder === order.id ? "rotated" : ""}`}
                                        size={16}
                                    />
                                </div>
                            </div>

                            {expandedOrder === order.id && (
                                <ul className="tracking-details">
                                    {order.tracking.map((step, index) => (
                                        <li key={index} className="tracking-step">
                                            <div className="tracking-indicator">
                                                <Circle
                                                    className={`tracking-radio ${step.completed ? "completed" : ""}`}
                                                    size={16}
                                                />
                                                {index < order.tracking.length - 1 && <div className="tracking-line"></div>}
                                            </div>
                                            <div className="tracking-info">
                                                <span className="tracking-date">{step.date}</span>
                                                <span className="tracking-status">{step.status}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))} */}
                    Tidak ada data
                </ul>
            </div>

            {/* Peta */}
            <div className="tracking-map">
                <GPSMap orderLocation={orderLocation} />
            </div>
        </div>
    );
};

export default TrackingOrder;
