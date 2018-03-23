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
			
			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.msgFragmentLoaded);
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
		handleMessagePopoverPress: function(oEvent) {
			if (!this.msgFragmentLoaded) {
				this.setFragment();
			}
			this.msgFragmentLoaded.openBy(oEvent.getSource());

		},

		oDataCall: function() {
			var _huVal = this.getGlobalModel().getProperty("/currentHuVal");
			this._shipInd = this.getGlobalModel().getProperty("/shipInd");
			var whenOdataCall = this.callOdataService().getLoadInq(this, _huVal, this._shipInd, "");
				whenOdataCall.done(function() {
				utilities.bindMessagePop(this, "");
			}.bind(this));

		},
		onHandleAccept: function() {
			var tableRowSelectedItems = utilities.selectedItems(this, "unpackTable");
			this.callOdataService().acceptItems(this, tableRowSelectedItems, "unpackTable", this._shipInd);

		},
		onAddItem: function() {
			this.fragmentLoaded.open();

		},
		onMatSave: function() {
			var material = sap.ui.core.Fragment.byId(this.getView().getId() + "addMaterial", "material").getValue(),
				quantity = sap.ui.core.Fragment.byId(this.getView().getId() + "addMaterial", "quantity").getValue(),
				unit = sap.ui.core.Fragment.byId(this.getView().getId() + "addMaterial", "unit").getValue();
			 var whenOdataCall = this.callOdataService().materialSave(this, material, quantity, unit,"unpackTable","HUMatModel");
			 	whenOdataCall.done(function() {
				this.onMatCancel();
			}.bind(this));
		},
		onMatCancel: function() {
			sap.ui.core.Fragment.byId(this.getView().getId() + "addMaterial", "material").setValue("");
			sap.ui.core.Fragment.byId(this.getView().getId() + "addMaterial", "quantity").setValue("");
			sap.ui.core.Fragment.byId(this.getView().getId() + "addMaterial", "unit").setValue("");
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		}

		

	});

});