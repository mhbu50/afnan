// Copyright (c) 2016, accurate systems and contributors
// For license information, please see license.txt

var Glass_Settings;
var meter_price = 0;
var full_beveled = 0;
var full_letter = 0;
var beveled_letter = 0;
var anti_braek = 0;
var wood = 0;
var wood_price = 0;
var canvas_price = 0;

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
  // debugger;
  var m_diff = get_m_diff(frm);
  frm.set_value('in_h', frm.doc.b_height + frm.doc.right + frm.doc.left + (m_diff * 2));

  if (frm.doc.is_for_borad == 1) {
    frappe.model.set_value("calculation", frm.doc.name, "g_height", frm.doc.in_h);
  }
}

function calc_in_w(frm) {
  var m_diff = get_m_diff(frm);
  console.log("frm.doc.b_width = " + frm.doc.b_width + "frm.doc.up = " + frm.doc.up + " (m_diff * 2) = " + (m_diff * 2));
  frm.set_value('in_w', frm.doc.b_width + frm.doc.up + frm.doc.down + (m_diff * 2));
  if (frm.doc.is_for_borad == 1) {
    frappe.model.set_value("calculation", frm.doc.name, "g_width", frm.doc.in_w);
  }
}

function calc_mating_price(frm) {
  var v_mating_price = 0;
  v_mating_price = frm.doc.in_h / 100 * frm.doc.in_w / 100 * frm.doc.mating_price;
  frappe.model.set_value("calculation", frm.doc.name, "m_price", v_mating_price);
}

function update_total_m_price(frm) {
  var m_price = 0;
  var total_m_price = 0;
  var diff = 0;
  if (frm.doc.sub_mating)
    frm.doc.sub_mating.forEach(function(d) {
      diff = diff + d.m_diff * 2;
    });
  console.log("frm.doc.in_h= " + frm.doc.in_h + " frm.doc.in_w = " + frm.doc.in_w + " frm.doc.mating_price = " + frm.doc.mating_price);
  m_price = (frm.doc.in_h + diff) / 100 * (frm.doc.in_w + diff) / 100 * frm.doc.mating_price;
  if (frm.doc.sub_mating) {
    frm.doc.sub_mating.forEach(function(d) {
      total_m_price = total_m_price + d.mating_price;
    });
  }
  console.log("m_price = " + m_price + " total_m_price = " + total_m_price + " val = " + parseInt(total_m_price + m_price));
  frappe.model.set_value("calculation", frm.doc.name, "total_m_price", parseFloat(total_m_price + m_price));
  update_final_price(frm);
}

function check_h_w(frm) {

  if (frm.doc.b_height !== 0 && frm.doc.b_width !== 0) {
    if (frm.doc.b_height < frm.doc.b_width) {
      msgprint("الطول يجب ان يكون اطول من العرض في قياسات اللوحة");
    }
  }
  if (frm.doc.g_height !== 0 && frm.doc.g_width !== 0) {
    if (frm.doc.g_height < frm.doc.g_width) {
      msgprint("الطول يجب ان يكون اطول من العرض في قياسات الزجاج");
    }
  }

  if (frm.doc.c_height !== 0 && frm.doc.c_width !== 0) {
    if (frm.doc.c_height < frm.doc.c_width) {
      msgprint("الطول يجب ان يكون اطول من العرض في قياسات الكانفاس");
    }
  }
}

