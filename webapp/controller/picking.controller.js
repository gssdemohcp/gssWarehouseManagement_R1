/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter"
], function(Controller, BaseController, formatter) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.picking", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		onInit: function() {
			this._router = this.getRouter();
			this._router.getRoute("picking").attachPatternMatched(this._routePatternMatched, this);
			this.oGlobalModel = this.getGlobalModel();
			this._oApplication = this.getApplication();
			this.inputDetails();
		},

		_routePatternMatched: function(oEvent) {
			var sId = oEvent.getParameter("arguments").ViewID,
				oView = this.getView(),
				sPath = "/WMProcessSet('" + sId + "')";
			var oModel = sap.ui.getCore().getModel();
			this.getView().setModel(oModel);
			oView.bindElement({
				path: sPath,
				events: {
					dataRequested: function() {
						oView.setBusy(true);
					},
					dataReceived: function() {
						oView.setBusy(false);
					}
				}
			});
		},

		inputDetails: function() {
			this.getView().byId("inputValue").setPlaceholder("Enter Transfer order");
			this.getView().byId("inputValue").setMaxLength(10);
			// this.getView().byId("inputValue").setValueState(sap.ui.core.ValueState.Error);
		},

		iGetInput: function(oEvent) {
			
			this._currentScreen = this.oGlobalModel.getProperty("/currentScreen");
			var inputVal = this.getView().byId("inputValue").getValue();
			if (!inputVal && this._currentScreen === "LM05") {
				return;
			} else {
				// var oModel = this.getView().byId("toTable").getModel("itemList");
				if (this._currentScreen) {
					this.aFilter = [];
					this.buildFilter(oEvent.getSource()._lastValue);
					this.inputValue = oEvent.getSource()._lastValue;
				}
			}
		},

		buildFilter: function(inputVal) {
			//Create filter string for get picking material - selvan
			var aFilterValues = [this._oApplication._ofilters.getFilters("Tanum", inputVal),this._oApplication._ofilters.getFilters("Queue", this.oGlobalModel.getProperty("/currentQueue")),this._oApplication._ofilters.getFilters("Lgnum",this.oGlobalModel.getProperty("/currentLgnum"))];
			this.getPickingMaterial(aFilterValues);
		},

		getPickingMaterial: function(aFilters){
			//Read picking material from backend
			this._oApplication._oGlobalWarehouseManage.LoadMaterial(this, this._oApplication, aFilters);
			//code end -selvan
			
		},
		pickingConfirm: function() {
			this._oApplication = this.getApplication();
			var selectedItems = this._oApplication._oGlobalWarehouseManage.confirmItems(this, this._oApplication);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.picking
		 */
		//	onExit: function() {
		//
		//	}

	});

});