// Copyright (c) 2016, accurate systems and contributors
// For license information, please see license.txt

frappe.ui.form.on('calculation', 'type',
    function(frm) {
			if (frm.doc.type === "برواز") {
					frm.toggle_reqd("b_width", true);
					frm.toggle_reqd("b_height", true);
					frm.toggle_reqd("g_width", true);
					frm.toggle_reqd("g_height", true);
					frm.toggle_reqd("glass_type", true);
					frm.toggle_reqd("c_width", false);
					frm.toggle_reqd("c_height", false);
			} else {
					frm.toggle_reqd("b_width", false);
					frm.toggle_reqd("b_height", false);
					frm.toggle_reqd("g_width", false);
					frm.toggle_reqd("g_height", false);
					frm.toggle_reqd("glass_type", false);
					frm.toggle_reqd("c_width", true);
					frm.toggle_reqd("c_height", true);
			}

    }
);

frappe.ui.form.on("calculation", "onload", function(frm) {
	console.log("frm",frm);
	console.log("frm.doc.type === برواز", frm.doc.type === "برواز");
    if (frm.doc.type === "برواز") {
        frm.toggle_reqd("b_width", true);
        frm.toggle_reqd("b_height", true);
        frm.toggle_reqd("g_width", true);
        frm.toggle_reqd("g_height", true);
				frm.toggle_reqd("glass_type", true);
				frm.toggle_reqd("c_width", false);
        frm.toggle_reqd("c_height", false);
    } else {
        frm.toggle_reqd("b_width", false);
        frm.toggle_reqd("b_height", false);
        frm.toggle_reqd("g_width", false);
        frm.toggle_reqd("g_height", false);
				frm.toggle_reqd("glass_type", false);
				frm.toggle_reqd("c_width", true);
        frm.toggle_reqd("c_height", true);
    }
		console.log("frm.doc.sides.length = ", frm.doc);
if(!frm.doc.sides){
    var new_row1 = frm.add_child("sides");
    new_row1.side = "جهة العلوية";
    var new_row2 = frm.add_child("sides");
    new_row2.side = "جهة اليمين";
    var new_row3 = frm.add_child("sides");
    new_row3.side = "جهة اليسار";
    var new_row4 = frm.add_child("sides");
    new_row4.side = "جهة السفلية";

    refresh_field("sides");
}


});
frappe.ui.form.on("Sub Frame", "frame",
    function(frm) {
        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Item Price",
                name: undefined,
                filters: {
                    "item_code": frm.doc.sub_frame[0].frame
                },
            },
            callback: function(data) {
                console.log("data is = ", data.message.price_list_rate);
                console.log("frm.doc.sub_frame[0] = ", frm.doc.sub_frame[0]);
                frappe.model.set_value("Sub Frame", frm.doc.sub_frame[0].name, "sub_f_price", data.message.price_list_rate);
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
                name: undefined,
                filters: {
                    "item_code": frm.doc.sub_mating[0].mating
                },
            },
            callback: function(data) {
                console.log("data is = ", data.message.price_list_rate);
                console.log("frm.doc.sub_frame[0] = ", frm.doc.sub_mating[0]);
                frappe.model.set_value("Sub Mating", frm.doc.sub_mating[0].name, "sub_m_price", data.message.price_list_rate);
                frm.refresh_field("sub_m_price");
            }
        });
    });
