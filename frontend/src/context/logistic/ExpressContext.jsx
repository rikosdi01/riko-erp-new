import { createContext, useContext, useEffect, useState } from 'react';
import React from "react"
import ExpressRepository from '../../repository/logistic/ExpressRepository';

const ExpressContext = createContext();

export const ExpressProvider = ({ children }) => {
    const [express, setExpress] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = ExpressRepository.getExpress((fetchedExpress) => {
            setExpress(fetchedExpress);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <ExpressContext.Provider value={{ express, isLoading }}>
            {children}
        </ExpressContext.Provider>
    );
};

export const useExpress = () => useContext(ExpressContext);