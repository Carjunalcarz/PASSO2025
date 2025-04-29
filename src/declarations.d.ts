declare namespace JSX {
    interface IntrinsicElements {
        'tableau-viz': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            src?: string;
            toolbar?: string;
            'hide-tabs'?: boolean;
            // add other attributes as needed
        };
    }
}
