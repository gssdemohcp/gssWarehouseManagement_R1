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
			this.fragmentMaterialLoaded = sap.ui.xmlfragment(viewId + "unpackMat", loadFragment, this);
			this.getView().addDependent(this.fragmentMaterialLoaded);

			var callFragment = this.gssFragmentsFunction().loadFragment(this, "hu");
			this.fragmentHuLoaded = sap.ui.xmlfragment(viewId + "unpackHu", callFragment, this);
			this.getView().addDependent(this.fragmentHuLoaded);

			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.msgFragmentLoaded);
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
		// ============================================
		// method to pass barocde value to input field
		// ============================================
		onHandleScanInput: function() {
			utilities.barcodeReader(this, "huInput", "");
			this.getHUInput();
		},
		/* =========================================================== */
		/*Handling message popover function*/
		/* =========================================================== */
		handleMessagePopoverPress: function(oEvent) {
			if (!this.msgFragmentLoaded) {
				this.setFragment();
			}
			this.msgFragmentLoaded.openBy(oEvent.getSource());
		},
		// ============================================
		// method called when byMat button is pressed
		//navigates to unpackmaterial page
		// ============================================
		onHandleMat: function(oEvent) {
			utilities.navigateChild("unpackMaterial", this);
		},
		// ============================================
		// method called when byHu button is pressed
		//navigates to unpackhu page
		// ============================================
		onHandleHU: function(oEvent) {
			utilities.navigateChild("unpackHu", this);
		}
	});

});