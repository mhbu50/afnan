frappe.ui.form.on("Item", "print_barcode",
    function(frm) {
        console.log("frm.doc.barcode",frm.doc.barcode);
        console.log("(frm.doc.barcode).trim().length <1: ",frm.doc.barcode.trim().length <1);
        // console.log("cond: ",(frm.doc.barcode === undefined || (frm.doc.barcode).trim.length <1));
        if(frm.doc.barcode === undefined || (frm.doc.barcode).trim().length <1){
            // alert("barcode is empty");
            var msg = frappe._("Please attach atleast 1 file");
            msgprint(msg);
            throw msg;
        }else{
        var dialog = new frappe.ui.Dialog({
            title: __("Barcode Lable "),
            fields: [{
                    "fieldtype": "Check",
                    "label": __("Remove All"),
                    "fieldname": "remove"
                },
                {
                    "fieldtype": "HTML",
                    "label": __("Reason for losing"),
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
            console.log("bar code = ", frm.doc.barcode);
            for (startIndex; startIndex < endIndex; startIndex++) {
              var remark = startIndex +1;
                $(".cont").append("<div class='barcode'>"+
                "<div style='background-color: rgb(250, 251, 252);position: absolute;font-size: 90px;color: #d1d8dd;width: 250px;text-align: center;' class='remark'>"+remark+"</div>"+
                "<img  style='position: absolute;' src='http://www.barcodes4.me/barcode/c128a/" + encodeURIComponent(frm.doc.barcode) + ".png?width=263&height=135&IsTextDrawn=1'/></div>");
            }
            $(".cont").append("<div class='page-break'></div>");
            $('div .barcode').on('click', function() {
                var $img = $(this).children()[1];
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
                $(w.document.body).css("margin", "0px");
                $(w.document).find(".barcode").css("outline", "0px");
                $(w.document).find(".remark").remove();

                w.print();
                w.close();
            }, 100);
        });
        dialog.$wrapper.find('.modal-dialog').css("width", "870px");
        dialog.show();
        }
    });
