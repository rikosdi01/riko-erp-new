import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import TransferRepository from '../../repository/warehouse/TransferRepository';

const TransferContext = createContext();

export const TransferProvider = ({ children }) => {
    const [transfer, setAdjustment] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = TransferRepository.getTransfer((fetchedTransfer) => {
            setAdjustment(fetchedTransfer);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <TransferContext.Provider value={{ transfer, isLoading }}>
            {children}
        </TransferContext.Provider>
    );
};

export const useTransfer = () => useContext(TransferContext);