sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	//"sap/ui/model/json/JSONModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/routing/History",
	"gss/newWarehouseManage_R1/modules/MenuBinding",
	"gss/newWarehouseManage_R1/modules/Fragments",
	"gss/newWarehouseManage_R1/modules/Difference",
	"gss/newWarehouseManage_R1/modules/CreateElements",
	"gss/newWarehouseManage_R1/modules/CreateBreadCrumbs",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/controller/ErrorHandler",
	"./errorHandling",
	"gss/newWarehouseManage_R1/lib/GssWarehouseManage"
	// "gss/newWarehouseManage_R1/lib/WMConfiguration"

], function(Object, Device, BindingMode, History, MENUBinding, Fragments, Difference, CreateElements, CreateBreadCrumbs, BaseController,
	ErrorHandler, errorHandling, GssWarehouseManage) {
	"use strict";

	return Object.extend("gss.newWarehouseManage_R1.controller.Application", {
		// Attributes of this class:
		// _oComponent: the component representing this app
		// _oRootView: the main view hosting the app
		// _oResourceBundle: the resource bundle for this app
		// _oODataModel: the ODataModel used by this app
		// _oGlobalModel: model 'globalProperties' (see below)
		// _oRouter: the router for this app
		// _fnWhenMetadataIsFinished: When metadata loading for the OData model finishes and this parameter is truthy,
		//                            it is assumed that this parameter is a function. In this case this function is called
		//                            passing the information whether the metadata loading finished successfully as parameter.                          

		/**
		 * This class serves as controller for the whole app. It is a singleton that is instantiated and initialized by
		 * the Component.
		 * Note that during initialization a json-model is created and attached to the component (name 'globalProperties').
		 * This json-model serves as storage for the global state of the app. In detail, it possesses the following attributes:
		 * - application: this instance
		 * - listNoDataText: the no data text currently used by the master list
		 * - isMultiSelect: boolean indicating whether the app is in multi-select mode
		 * - selectedPurchaseOrders: in multi select mode, this is an array containing purchase order objects representing the selected list items
		 * - currentPOId: if this attribute is truthy it specifies the ID of the purchase order that should be displayed on the detail screen
		 * - preferredIds: This attribute is only evaluated if currentPOId is faulty and the app is not running on a phone.
		 *                 In this case, the app must determine a PO that should be displayed in the detail area.
		 *                 Therefore the PO IDs in the array preferredIds are checked one after the other.
		 *                 The first one that can be found in the master list is taken. If this procedure does not lead to a match,
		 *                 the first entry in the master list is selected. This logic is implemented in method _findItemToDisplay of the S2 controller.
		 * - isMetaDataLoading: information about whether the app is currently loading metadata of the OData service
		 * - isBusyApproving: information about whether the app is currently busy with approving POs (note that quick approvals do not put the app into the 'busy' state).
		 *                    Note that the busy indication will not be set back when the approval process itself has ended. The app
		 *                    remains busy until the follow-up actions (refreshing the list, loading a new item in the detail area) are completed.
		 * - metaDataLoaded: information about whether the metadata of the OData service have already been loaded successfully
		 * - isSwipeRunning: information about whether a swipe approval is currently being processed. In order to avoid inconsistencies, the multi-select-button
		 *                is disabled meanwhile.
		 * - originalBusyDelay: the default delay for busy indication of the root view
		 * - masterImmediateBusy/detailImmediateBusy: Normally busy indication appears with a delay. However, if the master list or
		 *                                            controls on the detail page become busy directly after the whole app has been busy, this delay
		 *                                            should be suppressed in order to avoid a flickering of busy states.
		 * - emptyPage: only relevant when EmptyPage view is displayed. In this case, it contains the data that this view displays. For more information, see
		 *              the declarative definition of this view.
		 * Moreover, a json-model is created and attached to the component (name 'device') providing access to sap.ui.Device in declarative definitions.
		 * Note that the OData model used by this app is automatically created according to the app descriptor.
		 * For this ODataModel exactly one deferred batch group (namely "POMassApproval") is set.
		 * @class
		 * @public
		 * @param {object} oComponent the component representing this app
		 */
		constructor: function(oComponent) {
			this._oComponent = oComponent;
		},

		/* =========================================================== */
		/* Lifecycle methods                                              */
		/* =========================================================== */

		/**
		 * Called by component in order to launch the app.
		 * In this method, the json models are set and the router is initialized.
		 * @public
		 */
		init: function() {
			var JSONModel = sap.ui.require("sap/ui/model/json/JSONModel");

			this._oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
			// Globalsoft warehouse management
			this._oGssWarehouseManage = new GssWarehouseManage(this);
			//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			//By Sabari to Create object for Menu and Sub Menu Binding 
			//*******************************************************************************
			this._omenuBinding = new MENUBinding(this);
			//*******************************************************************************
			//End of Code Sabari to Create object for Menu and Sub Menu Binding 
			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			//By Sabari to Create Bread Crumbs
			//*******************************************************************************
			this._ocreateBreadCrumbs = new CreateBreadCrumbs(this);
			//*******************************************************************************
			//End of Code Sabari to Create Bread Crumbs 
			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

			// *************** Srini Code to display fragments begins ***************
			this._ofragments = new Fragments(this);
			// *************** Srini Code to display fragments ends *****************

			// *************** Srini Code to display difference begins ***************
			this._odifference = new Difference(this);
			// *************** Srini Code to display difference ends *****************
			this._oGssCreateElements = new CreateElements(this);
			// set the device model
			//this._oComponent.setModel(new JSONModel(Device), "device");
			//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

			// set the globalProperties model
			this._oGlobalModel = new JSONModel({
				application: this,
				fragments: this._ofragments,
				difference: this._odifference,
				gsswm: this._oGssWarehouseManage,
				gsscb: this._oGssCreateElements,
				breadcrumbs: this._ocreateBreadCrumbs,
				menu: this._omenuBinding,
				currentScreen: "LM999",
				parentScreen: "",
				currentModel: "",
				controlId: "",
				message: "",
				messageType: "",
				isOdataLoading: false,
				isMultiSelect: false,
				isMetaDataLoading: true,
				isBusyApproving: false,
				metaDataLoaded: false,
				isSwipeRunning: false,
				masterImmediateBusy: true,
				detailImmediateBusy: true,
				currentQueue: "",
				currentLgnum: "",
				currentNltyp: "",
				currentDelNo: "",
				currentHuVal: "",
				lastModelSetName: "",
				MenuData: "",
				MainView: "",
				SecondView: "",
				lastSubModelSetName: "",
				pack: "",
				shipInd: "",
				indiTO: "",
				viewId:"",
				uiInd:""
			});
			this._oGlobalModel.setDefaultBindingMode(BindingMode.TwoWay);
			this._oComponent.setModel(this._oGlobalModel, "globalProperties");

			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			// By Sabari to Add the Fragment Controller Model 
			//*******************************************************************************************
			// set the Fragment Properties Model
			this._oFragmentControllerModel = new JSONModel({
				putAway: "gss.newWarehouseManage_R1.controller.putAway",
				mainMenu: "gss.newWarehouseManage_R1.view.fragments.rfMenu",
				newBin: "gss.newWarehouseManage_R1.view.fragments.newBin",
				difference: "gss.newWarehouseManage_R1.view.fragments.difference",
				confirmation: "gss.newWarehouseManage_R1.view.fragments.confirmation",
				addHu: "gss.newWarehouseManage_R1.view.fragments.addHU",
				addMaterial: "gss.newWarehouseManage_R1.view.fragments.addMaterial"

			});

			this._oFragmentControllerModel.setDefaultBindingMode(BindingMode.TwoWay);
			this._oComponent.setModel(this._oFragmentControllerModel, "fragmentControllerProperties");
			//*******************************************************************************************
			// End of Code Sabari to Add the Fragment Controller Model 
			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

			//*******************************************************************************************
			// Start Menu item and view navvigation properties 
			//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

			this._oMenuTransactionModelNew =  new JSONModel("./lib/WMConfiguration.json");
			this._oComponent.setModel(this._oMenuTransactionModelNew, "MenuTransactionProperties");
			
			this._oProcessControlModel =  new JSONModel("./lib/ProcessConfiguration.json");
			this._oComponent.setModel(this._oProcessControlModel, "ProcessControlProperties");

			// delegate error handling
			errorHandling.register(this, this._oComponent, "");

		},

		/* =========================================================== */
		/* Route handlers (attached during initialization)             */
		/* =========================================================== */

		/* =========================================================== */
		/* Master handling                                             */
		/* =========================================================== */

		// Handling of back functionality.
		// bPreferHistory: Information whether back should be realized via browser-history if browser history is available.
		//                 This should be true with the exception of those views which do not have an own url (like the summary page in our example)
		// bFromDetailScreen: Information whether back is called from master or from detail screen. This is used to decide where to go when history
		// cannot be used. The 'merged header' calls the navButtonPress-handler of the sap.m.semantic.MasterPage when the master list is shown in full
		// screen mode (happens only on phones). Otherwise the the navButtonPress-handler of the sap.m.semantic.DetailPage is called:
		// When coming from a detail screen on a phone go to master, when coming from master or from the detail but not on a phone, go back to previous app/shell.
		navBack: function(bPreferHistory, bFromDetailScreen) {
			// this._oGlobalModel.setProperty("/currentPOId", null);
			if (bPreferHistory) {
				var oHistory = History.getInstance(),
					sPreviousHash = oHistory.getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
					return;
				}
			}
			if (bFromDetailScreen && sap.ui.Device.system.phone) {
				this._oRootView.getController().backMaster();
				this._oRouter.navTo("Main", {}, true);
				return;
			}
			// var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// oCrossAppNavigator.backToPreviousApp();
		},

		/* =========================================================== */
		/* Empty view handling                                         */
		/* =========================================================== */

		/**
		 * Show view EmptyPage in the detail area
		 * @public
		 * @param {string} sReason the reason for showing the empty view. The following reasons can be used:
		 * - bypassed: invalid url hash
		 * - noObjects: master list is empty (and attribute currentPOId in the global model is faulty)
		 * - objectNotFound: attribute currentPOId in the global model is truthy but does not specify a valid PO
		 */
		showEmptyView: function(sReason) {
			var oEmptyPageSettings = {
				title: this._oResourceBundle.getText(this._getEmptyTitleKey(sReason)),
				text: this._getEmptyText(sReason),
				icon: sReason === "bypassed" ? "sap-icon://document" : null,
				description: ""
			};
			this._oGlobalModel.setProperty("/emptyPage", oEmptyPageSettings);
			this._oGlobalModel.setProperty("/isBusyApproving", false);
			this._oGlobalModel.setProperty("/detailImmediateBusy", false);
			//this._oRouter.getTargets().display("empty");
		},

		_getEmptyTitleKey: function(sReason) {
			switch (sReason) {
				case "bypassed":
					return "notFoundTitle";
				case "noObjects":
					return "masterTitle";
				default:
					return "detailTitle";
			}
		},

		_getEmptyText: function(sReason) {
				if (sReason === "noObjects") {
					return this._oGlobalModel.getProperty("/listNoDataText");
				}
				return this._oResourceBundle.getText(sReason === "bypassed" ? "notFoundText" : "noObjectFoundText");
			}
			/* =========================================================== */
			/* OData metadata handling                                     */
			/* =========================================================== */

	});
});