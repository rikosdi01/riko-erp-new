import { useEffect, useRef } from "react";
import { useInstantSearch } from "react-instantsearch";

// Listener
const AlgoliaListener = ({ subscribeFn }) => {
    const { refresh, status } = useInstantSearch();
    const statusRef = useRef(status);
    const isMounted = useRef(false);

    // Update ref ketika status berubah
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // Track mount status
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const timeoutId = useRef(null);

    useEffect(() => {
        if (!subscribeFn) return;

        const unsub = subscribeFn(() => {
            if (timeoutId.current) clearTimeout(timeoutId.current);

            timeoutId.current = setTimeout(() => {
                if (isMounted.current && statusRef.current === 'idle') {
                    refresh();
                } else {
                    console.log('Refresh ditunda karena status:', statusRef.current);
                }
            }, 1000);
        });

        return () => {
            if (timeoutId.current) clearTimeout(timeoutId.current);
            unsub();
        };
    }, [refresh]);

    return null;
};

export default AlgoliaListener;