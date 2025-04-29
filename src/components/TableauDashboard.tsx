import { useEffect, useRef } from 'react';

const TableauDashboard = () => {
    const vizRef = useRef(null);

    useEffect(() => {
        const initViz = () => {
            const divElement = document.getElementById('viz1745816917611');
            if (!divElement) return;

            const scriptElement = document.createElement('script');
            scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
            scriptElement.async = true;
            scriptElement.onload = () => {
                const vizElement = divElement.getElementsByTagName('object')[0];
                if (!vizElement) return;

                // Set to container dimensions
                const setVizDimensions = () => {
                    vizElement.style.width = '100%';
                    vizElement.style.height = '100%';
                };

                setVizDimensions();
                window.addEventListener('resize', setVizDimensions);

                return () => {
                    window.removeEventListener('resize', setVizDimensions);
                };
            };

            document.head.appendChild(scriptElement);
        };

        initViz();
    }, []);

    return (
        <div className="tableau-fullscreen-wrapper h-full">
            <div
                className='tableauPlaceholder'
                id='viz1745816917611'
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                }}
            >
                <noscript>
                    <a href='#'>
                        <img
                            alt='Dashboard 1'
                            src='https://public.tableau.com/static/images/PA/PASSO2025-fixed04-28-25/Dashboard1/1_rss.png'
                            style={{ border: 'none' }}
                        />
                    </a>
                </noscript>
                <object className='tableauViz' style={{ display: 'none' }}>
                    <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
                    <param name='embed_code_version' value='3' />
                    <param name='site_root' value='' />
                    <param name='name' value='PASSO2025-fixed04-28-25/Dashboard1' />
                    <param name='tabs' value='no' />
                    <param name='toolbar' value='yes' />
                    <param name='static_image' value='https://public.tableau.com/static/images/PA/PASSO2025-fixed04-28-25/Dashboard1/1.png' />
                    <param name='animate_transition' value='yes' />
                    <param name='display_static_image' value='yes' />
                    <param name='display_spinner' value='yes' />
                    <param name='display_overlay' value='yes' />
                    <param name='display_count' value='yes' />
                    <param name='language' value='en-US' />
                    <param name='filter' value='publish=yes' />
                </object>
            </div>
        </div>
    );
};

export default TableauDashboard; 