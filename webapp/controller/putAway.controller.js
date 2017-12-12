/*eslint linebreak-style: ["error", "windows"]*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, BaseController, formatter, JSONModel, MessageBox, utilities) {
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

		// ********** Method for displaying new bin & its functionalities - Srini code begin ****************
		onHandleNewBin: function() {
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

		onHandleCheck: function() {
			var binValue = sap.ui.getCore().byId("newBinValue").getValue(), //To get the New Bin Details //
				oGlobalModel = this.getModel("globalProperties");
			oGlobalModel.setProperty("/currentNltyp", this.Nltyp);
			var oWhenCallReadIsDone;

			if (binValue) {
				if (window.Promise) {
					// Promises are supported by browser
					oWhenCallReadIsDone = this.gssCallFunction().newBinCheckPromise(this, binValue);
				} else {
					oWhenCallReadIsDone = this.gssCallFunction().newBinCheck(this, binValue);
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

		// ********** Srini code for new bin check begins ****************
		onHandleCheck1: function() {
			var binValue = sap.ui.getCore().byId("newBinValue").getValue(); //To get the New Bin Details //
			var oView = this.getView(); //TO the View Details //
			var oModel = oView.getModel(); //To get the Model data//
			var self = this;
			oModel.callFunction("/Check_new_bin", { // function import name //
				method: "GET", // http method //
				urlParameters: { //Parameters//
					"Lgnum": this.Lgnum, //Warehouse//
					"Nltyp": this.Nltyp, //Bin Type//
					"Nlpla": binValue //New Bin //
				}, // function import parameters
				success: function(oData, response) { //Success Function //
					// //Set Response Message and message Type to trigger message box
					// oGlobalModel.setProperty("/message", oRfData.rfMenu[0].Msgtext);
					// oGlobalModel.setProperty("/messageType", oRfData.rfMenu[0].Msgtyp);
					// // delegate error handling
					// errorHandling.register(oView.getApplication(), oView.getComponent());
					if (oData.Msgtyp === "E") { // Response Message Type //
						var errorMessage = oData.Msgtext; // Response Message Text //
						MessageBox.error( //MessageBox //
							errorMessage + ".");
					} else if (oData.Msgtyp === "S") { //Response Message Type //
						sap.ui.getCore().byId("newBinConfirm").setEnabled(true); //Response Message Text //
						errorMessage = oData.Msgtext; //Message Test //
						MessageBox.success( //MessageBox// 
							errorMessage + ".");
					}
				}, // callback function for success
				error: function(oError) {}
			}); // callback function for error
		},
		// ********** Srini code for new bin check begins ****************

		// *********** Srini code for new bin change begins ***********
		onNewBinConfirm: function() {
			var newDbin = sap.ui.getCore().byId("newBinValue").getValue();
			this.oNewBin = "";
			if (this.oldBin === "") {
				this.oldBin = this.modelObjects.Nlpla;
			}
			if (this.oldBin !== newDbin) {
				this.oNewBin = "X";
			}
			this.modelObjects.Nlpla = newDbin;
			var sValInd = "newBin";
			var destActa = "",
				destDifa = "",
				destTarget = "";
			this._updateTable(destActa, destDifa, destTarget, sValInd, newDbin);
			this._newBin.close();
		},
		onNewBinCancel: function() {
			this._newBin.close();
		},
		// *********** Srini code for new bin change ends ***********

		// *************** Srini cod eto update table begins **************
		_updateTable: function(destTarget, destActa, destDifa, sProperty, sValue) {
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
			if (!this._difference) {
				var MenuModel = this.getFragmentControllerModel();
				var difference = MenuModel.getProperty("/difference");
				this._difference = sap.ui.xmlfragment(difference, this);
			}
			this._difference.close();
		},
		// ********************** Srini code to update table ends ********************
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