import { FC } from 'react';

interface IconMunicipalityProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconMunicipality: FC<IconMunicipalityProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M2 22H22"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M3 22V8C3 6.11438 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H9V2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V4H17C18.8856 4 19.8284 4 20.4142 4.58579C21 5.17157 21 6.11438 21 8V22"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M6 8H8M6 12H8M6 16H8M16 8H18M16 12H18M16 16H18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M10 8H14M10 12H14M10 16H14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M12 4V2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M3 22V8C3 6.11438 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H9V2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V4H17C18.8856 4 19.8284 4 20.4142 4.58579C21 5.17157 21 6.11438 21 8V22H3Z"
                        fill="currentColor"
                    />
                    <path
                        d="M6 8C5.44772 8 5 8.44772 5 9C5 9.55228 5.44772 10 6 10H8C8.55228 10 9 9.55228 9 9C9 8.44772 8.55228 8 8 8H6Z"
                        fill="currentColor"
                    />
                    <path
                        d="M6 12C5.44772 12 5 12.4477 5 13C5 13.5523 5.44772 14 6 14H8C8.55228 14 9 13.5523 9 13C9 12.4477 8.55228 12 8 12H6Z"
                        fill="currentColor"
                    />
                    <path
                        d="M6 16C5.44772 16 5 16.4477 5 17C5 17.5523 5.44772 18 6 18H8C8.55228 18 9 17.5523 9 17C9 16.4477 8.55228 16 8 16H6Z"
                        fill="currentColor"
                    />
                    <path
                        d="M10 8C9.44772 8 9 8.44772 9 9C9 9.55228 9.44772 10 10 10H14C14.5523 10 15 9.55228 15 9C15 8.44772 14.5523 8 14 8H10Z"
                        fill="currentColor"
                    />
                    <path
                        d="M10 12C9.44772 12 9 12.4477 9 13C9 13.5523 9.44772 14 10 14H14C14.5523 14 15 13.5523 15 13C15 12.4477 14.5523 12 14 12H10Z"
                        fill="currentColor"
                    />
                    <path
                        d="M10 16C9.44772 16 9 16.4477 9 17C9 17.5523 9.44772 18 10 18H14C14.5523 18 15 17.5523 15 17C15 16.4477 14.5523 16 14 16H10Z"
                        fill="currentColor"
                    />
                    <path
                        d="M16 8C15.4477 8 15 8.44772 15 9C15 9.55228 15.4477 10 16 10H18C18.5523 10 19 9.55228 19 9C19 8.44772 18.5523 8 18 8H16Z"
                        fill="currentColor"
                    />
                    <path
                        d="M16 12C15.4477 12 15 12.4477 15 13C15 13.5523 15.4477 14 16 14H18C18.5523 14 19 13.5523 19 13C19 12.4477 18.5523 12 18 12H16Z"
                        fill="currentColor"
                    />
                    <path
                        d="M16 16C15.4477 16 15 16.4477 15 17C15 17.5523 15.4477 18 16 18H18C18.5523 18 19 17.5523 19 17C19 16.4477 18.5523 16 18 16H16Z"
                        fill="currentColor"
                    />
                    <path
                        d="M2 22C1.44772 22 1 22.4477 1 23C1 23.5523 1.44772 24 2 24H22C22.5523 24 23 23.5523 23 23C23 22.4477 22.5523 22 22 22H2Z"
                        fill="currentColor"
                    />
                </svg>
            )}
        </>
    );
};

export default IconMunicipality;