frappe.ui.form.on("calculation", {
  onload_post_render: function() {
    var section_head = $('.section-head').find("a").filter(
      function() {
        return $(this).text() == "ماتنق";
      }).parent();
    // console.log("section head", section_head);
    section_head.on("click", function() {
      console.log($(this).hasClass("collapsed"));
    });
  },
  refresh: function(frm) {
    if (!frm.doc.__islocal) {
      frm.add_custom_button(__('Invoice'), function() {
        if (frm.is_dirty()) {
          msgprint("الرجاء حفظ الملف قبل انشاء الفاتورة");
        } else {
          var sc_table = frm.doc.sub_calculation;
          var discount = frm.doc.discount;
          frappe.model.with_doctype('Sales Order', function() {
            var doc = frappe.model.get_new_doc('Sales Order');
            console.log("doc", doc);
            doc.customer = "عميل عابر";
            doc.delivery_date = frappe.datetime.add_days(frappe.datetime.nowdate(), 5);
            doc.additional_discount_percentage = parseFloat(discount);
            console.log("frm.doc = ", doc);
            $.each(sc_table, function(i, d) {
              // console.log("d = ",d);
              row = frappe.model.add_child(doc, "items");
              row.calculation_item = d.calculation_link;
              row.description = d.work_desc;
              row.rate = d.price;
              row.amount = d.price;
              row.qty = d.quantity;
              row.item_code = d.type;
              row.item_name = d.type;
              row.uom = "Nos";
            });
            frappe.set_route('Form', doc.doctype, doc.name);
          });
        }
      });

      frm.add_custom_button(__('Add Extra'), function() {
        var sc_table = frm.doc.sub_calculation;
        frappe.run_serially([
          () => frappe.new_doc('calculation'),
          () => console.log("sc = ", sc_table),
          () => $.each(sc_table, function(i, d) {
            // console.log("d = ",d);
            row = frm.add_child("sub_calculation")
            row.calculation_link = d.calculation_link;
            row.work_desc = d.work_desc,
              row.price = d.price;
            row.bom = d.bom;
            row.quantity = d.quantity;
            row.total = d.total;
            row.type = d.type;

          }),
          () => frm.refresh_field("sub_calculation")
        ]);
      });


    }
    var tot = 0;
    $.each(frm.doc.sub_calculation, function(index, row) {
      //update row if any changes happen in current calculation
      if(row.calculation_link == frm.doc.name){
        row.work_desc = frm.doc.work_desc;
        row.price = frm.doc.price;
        row.total = row.price * row.quantity;
      }

      tot = tot + parseInt(row.total);
    });
    frm.refresh_field("sub_calculation");
    frm.set_value("tot", tot);
    // if (frm.is_dirty()) {
    // frm.save();
    // }
  },
  onload: function(frm) {
    console.log("frappe.get_route()", frappe.get_route());
    if (frm.doc.type === "برواز") {
      frm.toggle_reqd("b_width", true);
      frm.toggle_reqd("b_height", true);
      frm.toggle_reqd("c_width", false);
      frm.toggle_reqd("c_height", false);
    } else {
      frm.toggle_reqd("b_width", false);
      frm.toggle_reqd("b_height", false);
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

    frm.fields_dict['mating'].get_query = function(doc) {
      return {
        "filters": {
          "item_group": ["in", ["ماتنق", "جلد و قماش"]]
        }
      };
    };

    frm.fields_dict["sub_mating"].grid.get_field("mating").get_query = function(doc) {
      return {
        "filters": {
          "item_group": ["in", ["ماتنق", "جلد و قماش"]]
        }
      };
    };

    cur_frm.fields_dict["sub_frame"].grid.get_field("frame").get_query = function(doc) {
      return {
        "filters": {
          "item_group": ["in", ["برواز بلاستك", "برواز خشب"]]
        }
      };
    };

    cur_frm.set_query("glass_type", function() {
      return {
        "filters": {
          "item_group": "زجاج"
        }
      };
    });

    cur_frm.set_query("canvas_type", function() {
      return {
        "filters": {
          "item_group": "كنفاس"
        }
      };
    });
    //to load Glass_Settings data on saved calculation
    if (frm.doc.glass_type)
      get_glass_settings(frm);
  },
  type: function(frm) {
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
  },
  b_height: function(frm) {
    calc_in_h(frm);
    calc_mating_price(frm);
    do_m_diff(frm);
    update_total_m_price(frm);
    check_h_w(frm);
    frappe.model.set_value("calculation", frm.doc.name, "b_area", (frm.doc.b_width * frm.doc.b_height) / 100);
    frappe.model.set_value("calculation", frm.doc.name, "b_circumference", ((frm.doc.b_width + frm.doc.b_height) * 2) / 100);
  },
  b_width: function(frm) {
    calc_in_w(frm);
    calc_mating_price(frm);
    do_m_diff(frm);
    update_total_m_price(frm);
    check_h_w(frm);
    frappe.model.set_value("calculation", frm.doc.name, "b_area", (frm.doc.b_width * frm.doc.b_height) / 100);
    frappe.model.set_value("calculation", frm.doc.name, "b_circumference", ((frm.doc.b_width + frm.doc.b_height) * 2) / 100);
  },
  right: function(frm) {
    calc_in_h(frm);
    calc_mating_price(frm);
    update_total_m_price(frm);
  },
  left: function(frm) {
    calc_in_h(frm);
    calc_mating_price(frm);
    update_total_m_price(frm);
  },
  up: function(frm) {
    calc_in_w(frm);
    calc_mating_price(frm);
    update_total_m_price(frm);
  },
  down: function(frm) {
    calc_in_w(frm);
    calc_mating_price(frm);
    update_total_m_price(frm);
  },
  mating: function(frm) {
    if (frm.doc.mating)
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
          if (data.message) {
            frappe.model.set_value("calculation", frm.doc.name, "mating_price", data.message.price_list_rate);
            frm.refresh_field("mating_price");
          }
        }
      });
  },
  is_for_borad: function(frm) {
    get_glass_settings(frm);
    if (frm.doc.b_height === undefined || frm.doc.b_width === undefined) {
      frappe.model.set_value("calculation", frm.doc.name, "is_for_borad", 0);
      msgprint("الرجاء ادخال الطول و العرض للوحة قبل اختيار الزجاج لها");
    }
    if (frm.doc.is_for_borad == 1) {
      console.log("frm.doc.in_h = " + frm.doc.in_h + " frm.doc.in_w = " + frm.doc.in_w);
      frappe.model.set_value("calculation", frm.doc.name, "g_height", frm.doc.in_h);
      frappe.model.set_value("calculation", frm.doc.name, "g_width", frm.doc.in_w);
      frm.set_df_property("g_height", "read_only", 1);
      frm.set_df_property("g_width", "read_only", 1);
    } else {
      frm.set_df_property("g_height", "read_only", 0);
      frm.set_df_property("g_width", "read_only", 0);
    }
  },
  anti_braek: function(frm) {
    update_total_g_price(frm);
  },
  g_height: function(frm) {
    check_h_w(frm);
    do_glass_type(frm);
    // console.log("meter_price =" + meter_price);
    frappe.model.set_value("calculation", frm.doc.name, "g_area", (frm.doc.g_width * frm.doc.g_height) / 100);
    frappe.model.set_value("calculation", frm.doc.name, "g_circumference", ((frm.doc.g_width + frm.doc.g_height) * 2) / 100);
    update_total_g_price(frm);

  },
  g_width: function(frm) {
    check_h_w(frm);
    do_glass_type(frm);
    // console.log("meter_price =" + meter_price);
    frappe.model.set_value("calculation", frm.doc.name, "g_area", (frm.doc.g_width * frm.doc.g_height) / 100);
    frappe.model.set_value("calculation", frm.doc.name, "g_circumference", ((frm.doc.g_width + frm.doc.g_height) * 2) / 100);
    update_total_g_price(frm);
  },
  glass_type: function(frm) {
    do_glass_type(frm);
  },
  c_width: function(frm) {
    check_h_w(frm);
  },
  c_height: function(frm) {
    check_h_w(frm);
  },
  wood: function(frm) {
    if (frm.doc.wood === "4x2") {
      wood = 2 * 15;
    } else if (frm.doc.wood === "2x4") {
      wood = 3 * 13;
    } else if (frm.doc.wood === "4x4") {
      wood = 2 * 23;
    }
    canvas_price = ((frm.doc.c_height + 10) / 100 * (frm.doc.c_width + 10) / 100) * 65;
    wood_price = (frm.doc.c_height / 100 + frm.doc.c_width / 100) * wood;
    frappe.model.set_value("calculation", frm.doc.name, "price", canvas_price + wood_price);
  },
  discount: function(frm) {
    console.log("frm.doc.tot = ", frm.doc.tot + " (frm.doc.discount /100) = " + (frm.doc.tot * frm.doc.discount / 100));
    console.log("frm.doc.tot - (frm.doc.discount /100)", frm.doc.tot - (frm.doc.discount / 100));
    frm.set_value("dis_tot", parseInt(frm.doc.tot - (frm.doc.tot * frm.doc.discount / 100)));
  }
});

