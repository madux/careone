# models/res_patient_pharmacy_history.py
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

# models/evaluation.py
class PatientMedicalEvaluation(models.Model):
    _name = 'patient.medical.evaluation'
    _description = 'Patient History'
    
    name = fields.Char(string='Evaluation No.', readonly=True)
    severity = fields.Selection([
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ], string='Severity')
    evaluation_type = fields.Selection([
        ('inbound', 'Inbound'),
        ('outbound', 'Outbound'),
    ], string='Evaluation type')
    description = fields.Text(string='Description')
    patient_id = fields.Many2one("res.partner", string="Patient ID")
    prescription_document = fields.Many2one("ir.attachment", string="Prescription Document")
    pharmacy_prescription_line_ids = fields.One2many('res.patient.pharmacy.history', 'patient_evaluation_id', string='Prescriptions')
 