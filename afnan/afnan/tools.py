from __future__ import unicode_literals
import frappe
import json
from frappe import _
from frappe.model.mapper import get_mapped_doc
from frappe.model.document import Document
from frappe.utils import cstr, flt, getdate, comma_and, cint


@frappe.whitelist()
def make_production_orders(source_name, target_doc=None):
    def set_missing_values(source, target):
        target.production_item = "ffff"

    target_doc = get_mapped_doc("Sales Order", source_name, {
        "Sales Order": {
            "doctype": "Production Order",
            "field_map": {
                "total": "qty"
            }
        }
    }, target_doc, set_missing_values)

    return target_doc

@frappe.whitelist()
def make_calculate_conversion(source_name, target_doc=None):
    # calculate conversion factor
	if item.stock_uom == args.uom:
		out.conversion_factor = 1.0
	else:
		out.conversion_factor = args.conversion_factor or \
			get_conversion_factor(item.item_code, args.uom).get("conversion_factor")  or 1.0

	args.conversion_factor = out.conversion_factor
	out.stock_qty = out.qty * out.conversion_factor

@frappe.whitelist()
def get_production_order_items(it=None,so=None):
    '''Returns items with BOM that already do not have a linked production order'''
    # so =333
    it = json.loads(it)
    # print it
    items = []
    for i in it:
        items.append(dict(
            item_code= i['item_code'],
            bom = frappe.db.get_value("calculation", i['calculation'], "bom" ),
            warehouse = i['warehouse'],
            pending_qty= i['stock_qty'] - flt(frappe.db.sql('''select sum(qty) from `tabProduction Order`
                where production_item=%s and sales_order=%s''', (i['item_code'], so))[0][0])
        ))
    return items


@frappe.whitelist()
def get_pro():
    return 555
