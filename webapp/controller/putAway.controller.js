/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"gss/newWarehouseManage_R1/model/utilities",
	"sap/ui/model/resource/ResourceModel"
], function(Controller, BaseController, formatter, JSONModel, MessageBox, MessageToast, utilities, ResourceModel) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.putAway", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.putAway
		 */
		onInit: function() {
			//TO get the BreadCrumb Detail 
			// Sabari 24/12/2017 
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel(this);
					this.inputDetails();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel(this);
			this.inputDetails();
			this.getGlobalModel().setProperty("/currentView", this);
			this.setFragment();
		},

		setFragment: function() {
			//Fragement Code for New Bin
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "newBin");
			this.fragmentNewBinLoaded = sap.ui.xmlfragment(loadFragment, this);
			this.getView().addDependent(this.fragmentNewBinLoaded);
			//	
			var callFragment = this.gssFragmentsFunction().loadFragment(this, "difference");
			this.fragmentLoaded = sap.ui.xmlfragment(callFragment, this);
		},
		inputDetails: function() {
			var Screen = this.getCurrentScrn();
			var ScreenModel = this.getScreenModel(Screen);
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(ScreenModel.placeHolderLabel);
			this.getView().byId("inputValue").setPlaceholder(Text);
			this.getView().byId("inputValue").setMaxLength(10);
		},

		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue();
			if (_inputValue) {
				//OLD CODE COMMENTED BY SELVAN this.getPutawayMaterial(_inputValue);
				this.callOdataService().getMaterial(this, _inputValue);
			}
		},


		putAwayConfirm: function() {
			var tableRowSelectedItems = this.callOdataService().selectedItems(this, "toTable");
			this.callOdataService().confirmItems(this,tableRowSelectedItems);

		},

		onHandleDifference: function() {
			// for the putaway diff process
			//OLD CODE var items = this.gssCallFunction().selectedItems(this, "toTable");
			var items = this.callOdataService().selectedItems(this, "toTable");

			if (items.length === 1) {
				//fragment code is Moved to OnInit 
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
			this.gssDifferenceFunction().diffCalculation(actualVal, this.modelObjects.DestTarga, this.fragmentLoaded);
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
		_updateTable: function(destActa, destDifa, destTarget, sProperty, sValue) {
			// for the putaway diff process
			var aItems = this.getView().byId("toTable").getModel("materialList").getData().aItems;
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
			var aData = this.getView().byId("toTable").getModel("materialList").getData();
			aData.aItems = aItems;
			this.getView().byId("toTable").getModel("materialList").setData(aData);
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		// ********************** Srini code to update table ends ********************

		// ********** Method for displaying new bin & its functionalities - Srini code begin ****************
		onHandleNewBin: function() {
			var objects = utilities.getObjects(this);
			this.modelObjects = objects.getProperty();
			var DestBinChg = this.modelObjects.DestBinChg;
			if (this.getView().byId("toTable").getSelectedItems().length === 1 && DestBinChg === "1") {
				this.getModel("globalProperties").setProperty("/currentNltyp", this.modelObjects.Nltyp);
				this.Nltyp = this.modelObjects.Nltyp;
				this.getModel("globalProperties").setProperty("/currentLgnum", this.modelObjects.Lgnum);
				var Lgnum = this.modelObjects.Lgnum;
				//Fragment code is Move to onInit function
				this.fragmentNewBinLoaded.open();
				var newBinData = {
					matDesc: this.modelObjects.Maktx,
					newBin: ""
				};
				// var oNewBinData = this.gssNewBinFunction().newBinModel(this.modelObjects);
				var oModel = new JSONModel();
				oModel.setData(newBinData);
				this.fragmentNewBinLoaded.setModel(oModel, "Bin");
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
			var sParentTcode = this.getGlobalModel().getProperty("/currentScreen");
			if (binValue) {
				this.getGlobalModel().setProperty("/currentScreen", "LM111");
				//OLD CODE oWhenCallReadIsDone = this.gssCallFunction().newBinCheckPromise(this.getGlobalModel().getProperty("/currentView"), binValue);
				//NEW ODATA CALL CODE
				oWhenCallReadIsDone = this.callOdataService().checkNewBin(this, binValue);

				oWhenCallReadIsDone.done(function() {
					if (oGlobalModel.getProperty("/messageType") === "S") {
						sap.ui.getCore().byId("newBinConfirm").setEnabled(true); //Response Message Text //
						var errorMessage = oGlobalModel.getProperty("/message"); //Message Test //
						MessageBox.success( //MessageBox// 
							errorMessage + ".");
					}

					this.getGlobalModel().setProperty("/currentScreen", sParentTcode);

				}.bind(this));
			} else {
				MessageBox.information("Bin value can not be blank!");
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
			this.gssFragmentsFunction().closeFragment(this.fragmentNewBinLoaded);
		},
		onHandleSelection: function() {
			this.getModel("globalProperties").setProperty("/controlId", "toTable");
			var objects = utilities.getObjects(this);
		},

		onNewBinCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentNewBinLoaded);
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