function do_glass_type(frm) {
  if (frm.doc.glass_type)
    frappe.call({
      "method": "frappe.client.get",
      args: {
        doctype: "Glass Settings",
        name: frm.doc.glass_type,
      },
      callback: function(data) {
        if (data.message) {
          Glass_Settings = data.message;
          meter_price = frm.doc.g_area * Glass_Settings.price_square;
          beveled_letter = ((frm.doc.g_width * 2 + frm.doc.g_height * 2) / 100) * Glass_Settings.beveled_letter;
          full_beveled = ((frm.doc.g_width * 2 + frm.doc.g_height * 2) / 100) * Glass_Settings.beveled;
          full_letter = ((frm.doc.g_width * 2 + frm.doc.g_height * 2) / 100) * Glass_Settings.letter;
          anti_braek = frm.doc.g_area * Glass_Settings.anti_braek;
          update_total_g_price(frm);
        }
      }
    });
}

function update_total_g_price(frm) {
  var total = 0;
  // frm.doc.g_circumference = (frm.doc.g_height + frm.doc.g_width);
  frm.doc.g_circumference = ((frm.doc.g_width + frm.doc.g_height) * 2) / 10000;
  // frm.doc.g_area = frm.doc.g_height * frm.doc.g_width;
  frm.doc.g_area = (frm.doc.g_width * frm.doc.g_height) / 10000;
  if (Glass_Settings !== undefined) {
    anti_braek = frm.doc.g_area * Glass_Settings.anti_braek;
    meter_price = frm.doc.g_area * Glass_Settings.price_square;
  }
  total = meter_price;

  var operation = calc_glass_operation(frm);
  if (operation) {
    total = total + operation;
  }
  if (frm.doc.anti_braek) {
    total = total + anti_braek;
  }
  frappe.model.set_value("calculation", frm.doc.name, "total_g_price", total);
  frm.refresh_field("total_g_price");
  update_final_price(frm);
}

