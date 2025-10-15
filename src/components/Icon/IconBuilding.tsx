import { FC } from 'react';

interface IconBuildingProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconBuilding: FC<IconBuildingProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M3 21V8C3 6.11438 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H17C18.8856 4 19.8284 4 20.4142 4.58579C21 5.17157 21 6.11438 21 8V21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M9 8H10M14 8H15M9 12H10M14 12H15M9 16H10M14 16H15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M12 21V18C12 17.4477 11.5523 17 11 17H10C9.44772 17 9 17.4477 9 18V21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M3 21V8C3 6.11438 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H17C18.8856 4 19.8284 4 20.4142 4.58579C21 5.17157 21 6.11438 21 8V21H15V18C15 16.8954 14.1046 16 13 16H11C9.89543 16 9 16.8954 9 18V21H3Z"
                        fill="currentColor"
                    />
                    <path
                        d="M9 8C9 7.44772 9.44772 7 10 7C10.5523 7 11 7.44772 11 8C11 8.55228 10.5523 9 10 9C9.44772 9 9 8.55228 9 8Z"
                        fill="currentColor"
                    />
                    <path
                        d="M13 8C13 7.44772 13.4477 7 14 7C14.5523 7 15 7.44772 15 8C15 8.55228 14.5523 9 14 9C13.4477 9 13 8.55228 13 8Z"
                        fill="currentColor"
                    />
                    <path
                        d="M9 12C9 11.4477 9.44772 11 10 11C10.5523 11 11 11.4477 11 12C11 12.5523 10.5523 13 10 13C9.44772 13 9 12.5523 9 12Z"
                        fill="currentColor"
                    />
                    <path
                        d="M13 12C13 11.4477 13.4477 11 14 11C14.5523 11 15 11.4477 15 12C15 12.5523 14.5523 13 14 13C13.4477 13 13 12.5523 13 12Z"
                        fill="currentColor"
                    />
                </svg>
            )}
        </>
    );
};

export default IconBuilding;
