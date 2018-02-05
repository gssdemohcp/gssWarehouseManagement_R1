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

		// ********** Srini code to get seleced line item from table control begins **************
		getObjects: function(oView) {
			var controlId = oView.getGlobalModel().getProperty("/controlId");
			var model = oView.byId(controlId).getSelectedItem().getBindingContext("materialList");
			return model;
		},

		getItems: function(oView, oControlId, oModel) {

			return oView.byId(oControlId).getSelectedItem().getBindingContext(oModel);
		},
		// ********** Srini code to get seleced line item from table control ends **************
		navigateChild: function(target, oView) {
			var childScreens = oView.getChildScreens(),
				childScreen = childScreens[target],
				currentScreen = oView.getGlobalModel().getProperty("/currentScreen");
			oView.getGlobalModel().setProperty("/parentScreen", currentScreen);

			oView.getGlobalModel().setProperty("/currentScreen", childScreen);
			oView.getRouter().navTo("" + target + "");

		},
		setParentScreen: function(screen, oView) {
			var viewProperties = oView.getViewProperties();
			viewProperties.parentScreen = screen;

		}

	};
});