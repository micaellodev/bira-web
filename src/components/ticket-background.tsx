export const TicketBackground = () => (
    <svg
        width="320"
        height="500"
        viewBox="0 0 320 500"
        className="absolute inset-0 z-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Layer 1: Wide Soft Green Glow (The "Blur") */}
        <path
            d="M0 24C0 10.7452 10.7452 0 24 0H90C101.332 0 106.635 1.70014 112 5.5C118.846 10.3496 123.896 23.332 129.5 28.5C138.803 37.0784 148.694 38 160 38C171.306 38 181.197 37.0784 190.5 28.5C196.104 23.332 201.154 10.3496 208 5.5C213.365 1.70014 218.668 0 230 0H296C309.255 0 320 10.7452 320 24V476C320 489.255 309.255 500 296 500H24C10.7452 500 0 489.255 0 476V24Z"
            fill="none"
            stroke="rgba(236, 72, 153, 0.3)" // Pink-500 equivalent, reduced opacity
            strokeWidth="10"
        // removed filter blur for performance
        />
        {/* Layer 2: Thinner Core for definition */}
        <path
            d="M0 24C0 10.7452 10.7452 0 24 0H90C101.332 0 106.635 1.70014 112 5.5C118.846 10.3496 123.896 23.332 129.5 28.5C138.803 37.0784 148.694 38 160 38C171.306 38 181.197 37.0784 190.5 28.5C196.104 23.332 201.154 10.3496 208 5.5C213.365 1.70014 218.668 0 230 0H296C309.255 0 320 10.7452 320 24V476C320 489.255 309.255 500 296 500H24C10.7452 500 0 489.255 0 476V24Z"
            fill="none"
            stroke="#fbcfe8" // Pink-200 (very light pink/white core)
            strokeWidth="2"
        />
    </svg>
);
