// File: lib/use-debounce.ts
import * as React from "react";
export function useDebounce<T>(value: T, delay = 350) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}
