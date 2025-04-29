import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'tableau-viz': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                width?: string | number;
                height?: string | number;
                toolbar?: 'top' | 'bottom' | 'hidden';
                'hide-tabs'?: boolean;
            };
        }
    }
}
