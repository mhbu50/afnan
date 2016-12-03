# -*- coding: utf-8 -*-
# Copyright (c) 2015, accurate systems and contributors
# For license information, please see license.txt
from __future__ import division
from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class calculation(Document):

	def validate(self):

		if self.b_height < self.b_width:
			 frappe.throw("الطول يجب ان يكون اطول من العرض في قياسات البرواز")
		if self.g_height < self.g_width:
	 		 frappe.throw("الطول يجب ان يكون اطول من العرض في قياسات الزجاج")

		self.b_area = check_empty(self.b_width)*check_empty(self.b_height)
		self.b_circumference = (check_empty(self.b_width)+check_empty(self.b_height))*2
		self.g_area = check_empty(self.g_width)*check_empty(self.g_height)
		self.g_circumference = (check_empty(self.g_width)+check_empty(self.g_height))*2

		meter_price = 0
		full_beveled = 0
		full_letter = 0
		beveled_letter = 0
		anti_braek = 0
		wood = 0
		wood_price =0
		canvas_price = 0
		self.price = 0


		if self.type == "برواز":
			doc = frappe.get_doc("Price Settings", self.glass_type)
			meter_price = self.g_area * doc.price_square
			beveled_letter = (self.g_width * 2 + self.g_height * 2) * doc.beveled_letter
			full_beveled = (self.g_width * 2 + self.g_height * 2) * doc.beveled
			full_letter = (self.g_width * 2 + self.g_height * 2) * doc.letter
			anti_braek = self.g_area * doc.anti_braek
			self.price = meter_price

			for d in self.get('sides'):
				# print "side = {0} letter = {1} beveled = {2}".format("kk",d.letter,d.beveled)
				print "d.beveled and not d.letter ={0} ".format(d.beveled and not d.letter)
				if d.beveled and not d.letter:
					print "self.price = ",self.price ," doc.beveled = " , doc.beveled
					self.price = self.price + doc.beveled
				print "d.letter and not d.beveled ={0} ".format(d.letter and not d.beveled)
				if d.letter and not d.beveled :
					print "self.price = ",self.price ," doc.letter = " , doc.letter
					self.price = self.price + doc.letter
				print "d.beveled and d.letter ={0} ".format(d.beveled and d.letter)
				if d.beveled and d.letter:
					print "self.price = ",self.price ," doc.beveled_letter = " , doc.beveled_letter
					self.price = self.price + doc.beveled_letter

				if d.security:
					print "self.price = ",self.price ," doc.beveled_letter = " , doc.beveled_letter
					self.price = self.price + doc.security

				print "-----------------------"
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








def check_empty(val):
	if val:
	    return val
	else:
		return 0
