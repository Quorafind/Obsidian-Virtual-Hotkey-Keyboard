/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: 'vhk-',
    content: ['./src/**/*.{svelte,js,ts}'],
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            gridColumn: {
                'span-15': 'span 15 / span 15',
            },
            gridColumnStart: {
                '5': '5',
                '14': '14',
                '23': '23',
            },
            gridTemplateColumns: {
                // Simple 15 column grid
                '30': 'repeat(30, minmax(0, 1fr))',
                '36': 'repeat(36, minmax(0, 1fr))',
                // Complex site-specific column configuration
                'footer': '200px minmax(900px, 1fr) 100px',
            }
        },
    },
    plugins: [],
}
