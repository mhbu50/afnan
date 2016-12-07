# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "afnan"
app_title = "Afnan"
app_publisher = "accurate systems"
app_description = "Afnan calculation App"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "mhbu50@gmail.com"
app_license = "MIT"

fixtures = ["Custom Field"]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/afnan/css/afnan.css"
# app_include_js = "/assets/afnan/js/afnan.js"

# include js, css files in header of web template
# web_include_css = "/assets/afnan/css/afnan.css"
# web_include_js = "/assets/afnan/js/afnan.js"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "afnan.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "afnan.install.before_install"
# after_install = "afnan.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "afnan.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"afnan.tasks.all"
# 	],
# 	"daily": [
# 		"afnan.tasks.daily"
# 	],
# 	"hourly": [
# 		"afnan.tasks.hourly"
# 	],
# 	"weekly": [
# 		"afnan.tasks.weekly"
# 	]
# 	"monthly": [
# 		"afnan.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "afnan.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "afnan.event.get_events"
# }
