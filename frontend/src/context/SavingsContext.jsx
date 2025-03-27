import { createContext, useContext, useEffect, useState } from 'react';
import SavingsRepository from '../repository/SavingRepository';
import React from "react";

const SavingsContext = createContext();

export const SavingsProvider = ({ children }) => {
    const [savings, setSavings] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = SavingsRepository.getSavings((fetchedSavings) => {
            setSavings(fetchedSavings);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <SavingsContext.Provider value={{ savings, isLoading }}>
            {children}
        </SavingsContext.Provider>
    );
};

export const useSavings = () => useContext(SavingsContext);