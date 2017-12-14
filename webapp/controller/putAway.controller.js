/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, JSONModel, MessageBox, MessageToast, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.putAway", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.putAway
		 */
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.inputDetails();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
				}.bind(this)
			});

			this._router = this.getRouter();
			this.inputDetails();
			this.getGlobalModel().setProperty("/currentView", this);

		},

		inputDetails: function() {
			this.getView().byId("inputValue").setPlaceholder("Enter Transfer order");
			this.getView().byId("inputValue").setMaxLength(10);
			// this.getView().byId("inputValue").setValueState(sap.ui.core.ValueState.Error);
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				this.getPutawayMaterial(_inputValue);
			}
		},

		getPutawayMaterial: function(sInputValue) {
			//Read picking material from backend
			this.gssCallFunction().LoadMaterial(this, sInputValue);
			//code end -selvan
		},

		putAwayConfirm: function() {
			var selectedItems = this.gssCallFunction().confirmItems(this);
		},

		onHandleDifference: function() {
			// for the putaway diff process
			var items = this.gssCallFunction().selectedItems(this);
			if (items.length === 1) {
				var callFragment = this.gssFragmentsFunction().loadFragment(this, "difference");
				this.fragmentLoaded = sap.ui.xmlfragment(callFragment, this);
				var objects = utilities.getObjects(this),
					oItem = objects.getProperty();
				if (oItem.Tapos !== this._item) {
					var newItemSelected = "X";
					this._item = oItem.Tapos;
				}
				var oItemList = this.gssDifferenceFunction().setDiffModel(oItem, this.fragmentLoaded);
				var oModel = new JSONModel(oItemList);
				this.fragmentLoaded.setModel(oModel, "handleDiff");
				this.fragmentLoaded.open();
			} else if (items.length === 0) {
				MessageToast.show("No Items Selected");
			} else if (items.length > 1) {
				MessageToast.show("Please select one material to check difference");
			}
		},

		onHandleActual: function(oEvent) {
			var actualVal = oEvent.getParameter("newValue");
			var objects = utilities.getObjects(this);
			this.modelObjects = objects.getProperty();
			var DestBinChg = this.modelObjects.DestBinChg;
			if (this.getView().byId("toTable").getSelectedItems().length === 1 && DestBinChg === "1") {
				this.Nltyp = this.modelObjects.Nltyp; //To get the Bin Type//
				this.Lgnum = this.modelObjects.Lgnum; //Warehouse No//

				if (!this._newBin) {
					var MenuModel = this.getFragmentControllerModel();
					var newBin = MenuModel.getProperty("/newBin");
					this._newBin = sap.ui.xmlfragment(newBin, this);
				}
				this.getView().addDependent(this._newBin);
				this._newBin.open();
				var oNewBinData = {
					matDesc: this.modelObjects.Maktx,
					newBin: ""
				};
				var oModel = new JSONModel();
				oModel.setData(oNewBinData);
				this._newBin.setModel(oModel, "Bin");
			} else if (this.getView().byId("toTable").getSelectedItems().length === 0) {
				MessageToast.show("No Items Selected");
			} else if (this.getView().byId("toTable").getSelectedItems().length > 1) {
				MessageToast.show("Please select one material to change Target bin");
			} else {
				MessageToast.show("Selection not possible");
			}
		},
		// ********** Method for displaying new bin & its functionalities - Srini code end ****************

		onDiffConfirm: function() {
			var destActa = this.fragmentLoaded.getModel("handleDiff").getData().destActa,
				destDifa = this.fragmentLoaded.getModel("handleDiff").getData().destDifa,
				destTarget = this.fragmentLoaded.getModel("handleDiff").getData().destTarget;
			this.destDifa = "X";
			var sValInd = "DestTarga";
			this._updateTable(destActa, destDifa, destTarget, sValInd);
		},

		onDiffCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},

		// *************** Srini cod eto update table begins **************
		_updateTable: function(destTarget, destActa, destDifa, sProperty, sValue) {
			// for the putaway diff process
			var aItems = this.getGlobalModel().getProperty("/currentView").byId("toTable").getModel("materialList").getData().aItems;
			aItems.forEach(function(oLineData) {
				if (oLineData.Tapos === this.modelObjects.Tapos &&
					oLineData.Tanum === this.modelObjects.Tanum) {
					if (sProperty === "DestTarga") {
						var destActual = parseFloat(destActa);
						var destActualStr = destActual.toFixed(3);
						oLineData.DestActa = destActualStr.toString();
						oLineData.DestQuantity = destActa;
						oLineData.DestDifa = destDifa.toString();
						oLineData.DestTarga = destTarget;
					} else if (sProperty === "newBin") {
						oLineData.Nlpla = sValue;
					}
				}
			}.bind(this));
			var aData = this.getGlobalModel().getProperty("/currentView").byId("toTable").getModel("materialList").getData();
			aData.aItems = aItems;
			this.getGlobalModel().getProperty("/currentView").byId("toTable").getModel("materialList").setData(aData);
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		// ********************** Srini code to update table ends ********************

		// ********** Method for displaying new bin & its functionalities - Srini code begin ****************
		onHandleNewBin: function() {
			var objects = utilities.getObjects(this);
			this.modelObjects = objects.getProperty();
			var DestBinChg = this.modelObjects.DestBinChg;
			if (this.getView().byId("toTable").getSelectedItems().length === 1 && DestBinChg === "1") {
				var Nltyp = this.getModel("globalProperties").setProperty("/currentNltyp", this.modelObjects.Nltyp);
				var Lgnum = this.getModel("globalProperties").setProperty("/currentLgnum", this.modelObjects.Lgnum);
				var loadFragment = this.gssFragmentsFunction().loadFragment(this, "newBin");
				this.fragmentLoaded = sap.ui.xmlfragment(loadFragment, this);
				this.getView().addDependent(this.fragmentLoaded);
				this.fragmentLoaded.open();
				var newBinData = {
					matDesc: this.modelObjects.Maktx,
					newBin: ""
				};
				// var oNewBinData = this.gssNewBinFunction().newBinModel(this.modelObjects);
				var oModel = new JSONModel();
				oModel.setData(newBinData);
				this.fragmentLoaded.setModel(oModel, "Bin");
			} else if (this.getView().byId("toTable").getSelectedItems().length === 0) {
				MessageToast.show("No Items Selected");
			} else if (this.getView().byId("toTable").getSelectedItems().length > 1) {
				MessageToast.show("Please select one material to change Target bin");
			} else {
				MessageToast.show("Selection not possible");
			}
		},
		// ********** Method for displaying new bin & its functionalities - Srini code end ****************

		onHandleCheck: function() {
			var binValue = sap.ui.getCore().byId("newBinValue").getValue(), //To get the New Bin Details //
				oGlobalModel = this.getModel("globalProperties");
			oGlobalModel.setProperty("/currentNltyp", this.Nltyp);
			var oWhenCallReadIsDone;
			if (binValue) {
				if (window.Promise) {
					// Promises are supported by browser
					oWhenCallReadIsDone = this.gssCallFunction().newBinCheckPromise(this.getGlobalModel().getProperty(
						"/currentView"), binValue);
				} else {
					oWhenCallReadIsDone = this.gssCallFunction().newBinCheck(this.getGlobalModel().getProperty("/currentView"),
						binValue);
				}

				oWhenCallReadIsDone.done(function() {
					if (oGlobalModel.getProperty("/messageType") === "S") {
						sap.ui.getCore().byId("newBinConfirm").setEnabled(true); //Response Message Text //
						var errorMessage = oGlobalModel.getProperty("/message"); //Message Test //
						MessageBox.success( //MessageBox// 
							errorMessage + ".");
					}
				}.bind(this));
			} else {
				MessageBox.success("Bin value can not be blank!");
			}
		},

		// *********** Srini code for new bin change begins ***********
		onNewBinConfirm: function() {
			var newDbin = sap.ui.getCore().byId("newBinValue").getValue();
			this.oNewBin = "";
			if (this.oldBin === "") {
				this.oldBin = this.modelObjects.Nlpla;
			} else if (this.oldBin !== newDbin) {
				this.oNewBin = "X";
			}
			this.modelObjects.Nlpla = newDbin;
			var sValInd = "newBin";
			var destActa = "",
				destDifa = "",
				destTarget = "";
			this._updateTable(destActa, destDifa, destTarget, sValInd, newDbin);
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},

		onNewBinCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		// *********** Srini code for new bin change ends ***********

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.putAway
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.putAway
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.putAway
		 */
		//	onExit: function() {
		//
		//	}

	});

});