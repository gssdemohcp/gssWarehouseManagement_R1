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
						this.oDataCall();

					}.bind(this)
				});

				this._router = this.getRouter();
				this.seti18nModel();

				/*this.setFragment();*/
			},
			seti18nModel: function() {
				// set i18n model on view
				var i18nModel = new ResourceModel({
					bundleName: "gss.newWarehouseManage_R1.i18n.i18n"
				});
				this.getView().setModel(i18nModel, "i18n");
			},
			oDataCall: function(oEvent) {
				var _inputValue = this.getView().byId("inputValue").getValue();
				if (_inputValue) {
					this.callOdataService().grKeyFields(this, _inputValue, "X");
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
		

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.giShip
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.giShip
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.giShip
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.giShip
		 */
		//	onExit: function() {
		//
		//	}

	});

});