sap.ui.define([
	"sap/ui/core/mvc/Controller",

	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/routing/History"
], function(Controller, ResourceModel, History) {

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

		getFragmentControllerModel: function() {
			return this.getOwnerComponent().getModel("fragmentControllerProperties");
		},

		getScreenModel: function(currentScreen) {
			var menuModel = this.getMenuTransactionModel(),
				//filterVal = menuModel.getProperty("/" + currentScreen).split("@").pop();
				ScreenModel = menuModel.getProperty("/" + currentScreen);
			return ScreenModel;
		},
		getMenuTransactionModel: function() {
			return this.getOwnerComponent().getModel("MenuTransactionProperties");

		},
		getProcessModel: function(uiIndicator) {
			var processModel = this.getProsessControlModel(),
				controlModel = processModel.getProperty("/" + uiIndicator);
			return controlModel;
		},
		getProsessControlModel: function() {
			return this.getOwnerComponent().getModel("ProcessControlProperties");

		},
		getCurrentScrn: function() {
			return this.getGlobalModel().getProperty("/currentScreen");
		},
		getModelData: function(model) {
			return this.getView().getModel(model).getData();
		},
		/**
		 * Convenience method
		 * @returns {object} the application controller
		 */

		getApplication: function() {
			return this.getGlobalModel().getProperty("/application");
		},
		gssCallBreadcrumbs: function() {
			return this.getGlobalModel().getProperty("/breadcrumbs");
		},
		gssFragmentsFunction: function() {
			return this.getGlobalModel().getProperty("/fragments");
		},
		gssDifferenceFunction: function() {
			return this.getGlobalModel().getProperty("/difference");
		},
		gssCallMenu: function() {
			return this.getGlobalModel().getProperty("/menu");
		},

		getComponent: function() {
			return this.getOwnerComponent();
		},

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

		onNavBack: function() {
			this.destroyModel();
			this.getGlobalModel().setProperty("/currentScreen", this.getGlobalModel().getProperty("/parentScreen"));
			this.getGlobalModel().setProperty("/parentScreen", this.getParentScreen());
			this.getApplication().navBack(History, "");

		},
		destroyModel: function() {
			this.getView().getModel(this.getModelName()).setData("");

		},
		checkInd: function(data) {
			this.getGlobalModel().setProperty("/indiTO", data.ToInd);
			this.gssFragmentsFunction().uiIndCheck(this, data.ToInd, data.ToConfirmInd, data.PostInd, "");
		},
		getControlId: function() {
			var viewProperties = this.getViewProperties();
			return viewProperties.uiControl;

		},

		setModelData: function(data) {
			var viewProperties = this.getViewProperties();
			viewProperties.modelData = data;
		},
		getBackModelData: function() {
			var viewProperties = this.getViewProperties(),
				jsonModel = new sap.ui.model.json.JSONModel(viewProperties.modelData);
			this.setModel(jsonModel, this.getModelName());
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