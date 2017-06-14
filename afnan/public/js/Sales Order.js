// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt
frappe.provide("erpnext.selling");


frappe.ui.form.on("Sales Order", {
    onload: function(frm) {
        if (frm.doc.__islocal) {
            frappe.model.set_value("Sales Order", frm.doc.name, "customer", "عميل عابر");
            frm.toggle_display("print_barcode", false);
        } else {
            frm.toggle_display("print_barcode", true);
        }
    },
    get_calculation: function(frm) {
        var dialog = new frappe.ui.Dialog({
            title: __("القياس"),
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
            console.log("arg",arg);
            if (!arg) return;
          //  frm.set_value("calculation",arg);
            return frappe.call({
                method: "frappe.client.get",
                args: {
                    "doctype": "calculation",
                    "name": arg
                },
                callback: function(r) {
                  // debugger;
                  console.log("frm",frm);
                    var row_name = "";
                    if (frm.doc.items[0].item_code === undefined) {
                        row_name = "New Sales Order Item 1";
                    } else {
                        row = frappe.model.add_child(frm.doc, 'Sales Order Item', "items");
                        row_name = row.name;
                    }
                    // debugger;
                    frappe.model.set_value("Sales Order Item", row_name, "calculation_item", arg);
                    if (r.message.total_m_price || r.message.total_f_price) {
                        frappe.model.set_value("Sales Order Item", row_name, "item_code", "عمل برواز");
                        setTimeout(function() {
                            // frappe.model.set_value("Sales Order Item", row_name, "qty", (r.message.quantity_f));
                            frappe.model.set_value("Sales Order Item", row_name, "rate", (r.message.total_m_price + r.message.total_f_price));
                            frappe.model.set_value("Sales Order Item", row_name, "desc", r.message.work_desc);
                        }, 150);
                    } else if (r.message.total_g_price) {
                        frappe.model.set_value("Sales Order Item", row_name, "item_code", "عمل زجاج");
                        setTimeout(function() {
                            // frappe.model.set_value("Sales Order Item", row_name, "qty", r.message.quantity_g);
                            frappe.model.set_value("Sales Order Item", row_name, "rate", r.message.total_g_price);
                            frappe.model.set_value("Sales Order Item", row_name, "height", r.message.g_height);
                            frappe.model.set_value("Sales Order Item", row_name, "width", r.message.g_width);
                            frappe.model.set_value("Sales Order Item", row_name, "desc", r.message.work_desc);
                        }, 100);
                    } else if (r.message.type == "كانفاس") {
                        frappe.model.set_value("Sales Order Item", row_name, "item_code", "عمل كانفاس");
                        setTimeout(function() {
                            // frappe.model.set_value("Sales Order Item", row_name, "qty", (r.message.quantity_c));
                            frappe.model.set_value("Sales Order Item", row_name, "rate", r.message.price);
                            frappe.model.set_value("Sales Order Item", row_name, "desc",r.message.work_desc);
                        }, 100);
                    }
                    dialog.hide();
                },
                btn: this
            });
        });
        dialog.show();
    },
    print_barcode: function(frm) {
        var dialog = new frappe.ui.Dialog({
            title: __("Barcode Lable "),
            fields: [{
                    "fieldtype": "Check",
                    "label": __("حذف الكل"),
                    "fieldname": "remove"
                },
                {
                    "fieldtype": "HTML",
                    "fieldname": "reason",
                    "reqd": 1,
                },
            ]
        });

        $(dialog.fields_dict['reason'].wrapper).html(frappe.render(frappe.templates.barcode, ""));
        dialog.fields_dict.remove.$input.change(function() {
            if ($(this).is(":checked")) {
                var returnVal = true;
                $(this).attr("checked", returnVal);
            }
            $('div .barcode img').toggle('slow');
        });
        setTimeout(function() {
            var startIndex = 0;
            var endIndex = 24;

            for (startIndex; startIndex < endIndex; startIndex++) {
                var remark = startIndex + 1;
                $(".cont").append("<div class='barcode'>" +
                    "<div style='background-color: rgb(250, 251, 252);position: absolute;font-size: 90px;color: #d1d8dd;width: 250px;text-align: center;' class='remark'>" + remark + "</div>" +
                    "<img style='position: absolute;' src='http://www.barcodes4.me/barcode/c128a/" + encodeURIComponent(frm.doc.name) + ".png?width=263&height=135&IsTextDrawn=1'/></div>");
            }
            $(".cont").append("<div class='page-break'></div>");
            $('div .barcode').on('click', function() {
                var $img = $(this).children()[1];
                console.log("hh = ", $($img).css("height"));
                $(this).css("height", "140px");
                $($img).toggle('slow');
            });
        }, 100);

        dialog.set_primary_action(__("طباعة"), function() {

            var printContents = $(dialog.fields_dict['reason'].wrapper).html();
            // printContents = printContents.replace("width: inherit","width: 8.27in");
            var xmlFromPage = $($.parseHTML(printContents));
            xmlFromPage.find("html").css("height", "11in");
            xmlFromPage.find("html").css("width", "8.5in");

            w = window.open();
            w.document.write(printContents);
            setTimeout(function() {
                $(w.document.body).css("margin", "0px");
                $(w.document).find(".barcode").css("outline", "0px");
                $(w.document).find(".remark").remove();

                w.print();
                w.close();
            }, 100);
        });
        dialog.$wrapper.find('.modal-dialog').css("width", "870px");
        dialog.show();
    },
    make_production: function(frm) {


    frappe.call({

      method: 'afnan.afnan.tools.get_production_order_items',
      args: {
        it:frm.doc.items,
      so:frm.doc.name},
      callback: function(r) {
        console.log(r);
        if(!r.message.every(function(d) { return !!d.bom; })) {
          frappe.msgprint({
            title: __('Production Order not created'),
            message: __('No Items with Bill of Materials to Manufacture'),
            indicator: 'orange'
          });
          return;
        }
        else if(!r.message.every(function(d) { return !!d.pending_qty; })) {
          frappe.msgprint({
            title: __('Production Order not created'),
            message: __('Production Order already created for all items with BOM'),
            indicator: 'orange'
          });
          return;
        } else {
          var fields = [
            {fieldtype:'Table', fieldname: 'items',
              description: __('Select BOM and Qty for Production'),
              fields: [
                {fieldtype:'Read Only', fieldname:'item_code',
                  label: __('Item Code'), in_list_view:1},
                {fieldtype:'Link', fieldname:'bom', options: 'BOM', reqd: 1,
                  label: __('Select BOM'), in_list_view:1, get_query: function(doc) {
                    return {filters: {item: doc.item_code}};
                  }},
                {fieldtype:'Float', fieldname:'pending_qty', reqd: 1,
                  label: __('Qty'), in_list_view:1},
              ],
              get_data: function() {
                console.log("r.message",r.message);
                return r.message;
              }
            }
          ];
          var d = new frappe.ui.Dialog({
            title: __('Select Items to Manufacture'),
            fields: fields,
            primary_action: function() {
              data = d.get_values();
              frm.call({
                method: 'make_production_orders',
                args: {
                  items: data,
                  company: frm.doc.company,
                  sales_order: frm.docname,
                  project: frm.project
                },
                freeze: true,
                callback: function(r) {
                  if(r.message) {
                    frappe.msgprint({
                      message: __('Production Orders Created: {0}',
                        [r.message.map(function(d) {
                          return repl('<a href="#Form/Production Order/%(name)s">%(name)s</a>', {name:d});
                        }).join(', ')]),
                      indicator: 'green'
                    });
                  }
                  d.hide();
                }
              });
            },
            primary_action_label: __('Make')
          });
          d.show();
        }
      }
    });
    }
});
