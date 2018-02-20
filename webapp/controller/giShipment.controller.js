/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"gss/newWarehouseManage_R1/model/utilities",
	"sap/ui/model/resource/ResourceModel"

], function(Controller, BaseController, formatter, JSONModel, MessageBox, MessageToast, utilities, ResourceModel) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.giShipment", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.putAway
		 */
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.inputDetails();
					this.getBackModelData();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel();
			this.inputDetails();

			/*this.setFragment();*/
		},
		seti18nModel: function() {
			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "gss.newWarehouseManage_R1.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
		},
		setFragment: function() {
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},
		inputDetails: function() {
			var Screen = this.getCurrentScrn();
			var ScreenModel = this.getScreenModel(Screen);
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(ScreenModel.placeHolderLabel);
			this.getView().byId("inputValue").setPlaceholder(Text);
			this.getView().byId("inputValue").setMaxLength(10);
		},

		onSingleSelectGI: function(oEvent) {
			var len = this.getView().byId("tableGIS").getSelectedItems().length;
			this.getView().byId("ship").setVisible(true);
			if (len === 1) {
				var vbeln = this.getView().byId("tableGIS").getSelectedItem().getBindingContext("delList").getObject().Vbeln;
				this.getGlobalModel().setProperty("/currentDelNo", vbeln);
				var obj = this.getView().byId("tableGIS").getSelectedItem().getBindingContext("delList").getObject();
				this.indiTO = obj.ToInd;
				this.indiTOConf = obj.ToConfirmInd;
				this.indiPost = obj.PostInd;
				this.gssFragmentsFunction().indCheck(this, this.indiTO, this.indiTOConf, this.indiPost);
			} else if (len > 1) {
				MessageToast.show("Please select one delivery");
				this.gssFragmentsFunction().fragmentFalse();
			} else if (len === 0) {
				MessageToast.show("Please select a delivery");
				this.gssFragmentsFunction().fragmentFalse();
			}
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				this.getView().byId("tableGIS").setVisible(true);
				this.callOdataService().getLoadInq(this, _inputValue, "", "");
				
			}
		},
		onHandleScanInput: function(oEvent) {
			this.callOdataService().barcodeReader(this, "inputValue");
			this.iGetInput();
		},
		onHandleUnload: function(oEvent) {
			utilities.navigateChild("loadDelivery", this);

		},
		onHandleItems: function(event) {
			utilities.navigateChild("grShipItems", this);
		},
		handleMore: function(oEvent) {
			this.createElements().handleMoreButtons(oEvent, this);
		},
		onHandleShip: function(event) {
			utilities.navigateChild("giShip", this);
		},
		onConfirm: function() {
			if (this.indiTO === "") {
				this.onHandleGTO();
			}else{
				this.onHandlePost();
			}
		},

		onConfirmCancel: function() {
			this.onCancel();
		},

		onGenerateTO: function() {
			if (!this.fragmentLoaded) {
				this.fragmentLoaded = this.setFragment();
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();
			sap.ui.getCore().byId("popup").setText("Are you sure you want to generate Transfer Order?");
		},

		onHandleGTO: function() {
			this.fragmentLoaded.close();
			this.callOdataService().handleShipTO(this, "tableGIS","delList","T");
		
		},

		onPostGR: function() {
			if (!this.fragmentLoaded) {
				this.fragmentLoaded = this.setFragment();
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();
			sap.ui.getCore().byId("popup").setText("Are you sure you want to post Goods Issue?");

		},

		onHandlePost: function() {
			this.fragmentLoaded.close();
			this.callOdataService().handleShipTO(this, "tableGIS","delList","C");
		
		},

		giShipmentConfirm: function() {
			var selectedItems = this.gssCallFunction().confirmItems(this);
		}

	});

});