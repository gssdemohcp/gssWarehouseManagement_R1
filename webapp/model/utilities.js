sap.ui.define([
	"sap/ui/Device"
], function(Device) {
	"use strict";

	// class providing static utility methods.

	// the density class that should be used according to the environment (may be "")
	var sContentDensityClass = (function() {
		var sCozyClass = "sapUiSizeCozy",
			sCompactClass = "sapUiSizeCompact",
			oBody = jQuery(document.body);
		if (oBody.hasClass(sCozyClass) || oBody.hasClass(sCompactClass)) { // density class is already set by the FLP
			return "";
		} else {
			return Device.support.touch ? sCozyClass : sCompactClass;
		}
	}());

	return {
		// provide the density class that should be used according to the environment (may be "")
		getContentDensityClass: function() {
			return sContentDensityClass;
		},

		// defines a dependency from oControl to oView
		attachControlToView: function(oView, oControl) {
			jQuery.sap.syncStyleClass(sContentDensityClass, oView, oControl);
			oView.addDependent(oControl);
		},
		//oData Call Function
		oCallReadFunction: function(sFunction,oOwnerComponent,oGlobalModel) {
			//var oModel = oOwnerComponent.getModel();
			var oRfData;
			oOwnerComponent.read(sFunction, {
				success: function(oRetrievedResult) {
					//return odata result 
					oRfData = oRetrievedResult.results;
				    oGlobalModel.setProperty("/oDataResult", this._oResultData);
				}.bind(this),
				error: function(oError) {
					return null;
				}.bind(this)
			});
			return oRfData;
		}
	};
});