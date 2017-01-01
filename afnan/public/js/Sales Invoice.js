
frappe.ui.form.on("Sales Invoice", {
    get_calculation: function(frm) {
        var dialog = new frappe.ui.Dialog({
            title: __("قياس العمل"),
            fields: [{
                "fieldtype": "Link",
                "label": __("أختر رقم القياس"),
                "fieldname": "calc",
                "reqd": 1,
                "options": "calculation"
            }, {
                "fieldtype": "Button",
                "label": __("اختر"),
                "fieldname": "update"
            }, ]
        });
        dialog.fields_dict.update.$input.click(function() {
            arg = dialog.fields_list[0].input.value;
            if (!arg) return;
            return frappe.call({
                method: "frappe.client.get",
                args: {
                    "doctype": "calculation",
                    "name": arg
                },
                callback: function(r) {
                    var row_name ="";
                    if (frm.doc.items[0].item_code === undefined) {
                      row_name= "New Sales Invoice Item 1";
                    }else {
                      row = frappe.model.add_child(frm.doc, 'Sales Invoice Item', "items");
                      row_name = row.name;
                    }
                        if (r.message.total_m_price || r.message.total_f_price) {
                            frappe.model.set_value("Sales Invoice Item", row_name, "item_code", "عمل برواز");
                            setTimeout(function() {
                                frappe.model.set_value("Sales Invoice Item", row_name, "qty", (r.message.quantity_f));
                                frappe.model.set_value("Sales Invoice Item", row_name, "rate", (r.message.total_m_price + r.message.total_f_price));
                            }, 200);
                        } else if (r.message.total_g_price) {
                            frappe.model.set_value("Sales Invoice Item", row_name, "item_code", "عمل زجاج");
                            setTimeout(function() {
                                frappe.model.set_value("Sales Invoice Item", row_name, "qty", (r.message.quantity_g));
                                frappe.model.set_value("Sales Invoice Item", row_name, "rate", r.message.total_g_price);
                            }, 200);
                        } else if (r.message.type == "كانفاس") {
                            frappe.model.set_value("Sales Invoice Item", row_name, "item_code", "عمل كانفاس");
                            setTimeout(function() {
                                frappe.model.set_value("Sales Invoice Item", row_name, "qty", (r.message.quantity_c));
                                frappe.model.set_value("Sales Invoice Item", row_name, "rate", r.message.price);
                            }, 200);
                        }
                    dialog.hide();
                },
                btn: this
            });
        });
        dialog.show();
    },
  refresh: function(frm)  {
    	// frm.get_field("barcode").$wrapper.html("{{<img src='http://www.barcodes4.me/barcode/c128a/" + encodeURIComponent(frm.doc.name) + ".png?width=263&height=135&IsTextDrawn=1'/>}}");

    }
});
