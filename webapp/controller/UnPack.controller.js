sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.UnPack", {
		formatter: formatter,
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.inputDetails();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					utilities.setParentScreen(this.getGlobalModel().getProperty("/parentScreen"), this);
					/*		this.getBackModelData();*/
					this.getHUInput();

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
		inputDetails: function() {
			var Screen = this.getCurrentScrn();
			var ScreenModel = this.getScreenModel(Screen);
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(ScreenModel.placeHolderLabel);
			this.getView().byId("huInput").setPlaceholder(Text);
			this.getView().byId("huInput").setMaxLength(10);
			var pack = this.getGlobalModel().getProperty("/pack");
			this.getView().byId("unpackForm").setTitle(pack);

		},
		setFragment: function() {
			//Fragement Code for New Bin
			var viewId = this.getView().getId();
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "unpackMaterial");
			this.fragmentMaterialLoaded = sap.ui.xmlfragment(viewId,loadFragment, this);
			this.getView().addDependent(this.fragmentMaterialLoaded);
			/*	this.fragmentMaterialLoaded.open();*/

			var callFragment = this.gssFragmentsFunction().loadFragment(this, "hu");
			this.fragmentHuLoaded = sap.ui.xmlfragment(viewId,callFragment, this);
			// this.getView().addDependent(this.fragmentHuLoaded);
		},

		getHUInput: function(oEvent) {
			var _inputValue = this.getView().byId("huInput").getValue(),
				_delVal = this.getGlobalModel().getProperty("/currentDelNo");
			this.getGlobalModel().setProperty("/currentHuVal", _inputValue);
			var whenOdataCall = this.callOdataService().grPackKeyFields(this, _delVal, _inputValue);
			whenOdataCall.done(function() {
				var data = this.getModelData("packItems").aItems[0];
				if (data.MatInd === "X") {
					this.getView().byId("byMat").setEnabled(false);
					this.getView().byId("byHU").setEnabled(true);
				} else if (data.MatInd === "Y") {
					this.getView().byId("byMat").setEnabled(true);
					this.getView().byId("byHU").setEnabled(true);

				} else {
					this.getView().byId("byMat").setEnabled(true);
					this.getView().byId("byHU").setEnabled(false);
				}

			}.bind(this));

		},
		onHandleScanInput: function() {
			this.callOdataService().barcodeReader(this, "huInput");
			this.getHUInput();
		},
		onHandleMat: function(oEvent) {

			utilities.navigateChild("unpackMaterial", this);

		},
		onHandleHU: function(oEvent) {
				utilities.navigateChild("unpackHu", this);
			}
			/*	callPack: function() {
					var _delVal = this.getGlobalModel().getProperty("/currentDelNo");
					var _huVal = this.getGlobalModel().getProperty("/currentHuVal");
					this.callOdataService().grPackKeyFields(this, _delVal, _huVal);

				}*/

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.UnPack
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.UnPack
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.UnPack
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.UnPack
		 */
		//	onExit: function() {
		//
		//	}

	});

});