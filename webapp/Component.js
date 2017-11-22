sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"gss/newWarehouseManage_R1/controller/Application",
	"gss/newWarehouseManage_R1/model/models"
], function(UIComponent, Device, Application, models) {
	"use strict";

	return UIComponent.extend("gss.newWarehouseManage_R1.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			var oApplication = new Application(this);
			oApplication.init();
			UIComponent.prototype.init.apply(this, arguments);
			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});