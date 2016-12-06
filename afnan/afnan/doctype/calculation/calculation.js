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

frappe.ui.form.on("calculation", "onload",
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

        if (!frm.doc.sides) {
            var new_row1 = frm.add_child("sides");
            new_row1.side = "أعلى";
            var new_row2 = frm.add_child("sides");
            new_row2.side = "أسفل";
            var new_row3 = frm.add_child("sides");
            new_row3.side = "يمين";
            var new_row4 = frm.add_child("sides");
            new_row4.side = "يسار";

            refresh_field("sides");
        }
    });


frappe.ui.form.on("calculation", {
    onload_post_render: function() {
        var section_head = $('.section-head').find("a").filter(
            function() {
                return $(this).text() == "ماتنق";
            }).parent();
        console.log("section head", section_head);
        section_head.on("click", function() {
            console.log($(this).hasClass("collapsed"));
        });
    }
});

function get_m_diff(frm) {
    var total = 0;
    if (frm.doc.sub_mating) {
        frm.doc.sub_mating.forEach(function(d) {
            total += d.m_diff;
        });
    }
    return total;
}

function calc_in_h(frm) {
    var m_diff = get_m_diff(frm);
    frm.set_value('in_h', frm.doc.b_height + frm.doc.right + frm.doc.left + (m_diff * 2));
}

function calc_in_w(frm) {
    var m_diff = get_m_diff(frm);
    frm.set_value('in_w', frm.doc.b_width + frm.doc.up + frm.doc.down + (m_diff * 2));
}

frappe.ui.form.on("calculation", "b_height",
    function(frm) {
        calc_in_h(frm);
    }
);

frappe.ui.form.on("calculation", "b_width",
    function(frm) {
        calc_in_w(frm);
    }
);


frappe.ui.form.on("calculation", "right",
    function(frm) {
        calc_in_h(frm);
    }
);

frappe.ui.form.on("calculation", "left",
    function(frm) {
        calc_in_h(frm);
    }
);

frappe.ui.form.on("calculation", "up",
    function(frm) {
        calc_in_w(frm);
    }
);

frappe.ui.form.on("calculation", "down",
    function(frm) {
        calc_in_w(frm);
    }
);

frappe.ui.form.on("calculation", "mating",
    function(frm) {
        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "Item Price",
                name: undefined,
                filters: {
                    "item_code": frm.doc.mating
                },
            },
            callback: function(data) {
                frappe.model.set_value("calculation", frm.doc.name, "mating_price", data.message.price_list_rate);
                frm.refresh_field("mating_price");
            }
        });
    });


frappe.ui.form.on("Sub Frame", "frame",
    function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.frame) {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Item Price",
                    name: undefined,
                    filters: {
                        "item_code": row.frame
                    },
                },
                callback: function(data) {
                    frappe.model.set_value("Sub Frame", row.name, "sub_f_price", data.message.price_list_rate);
                    frm.refresh_field("sub_f_price");
                }
            });

            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Item",
                    name: row.frame,
                },
                callback: function(data) {

                    frappe.model.set_value("Sub Frame", row.name, "frame_width", data.message.width);
                    frm.refresh_field("frame_width");
                    console.log("frm.doc.in_h = " + frm.doc.in_h + " data.message.width  = " + data.message.width);


                    var len = frm.doc.sub_frame.length;
                    console.log("len", len);
                    if (1 < len) {

                        frappe.model.set_value("Sub Frame", row.name, "out_height", frm.doc.sub_frame[len - 2].out_height + data.message.width * 2);
                        frm.refresh_field("out_height");

                        frappe.model.set_value("Sub Frame", row.name, "out_width", frm.doc.sub_frame[len - 2].out_width + data.message.width * 2);
                        frm.refresh_field("out_width");

                        console.log("frm.doc.sub_frame[len-1]", frm.doc.sub_frame[len - 2]);
                    } else {
                        frappe.model.set_value("Sub Frame", row.name, "out_height", frm.doc.in_h + data.message.width * 2);
                        frm.refresh_field("out_height");

                        frappe.model.set_value("Sub Frame", row.name, "out_width", frm.doc.in_w + data.message.width * 2);
                        frm.refresh_field("out_width");
                    }

                    frappe.model.set_value("Sub Frame", row.name, "f_used", row.out_height / 100 * 2 + row.out_width / 100 * 2);
                    frm.refresh_field("f_used");


                    frappe.model.set_value("Sub Frame", row.name, "frame_price", row.f_used * row.sub_f_price);
                    frm.refresh_field("frame_price");

                    var total_f_price = 0;
                    frm.doc.sub_frame.forEach(function(d) {
                        total_f_price += d.frame_price;
                    });

                    frappe.model.set_value("calculation", frm.doc.name, "total_f_price", total_f_price);
                    frm.refresh_field("total_f_price");
                }
            });
        }
    });

frappe.ui.form.on("Sub Mating", "mating",
    function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        if (row.mating) {
            frappe.call({
                "method": "frappe.client.get",
                args: {
                    doctype: "Item Price",
                    name: undefined,
                    filters: {
                        "item_code": row.mating
                    },
                },
                callback: function(data) {
                    console.log("data is = ", data.message.price_list_rate);
                    console.log("row = ", row);
                    frappe.model.set_value("Sub Mating", row.name, "sub_m_price", data.message.price_list_rate);
                    frm.refresh_field("sub_m_price");
                }
            });
        }
    });

//to calculate inner
frappe.ui.form.on("Sub Mating", "m_diff",
    function(frm) {
        calc_in_h(frm);
    });
