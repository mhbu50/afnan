frappe.ui.form.on("Production Order", {
    onload: function(frm) {
   if(frm.doc.source_warehouse === undefined || frm.doc.source_warehouse === ""){
     frm.set_value("source_warehouse","Raw Material - اش");

   }
   if(frm.doc.wip_warehouse === undefined || frm.doc.wip_warehouse === ""){
      frm.set_value("wip_warehouse","Works In Progress - اش");

   }

   if(frm.doc.fg_warehouse === undefined || frm.doc.fg_warehouse === ""){
      frm.set_value("fg_warehouse","Finished Goods - اش");

   }
    }
  });
