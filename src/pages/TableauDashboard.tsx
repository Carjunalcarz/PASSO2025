import React, { useEffect, useRef } from 'react';



interface TableauDashboardProps {
    url: string;
    height?: string | number;
    width?: string | number;
    toolbar?: 'top' | 'bottom' | 'hidden';
    className?: string;
}

const TableauDashboard: React.FC<TableauDashboardProps> = ({
    url,
    height = '600px',
    width = '100%',
    toolbar = 'bottom',
    className = '',
}) => {
    const vizRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (vizRef.current) {
            vizRef.current.src = url;
            vizRef.current.toolbar = toolbar;
        }
    }, [url, toolbar]);

    const containerStyle: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        overflow: 'hidden',
        display: 'block'  // Added to ensure proper block-level rendering
    };

    return (
        <div ref={containerRef} style={containerStyle} className={className}>
            <tableau-viz
                ref={vizRef}
                src={url}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%'
                }}
                toolbar={toolbar}
            />
        </div>
    );
};

export default TableauDashboard;