function update_final_price(frm) {
  console.log("frm.doc.total_f_price = " + frm.doc.total_f_price + " frm.doc.total_m_price = " +
  frm.doc.total_m_price + " frm.doc.total_g_price = " + frm.doc.total_g_price);
  frm.set_value("price", parseFloat(frm.doc.total_f_price) +
  parseFloat(frm.doc.total_m_price) + parseFloat(frm.doc.total_g_price));
  frm.refresh_field("price");
 // make loop for sum of works
}

function get_glass_settings(frm) {
  if (frm.doc.glass_type !== undefined) {
    frappe.call({
      "method": "frappe.client.get",
      args: {
        doctype: "Glass Settings",
        name: frm.doc.glass_type,
      },
      callback: function(data) {
        if (data.message) {
          Glass_Settings = data.message;
          console.log("frm.doc.g_area = " + frm.doc.g_area + " Glass_Settings.price_square = " + Glass_Settings.price_square);
          meter_price = frm.doc.g_area * Glass_Settings.price_square;
          beveled_letter = ((frm.doc.g_width * 2 + frm.doc.g_height * 2) / 100) * Glass_Settings.beveled_letter;
          full_beveled = ((frm.doc.g_width * 2 + frm.doc.g_height * 2) / 100) * Glass_Settings.beveled;
          full_letter = ((frm.doc.g_width * 2 + frm.doc.g_height * 2) / 100) * Glass_Settings.letter;
          anti_braek = frm.doc.g_area * Glass_Settings.anti_braek;
        }
      }
    });
  }
}

