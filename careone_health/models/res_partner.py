# models/res_partner.py
from odoo import models, fields, api
from dateutil.relativedelta import relativedelta

class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    employee_number = fields.Integer(string='Number')

class ResPartner(models.Model):
    _inherit = 'res.partner'
    
    pharmacy_history_ids = fields.One2many('res.patient.pharmacy.history', 'patient_id', string='Pharmacy History')
    patient_no = fields.Char(string='Patient No')
    gender = fields.Selection([('Male', 'Male'),('Female', 'Female'),('Other', 'Other')], string='Gender')
    date_of_registration = fields.Char(string='Registration Date')
    first_name = fields.Char(string='First Name')
    middle_name = fields.Char(string='Middle Name')
    last_name = fields.Char(string='Last Name')
    date_of_registration = fields.Date(string='Registration Date')
    dob = fields.Date(string='Date of Birth')
    age = fields.Char(string='Age', compute="compute_dob", store=False)

    
    related_employee_number = fields.Char(string='Employee No', compute="get_employee_number", store=False)
    is_patient = fields.Boolean(string='Is Patient')

    prescription_count = fields.Integer(compute='_compute_prescription_count')
    last_visit_date = fields.Datetime(compute='_compute_last_visit_date', store=True)
    allergy_ids = fields.Many2many('pharmacy.allergy', string='Allergies')
    chronic_condition_ids = fields.Many2many('pharmacy.chronic.condition', string='Chronic Conditions')
    patient_history_ids = fields.One2many('patient.medical.history', 'patient_id', string='Medical History')
    patient_evaluation_ids = fields.One2many('patient.medical.evaluation', 'patient_id', string='Medical Evaluation')
    
    @api.depends('name')
    def get_employee_number(self):
        '''used to relate the contact with existing employee'''
        for rec in self:
            related_employee_id = self.env['hr.employee'].search([('partner_id', '=', rec.id)], limit=1)
            if related_employee_id:
                rec.related_employee_number = related_employee_id.employee_number
            else:
                rec.related_employee_number = False 

    @api.depends('dob')
    def compute_dob(self):
        for rec in self:
            if rec.dob:
                today = fields.Date.today()
                diff = relativedelta(today, rec.dob)
                years = diff.years
                days = diff.days

                rec.age = f"{years} Years {days} Days"
            else:
                rec.age = False

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
