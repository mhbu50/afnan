# -*- coding: utf-8 -*-
# Copyright (c) 2015, accurate systems and contributors
# For license information, please see license.txt
from __future__ import division
from __future__ import unicode_literals
import frappe
from frappe import utils
from erpnext import get_default_currency
from erpnext import get_default_company
from frappe.model.mapper import get_mapped_doc
from frappe.model.document import Document


class calculation(Document):
    # def validate(self):
    #     self.price = 0
    #     if self.type == "كانفاس":
    #         if self.wood == "4x2":
    #             wood = 2 * 15
    #         elif self.wood == "2x4":
    #             wood = 3 * 13
    #         else:
    #             wood = 2 * 23
    #         canvas_price = (
    #             (self.c_height + 10) / 100 * (self.c_width + 10) / 100) * 65
    #         wood_price = (self.c_height / 100 + self.c_width / 100) * wood
    #         self.price = canvas_price + wood_price + 1

    def after_insert(self):
        doc = frappe.get_doc({
            "doctype": "Sub Calculation",
            "calculation_link": self.name,
            "work_desc": self.work_desc,
            "bom": self.bom,
            "price": self.price,
            "quantity": 1,
            "total": self.price,
            "type": "عمل " + self.type,
        })
        self.append("sub_calculation", doc)
        self.save()

    def on_update(self):
        sub_calc_list = frappe.get_list(
            "Sub Calculation",
            filters={"calculation_link": self.name},
            fields=["*"])
        for sub_calc in sub_calc_list:
            print "1 sub_calc.name = {}".format(sub_calc.name)
            sub_calc = frappe.get_doc("Sub Calculation", sub_calc.name)
            print "2 sub_calc.name = {}".format(sub_calc.name)
            print "self = {}".format(self.price)
            print "sub_calc.price = {}".format(sub_calc.price)
            sub_calc.price = self.price
            sub_calc.total = self.price * sub_calc.quantity
            sub_calc.work_desc = self.work_desc
            sub_calc.save()

    def before_insert(self):
        doc = frappe.get_doc({
            "doctype": "BOM",
            "quantity": 1,
            "is_active": 1,
            "is_default": 0,
            "item": "عمل " + self.type,
            "rm_cost_as_per": "Price List",
            "Price List": "Standard Buying",
            "currency": get_default_currency(),
            "conversion_rate": 1,
            "company": get_default_company()
        })
        in_w = self.in_w
        in_h = self.in_h
        # get first mating
        if (self.mating):
            mating_item1 = frappe.get_doc({
                "doctype":
                "BOM Item",
                "item_code":
                self.mating,
                "qty":
                self.in_h / 100 * self.in_w / 100,
                "stock_qty":
                self.in_h / 100 * self.in_w / 100,
                "rate":
                self.mating_price,
                "stock_uom":
                "Meter"
            })
            doc.append("items", mating_item1)
# get sub mating
        for m in self.sub_mating:
            mating_items = frappe.get_doc({
                "doctype":
                "BOM Item",
                "item_code":
                m.mating,
                "qty":
                self.in_h / 100 * self.in_w / 100,
                "stock_qty":
                self.in_h / 100 * self.in_w / 100,
                "rate":
                m.mating_price,
                "stock_uom":
                "Meter"
            })
            doc.append("items", mating_items)
# get sub frame

        for f in self.sub_frame:
            frame_item = frappe.get_doc({
                "doctype": "BOM Item",
                "item_code": f.frame,
                "qty": f.f_used,
                "stock_qty": f.f_used,
                "rate": f.frame_price,
                "stock_uom": "Meter"
            })
            doc.append("items", frame_item)

# get glass
        if (self.glass_type):
            glass_item = frappe.get_doc({
                "doctype": "BOM Item",
                "item_code": self.glass_type,
                "qty": in_h / 100 * in_w / 100,
                "stock_qty": in_h / 100 * in_w / 100,
                "rate": self.total_g_price,
                "stock_uom": "Meter"
            })
            doc.append("items", glass_item)
        doc.save()
        doc.submit()
        self.bom = doc.name


@frappe.whitelist()
def make_invoice(source_name, target_doc=None):
    def set_missing_values(source, target):
        target.delivery_date = utils.add_days(utils.now(), 5)

    print "source_name = {}".format(source_name)
    doclist = get_mapped_doc(
        "calculation",
        source_name,
        {
            "calculation": {
                "doctype": "Sales Order",
                "field_map": {
                    "discount": "additional_discount_percentage",
                    # "enquiry_type": "order_type",
                    # "name": "enq_no",
                }
            },
            "Sub Calculation": {
                "doctype": "Sales Order Item",
                "field_map": {
                    # "item_code": "Furniture 1",
                    # "item_name": "Furniture 1",
                    "description": "work_desc",
                    # "calculation_item": "calculation_link",
                    "qty": "price",
                    # "so_detail": "so_detail",
                    # "cost_center": "cost_center"
                }
            }
        },
        target_doc,
        set_missing_values)
    return doclist