frappe.ui.form.on("Sub Frame", {
  frame: function(frm, cdt, cdn) {
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
          if (data.message) {
            frappe.model.set_value("Sub Frame", row.name, "sub_f_price", data.message.price_list_rate);
            frm.refresh_field("sub_f_price");
          }
        }
      });

      frappe.call({
        "method": "frappe.client.get",
        args: {
          doctype: "Item",
          name: row.frame,
        },
        callback: function(data) {
          if (data.message) {
            frappe.model.set_value("Sub Frame", row.name, "frame_width", data.message.width);
            frm.refresh_field("frame_width");
            // console.log("frm.doc.in_h = " + frm.doc.in_h + " data.message.width  = " + data.message.width);
            var len = frm.doc.sub_frame.length;
            //console.log("len", len);
            var out_height = 0;
            var out_width = 0;
            var frame_width = 0;
            // debugger;

            if (1 < len) {
              console.log("idx =", row.idx);
              calc_outers(frm.doc.sub_frame, row.idx);
              frappe.model.set_value("Sub Frame", row.name, "out_height", frm.doc.sub_frame[len - 2].out_height + data.message.width * 2);
              frappe.model.set_value("Sub Frame", row.name, "out_width", frm.doc.sub_frame[len - 2].out_width + data.message.width * 2);
              frm.refresh_field("out_height");
              frm.refresh_field("out_width");
            } else {
              frappe.model.set_value("Sub Frame", row.name, "out_height", frm.doc.in_h + data.message.width * 2);
              frappe.model.set_value("Sub Frame", row.name, "out_width", frm.doc.in_w + data.message.width * 2);
              frm.refresh_field("out_height");
              frm.refresh_field("out_width");
            }
            frappe.model.set_value("Sub Frame", row.name, "f_used", row.out_height / 100 * 2 + row.out_width / 100 * 2);
            frappe.model.set_value("Sub Frame", row.name, "frame_price", row.f_used * row.sub_f_price);
            frm.refresh_field("f_used");
            frm.refresh_field("frame_price");


            var total_f_price = 0;
            frm.doc.sub_frame.forEach(function(d) {
              total_f_price += d.frame_price;
            });
            frappe.model.set_value("calculation", frm.doc.name, "total_f_price", total_f_price);
            frappe.model.set_value("calculation", frm.doc.name, "price", parseFloat(frm.doc.total_m_price + frm.doc.total_f_price));
            frm.refresh_field("total_f_price");
            frm.refresh_field("price");
          }
        }
      });

      //to refresh exist row
      setTimeout(function() {
        $.each(frm.doc.sub_frame, function(key, value) {
          console.log("row " + parseInt(key + 1) + ": ", value);
          frame_width = 0;
          $.each(frm.doc.sub_frame.slice(0, parseInt(key + 1)), function(key2, value2) {
            frame_width = parseInt(frame_width) + parseInt(value2.frame_width);
          });
          console.log("frame_width = " + frame_width);
          frappe.model.set_value("Sub Frame", value.name, "out_height", frm.doc.in_h + (frame_width * 2));
          frm.refresh_field("out_height");
          frappe.model.set_value("Sub Frame", value.name, "out_width", frm.doc.in_w + (frame_width * 2));
          frm.refresh_field("out_width");

        });
      }, 150);


    }
  },
  sub_frame_add: function(frm) {
    if (frm.doc.b_height === 0.0 || frm.doc.b_width === 0.0) {
      frm.doc.sub_frame = [];
      return msgprint("الرجاء ادخال الطول و العرض");
    }
  }
});

