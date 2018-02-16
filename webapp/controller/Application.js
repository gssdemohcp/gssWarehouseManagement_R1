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
				indiTO:""
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

			this._oMenuTransactionModelNew = new JSONModel({

				LM02: {
					view: "putaway",
					keyFields: {
						Lenum: "",
						Queue: "",
						Vbeln: "",
						Lgnum: "",
						Tanum: "",
						Tapos: ""
					},
					filters: {
						Lenum: "",
						Queue: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterSU",
					entitySet: "/WMProcessSet",
					modelName: "materialList",
					UI: {
						footer: {}
					}
				},
				LM03: {
					view: "putaway",
					putaway: "LM03",
					keyFields: {
						Lenum: "",
						Queue: "",
						Vbeln: "",
						Lgnum: "",
						Tanum: "",
						Tapos: ""
					},
					filters: {
						Tanum: "",
						Queue: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterTO",
					entitySet: "/WMProcessSet",
					modelName: "materialList"
				},
				LM09: {
					view: "putaway",
					putaway: "LM09",
					keyFields: {
						Lenum: "",
						Queue: "",
						Vbeln: "",
						Lgnum: "",
						Tanum: "",
						Tapos: ""
					},
					filters: {
						Vbeln: "",
						Queue: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterDel",
					entitySet: "/WMProcessSet",
					modelName: "materialList"
				},

				LM05: {
					view: "picking",
					picking: "LM05",
					keyFields: {
						Lenum: "",
						Queue: "",
						Vbeln: "",
						Lgnum: "",
						Tanum: "",
						Tapos: ""
					},
					filters: {
						Tanum: "",
						Queue: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterTO",
					entitySet: "/WMProcessSet",
					modelName: "materialList"
				},
				LM06: {
					view: "picking",
					picking: "LM06",
					keyFields: {
						Lenum: "",
						Queue: "",
						Vbeln: "",
						Lgnum: "",
						Tanum: "",
						Tapos: ""
					},
					filters: {
						Vbeln: "",
						Queue: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterDel",
					entitySet: "/WMProcessSet",
					modelName: "materialList"
				},

				LM33: {
					view: "unloadShipment",
					unloadShipment: "LM33",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						Exida: "",
						Tknum: "",
						LoadInd: "",
						HuStatus: "",
						Lgnum: "",
						ProcInd: ""
					},
					filters: {
						Tknum: "",
						Exidv: "",
						Lgnum: "",
						ProcInd: "",
						LoadInd: ""
					},
					placeHolderLabel: "EnterShip",
					entitySet: "/LoadProcessSet",
					modelName: "itemList"
				},
				LM34: {
					view: "unloadDelivery",
					unloadDelivery: "LM34",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						Exida: "",
						Tknum: "",
						LoadInd: "",
						HuStatus: "",
						Lgnum: "",
						ProcInd: ""
					},
					filters: {
						Vbeln: "",
						Exidv: "",
						Lgnum: "",
						ProcInd: "",
						LoadInd: ""
					},
					placeHolderLabel: "EnterDel",
					entitySet: "/LoadProcessSet",
					modelName: "itemList"
				},

				LM30: {
					view: "loadShipment",
					loadShipment: "LM30",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						Exida: "",
						Tknum: "",
						LoadInd: "",
						HuStatus: "",
						Lgnum: "",
						ProcInd: ""
					},
					filters: {
						Tknum: "",
						Exidv: "",
						ProcInd: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterShip",
					entitySet: "/LoadProcessSet",
					modelName: "itemList"
				},
				LM31: {
					view: "loadDelivery",
					loadDelivery: "LM31",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						Exida: "",
						Tknum: "",
						LoadInd: "",
						HuStatus: "",
						Lgnum: "",
						ProcInd: ""
					},
					filters: {
						Vbeln: "",
						Exidv: "",
						ProcInd: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterDel",
					entitySet: "/LoadProcessSet",
					modelName: "itemList"
				},

				LM37: {
					view: "loadInqShipment",
					loadInqShipment: "LM37",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						Exida: "",
						Tknum: "",
						LoadInd: "",
						HuStatus: "",
						Lgnum: "",
						ProcInd: ""
					},
					filters: {
						Tknum: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterShip",
					entitySet: "/LoadProcessSet",
					modelName: "itemList"
				},
				LM36: {
					view: "loadInqDelivery",
					loadInqDelivery: "LM36",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						Exida: "",
						Tknum: "",
						LoadInd: "",
						HuStatus: "",
						Lgnum: "",
						ProcInd: ""
					},
					filters: {
						Vbeln: "",
						Lgnum: ""
					},
					placeHolderLabel: "EnterDel",
					entitySet: "/LoadProcessSet",
					modelName: "itemList"
				},
				LM35: {
					view: "loadInqHu",
					loadInqHu: "LM35",
					filters: {
						Exidv: "",
						Lgnum: ""
					},
					keyFields: {
						Vbeln: "",
						Exidv: "",
						Exida: "",
						Tknum: "",
						LoadInd: "",
						HuStatus: "",
						Lgnum: "",
						ProcInd: ""
					},
					placeHolderLabel: "EnterHU",
					entitySet: "/LoadProcessSet",
					modelName: "itemList"
				},

				LM71: {
					view: "grdelivery",
					grdelivery: "LM71",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: ""
					},
					modelData: "",
					childScreens: {
						unloadDelivery: "LM34",
						putaway: "LM09",
						UnPack: "LM222",
						grDelItems: "LM333"
					},
					filters: {},
					placeHolderLabel: "Enter Delivery",
					entitySet: "/GRProcessSet",
					modelName: "itemList"
				},
				LM73: {
					view: "grShipment",
					grShipment: "LM73",
					keyFields: {
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: "",
						Vbeln: ""
					},
					modelData: "",
					childScreens: {
						unloadDelivery: "LM34",
						putaway: "LM09",
						UnPack: "LM222",
						grShipItems: "LM444"
					},
					filters: {
						Tknum: "",
						Lgnum: ""
					},
					placeHolderLabel: "Enter Shipment",
					entitySet: "/GRProcessSet",
					modelName: "itemList"
				},
				LM72: {
					view: "grStagingArea",
					grStagingArea: "LM72",
					keyFields: {
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: "",
						Vbeln: ""
					},
					modelData: "",
					childScreens: {
						unloadDelivery: "LM34",
						putaway: "LM09",
						UnPack: "LM222",
						grShipItems: "LM444"
					},
					filters: {
						Lgbzo: "",
						Lgnum: ""
					},
					placeHolderLabel: "Enter Staging Area",
					entitySet: "/GRProcessSet",
					modelName: "itemList"
				},
				LM76: {
					view: "grHu",
					grHu: "LM76",
					keyFields: {
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: "",
						Vbeln: ""
					},
					filters: {},
					modelData: "",
					childScreens: {
						unloadDelivery: "LM34",
						putaway: "LM09",
						UnPack: "LM222",
						grDelItems: "LM333"
					},
					placeHolderLabel: "Enter Handling Unit",
					entitySet: "/GRProcessSet",
					modelName: "itemList"
				},

				LM61: {
					view: "gidelivery",
					gidelivery: "LM61",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: ""

					},
					modelData: "",
					childScreens: {
						loadDelivery: "LM31",
						UnPack: "LM223",
						grDelItems: "LM334",
						giShip:"LM777"
					},
					filters: {},
					placeHolderLabel: "Enter Delivery",
					entitySet: "/GIProcessSet",
					modelName: "delList"
				},
				LM62: {
					view: "giStagingArea",
					giStagingArea: "LM62",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: ""
					},
					filters: {
						Lgbzo: "",
						Lgnum: ""
					},
					modelData: "",
					childScreens: {
						loadDelivery: "LM31",
						UnPack: "LM223",
						grShipItems: "LM445",
						giShip:"LM777"
					},
					placeHolderLabel: "Enter Staging Area",
					entitySet: "/GIProcessSet",
					modelName: "delList"
				},
				LM63: {
					view: "giShipment",
					giShipment: "LM63",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: ""
					},
					filters: {
						Tknum: "",
						Lgnum: ""
					},
					modelData: "",
					childScreens: {
						loadDelivery: "LM31",
						UnPack: "LM223",
						grShipItems: "LM445",
						giShip:"LM777"
					},
					placeHolderLabel: "Enter Shipment",
					entitySet: "/GIProcessSet",
					modelName: "delList"
				},
				LM66: {
					view: "giHu",
					giHu: "LM66",
					keyFields: {
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: "",
						Vbeln: ""
					},
					filters: {},
					modelData: "",
					childScreens: {
						loadDelivery: "LM31",
						UnPack: "LM223",
						grDelItems: "LM334",
						giShip:"LM777"
					},
					placeHolderLabel: "Enter Handling Unit",
					entitySet: "/GIProcessSet",
					modelName: "delList"
				},

				LM999: {
					view: "menuConfiguration",
					menuConfiguration: "LM999",
					keyFields: {},
					filters: {},
					entitySet: "/configurationsSet",
					modelName: "mainJsonModel"
				},
				LM111: {
					view: "newBin",
					newBin: "LM111",
					keyFields: {},
					filters: {
						Nlpla: "",
						Nltyp: "",
						Lgnum: ""
					},
					entitySet: "/WMProcessSet",
					modelName: ""
				},
				LM222: {
					view: "UnPack",
					UnPack: "LM222",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: ""
					},
					filters: {},
					parentScreen: "",
					childScreens: {
						unpackMaterial: "LM555",
						unpackHu: "LM666"
					},
					placeHolderLabel: "Enter Handling Unit",
					entitySet: "/GRProcessSet",
					modelName: "packItems"
				},
				LM223: {
					view: "UnPack",
					UnPack: "LM222",
					keyFields: {
						Vbeln: "",
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: ""
					},
					filters: {},
					parentScreen: "",
					childScreens: {
						unpackMaterial: "LM556",
						unpackHu: "LM667"
					},
					placeHolderLabel: "Enter Handling Unit",
					entitySet: "/GIProcessSet",
					modelName: "packItems"
				},
				LM333: {
					view: "grDelItems",
					keyFields: {
						Vbeln: "",
						Lgnum: "",
						ShipInd: "",
						Tknum: "",
						Lgbzo: "",
						Exidv: ""

					},
					filters: {
						Vbeln: "",
						Lgnum: ""
					},
					parentScreen: "",
					placeHolderLabel: "",
					entitySet: "/GRProcessSet",
					modelName: "itemList"
				},
				LM444: {
					view: "grShipItems",
					keyFields: {
						Vbeln: "",
						Lgnum: "",
						ShipInd: "",
						Tknum: "",
						Lgbzo: "",
						Exidv: ""
					},
					filters: {
						Vbeln: "",
						Lgnum: ""
					},
					parentScreen: "",
					placeHolderLabel: "",
					entitySet: "/GRProcessSet",
					modelName: "itemList"
				},
				LM334: {
					view: "grDelItems",
					keyFields: {
						Vbeln: "",
						Lgnum: "",
						ShipInd: "",
						Tknum: "",
						Lgbzo: "",
						Exidv: ""

					},
					filters: {
						Vbeln: "",
						Lgnum: ""
					},
					parentScreen: "",
					placeHolderLabel: "",
					entitySet: "/GIProcessSet",
					modelName: "itemList"
				},
				LM445: {
					view: "grShipItems",
					keyFields: {
						Vbeln: "",
						Lgnum: "",
						ShipInd: "",
						Tknum: "",
						Lgbzo: "",
						Exidv: ""
					},
					filters: {
						Vbeln: "",
						Lgnum: ""
					},
					parentScreen: "",
					placeHolderLabel: "",
					entitySet: "/GIProcessSet",
					modelName: "itemList"
				},
				LM555: {
					view: "unpackMaterial",
					material: "LM555",
					keyFields: {
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: "",
						Vbeln: ""
					},
					parentScreen: "",
					filters: {
						Exidv: "",
						ShipInd: "",
						Vbeln: "",
						Lgnum: "",
						Matnr: "",
						Lfimg: "",
						Vrkme: ""
					},
					entitySet: "/GRProcessSet",
					modelName: "HUMatModel"
				},
				LM666: {
					view: "unpackHu",
					material: "LM666",
					keyFields: {
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: "",
						Vbeln: ""
					},
					parentScreen: "",
					filters: {
						Exidv: "",
						ShipInd: "",
						Vbeln: ""
					},
					entitySet: "/GRProcessSet",
					modelName: "HUModel"
				},
				LM556: {
					view: "unpackMaterial",
					material: "LM555",
					keyFields: {
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: "",
						Vbeln: ""
					},
					parentScreen: "",
					filters: {
						Exidv: "",
						ShipInd: "",
						Vbeln: "",
						Lgnum: "",
						Matnr: "",
						Lfimg: "",
						Vrkme: ""
					},
					entitySet: "/GIProcessSet",
					modelName: "HUMatModel"
				},
				LM667: {
					view: "unpackHu",
					material: "LM666",
					keyFields: {
						Exidv: "",
						ShipInd: "",
						Lgnum: "",
						Tknum: "",
						Lgbzo: "",
						Vbeln: ""
					},
					parentScreen: "",
					filters: {
						Exidv: "",
						ShipInd: "",
						Vbeln: ""
					},
					entitySet: "/GIProcessSet",
					modelName: "HUModel"
				},
				LM777: {
					view: "giShip",
					giShip: "LM777",
					keyFields: {
						Vbeln: " ",
						Lgnum: "",
						Exidv: "",
						Tknum: "",
						Lgbzo: "",
						ShipInd:""
					},
					parentScreen: "",
					filters: {
						Exidv: "",
						ShipInd: "",
						Vbeln: ""
					},
					entitySet: "/GIProcessSet",
					modelName: "shipList"
				}
			});

			this._oMenuTransactionModelNew.setDefaultBindingMode(BindingMode.OneWay);
			this._oComponent.setModel(this._oMenuTransactionModelNew, "MenuTransactionProperties");

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