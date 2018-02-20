sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.grHu", {

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
		inputDetails: function() {
			var _screen = this.getCurrentScrn();
			var _screenModel = this.getScreenModel(_screen);
			var _text = this.getView().getModel("i18n").getResourceBundle().getText(_screenModel.placeHolderLabel);
			this.getView().byId("inputValue").setPlaceholder(_text);
			this.getView().byId("inputValue").setMaxLength(10);
		},

		setFragment: function() {
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.byId("inputValue").getValue();
			var whenOdataCall;
			if (_inputValue) {
				this.getGlobalModel().setProperty("/currentHuVal", _inputValue);
				this.getGlobalModel().setProperty("/title", "GR By Handling Unit");
				whenOdataCall = this.callOdataService().grKeyFields(this, _inputValue);
				whenOdataCall.done(function() {
						this.getView().byId("GRDForm").setVisible(true);
						var _delVal = this.byId("grDelField").getText();
						this.getGlobalModel().setProperty("/currentDelNo", _delVal);
						this.checkInd();
					}.bind(this)

				);

			}
		},
		checkInd: function() {
			var data = this.getModelData("itemList").aItems[0];
			this.indiTO = data.ToInd;
			this.indiTOConf = data.ToConfirmInd;
			this.indiPost = data.PostInd;
			this.gssFragmentsFunction().indCheck(this, this.indiTO, this.indiTOConf, this.indiPost);
		},
		onHandleScanInput: function(oEvent) {
			this.callOdataService().barcodeReader(this, "inputValue");
			this.iGetInput();
		},

		handleMore: function(oEvent) {
			this.createElements().handleMoreButtons(oEvent, this);
		},

		onHandleItems: function(event) {
			utilities.navigateChild("grDelItems", this);
		},
		onHandleUnload: function(oEvent) {
			utilities.navigateChild("unloadDelivery", this);

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
			var whenOdataCall = this.callOdataService().handleDelTO(this, "GRDForm", "itemList", "T");
			whenOdataCall.done(function() {
				this.getView().byId("toInd").setText("Available");
			}.bind(this));

		},

		onPostGR: function() {
			if (!this.fragmentLoaded) {
				this.fragmentLoaded = this.setFragment();
			}
			this.getView().addDependent(this.fragmentLoaded);
			this.fragmentLoaded.open();
			sap.ui.getCore().byId("popup").setText("Are you sure you want to post Goods Receipt?");

		},

		onHandlePost: function() {
			this.fragmentLoaded.close();
			this.callOdataService().handleDelTO(this, "GRDForm", "itemList", "C");

		},
		grHuConfirm: function() {
			var selectedItems = this.gssCallFunction().confirmItems(this);
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.grHu
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.grHu
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.grHu
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.grHu
		 */
		//	onExit: function() {
		//
		//	}

	});

});