frappe.ui.form.on("Sub Mating", {
  mating: function(frm, cdt, cdn) {
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
          if (data.message) {
            frappe.model.set_value("Sub Mating", row.name, "sub_m_price", data.message.price_list_rate);
            frm.refresh_field("sub_m_price");
            if (row.m_diff) {
              do_m_diff(frm);
            }
          }
        }
      });
    }
  },
  m_diff: function(frm) {
    do_m_diff(frm);
  }
});

function do_m_diff(frm) {
  console.log("in m_diff");
  if(frm.doc.sub_mating){
    var arr = frm.doc.sub_mating.reverse();
    var sum_diff = 0;
    var h = 0;
    var w = 0;
    for (var i = 0; i < arr.length; i++) {
      h = frm.doc.b_height + frm.doc.right + frm.doc.left + (arr[i].m_diff * 2) + sum_diff;
      w = frm.doc.b_width + frm.doc.up + frm.doc.down + (arr[i].m_diff * 2) + sum_diff;
      console.log("name = " + arr[i].name + " h = " + h + " w = " + w + " sum_diff = " + sum_diff);
      frappe.model.set_value("Sub Mating", arr[i].name, "mating_price", h / 100 * w / 100 * arr[i].sub_m_price);
      sum_diff = sum_diff + arr[i].m_diff * 2;
    }
    // var v_mating_price = 0;
    // v_mating_price = (frm.doc.in_h + sum_diff) / 100 * (frm.doc.in_w + sum_diff) / 100 * frm.doc.mating_price;
    // frappe.model.set_value("calculation", frm.doc.name, "m_price", v_mating_price);
    update_total_m_price(frm);
    calc_in_h(frm);
    calc_in_w(frm);
  }
}

function calc_glass_operation(frm) {
  var price = 0;
  frm.doc.sides.forEach(function(d) {
    // debugger;
    //console.log("d", d);
    if (d.beveled && !d.letter) {
      if (d.side == "أعلى" || d.side == "أسفل") {
        price = price + (Glass_Settings.beveled * frm.doc.g_width) / 100;
      } else if (d.side == "يمين" || d.side == "يسار") {
        price = price + (Glass_Settings.beveled * frm.doc.g_height) / 100;
      }
    }
    if (d.letter && !d.beveled) {
      if (d.side == "أعلى" || d.side == "أسفل") {
        price = price + (Glass_Settings.letter * frm.doc.g_width) / 100;
      } else if (d.side == "يمين" || d.side == "يسار") {
        price = price + (Glass_Settings.letter * frm.doc.g_height) / 100;
      }
    }
    if (d.beveled && d.letter) {
      if (d.side == "أعلى" || d.side == "أسفل") {
        price = price + (Glass_Settings.beveled_letter * frm.doc.g_width) / 100;
      } else if (d.side == "يمين" || d.side == "يسار") {
        price = price + (Glass_Settings.beveled_letter * frm.doc.g_height) / 100;
      }
    }
    if (d.security) {
      price = price + Glass_Settings.security;
    }
  });
  return price;
}

frappe.ui.form.on("Sides", {
  beveled: function(frm) {
    update_total_g_price(frm);
  },
  letter: function(frm) {
    update_total_g_price(frm);
  },
  security: function(frm) {
    update_total_g_price(frm);
  }

});

frappe.ui.form.on("Sub Calculation", {
  quantity: function(frm, cdt, cdn) {
    var row = locals[cdt][cdn];
    frappe.model.set_value("Sub Calculation", row.name, "total", row.quantity * row.price);
    frm.refresh_field("sub_m_price");
    var tot = 0;
    $.each(frm.doc.sub_calculation, function(index, row) {
      tot = tot + parseInt(row.total);
    });
    frm.set_value("tot", tot);
  },refresh:function (frm) {
    console.log("ddddddd");
    frm.refresh_field("sub_calculation")
  }

});
