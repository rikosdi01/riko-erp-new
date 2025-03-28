import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import SalesOrderRepository from '../../repository/sales/SalesOrderRepository';

const SalesOrderContext = createContext();

export const SalesOrderProvider = ({ children }) => {
    const [salesOrder, setSalesOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = SalesOrderRepository.getSalesOrder((fetchedSalesOrder) => {
            setSalesOrder(fetchedSalesOrder);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <SalesOrderContext.Provider value={{ salesOrder, isLoading }}>
            {children}
        </SalesOrderContext.Provider>
    );
};

export const useSalesOrder = () => useContext(SalesOrderContext);