sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.grdelivery", {
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
			handleMore: function(event) {
			var popover = new sap.m.Popover({ // To build popup&nbsp;
				showHeader: false,
				placement: sap.m.PlacementType.Top,
				content: [
					new sap.m.Button({ // To display Logout button inside popup
						text: "Pack", // Text to be dispalyed for the button
						type: sap.m.ButtonType.Transparent, // Button type
						press: function() { // press functionality for the button
								this.onHandlePack(); // Call to exit() method
							}.bind(this) // bind the popup to the view
					}),
					new sap.m.Button({ // To display Logout button inside popup
						text: "Unpack", // Text to be dispalyed for the button
						type: sap.m.ButtonType.Transparent, // Button type
						press: function() { // press functionality for the button
								this.onHandleUnpack(); // Call to exit() method
							}.bind(this) // bind the popup to the view
					})
					// new sap.m.Button({ // To display Logout button inside popup
					// 	text: "Split", // Text to be dispalyed for the button
					// 	type: sap.m.ButtonType.Transparent, // Button type
					// 	press: function() { // press functionality for the button
					// 			this.onHandleSplit(); // Call to exit() method
					// 		}.bind(this) // bind the popup to the view
					// })
				]
			}).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover'); // CSS style for the popup

			popover.openBy(event.getSource()); // To open popup event
		},

		setFragment: function() {
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "confirmation");
			this.fragmentLoaded = sap.ui.xmlfragment(loadFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			this.getGlobalModel().setProperty("/currentDelNo", _inputValue);
			this.inpVal = _inputValue;
			if (_inputValue) {
				this.getView().byId("GRDForm").setVisible(true);
				this.callOdataService().grKeyFields(this, _inputValue);
			}
		},
		onHandleUnload: function(oEvent) {
			utilities.navigateChild("unloadDelivery", this);

		},
		handleMore: function(oEvent) {
			this.createElements().handleMoreButtons(oEvent, this);
		},
		onHandleItems: function(event) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			this.getGlobalModel().setProperty("/currentDelNo", _inputValue);
			this.getGlobalModel().setProperty("/title", "GR by Delivery");
			utilities.navigateChild("grDelItems", this);
		},

		grDeliveryConfirm: function() {
			var selectedItems = this.gssCallFunction().confirmItems(this);
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.giStagingArea
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.giStagingArea
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.giStagingArea
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.giStagingArea
		 */
		//	onExit: function() {
		//
		//	}

	});

});
