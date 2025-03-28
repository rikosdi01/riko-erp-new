import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import CSORepository from '../../repository/sales/CSORepository';

const CSOContext = createContext();

export const CSOProvider = ({ children }) => {
    const [cso, setCSO] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = CSORepository.getCSO((fetchedCSO) => {
            setCSO(fetchedCSO);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <CSOContext.Provider value={{ cso, isLoading }}>
            {children}
        </CSOContext.Provider>
    );
};

export const useCSO = () => useContext(CSOContext);