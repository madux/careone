# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
import base64


class HomeMenuController(http.Controller):
    
    @http.route('/home_menu/get_apps', type='json', auth='user')
    def get_apps(self):
        """
        Fetch all installed Odoo apps/modules with menus
        Returns list of apps with name, icon, action, etc.
        """
        apps = []
        
        # Get root menus (top-level apps)
        root_menus = request.env['ir.ui.menu'].search([
            ('parent_id', '=', False),
            ('action', '!=', False)
        ], order='sequence, name')
        
        for menu in root_menus:
            app_data = {
                'id': menu.id,
                'name': menu.name,
                'xmlid': menu.get_external_id().get(menu.id, ''),
                'sequence': menu.sequence,
            }
            
            # Get action information
            if menu.action:
                action_parts = menu.action.split(',')
                if len(action_parts) == 2:
                    model, action_id = action_parts
                    app_data['action_model'] = model
                    app_data['action_id'] = int(action_id)
            
            # Get web icon (can be module,path or image data)
            if menu.web_icon:
                app_data['web_icon'] = menu.web_icon
                
                # If it's comma-separated (module,path format)
                if ',' in menu.web_icon:
                    app_data['web_icon_type'] = 'path'
                else:
                    # It might be base64 image data
                    app_data['web_icon_type'] = 'data'
            
            # Try to get the module/app technical name from xmlid
            if app_data['xmlid']:
                module_name = app_data['xmlid'].split('.')[0]
                app_data['module'] = module_name
                
                # Get module info
                module = request.env['ir.module.module'].sudo().search([
                    ('name', '=', module_name),
                    ('state', '=', 'installed')
                ], limit=1)
                
                if module:
                    app_data['summary'] = module.summary or module.shortdesc or menu.name
                    app_data['category'] = module.category_id.name if module.category_id else 'Uncategorized'
                else:
                    app_data['summary'] = menu.name
                    app_data['category'] = 'Apps'
            else:
                app_data['summary'] = menu.name
                app_data['category'] = 'Apps'
            
            apps.append(app_data)
        
        return apps
    
    @http.route('/home_menu/get_icon/<int:menu_id>', type='http', auth='user')
    def get_icon(self, menu_id):
        """
        Get the icon for a specific menu item
        Returns the image file
        """
        menu = request.env['ir.ui.menu'].browse(menu_id)
        
        if menu.web_icon_data:
            # Direct image data
            image_data = base64.b64decode(menu.web_icon_data)
            return request.make_response(
                image_data,
                headers=[
                    ('Content-Type', 'image/png'),
                    ('Cache-Control', 'public, max-age=604800'),
                ]
            )
        
        # Return a default icon if none found
        return request.not_found()
