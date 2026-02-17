{
    'name': 'Home Menu Overlay',
    'version': '17.0.1.0.0',
    'category': 'Web',
    'summary': 'Beautiful animated home menu overlay for Odoo 17',
    'description': """
        Home Menu Overlay
        =================
        
        A modern, animated overlay that displays all installed Odoo applications
        in a beautiful grid layout with smooth transitions.
        
        Features:
        ---------
        * Beautiful card-based grid layout
        * Smooth animations and transitions
        * Search functionality to filter apps
        * Responsive design for all screen sizes
        * Dark theme with gradient colors
        * Easy to use - just click the home icon
        
        How to use:
        -----------
        1. Install the module
        2. Click on the home/menu icon in the navbar
        3. Browse your apps in the overlay
        4. Click any app to open it
        5. Use the search bar to filter apps
        6. Press ESC or click Back to close
    """,
    'author': 'Your Company',
    'website': 'https://www.yourcompany.com',
    'depends': ['web'],
    'data': [
        # 'views/home_menu_overlay_templates.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'home_menu_overlay/static/src/css/home_menu_overlay.css',
            'home_menu_overlay/static/src/js/home_menu_overlay_jquery.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
