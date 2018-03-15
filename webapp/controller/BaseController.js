sap.ui.define([
	"sap/ui/core/mvc/Controller",

	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/routing/History",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, ResourceModel, History, utilities) {

	"use strict";

	return Controller.extend("gss.newWarehouseManage_R1.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		// onInit: function(){
		// 	this.setModel(models.toList(), "rfModel");		
		// },						 
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Convenience method to get the global model containing the global state of the app.
		 * @returns {object} the global Propery model
		 */
		getGlobalModel: function() {
			return this.getOwnerComponent().getModel("globalProperties");
		},
		/**
		 * Convenience method to get the fragment model containing the fragments used in the app.
		 * @returns {object} the fragment model
		 */

		getFragmentControllerModel: function() {
			return this.getOwnerComponent().getModel("fragmentControllerProperties");
		},
		/**
		 * Convenience method to get the screen model containing the necessary fields and filters for the view.
		 * @returns {object} the screen Propery 
		 */

		getScreenModel: function(currentScreen) {
			var menuModel = this.getMenuTransactionModel(),
				//filterVal = menuModel.getProperty("/" + currentScreen).split("@").pop();
				ScreenModel = menuModel.getProperty("/" + currentScreen);
			return ScreenModel;
		},
		/**
		 * Convenience method to get the WM configuration model containing the global state of the app.
		 * @returns {object} the configuration Propery model
		 */
		getMenuTransactionModel: function() {
			return this.getOwnerComponent().getModel("MenuTransactionProperties");

		},
		/**
		 * Convenience method to get the process model containing .
		 * @returns {object} the process Propery
		 */
		getProcessModel: function(uiIndicator) {
			var processModel = this.getProsessControlModel(),
				controlModel = processModel.getProperty("/" + uiIndicator);
			return controlModel;
		},
		/**
		 * Convenience method to get the WM Process Configuration model containing the global state of the app.
		 * @returns {object} the Process configuration Propery model
		 */
		getProsessControlModel: function() {
			return this.getOwnerComponent().getModel("ProcessControlProperties");

		},
		/**
		 * Convenience method for getting Tcode
		 * @returns {object} Tcode for the view
		 */
		getCurrentScrn: function() {
			return this.getGlobalModel().getProperty("/currentScreen");
		},
		/**
		 * Convenience method for getting data binded to the view
		 * * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @returns {object} data from the model
		 */
		getModelData: function(oModel) {
			return this.getView().getModel(oModel).getData();
		},
		/**
		 * Convenience method
		 * @returns {object} the application controller
		 */

		getApplication: function() {
			return this.getGlobalModel().getProperty("/application");
		},
		/**
		 * Convenience method
		 * @returns {object} the CreateBreadCrumbs controller
		 */
		gssCallBreadcrumbs: function() {
			return this.getGlobalModel().getProperty("/breadcrumbs");
		},
		/**
		 * Convenience method
		 * @returns {object} the fragments controller
		 */
		gssFragmentsFunction: function() {
			return this.getGlobalModel().getProperty("/fragments");
		},
		/**
		 * Convenience method
		 * @returns {object} the difference controller
		 */
		gssDifferenceFunction: function() {
			return this.getGlobalModel().getProperty("/difference");
		},
		/**
		 * Convenience method
		 * @returns {object} the menubinding controller
		 */
		gssCallMenu: function() {
			return this.getGlobalModel().getProperty("/menu");
		},
		/**
		 * Convenience method
		 * @returns {object} the Component 
		 */
		getComponent: function() {
			return this.getOwnerComponent();
		},
		/**
		 * Convenience method to set i18n model to the view
		 */

		seti18nModel: function(oView) {
			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "gss.newWarehouseManage_R1.i18n.i18n"
			});
			oView.setModel(i18nModel, "i18n");
		},
		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},
		/**
		 * Event handler when back button has been clicked
		 
		 * @public
		 */
		onNavBack: function() {
			this.destroyModel(); // destroys the model of the view
			this.getGlobalModel().setProperty("/currentScreen", this.getGlobalModel().getProperty("/parentScreen")); //sets parentscreen as currentscreen
			this.getGlobalModel().setProperty("/parentScreen", this.getParentScreen()); //gets parentscreen and sets it to globalmodel
			this.getApplication().navBack(History, ""); //standard back function in application controller

		},
		/**
		 * Convenience method to destroy model binded to the view
		 */
		destroyModel: function() {
			this.getView().getModel(this.getModelName()).setData("");

		},
		/**
		 * Convenience method to check indicators for the data
		 * @param {object} data - oData instance
		 * @param {boolean} flag  
		 */
		checkInd: function(data, flag) {
			if (flag) {
				this.getGlobalModel().setProperty("/indiTO", data.ToInd);
				this.gssFragmentsFunction().uiIndCheck(this, data.ToInd, data.ToConfirmInd, data.PostInd, flag); //uiIndCheck:to perform ui operations with data
				utilities.bindMessagePop(this, data); //bindMessagePop:set message to messagepopover
			} else {
				utilities.bindMessagePop(this, data); //bindMessagePop:set message to messagepopover
			}

		},
		/**
		 * Convenience method to get controlId of the view
		 */
		getControlId: function() {
			var viewProperties = this.getViewProperties();
			return viewProperties.uiControl;
		},
		/**
		 * Convenience method to set retrieved data to the global property
		 * @param {object} data - oData instance
		 */
		setModelData: function(data) {
			var viewProperties = this.getViewProperties();
			viewProperties.modelData = data;
		},
		/**
		 * Convenience method to set retrieved data to the view from global property
		 * @public
		 */
		getBackModelData: function() {
			var viewProperties = this.getViewProperties(),
				jsonModel = new sap.ui.model.json.JSONModel(viewProperties.modelData);
			this.setModel(jsonModel, this.getModelName());
		},

		loadCheck: function() {
			var viewProperties = this.getViewProperties();
			var data = viewProperties.modelData;
			if (this.getGlobalModel().getProperty("/load") === "X") {
                 data.aItems[0].LoadStat = "X";                      
			} else if (this.getGlobalModel().getProperty("/load") === "Y"){
				data.aItems[0].LoadStat = "";
			}
			this.setModelData(data);
			this.getGlobalModel().setProperty("/load","");
		},
		titleSet: function() {
			var title = this.getGlobalModel().getProperty("/title");
			this.byId("title").setTitle(title);

		},

		setPageTitle: function() {
			var titleId = this.getPageTitle(),
				title = this.geti18n(titleId);
			this.byId("title").setProperty("title", title);
			this.byId("title").setTitle(title);

		},
		setUpdateToast: function(toast) {
			var properties = this.getViewProperties();
			properties.toastMsg = toast;
		},
		geti18n: function(key) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			return oResourceBundle.getText(key);

		},

		getGlobalProperty: function(property) {
			return this.getGlobalModel().getProperty("/" + property + "");

		},
		setGlobalProperty: function(property, sValue) {
			return this.getGlobalModel().setProperty("/" + property + "", sValue);

		},
		//**********************************************************************************************
		//THESE METHODS ARE USED IN ODATASERVICE LIBRARY
		//**********************************************************************************************
		callOdataService: function() {
			return this.getGlobalModel().getProperty("/gsswm");
		},
		createElements: function() {
			return this.getGlobalModel().getProperty("/gsscb");

		},
		getViewProperties: function() {
			var sCurrentScrnName = this.getCurrentScrn();
			return this.getScreenModel(sCurrentScrnName);
		},

		getEntitySet: function() {
			var viewProperties = this.getViewProperties();
			return viewProperties.entitySet;
		},

		getModelName: function() {
			var viewProperties = this.getViewProperties();
			return viewProperties.modelName;
		},

		getFilterFields: function() {
			var viewProperties = this.getViewProperties();
			return viewProperties.filters;
		},

		getKeyFields: function() {
			var properties = this.getViewProperties();
			return properties.keyFields;
		},
		getChildScreens: function() {
			var properties = this.getViewProperties();
			return properties.childScreens;
		},
		getParentScreen: function() {
			var properties = this.getViewProperties();
			return properties.parentScreen;
		},
		getPageTitle: function() {
			var properties = this.getViewProperties();
			return properties.pageTitle;
		},
		getUpdateToast: function() {
			var properties = this.getViewProperties();
			return properties.toastMsg;
		}

		//*************************************************************************************************
		//END
		//***************************************************************************************************
	});

});