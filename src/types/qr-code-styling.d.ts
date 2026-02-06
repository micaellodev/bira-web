declare module 'qr-code-styling' {
    export interface Options {
        width?: number;
        height?: number;
        data?: string;
        image?: string;
        qrOptions?: {
            typeNumber?: number;
            mode?: string;
            errorCorrectionLevel?: string;
        };
        imageOptions?: {
            hideBackgroundDots?: boolean;
            imageSize?: number;
            crossOrigin?: string;
            margin?: number;
        };
        dotsOptions?: {
            type?: string;
            color?: string;
            gradient?: {
                type?: string;
                rotation?: number;
                colorStops?: {
                    offset: number;
                    color: string;
                }[];
            };
        };
        backgroundOptions?: {
            color?: string;
            gradient?: {
                type?: string;
                rotation?: number;
                colorStops?: {
                    offset: number;
                    color: string;
                }[];
            };
        };
        cornersSquareOptions?: {
            type?: string;
            color?: string;
            gradient?: {
                type?: string;
                rotation?: number;
                colorStops?: {
                    offset: number;
                    color: string;
                }[];
            };
        };
        cornersDotOptions?: {
            type?: string;
            color?: string;
            gradient?: {
                type?: string;
                rotation?: number;
                colorStops?: {
                    offset: number;
                    color: string;
                }[];
            };
        };
    }

    export default class QRCodeStyling {
        constructor(options?: Options);
        append(container: HTMLElement): void;
        update(options?: Options): void;
        download(downloadOptions?: { name?: string; extension?: string }): void;
    }
}
