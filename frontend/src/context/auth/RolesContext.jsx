import { createContext, useContext, useEffect, useState } from 'react';
import RolesRepository from '../../repository/authentication/RolesRepository';

const RolesContext = createContext();

export const RolesProvider = ({ children }) => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

    useEffect(() => {
        const unsubscribe = RolesRepository.getRoles((fetchedRoles) => {
            setRoles(fetchedRoles);
            setIsLoading(false); // Set loading false setelah data diambil
        });

        return () => unsubscribe();
    }, []);

    return (
        <RolesContext.Provider value={{ roles, isLoading }}>
            {children}
        </RolesContext.Provider>
    );
};

export const useRoles = () => useContext(RolesContext);