# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': "Financial Report Portal",
    'version': '2.0',
    'category': '',
    "sequence":10,
    'summary': 'Standalone HTML financial report portal with GL, P&L, Balance Sheet, Trial Balance, Tax, Consolidated, Monthly Expense + Dashboard',
    'depends': ['account', 'web'],
    'author': 'Chris Maduka [MAACH SOFTWARE]',
    'data': [
        'security/ir.model.access.csv',
        'views/menu.xml',
    ],
    
    'installable': True,
    'auto_install': True,
    'license': 'LGPL-3',
}
