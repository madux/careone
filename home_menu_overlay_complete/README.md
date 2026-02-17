# Home Menu Overlay for Odoo 17

A beautiful, modern overlay menu system for Odoo 17 Community Edition that displays all installed applications in an elegant grid layout with smooth animations and transitions.

![Home Menu Overlay](screenshot.png)

## Features

✨ **Beautiful Design**
- Modern card-based grid layout
- Dark theme with gradient colors
- Smooth animations and transitions
- Responsive design for all devices

🔍 **Smart Search**
- Real-time search filtering
- Search by app name or description
- Instant results

⚡ **Performance**
- Smooth 60fps animations
- Optimized CSS transitions
- Minimal JavaScript overhead

📱 **Responsive**
- Works on desktop, tablet, and mobile
- Adaptive grid layout
- Touch-friendly interface

## Installation

### Method 1: Manual Installation

1. **Download the module**
   - Download or clone this repository

2. **Create the module structure**
   ```
   odoo17/addons/home_menu_overlay/
   ├── __init__.py
   ├── __manifest__.py
   ├── static/
   │   └── src/
   │       ├── css/
   │       │   └── home_menu_overlay.css
   │       └── js/
   │           └── home_menu_overlay_jquery.js
   └── views/
       └── home_menu_overlay_templates.xml
   ```

3. **Copy the files**
   - Copy `__manifest__.py` to the module root
   - Copy `home_menu_overlay.css` to `static/src/css/`
   - Copy `home_menu_overlay_jquery.js` to `static/src/js/`
   - Copy `home_menu_overlay_templates.xml` to `views/`

4. **Create __init__.py**
   ```python
   # -*- coding: utf-8 -*-
   ```

5. **Restart Odoo**
   ```bash
   sudo systemctl restart odoo
   ```

6. **Update Apps List**
   - Go to Apps menu
   - Click "Update Apps List"
   - Search for "Home Menu Overlay"
   - Click Install

### Method 2: Quick Setup

If you have the files already:

1. **Place files in the correct structure:**
   ```bash
   mkdir -p your_addons_path/home_menu_overlay/static/src/{css,js}
   mkdir -p your_addons_path/home_menu_overlay/views
   
   # Copy files
   cp __manifest__.py your_addons_path/home_menu_overlay/
   cp home_menu_overlay.css your_addons_path/home_menu_overlay/static/src/css/
   cp home_menu_overlay_jquery.js your_addons_path/home_menu_overlay/static/src/js/
   cp home_menu_overlay_templates.xml your_addons_path/home_menu_overlay/views/
   
   # Create empty __init__.py
   touch your_addons_path/home_menu_overlay/__init__.py
   ```

2. **Restart and Install**
   ```bash
   sudo systemctl restart odoo
   ```
   Then install via Apps menu.

## Usage

### Opening the Menu

The home menu overlay can be opened by:

1. **Clicking the home/menu icon** in the Odoo navbar
2. **Clicking any element** with `data-home-trigger` attribute
3. **Programmatically** via JavaScript:
   ```javascript
   window.HomeMenuOverlay.open();
   ```

### Closing the Menu

You can close the overlay by:

1. **Clicking the Back button**
2. **Pressing ESC key**
3. **Clicking outside** (on the backdrop)
4. **Clicking any app** (auto-closes and opens the app)
5. **Programmatically**:
   ```javascript
   window.HomeMenuOverlay.close();
   ```

### Searching Apps

- Type in the search box to filter applications
- Search works on both app names and descriptions
- Results update in real-time

## Customization

### Changing Colors

Edit the CSS variables in `home_menu_overlay.css`:

```css
:root {
    --overlay-bg: rgba(15, 23, 42, 0.98);
    --card-bg: rgba(30, 41, 59, 0.8);
    --text-primary: #f1f5f9;
    --accent-color: #3b82f6;
    /* ... more variables ... */
}
```

### Changing App Gradients

Edit the `getAppColor` function in `home_menu_overlay_jquery.js`:

```javascript
getAppColor: function(index) {
    var colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        // Add your custom gradients here
    ];
    return colors[index % colors.length];
}
```

### Adding Custom Icons

Edit the `iconMap` in the `getAppIcon` function:

```javascript
var iconMap = {
    'Your App Name': 'fa fa-your-icon',
    'Sales': 'fa fa-shopping-cart',
    // ... add more mappings ...
};
```

### Changing Animation Speed

Edit the transition duration in the CSS:

```css
.home-menu-overlay {
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    /* Change 0.4s to your preferred duration */
}
```

## Triggering from Custom Elements

To trigger the overlay from your custom button or element:

### HTML Method
```html
<button data-home-trigger>Open Apps</button>
```

### JavaScript Method
```javascript
$('#myButton').click(function() {
    window.HomeMenuOverlay.open();
});
```

### Adding to Existing Odoo Buttons

You can modify existing Odoo menu buttons by adding the trigger:

```xml
<button class="btn btn-primary" data-home-trigger="true">
    <i class="fa fa-th"></i> Applications
</button>
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)
- ⚠️ IE11 (limited support, no backdrop blur)

## Troubleshooting

### Overlay doesn't appear

1. **Check if jQuery is loaded:**
   ```javascript
   console.log(jQuery.fn.jquery);
   ```

2. **Check if module is loaded:**
   ```javascript
   console.log(window.HomeMenuOverlay);
   ```

3. **Check browser console** for errors

4. **Clear browser cache** and reload

### Apps not showing

1. **Check if apps are loaded:**
   ```javascript
   console.log(window.HomeMenuOverlay.apps);
   ```

2. **Manually reload apps:**
   ```javascript
   window.HomeMenuOverlay.loadApps();
   window.HomeMenuOverlay.renderApps();
   ```

### Styling issues

1. **Check if CSS is loaded:**
   - Open browser DevTools
   - Check Network tab for `home_menu_overlay.css`

2. **Clear Odoo assets:**
   - Settings → Technical → User Interface → Assets
   - Click "Regenerate Assets Bundle"

3. **Force reload:**
   - Press Ctrl+Shift+R (Windows/Linux)
   - Press Cmd+Shift+R (Mac)

## Performance Optimization

The module is optimized for performance:

- **CSS-based animations** for 60fps smoothness
- **Efficient DOM manipulation** with jQuery
- **Debounced search** for instant results
- **Minimal JavaScript** overhead
- **Lazy initialization** on first use

## Accessibility

- **Keyboard navigation** with ESC key support
- **Focus management** for better UX
- **ARIA labels** (can be added if needed)
- **Screen reader** compatible

## Credits

- **Icons:** Font Awesome
- **Design:** Modern gradient trends
- **Animations:** Cubic bezier easing

## License

LGPL-3

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: support@yourcompany.com

## Changelog

### Version 17.0.1.0.0
- Initial release
- Beautiful card-based grid layout
- Search functionality
- Smooth animations
- Responsive design
- jQuery implementation
- Full Odoo 17 compatibility

## Future Enhancements

Planned features for future versions:
- [ ] App categories/grouping
- [ ] Favorite apps section
- [ ] Recently used apps
- [ ] Drag-to-reorder
- [ ] Custom themes
- [ ] Import/export layout
- [ ] App usage statistics

---

**Enjoy your beautiful new home menu! 🚀**
