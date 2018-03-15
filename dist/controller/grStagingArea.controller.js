/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.grStagingArea", {
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

				this.setFragment();
		},
		seti18nModel: function() {
			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "gss.newWarehouseManage_R1.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
		},
		inputDetails: function() {
			var _screen = this.getCurrentScrn();
			var _screenModel = this.getScreenModel(_screen);
			var _text = this.getView().getModel("i18n").getResourceBundle().getText(_screenModel.placeHolderLabel);
			this.getGlobalModel().setProperty("/viewCid", this.getView().getId());
			this.getGlobalModel().setProperty("/title", this.geti18n("grBySa"));
			this.getView().byId("inputValue").setPlaceholder(_text);
			this.getView().byId("inputValue").setMaxLength(10);
		},
		onSingleSelectSA: function(oEvent) {
			var len = this.getView().byId("tableSA").getSelectedItems().length;
			if (len === 1) {
				var vbeln = this.getView().byId("tableSA").getSelectedItem().getBindingContext("itemList").getObject().Vbeln;
				this.getGlobalModel().setProperty("/currentDelNo", vbeln);
				var obj = this.getView().byId("tableSA").getSelectedItem().getBindingContext("itemList").getObject();
				this.checkInd(obj,"false");
			} else if (len > 1) {
				MessageToast.show(this.geti18n("toastOneDel"));
			} else if (len === 0) {
				MessageToast.show(this.geti18n("toastOneDel"));
			}
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				this.getView().byId("tableSA").setBusy(true);
				var whenOdataCall = this.callOdataService().getLoadInq(this, _inputValue, "", "");
				whenOdataCall.done(function() {
						utilities.checkVisible(this);
						this.checkInd(oResult.getData().aItems[0],"");
					}.bind(this)

				);
			}
		},
		onHandleScanInput: function(oEvent) {
			utilities.barcodeReader(this, "inputValue", "");
			this.iGetInput();
		},
		handleMessagePopoverPress: function(oEvent) {
				if (!this.msgFragmentLoaded) {
				this.setFragment();
			}
			this.msgFragmentLoaded.openBy(oEvent.getSource());

		},

		handleMore: function(oEvent) {
			this.createElements().handleMoreButtons(oEvent, this);
		},

		setFragment: function() {
			var viewId = this.getView().getId();
			this.getGlobalModel().setProperty("/viewId", viewId);
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "conf", loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
			
			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},
		onHandleItems: function(event) {

			utilities.navigateChild("grShipItems", this);
		},
		onHandleUnload: function(oEvent) {

			utilities.navigateChild("unloadDelivery", this);

		},
		onConfirm: function() {
			if (this.getGlobalModel().getProperty("/indiTO") === "") {
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
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "conf", "popup").setText(this.geti18n("genToPop"));
		},

		onHandleGTO: function() {
			this.fragmentLoaded.close();
			this.callOdataService().handleShipTO(this, "tableSA", "itemList", "T");

		},
		onHandleTOEx: function() {
			utilities.navigateChild("putaway", this);
		},

		onPostGR: function() {
			if (!this.fragmentLoaded) {
				this.setFragment();
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "conf", "popup").setText(this.geti18n("postGIPop"));

		},

		onHandlePost: function() {
			this.fragmentLoaded.close();
			this.callOdataService().handleShipTO(this, "tableSA", "itemList", "C");

		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.grStagingArea
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.grStagingArea
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.grStagingArea
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.grStagingArea
		 */
		//	onExit: function() {
		//
		//	}

	});

});