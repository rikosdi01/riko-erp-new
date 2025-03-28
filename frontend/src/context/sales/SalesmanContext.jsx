import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import SalesOrderRepository from '../../repository/sales/SalesOrderRepository';
import SalesmanRepository from '../../repository/sales/SalesmanRepository';

const SalesmanContext = createContext();

export const SalesmanProvider = ({ children }) => {
    const [salesman, setSalesman] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = SalesmanRepository.getSalesman((fetchedSalesman) => {
            setSalesman(fetchedSalesman);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <SalesmanContext.Provider value={{ salesman, isLoading }}>
            {children}
        </SalesmanContext.Provider>
    );
};

export const useSalesman = () => useContext(SalesmanContext);