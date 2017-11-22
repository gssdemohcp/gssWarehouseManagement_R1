//By Sabari To get the Menu Filter for Dialog
sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"

], function(Object, Device, JSONModel) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.model.menuBinding", {
		constructor: function(oApplication) {
			this._iOpenCallsCount = 0;
			this._mRunningSwipes = {};
			this._bOneWaitingSuccess = false;
		},
		oMenu: function(oView, oSubMenu, oSelectedItem, createBC,oApplication) {
			this._rfMenu = [];
			oSubMenu.forEach(function(mItem) {
				if (mItem.Qmenu && !oSelectedItem) {
					//Main menu itself a transaction
					if (mItem.Qmenu && mItem.ProTyp === "2") {
						oView.byId("breadCrumbs").setCurrentLocationText(mItem.Text);
						oView.byId("inputValue").setPlaceholder("Enter" + " " + mItem.Text);
						oView._oDialog.close();
						return;
					} else {
						//Get the main menu
						this._qMenu = mItem.Qmenu;
						this.sUser = mItem.SyUname;
						this.Queue = mItem.Queue;
						this.Lgnum = mItem.Lgnum;
						oView.byId("syuser").setText(this.sUser);
						oView._oDialog.setTitle("Main Menu");
						//Create Breadcrumb link
						oApplication._ocreateBreadCrumbs.BreadCrumbs(mItem, oView);
					}
				}
				//Bind Main Menu
				else if (mItem.Mmenu === this._qMenu && mItem.ProTyp === "1" && !oSelectedItem) {
					this._rfMenu.push(mItem);
				}
				//Bind Sub Menus
				else if (oSelectedItem) {
					if (oSelectedItem.ProTyp === "1" && mItem.Mmenu === oSelectedItem.MenTrans) {
						this._rfMenu.push(mItem);
					}
				}
			}.bind(this));
			if (oSelectedItem && createBC === "X") {
				oView._oDialog.setTitle(" ");
				oView._oDialog.setTitle(oSelectedItem.Text);
				oApplication._ocreateBreadCrumbs.BreadCrumbs(oSelectedItem, oView); //Call function create breadcrumbs
			} else if (oSelectedItem && createBC === "") {
				oView._oDialog.setTitle(" ");
				oView._oDialog.setTitle(oSelectedItem.Text);
			}
			return this._rfMenu;
		},
		bindMenuModel: function(_rfMenu) {
			var rfModel = new JSONModel();
			var rfData = {
				rfMenu: _rfMenu
			};
			this._rfMenu = [];
			rfModel.setData(rfData);
			return rfModel;
		}
	});
});