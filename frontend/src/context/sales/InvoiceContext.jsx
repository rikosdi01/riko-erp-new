import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import InvoiceRepository from '../../repository/sales/InvoiceRepository';

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
    const [invoice, setInvoice] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = InvoiceRepository.getInvoice((fetchedInvoice) => {
            setInvoice(fetchedInvoice);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <InvoiceContext.Provider value={{ invoice, isLoading }}>
            {children}
        </InvoiceContext.Provider>
    );
};

export const useInvoice = () => useContext(InvoiceContext);