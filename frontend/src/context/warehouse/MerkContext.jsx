import { createContext, useContext, useEffect, useState } from 'react';
import React from "react";
import MerksRepository from '../../repository/warehouse/MerksRepository';

const MerkContext = createContext();

export const MerkProvider = ({ children }) => {
    const [merks, setMerks] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = MerksRepository.getMerks((fetchedMerks) => {
            setMerks(fetchedMerks);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <MerkContext.Provider value={{ merks, isLoading }}>
            {children}
        </MerkContext.Provider>
    );
};

export const useMerks = () => useContext(MerkContext);