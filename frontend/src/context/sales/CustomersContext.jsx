import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import CustomersRepository from '../../repository/sales/CustomersRepository';

const CustomersContext = createContext();

export const CustomersProvider = ({ children }) => {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = CustomersRepository.getCustomers((fetchedCustomers) => {
            setCustomers(fetchedCustomers);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <CustomersContext.Provider value={{ customers, isLoading }}>
            {children}
        </CustomersContext.Provider>
    );
};

export const useCustomers = () => useContext(CustomersContext);