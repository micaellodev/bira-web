import React from 'react';

export const Footer = () => {
    const year = 2026;

    return (
        <footer className="w-full py-6 text-center text-xs text-white/40 relative z-20">
            <p>&copy; {year} Bira Party. Todos los derechos reservados.</p>
        </footer>
    );
};
