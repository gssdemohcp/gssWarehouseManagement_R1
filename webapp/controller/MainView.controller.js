sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(Controller, BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.MainView", {

		onInit: function() {
			this.component = this.getComponent();
			this.model = this.component.getModel();
			this.model.metadataLoaded().then(this._menuLoadFunction.bind(this));
		},

		_menuLoadFunction: function() {
			//Fetch Menu Configuration Data
			this.afilters = [];
			this._oApplication = this.getApplication();
			var oWhenCallReadIsDone = this._oApplication._oGlobalWarehouseManage.menuConfigurationLoad(this, this._oApplication, this.afilters);
			//Load Menu Fragment in view
			oWhenCallReadIsDone.done(function() {
				this._menuBinding("", "");
			}.bind(this));
		},

		_menuBinding: function(oSelectedItem, createBC) {
			this._rfMenu = [];
			if (!this._oDialog) {
				var MenuModel = this.getFragmentControllerModel();
				var Menu = MenuModel.getProperty("/mainMenu");
				this._oDialog = sap.ui.xmlfragment(Menu, this);
			}
			var oSubMenu = sap.ui.getCore().getModel("mainJsonModel").getData().rfMenu;
			//To Get the menuBindings
			this._rfMenu = this._oApplication._omenuBinding.oMenu(this, oSubMenu, oSelectedItem, createBC, this._oApplication);
			this.bindFilteredMenu(this._rfMenu);
		},

		bindFilteredMenu: function(_rfMenu) {
			var rfModel = this._oApplication._omenuBinding.bindMenuModel(_rfMenu);
			this._oDialog.setModel(rfModel, "rfMenuModel");
			var oView = this.getView();
			oView.addDependent(this._oDialog);
			this._oDialog.setEndButton(new sap.m.Button({
				text: "Cancel",
				press: function() {
					this._prevMenu();
				}.bind(this)
			}));
			this._oDialog.open();
			//*********************************Code by Sabari To Hide the Value on Main Menu Popup Open******************************//
			this.getView().byId("rfScreen").setText("WareHouse Management"); //To Set the Title of the Page//
			this.getView().byId("toolbarheader").setVisible(false); //To hide the Header Bar//
			this.getView().byId("inputValue").setVisible(false); //To Hide the Input Field //
			this.getView().byId("footerbar").setVisible(false); //To Hide the Footer Bar //
			this.getView().byId("message-popup").setVisible(false); //To Hide the Popup message //
			//	this._fragmentFalse();
		},

		// Description: Handle cancel button in Menu dialog
		// ***********************************				
		_prevMenu: function() {
			var aLink = sap.ui.getCore().byId("breadCrumbs").getLinks(); //Get the number of links
			var plinkIndex = aLink.length - 2; //length -2 gives the index of the previous breadcrumb index
			if (plinkIndex === -1) {
				this.Exit(); //Call the exit function
				return;
			}
			var pMmenu = aLink[plinkIndex].getTarget(); //Get the target of the previous link using index
			var pText = aLink[plinkIndex].getText(); //Get the text of the previous link using index
			if (pText === "Main menu") { //If the text is Main menu, insert the link
				this.getView().byId("breadCrumbs").insertLink(aLink[plinkIndex], plinkIndex);
			}
			//Remove the link from the breadcrumb, once the user click on the cancel button in the menu 
			var removeLinkId = aLink.length - 1; //Get the last breadcrumb link
			this.getView().byId("breadCrumbs").removeLink(removeLinkId); //Remove the link
			var mData = {
				MenTrans: pMmenu,
				ProTyp: "1",
				Text: pText
			};
			var createBC = "";
			//Filter the dialog menu with selected item and don't create the breadcrumbs 
			this._menuBinding(mData, createBC);
		},
		onHandleMenu: function(oEvent) {
			var oSelectedData = oEvent.getSource().getBindingContext("rfMenuModel").getObject();

			if (oSelectedData.ProTyp === "1") {
				this._oDialog.close();
				var createBC = "X";
				this._menuBinding(oSelectedData, createBC); //Call function menu binding
			}else if (oSelectedData.ProTyp === "2"){
				this.getRouter().navTo(this.getMenuTransactionModel().getProperty("/"+oSelectedData.MenTrans));
				this.getGlobalModel().setProperty("/currentScreen", oSelectedData.MenTrans);
			 	this._oDialog.close();
			}
			//COMMENT BY SELVAN FOR ABOVE NEW CODE FOR THIS
			// // ************** Srini code to display Putaway by TO begins **********************
						//var oGlobalModel = this.getView().getModel("globalProperties");
		//	var loadView = this.getRouter();
			
			// else if (oSelectedData.ProTyp === "2" && oSelectedData.MenTrans === "LM03") {
			// 	this._oDialog.close();
				
			// 	oGlobalModel.setProperty("/currentScreen", "LM03");
			// 	this._oDialog.close();
			// 	//loadView = this.getRouter();
			// 	loadView.navTo("putaway");
			// }else if (oSelectedData.ProTyp === "2" && oSelectedData.MenTrans === "LM05") {
			// 	this._oDialog.close();
			// 	oGlobalModel.setProperty("/currentScreen", "LM05");
			// 	this._oDialog.close();
			// 	//loadView = this.getRouter();
			// 	loadView.navTo("picking");
			// }
			// // ************** Srini code to display Putaway by TO begins **********************
		}
	});
});