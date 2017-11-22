//By Sabari To get the Menu Filter for Dialog
sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"

], function(Object, Device, JSONModel) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.model.createBreadCrumbs", {
		constructor: function(oApplication) {
			this._iOpenCallsCount = 0;
			this._mRunningSwipes = {};
			this._bOneWaitingSuccess = false;
		},
		BreadCrumbs: function(oSelectedItem, oView) {
			if (oSelectedItem.Qmenu) {
				oView.byId("breadCrumbs").addLink(
					new sap.m.Link({
						text: "Main Menu",
						target: oSelectedItem.Qmenu,
						press: function(oSelect) {
							this._openBreadcrumbLink(oSelect, oView); //Press function to open the bread crumb link
						}.bind(this)
					})
				);
			} else {
				oView.byId("breadCrumbs").addLink(
					new sap.m.Link({
						text: oSelectedItem.Text,
						target: oSelectedItem.MenTrans,
						press: function(oSelect) {
							this._openBreadcrumbLink(oSelect, oView); //Press function to open the bread crumb link
						}.bind(this)
					})
				);
			}
		},
		_openBreadcrumbLink: function(oSelect, oView) {
			this._pTarget = oSelect.getSource().getTarget(); //Get the selected link target
			this._pText = oSelect.getSource().getText(); //Get the selected link text
			this._pId = oSelect.getSource().getId(); //Get the selected link Id
			oView.byId("scanHUDel").setValue("");
			oView.byId("scanHUinDel").setValue("");
			//Check whether the table items are checked and show the confirmation dialog to exit the transaction.
			if (oView.byId("toTable").getSelectedItems().length !== 0) {
				if (!this._oConfirm) {
					this._oConfirm = sap.ui.xmlfragment("com.sap.wmwmApp.view.fragments.confirmation", this);
				}
				oView.addDependent(this._oConfirm);
				this._oConfirm.open();
			} else {
				this._modifyBreadCrumbLink(this._pTarget, this._pText, this._pId, oView); //Call the modifybreadcrumblink with the selected link
			}
		},
		// Description: Modify breadcrumb link based on target, text and id
		// ***********************************	
		_modifyBreadCrumbLink: function(sTarget, sText, sId, oView) {
			var aLink = oView.byId("breadCrumbs").getLinks();
			this._clearModel();
			oView.byId("inputValue").setValue("");
			aLink.forEach(function(mLink) {
				if (mLink.getId() > sId) {
					oView.byId("breadCrumbs").removeLink(mLink);
				}
				oView.byId("breadCrumbs").setCurrentLocationText("");
			}.bind(this));
			this._bindTarget(sTarget, sText, oView);
		},
		// Description: Open the selected breadcrumb link
		// ***********************************					
		_bindTarget: function(sTarget, sText, oView) {
			var createBC = "";
			var mData = {
				MenTrans: sTarget,
				ProTyp: "1",
				Text: sText
			};
			var oViewModel = new JSONModel();
			oView.byId("toTable").setModel(oViewModel, "itemList");
			oView.byId("toTable").getModel("itemList").setData();
			oView.setModel(oViewModel, "itemList");
			oView.getModel("itemList").setData();
			oView._menuBinding(mData, createBC, oView); //Call the filter method passing selected target and text data with create breadcrumb indicator
		}
	});
});