// Copyright (c) 2016, accurate systems and contributors
// For license information, please see license.txt

frappe.ui.form.on('calculation', {
	refresh: function(frm) {

	}
});

		frappe.ui.form.on("Sub Frame", "frame",
		    function(frm) {
		        frappe.call({
		            "method": "frappe.client.get",
		            args: {
		                doctype: "Item Price",
										name:undefined,
										filters:{"item_code":frm.doc.sub_frame[0].frame},
		            },
		            callback: function (data) {
									console.log("data is = ", data.message.price_list_rate);
									console.log("frm.doc.sub_frame[0] = ", frm.doc.sub_frame[0]);
		                frappe.model.set_value("Sub Frame",frm.doc.sub_frame[0].name, "sub_f_price", data.message.price_list_rate);
									 frm.refresh_field("sub_f_price");
		            }
		        });
		    });

				frappe.ui.form.on("Sub Mating", "mating",
				    function(frm) {
				        frappe.call({
				            "method": "frappe.client.get",
				            args: {
				                doctype: "Item Price",
												name:undefined,
												filters:{"item_code":frm.doc.sub_mating[0].mating},
				            },
				            callback: function (data) {
											console.log("data is = ", data.message.price_list_rate);
											console.log("frm.doc.sub_frame[0] = ", frm.doc.sub_mating[0]);
				                frappe.model.set_value("Sub Mating",frm.doc.sub_mating[0].name, "sub_m_price", data.message.price_list_rate);
											 frm.refresh_field("sub_m_price");
				            }
				        });
				    });
