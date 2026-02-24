import React from 'react';

export const Footer = () => {
    const year = 2026;

    return (
        <footer className="w-full pb-4 pt-2 text-center text-xs text-white font-bold [text-shadow:0_2px_4px_rgb(0_0_0/0.8)] relative z-20">
            <p>&copy; {year} Bira Party. Todos los derechos reservados.</p>
        </footer>
    );
};
