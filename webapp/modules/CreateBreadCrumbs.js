//By Sabari To get the Menu Filter for Dialog
sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"gss/newWarehouseManage_R1/controller/BaseController"
], function(Object, Device, JSONModel, History, BaseController) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.model.createBreadCrumbs", {
		constructor: function(oApplication) {
			this._iOpenCallsCount = 0;
			this._mRunningSwipes = {};
			this._bOneWaitingSuccess = false;
		},
		BreadCrumbs: function(oSelectedItem, oView) {
			this.MainView = oView;
			oView.getGlobalModel().setProperty("/MainView", this.MainView);
			if (oSelectedItem.Qmenu) {
				oView.byId("breadCrumbs").addLink(
					new sap.m.Link({
						text: oView.geti18n("mainMenu"),
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
			oView.setModelData("");
			this.SecondView.byId("inputValue").setValue("");
			if (this._pText === "Goods Receipt" || this._pText === "Goods Issue") {
				this.SecondView.byId(oView.getControlId()).setVisible(false);
			}
			this._modifyBreadCrumbLink(this._pTarget, this._pText, this._pId, oView); //Call the modifybreadcrumblink with the selected link
		},
		// Description: Modify breadcrumb link based on target, text and id
		// ***********************************	
		_modifyBreadCrumbLink: function(sTarget, sText, sId, oView) {
			if (History.length !== 0) {
				this.MainView = oView.getGlobalModel().getProperty("/MainView");
				this.SecondView = oView.getGlobalModel().getProperty("/SecondView");
				var aLink = this.SecondView.byId("breadCrumbs").getLinks();
				aLink.forEach(function(mLink) {
					this.MainView.byId("breadCrumbs").addLink(mLink);
				}.bind(this));
				var aLink = this.MainView.byId("breadCrumbs").getLinks();
				aLink.forEach(function(mLink) {
					if (mLink.getId() > sId) {
						this.MainView.byId("breadCrumbs").removeLink(mLink);
					}
					oView.byId("breadCrumbs").setCurrentLocationText("");
				}.bind(this));
				this._bindTarget(sTarget, sText, oView);
			} else {
				var aLink = oView.byId("breadCrumbs").getLinks();
				aLink.forEach(function(mLink) {
					if (mLink.getId() > sId) {
						oView.byId("breadCrumbs").removeLink(mLink);
					}
					oView.byId("breadCrumbs").setCurrentLocationText("");
				}.bind(this));
				this._bindTarget(sTarget, sText, oView);
			}
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
			if (History.length !== 0) {
				oView.getGlobalModel().setProperty("/MenuData", mData);
				oView.getGlobalModel().setProperty("/currentScreen", "LM999");
				oView.getApplication().navBack(History, "");
			} else {
				oView._menuBinding(mData, createBC); //Call the filter method passing selected target and text data with create breadcrumb indicator
			}
		},
		getMainBreadCrumb: function(oView) {
			this.MainView = oView.getGlobalModel().getProperty("/MainView");
			var aLink = this.MainView.byId("breadCrumbs").getLinks();
			this.SecondView = oView;
			oView.getGlobalModel().setProperty("/SecondView", this.SecondView);
			aLink.forEach(function(mLink) {
				this.SecondView.byId("breadCrumbs").addLink(mLink);
			}.bind(this));
		}
	});
});