sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.unpackMaterial", {

		formatter: formatter,
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					this.oDataCall();
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel();

			this.setFragment();
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
			this.getGlobalModel().setProperty("/viewId", viewId);
			var callFragment = this.gssFragmentsFunction().loadFragment(this, "addMaterial");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "addMaterial", callFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
		},
		packMatScan: function() {
			utilities.barcodeReader(this, "material","addMaterial");
		},
		packQuaScan: function() {
			utilities.barcodeReader(this, "quantity","addMaterial");
		},
		packUnitScan: function() {
			utilities.barcodeReader(this, "quantity","addMaterial");
		},

		oDataCall: function() {
			var _huVal = this.getGlobalModel().getProperty("/currentHuVal");
			this._shipInd = this.getGlobalModel().getProperty("/shipInd");
			this.callOdataService().getLoadInq(this, _huVal, this._shipInd, "");

		},
		onHandleAccept: function() {
			var tableRowSelectedItems = utilities.selectedItems(this, "unpackTable");
			this.callOdataService().acceptItems(this, tableRowSelectedItems, "unpackTable", this._shipInd);

		},
		onAddItem: function() {
			this.fragmentLoaded.open();

		},
		onMatSave: function() {
			var material = sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "addMaterial", "material").getValue(),
				quantity = sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "addMaterial", "quantity").getValue(),
				unit = sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "addMaterial", "unit").getValue();
			 this.callOdataService().materialSave(this, material, quantity, unit,"unpackTable","HUMatModel");
		
			this.fragmentLoaded.close();

		},
		onMatCancel: function() {
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "addMaterial", "material").setValue("");
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "addMaterial", "quantity").setValue("");
			sap.ui.core.Fragment.byId(this.getGlobalModel().getProperty("/viewId") + "addMaterial", "unit").setValue("");
			this.fragmentLoaded.close();
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.unpackMaterial
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.unpackMaterial
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.unpackMaterial
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.unpackMaterial
		 */
		//	onExit: function() {
		//
		//	}

	});

});