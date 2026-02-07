export const TicketBackground = () => (
    <svg
        width="320"
        height="500"
        viewBox="0 0 320 500"
        className="absolute inset-0 z-0 h-full w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M0 24C0 10.7452 10.7452 0 24 0H90C101.332 0 106.635 1.70014 112 5.5C118.846 10.3496 123.896 23.332 129.5 28.5C138.803 37.0784 148.694 38 160 38C171.306 38 181.197 37.0784 190.5 28.5C196.104 23.332 201.154 10.3496 208 5.5C213.365 1.70014 218.668 0 230 0H296C309.255 0 320 10.7452 320 24V476C320 489.255 309.255 500 296 500H24C10.7452 500 0 489.255 0 476V24Z"
            fill="rgba(24, 24, 27, 0.6)" // Zinc-950 with opacity for glass effect
            stroke="#f472b6" // Pink-400 Solid Border
            strokeWidth="3"
        />
    </svg>
);
