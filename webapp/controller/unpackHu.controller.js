sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, ResourceModel, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.unpackHu", {
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
			var callFragment = this.gssFragmentsFunction().loadFragment(this, "addHU");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "addHU", callFragment, this);
			this.getView().addDependent(this.fragmentLoaded);
			
			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.msgFragmentLoaded);
		},
		// ============================================
		// method to pass barocde value to input field
		// ============================================
		packHuScan:function(){
			utilities.barcodeReader(this, "HU","addHU");
			
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
        // ==================================================
		// method to get packed/unpacked HUs for the delivery
		// ================================================== 
		oDataCall: function() {
			var _huVal = this.getGlobalModel().getProperty("/currentHuVal"),//get HU for the delivery
				_shipInd = this.getGlobalModel().getProperty("/shipInd"),//get ship indicator
				_delVal = this.getGlobalModel().getProperty("/currentDelVal");//get Delivery no
			var whenOdataCall = this.callOdataService().getLoadInq(this, _huVal, _shipInd, _delVal);
				whenOdataCall.done(function() {
				utilities.bindMessagePop(this, "");
			}.bind(this));


		},
		onHandleAccept: function() {
			var tableRowSelectedItems = utilities.selectedItems(this, "unpackTable");
			if (this.getGlobalModel().getProperty("/shipInd") === "P") {
				var ind = "H";
			} else {
				ind = "I";
			}
			this.callOdataService().acceptItems(this, tableRowSelectedItems, "unpackTable", ind);

		},
		onAddItem: function() {
			this.fragmentLoaded.open();

		},
		huSave: function() {
			var hu = sap.ui.core.Fragment.byId(this.getView().getId() + "addHU", "HU").getValue();
			this.callOdataService().huSave(this, hu,"unpackTable","HUModel");
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);

		},
		huCancel: function() {
			sap.ui.core.Fragment.byId(this.getView().getId() + "addHU", "material").setValue("");
			sap.ui.core.Fragment.byId(this.getView().getId() + "addHU", "quantity").setValue("");
			sap.ui.core.Fragment.byId(this.getView().getId() + "addHU", "unit").setValue("");
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		}
	});

});