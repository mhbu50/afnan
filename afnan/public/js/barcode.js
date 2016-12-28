frappe.ui.form.on("Item", "print_barcode",
    function(frm) {
        var dialog = new frappe.ui.Dialog({
            title: __("Barcode Lable "),
            fields: [{
                "fieldtype": "HTML",
                "label": __("Reason for losing"),
                "fieldname": "reason",
                "reqd": 1,
            }, ]
        });
        console.log("dialog.fields_dict.", dialog.fields_dict);
        $(dialog.fields_dict['reason'].wrapper).html(frappe.render(frappe.templates.barcode, ""));

        setTimeout(function() {
            var startIndex = 0;
            var endIndex = 24;
            console.log("bar code = ",frm.doc.barcode);
            for (startIndex; startIndex < endIndex; startIndex++) {
                $(".cont").append("<div class='barcode'><img src='http://www.barcodes4.me/barcode/c128a/" + encodeURIComponent(frm.doc.barcode) + ".png?width=263&height=135&IsTextDrawn=1'/></div>");
            }
            $(".cont").append("<div class='page-break'></div>");
            $('div .barcode').on('click', function() {
                var $img = $(this).children()[0];
                console.log("hh = ", $($img).css("height"));
                $(this).css("height", "140px");
                $($img).toggle('slow');
            });
        }, 100);

        dialog.set_primary_action(__("Print"), function() {

            var printContents = $(dialog.fields_dict['reason'].wrapper).html();
            // printContents = printContents.replace("width: inherit","width: 8.27in");
            var xmlFromPage = $($.parseHTML(printContents));
            xmlFromPage.find("html").css("height", "11in");
            xmlFromPage.find("html").css("width", "8.5in");

            w = window.open();
            w.document.write(printContents);
            setTimeout(function() {
                $(w.document.body).css("margin","0px");
                $(w.document).find(".barcode").css("outline","0px");

                w.print();
                w.close();
            }, 100);
        });
        dialog.$wrapper.find('.modal-dialog').css("width", "870px");
        dialog.show();
    });
