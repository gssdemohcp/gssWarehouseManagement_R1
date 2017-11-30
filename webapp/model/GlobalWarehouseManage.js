sap.ui.define(["sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"gss/newWarehouseManage_R1/model/utilities",
	"gss/newWarehouseManage_R1/controller/errorHandling"


], function(Object, Device, JSONModel,MessageBox,utilities,errorHandling) {
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
			
			this._bMessageOpen = false;
		},
		showServiceError: function(sDetails) {
				if (this._bMessageOpen) {
					return;
				}
				this._bMessageOpen = true;
				MessageBox.error(
					sDetails,
					{
						id : "serviceErrorMessageBox",
						icon: sap.m.MessageBox.Icon.ERROR,
						details: sDetails,
						styleClass: utilities.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			},
				showServiceShow: function(sDetails) {
				if (this._bMessageOpen) {
					return;
				}
				this._bMessageOpen = true;
				MessageBox.show(
					sDetails,
					{
						id : "serviceErrorMessageBox",
						title: "Information",
						icon: sap.m.MessageBox.Icon.WARNING,
						details: sDetails,
						styleClass: utilities.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE],
						onClose: function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			},

		menuConfigurationLoad: function(oView, afilters) {
			//Call oDATA Read with entity set name
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				oOdataService = oView.gssOdataService(),
				bEntityName = this.entityName(oView, "/MenuConfiguration"),
				oWhenCallReadIsDone = oOdataService.oCallReadDeferred(bEntityName, oView, afilters);

			var pQueue,
				pLgnum,
				Nltyp;

			var oGlobalModel = oView.getModel("globalProperties");
			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call	
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					rfMenu: oRfData
				};
				oRfModel.setData(oRfData);

				//code start - selvan
				//capture queue number for filter option
				var aRfMenu = oRfModel.getData().rfMenu;
				aRfMenu.forEach(function(oRfMenu) {
					if (oRfMenu.Queue && oRfMenu.Lgnum) {
						pQueue = oRfMenu.Queue;
						pLgnum = oRfMenu.Lgnum;
						Nltyp = oRfMenu.Nltyp;
					}
				}.bind(this));
				oGlobalModel.setProperty("/currentQueue", pQueue);
				oGlobalModel.setProperty("/currentLgnum", pLgnum);
				oGlobalModel.setProperty("/currentNltyp", Nltyp);
				//code end -selvan

				oGlobalModel.setProperty("/isOdataLoading", false);

				//Create New Model for Menu Configuration Item
				sap.ui.getCore().setModel(oRfModel, "mainJsonModel");

				promise.resolve();

			}.bind(this));

			return promise;
		},

		// ********** Srini code to load putaway data begins *****************
		LoadMaterial: function(oView, sInputValue) {
			//Call oDATA Read with entity set name
			var oRfModel = new JSONModel(),
				promise = jQuery.Deferred(),
				oOdataService = oView.gssOdataService(),
				bEntityName = this.entityName(oView, "/MaterialList"),
				//Setup filter string
				aFilterValues = oView.gssFilterFunction().setFilter(oView, sInputValue),
				//******
				oWhenCallReadIsDone = oOdataService.oCallReadDeferred(bEntityName, oView, aFilterValues);

			var oGlobalModel = oView.getModel("globalProperties"),
				bMsgType = false;
			oGlobalModel.setProperty("/isOdataLoading", true);
			//Handle response from oData Call	
			oWhenCallReadIsDone.done(function(oResult, oFailed) {
				var oRfData;
				oRfData = oResult.results;
				oRfData = {
					aItems: oRfData
				};
				oRfModel.setData(oRfData);
				//Create New Model for Menu Configuration Item
				oView.setModel(oRfModel, "materialList");
				if (oRfData.aItems[0].Msgtyp === "E" || oRfData.aItems[0].Msgtyp === "W") {
					bMsgType = true;
					this.showServiceShow(oRfData.aItems[0].Msgtext);
				} else if (oRfData.aItems[0].Msgtyp === "S") {
					bMsgType = false;
				}
				
				// delegate error handling
			    errorHandling.register(oView.getApplication(), oView.getComponent());

				oGlobalModel.setProperty("/isMessageError", bMsgType);
				oGlobalModel.setProperty("/msgText", oRfData.aItems[0].Msgtext);
				oGlobalModel.setProperty("/isOdataLoading", false);
				promise.resolve();
				
				
			}.bind(this));
			return promise;
		},
		// ********** Srini code to load putaway data ends *****************

		// ************* Srini code to get selected items from table begins ************
		selectedItems: function(oView) {
			return oView.byId("toTable").getSelectedItems();
		},
		// ************* Srini code to get selected items from table ends ************

		// ************* Srini code to get confirm items begins ************
		confirmItems: function(oView) {
			var getItems = this.selectedItems(oView),
				oOdataService = oView.gssOdataService();
			// var oErrorModel = new JSONModel();
			getItems.forEach(function(mItem) {
				var bEntityName = this.entityName(oView, "/MaterialList"),
					updateItem = mItem.getBindingContext("itemList").getObject();
				var updatePath = bEntityName + "(Lenum='',Queue='" + updateItem.Queue + "',Vbeln='',Lgnum='" + updateItem.Lgnum +
					"',Tanum='" + updateItem.Tanum + "',Tapos='" + updateItem.Tapos +
					"')",
					oWhenCallUpdateIsDone = oOdataService.oCallUpdateDeferred(updatePath, updateItem, mItem, oView);
					
			}.bind(this));
		},
		entityName: function(oView, sEntityProperty) {
				var oEntitySetModel = oView.getModel("entitySetProperties"),
					bEntityName = oEntitySetModel.getProperty(sEntityProperty);
				return bEntityName;

			}
			// ************* Srini code to get confirm items ends ************
	});
});