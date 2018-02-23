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
					if ((this.getView().byId("inputValue").getValue())) {
						this.iGetInput();
					}
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
			var viewId = this.getView().getId();
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId,loadFragment, this);
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
				this.gssFragmentsFunction().indCheck(this, this.indiTO, this.indiTOConf, this.indiPost,"S");
			} else if (len > 1) {
				MessageToast.show(this.geti18n("toastOneDel"));
				this.gssFragmentsFunction().fragmentFalse(this,"S" );
			} else if (len === 0) {
				MessageToast.show(this.geti18n("toastOneDel"));
				this.gssFragmentsFunction().fragmentFalse(this,"S");
			}
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				var whenOdataCall = this.callOdataService().getLoadInq(this, _inputValue, "", "");
				whenOdataCall.done(function() {
						this.getView().byId("tableGIS").setVisible(true);
						this.getGlobalModel().setProperty("/title", this.geti18n("giByShip"));
					}.bind(this)

				);

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
			} else {
				this.onHandlePost();
			}
		},

		onConfirmCancel: function() {
			this.onCancel();
		},
		onCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},

		onGenerateTO: function() {
			if (!this.fragmentLoaded) {
				this.setFragment();
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();
			this.byId("popup").setText(this.geti18n("genToPop"));
		},

		onHandleGTO: function() {
			this.fragmentLoaded.close();
			var whenOdataCall = this.callOdataService().handleShipTO(this, "tableGIS", "delList", "T");
			whenOdataCall.done(function() {
				this.getView().byId("GItoInd").setText(this.geti18n("available"));
			}.bind(this));

		},
		onHandleTOEx: function() {
			utilities.navigateChild("picking", this);
		},

		onPostGI: function() {
			if (!this.fragmentLoaded) {
				this.setFragment();
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();
			this.byId("popup").setText(this.geti18n("postGIPop"));

		},

		onHandlePost: function() {
			this.fragmentLoaded.close();
			this.callOdataService().handleShipTO(this, "tableGIS", "delList", "C");

		},

		giShipmentConfirm: function() {
			var selectedItems = this.gssCallFunction().confirmItems(this);
		},
		onExit: function() {
			if (this.fragmentLoaded) {
				this.fragmentLoaded.destroy(true);
			}

		}

	});

});