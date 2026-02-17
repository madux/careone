# models/res_partner.py
from odoo import models, fields, api

class ResPartner(models.Model):
    _inherit = 'res.partner'
    
    pharmacy_history_ids = fields.One2many('res.patient.pharmacy.history', 'patient_id', string='Pharmacy History')
    patient_no = fields.Integer(string='Patient No')
    prescription_count = fields.Integer(compute='_compute_prescription_count')
    last_visit_date = fields.Datetime(compute='_compute_last_visit_date', store=True)
    allergy_ids = fields.Many2many('pharmacy.allergy', string='Allergies')
    chronic_condition_ids = fields.Many2many('pharmacy.chronic.condition', string='Chronic Conditions')
    
    @api.depends('pharmacy_history_ids')
    def _compute_prescription_count(self):
        for rec in self:
            rec.prescription_count = len(rec.pharmacy_history_ids)
    
    @api.depends('pharmacy_history_ids.date')
    def _compute_last_visit_date(self):
        for rec in self:
            if rec.pharmacy_history_ids:
                rec.last_visit_date = max(rec.pharmacy_history_ids.mapped('date'))
            else:
                rec.last_visit_date = False
