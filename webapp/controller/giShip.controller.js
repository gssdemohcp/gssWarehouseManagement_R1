sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/model/utilities",
	"sap/m/MessageBox"
], function(Controller, BaseController, formatter, ResourceModel, utilities, MessageBox) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.giShip", {
		formatter: formatter,
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					this.titleSet();
					this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo"));
					this.getView().byId("inputValue").setEnabled(false);
					this.getView().byId("back").setVisible(true);
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
			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.msgFragmentLoaded);
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
		onHandleScanInput: function(oEvent) {
			utilities.barcodeReader(this, "inputValue", "");
			this.iGetInput();
		},
		oDataCall: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				var whenOdataCall = this.callOdataService().grKeyFields(this, _inputValue, "X");
				 whenOdataCall.done(function() {
				utilities.bindMessagePop(this, "");
			}.bind(this));
			}
		},
		onHandleSave: function(oEvent) {
			var startDate = this.getView().byId("DP1").getValue(),
				endDate = this.getView().byId("DP2").getValue(),
				startTime = this.getView().byId("TP3").getValue(),
				endTime = this.getView().byId("TP4").getValue(),
				tkNum = this.getView().byId("shipment").getText();

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYYMMdd"
			});
			var startDateFormatted = dateFormat.format(new Date(startDate)),
				endDateFormatted = dateFormat.format(new Date(endDate));

			this.FormatDate = new Date(startDate);
			this.StartYear = this.FormatDate.getFullYear();
			this.StartMonth = this.FormatDate.getMonth() + 1;
			this.StartDate = this.FormatDate.getDate();
			startDateFormatted = "".concat(this.StartYear, this.StartMonth, this.StartDate);

			this.FormatDate = new Date(endDate);
			this.StartYear = this.FormatDate.getFullYear();
			this.StartMonth = this.FormatDate.getMonth() + 1;
			this.StartDate = this.FormatDate.getDate();
			endDateFormatted = "".concat(this.StartYear, this.StartMonth, this.StartDate);

			if (startDate > endDate) {
				MessageBox.error(this.geti18n("dateError"));
			} else if (startDate < endDate) {
				this.callOdataService().giShipUpdate(this, startDateFormatted, endDateFormatted, startTime, endTime, tkNum);
			} else if (startDate === endDate && startTime > endTime) {
				MessageBox.error(this.geti18n("timeError"));
			} else if (startDate === endDate && startTime < endTime) {
				this.callOdataService().giShipUpdate(this, startDateFormatted, endDateFormatted, startTime, endTime, tkNum);
			}

		}

	});

});