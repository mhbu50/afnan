// Copyright (c) 2016, accurate systems and contributors
// For license information, please see license.txt

frappe.ui.form.on('Glass Settings', {
	refresh: function(frm) {
		frm.fields_dict['item'].get_query = function(doc) {
			return {
				"filters": {
					"item_group": [
						"in",
						[
							"زجاج"
						]
					]
				}
			};
		};
	}
});
