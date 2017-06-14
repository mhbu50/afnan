# -*- coding: utf-8 -*-
# Copyright (c) 2015, accurate systems and contributors
# For license information, please see license.txt
from __future__ import division
from __future__ import unicode_literals
import frappe
from erpnext import get_default_currency
from erpnext import get_default_company
from frappe.model.mapper import get_mapped_doc
from frappe.model.document import Document

class calculation(Document):

	def validate(self):
		self.price = 0
		if self.type == "كانفاس":
			if self.wood =="4x2":
				wood = 2 * 15
			elif self.wood == "2x4":
				wood = 3 * 13
			else:
				wood = 2 * 23
			canvas_price =((self.c_height + 10)/100 * (self.c_width + 10)/100) * 65
			wood_price  = (self.c_height /100 + self.c_width /100) * wood
			self.price = canvas_price + wood_price + 1

	def on_update(self):
		pass
	def before_insert(self):
		doc = frappe.get_doc({
            "doctype": "BOM",
            "quantity": 1,
            "is_active":1,
            "is_default":0,
            "item": "عمل "+self.type,
            "rm_cost_as_per":"Price List",
            "Price List":"Standard Buying",
            "currency": get_default_currency(),
            "conversion_rate": 1,
            "company": get_default_company()
        })
		in_w = self.in_w
		in_h = self.in_h
        #get first mating
		if(self.mating):
			mating_item1 = frappe.get_doc({
            "doctype": "BOM Item",
            "item_code": self.mating,
            "qty": self.in_h / 100 * self.in_w / 100,
            "rate":self.mating_price,
            "stock_uom":"Meter"
            })
			doc.append("items", mating_item1)
            #get sub mating
		for m in self.sub_mating:
			mating_items = frappe.get_doc({
            "doctype": "BOM Item",
            "item_code": m.mating,
            "qty": self.in_h / 100 * self.in_w / 100,
            "rate":m.mating_price,
            "stock_uom":"Meter"
            })
			doc.append("items", mating_items)
            #get sub frame

		for f in self.sub_frame:
			frame_item = frappe.get_doc({
            "doctype": "BOM Item",
            "item_code": f.frame,
            "qty": f.f_used,
            "rate":f.frame_price,
            "stock_uom":"Meter"
            })
			doc.append("items", frame_item)
         #get glass
		if(self.glass_type):
			glass_item = frappe.get_doc({
            "doctype": "BOM Item",
            "item_code": self.glass_type,
            "qty": in_h / 100 * in_w / 100,
            "rate":self.total_g_price,
            "stock_uom":"Meter"
            })
			doc.append("items", glass_item)
		doc.save()
		# doc.submit()
		self.bom = doc.name

@frappe.whitelist()
def make_invoice(source_name, target_doc=None):

    calculation = frappe.get_doc("calculation", source_name)
    print "calculation.type = {0}".format(calculation.b_height)
    si = frappe.get_doc("Sales Invoice Item","New Sales Invoice Item 1")
    # si.item_code = calculation.type
    # si.rate = calculation.total_g_price
    return si
