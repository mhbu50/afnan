# -*- coding: utf-8 -*-
# Copyright (c) 2015, accurate systems and contributors
# For license information, please see license.txt
from __future__ import division
from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class calculation(Document):

	def validate(self):
		self.price = 0
		if self.type == "برواز و زجاج":
			pass
		else:
			if self.wood =="4x2":
				wood = 2 * 15
			elif self.wood == "2x4":
				wood = 3 * 13
			else:
				wood = 2 * 23
			canvas_price =((self.c_height + 10)/100 * (self.c_width + 10)/100) * 65
			wood_price  = (self.c_height /100 + self.c_width /100) * wood
			self.price = canvas_price + wood_price + 1
