sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function(Object, Device, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.model.GlobalWarehouseManage", {
		// This class provides the service of sending approve/reject requests to the backend. Moreover, it deals with concurrency handling and success dialogs.
		// For this purpose, a singleton instance is created and attached to the application controller as public property oApprover.
		// This is used by the instances of SubControllerForApproval and by the S2-controller (for swipe approve).
		// Note that approvals that are caused by SubControllerForApproval make the app busy while approvals done by swiping do not.
		// This cla"ss has the following properties:
		// - _oList"Selector: helper class to interact with the master list (fixed)
		// - iOpenCallsCount: number of running approve/reject calls. This attribute is needed because swipe approvals may cause parallel calls.
		// - _mRunni"ngSwipes: maps the IDs of those POs for which a swipe approve is still in process onto true
		// - _bOneWaitingSuccess: true, if at least one approve/reject operation was successfully performed since the last refresh of the master list 
		constructor: function(oApplication) {
			this._iOpenCallsCount = 0;
			this._mRunningSwipes = {};
			this._bOneWaitingSuccess = false;
		},

		buildFilter: function(field, value) {
			var aFilter = new Filter(field, FilterOperator.EQ, value);
			return aFilter;
		},
	/*	setFilter: function(oView, sInputValue) {

			//Get Current View Name to get filter field name
			var sCurrentScrnName = oView.getCurrentScrn(),
				ScreenModel = oView.getScreenModel(sCurrentScrnName),
				//Bind user entered input value
				sInptValue = this.buildFilter(ScreenModel.field1, sInputValue),
				//Bind Queue id
				sQueue = this.buildFilter(ScreenModel.field2, oView.getGlobalModel().getProperty("/currentQueue")),
				//Bind Lgnum id
				sLgnum = this.buildFilter(ScreenModel.field3, oView.getGlobalModel().getProperty("/currentLgnum")),
				//Build filter array
				aFilterValues = [sInptValue, sQueue, sLgnum];

			return aFilterValues;
<<<<<<< Upstream, based on 64cb60c85070823ea18849c629905c32a1937847
		},*/
		
		setLoadInqFilter: function(oView, sInputValue) {
			//Get Current View Name to get filter field name
			var sCurrentScrnName = oView.getCurrentScrn(),

				ScreenModel = oView.getScreenModel(sCurrentScrnName),
				//Bind user entered input value
				sInptValue = this.buildFilter(ScreenModel.field1, sInputValue),
				//Bind Lgnum id
				sLgnum = this.buildFilter(ScreenModel.field3, oView.getGlobalModel().getProperty("/currentLgnum")),
				//Build filter array 
				aFilterValues = [sInptValue, sLgnum];

			return aFilterValues;
		},

		setNewBinUriParamter: function(oView, sInputValue) {
			//Get Current View Name to get filter field name

			var ScreenModel = oView.getScreenModel("LM999"),
				sLgnum = this.buildFilter(ScreenModel.field3, oView.getGlobalModel().getProperty("/currentLgnum")),
				sNltyp = this.buildFilter(ScreenModel.field2, oView.getGlobalModel().getProperty("/currentNltyp")),
				sNlpla = this.buildFilter(ScreenModel.field2, sInputValue),

				jUriParameter = [sLgnum, sNlpla, sNltyp];
			// jUriParameter = [{"Lgnum":oView.getGlobalModel().getProperty("/currentLgnum"),"Nltyp":oView.getGlobalModel().getProperty("/currentNltyp"),"Nlpla": sInputValue}];
			//jUriParameter = [{"Lgnum": "BI0","Nltyp":"AX2","Nlpla":"01-01-02"}];
			return jUriParameter;

		},

		setLoadFilter: function(oView) {
			var ScreenModel = oView.getViewProperties();
			var viewProperties = oView.getViewProperties(),
				parameters = viewProperties.parameters,
				index = 0,
				aFilterValues = [];
			var inputValues = [];
			if (ScreenModel.filters.length > 0 && ScreenModel.filters !== null) {
				for (index in parameters) {
					inputValues.push(parameters[index]);
					index++;
				}
				for (var i = 0; i < ScreenModel.filters.length; i++) {
					aFilterValues.push(this.buildFilter(ScreenModel.filters[i], inputValues[i]));
				}
			}
			return aFilterValues;
		}
	});
});