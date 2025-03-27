import { createContext, useContext, useEffect, useState } from 'react';
import LoansRepository from '../repository/LoanRepository.jsx';
import React from "react";

const LoansContext = createContext();

export const LoansProvider = ({ children }) => {
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = LoansRepository.getLoans((fetchedLoans) => {
            setLoans(fetchedLoans);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <LoansContext.Provider value={{ loans, isLoading }}>
            {children}
        </LoansContext.Provider>
    );
};

export const useLoans = () => useContext(LoansContext);