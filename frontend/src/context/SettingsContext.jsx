import { createContext, useContext, useEffect, useState } from 'react';
import SettingsRepository from '../repository/SettingsRepository';
import React from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = SettingsRepository.getSettings((fetchedSettings) => {
            setSettings(fetchedSettings);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);