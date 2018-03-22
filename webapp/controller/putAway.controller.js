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
		// ================================================================================
		// This method is called first and is executed first in the controller's lifecycle
		// ================================================================================
		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter(); // calling the router initialization function
					this.seti18nModel(this); // to set the resource bundle properties for the view
					this.inputDetails(); // to get input details from the view
					this.setPageTitle(); // to set page title for the view
					this.gssCallBreadcrumbs().getMainBreadCrumb(this); // to call the breadcrumbs for the view
					if (this.getGlobalModel().getProperty("/parentScreen")) { // to get parent screen properties from Global model
						this.getView().byId("inputValue").setValue(this.getGlobalModel().getProperty("/currentDelNo")); // to set input value to global model property
						this.getView().byId("inputValue").setEnabled(false);
						this.getView().byId("back").setVisible(true);
						this.iGetInput(); // odata function call to get backend response
					} else {
						this.getView().byId("inputValue").setValue("");
						this.getView().byId("inputValue").setEnabled(true);
						this.getView().byId("back").setVisible(false);
					}
				}.bind(this)
			});
			this._router = this.getRouter();
			this.seti18nModel(this);
			this.inputDetails();
			this.setFragment();
		},

		// ==========================================
		// method call to bind fragment to that view
		// ==========================================
		setFragment: function() {
			var viewId = this.getView().getId(); // to get the id of the view
			this.getGlobalModel().setProperty("/viewId", viewId); // to set the view id to the corresponding global model property
			var loadFragment = this.gssFragmentsFunction().loadFragment(this, "newBin"); // to load fragments
			this.fragmentNewBinLoaded = sap.ui.xmlfragment(viewId + "newBin", loadFragment, this); // to set id to the fragment
			this.getView().addDependent(this.fragmentNewBinLoaded); // to add the loaded fragment to the view

			var callFragment = this.gssFragmentsFunction().loadFragment(this, "difference"); // to load fragments
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "diff", callFragment, this); // to set id to the fragment
			this.getView().addDependent(this.fragmentLoaded); // to add the loaded fragment to the view
			
			var loadMsgPopFragment = this.gssFragmentsFunction().loadFragment(this, "msgPopOver");
			this.msgFragmentLoaded = sap.ui.xmlfragment(viewId + "msgPop", loadMsgPopFragment, this);
			this.getView().addDependent(this.msgFragmentLoaded);
		},

		// ================================================================
		// method to get current screen model & resource bundle properties
		// ================================================================
		inputDetails: function() {
			var Screen = this.getCurrentScrn(); // function call to get current screen value
			var ScreenModel = this.getScreenModel(Screen); // function call to get model set to current screen
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(ScreenModel.placeHolderLabel); // to set resource bundle properties
			this.getView().byId("inputValue").setPlaceholder(Text); // to set placeholder to input field
			this.getView().byId("inputValue").setMaxLength(10); // to set length for input field
		},

		// =======================================================
		// method to get input field value and perform odata call
		// =======================================================
		iGetInput: function(oEvent) {
			var _inputValue = this.getView().byId("inputValue").getValue(); // to get input field value 
			if (_inputValue) {
				var whenOdataCall = this.callOdataService().getMaterial(this, _inputValue); // odata function call with input field to get response from backend
				whenOdataCall.done(function() {
					this.getView().byId("toTable").setVisible(true);
					utilities.bindMessagePop(this, "");
				}.bind(this));
			}
		},

		// ============================================
		// method to pass barocde value to input field
		// ============================================
		onHandleScanInput: function() {
			utilities.barcodeReader(this, "inputValue", ""); // function call to set barcode value to input field
			this.iGetInput();
		},
		
		// ====================================
		// method to display response messages
		// ====================================
		handleMessagePopoverPress: function(oEvent) {
			if (!this.msgFragmentLoaded) {
				this.setFragment();
			}
			this.msgFragmentLoaded.openBy(oEvent.getSource());
		},

		// =================================================================
		// method to confirm materials from table and display response text
		// =================================================================
		putAwayConfirm: function() {
			var tableRowSelectedItems = utilities.selectedItems(this, "toTable"); // function call to get selected items from table
			var whenOdataCall = this.callOdataService().confirmItems(this, tableRowSelectedItems, "toTable"); // function call to confirm the selected items
			whenOdataCall.done(function() {
			MessageToast.show(this.geti18n(this.getUpdateToast())); // to display success message from odata response
			utilities.bindMessagePop(this, "");
			}.bind(this));
		},
		
		// ===================================================================
		// method to change difference quantities for selected items in table
		// ===================================================================
		onHandleDifference: function() {
			var items = utilities.selectedItems(this, "toTable"); // function call to get selected items from table
			if (items.length === 1) {
				var objects = utilities.getObjects(this), // function call to get object details
					oItem = objects.getProperty(); // function call to get properties of the objects
				if (oItem.Tapos !== this._item) {
					var newItemSelected = "X";
					this._item = oItem.Tapos;
				}
				var oItemList = this.gssDifferenceFunction().setDiffModel(oItem, this.fragmentLoaded); // function to set data to difference fragment
				var oModel = new JSONModel(oItemList);
				this.fragmentLoaded.setModel(oModel, "handleDiff"); // set model to loaded fragment
				this.fragmentLoaded.open(); // to open initialised fragment
			} else if (items.length === 0) {
				MessageToast.show(this.geti18n("toastItemSel"));
			} else if (items.length > 1) {
				MessageToast.show(this.geti18n("toastSelMat"));
			}
		},

		// ======================================================
		// method to calculate difference values in the fragment
		// ======================================================
		onHandleActual: function(oEvent) {
			var actualVal = oEvent.getParameter("newValue"); // get parameter details of the selected row
			var objects = utilities.getObjects(this); // function call to get object details 
			this.modelObjects = objects.getProperty(); // function call to get properties of the objects
			this.gssDifferenceFunction().diffCalculation(actualVal, this.modelObjects.DestTarga, this.fragmentLoaded, this.getView().getId() + "diff"); // function call to calculate data for difference fragment
		},

		// ===================================================================
		// method to confirm the differernce value and update values to table
		// ===================================================================
		onDiffConfirm: function() {
			var destActa = this.fragmentLoaded.getModel("handleDiff").getData().destActa, // get particular field property from fragment model
				destDifa = this.fragmentLoaded.getModel("handleDiff").getData().destDifa, // get particular field property from fragment model
				destTarget = this.fragmentLoaded.getModel("handleDiff").getData().destTarget; // get particular field property from fragment model
			this.destDifa = "X";
			var sValInd = "DestTarga";
			this._updateTable(destActa, destDifa, destTarget, sValInd); //function call to display updated value to table
		},

		// ===============================================
		// method to close the opened difference fragment
		// ===============================================
		onDiffCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded); // function call to close the loaded fragment
		},

		// ===============================================================
		// method to update the calculated difference values to the table
		// ===============================================================
		_updateTable: function(destActa, destDifa, destTarget, sProperty, sValue) {
			var aItems = this.getView().byId("toTable").getModel("materialList").getData().aItems; // to get line item details from model
			aItems.forEach(function(oLineData) { // looping through line item
				if (oLineData.Tapos === this.modelObjects.Tapos && // line item value comparison
					oLineData.Tanum === this.modelObjects.Tanum) { // line item value comparison
					if (sProperty === "DestTarga") {
						var destActual = parseFloat(destActa); //initialising value to variable
						var destActualStr = destActual.toFixed(3); // value with round off to 3 decimal places
						oLineData.DestActa = destActualStr.toString(); // convert value to string
						oLineData.DestQuantity = destActa;
						oLineData.DestDifa = destDifa.toString(); // convert value to string
						oLineData.DestTarga = destTarget;
					} else if (sProperty === "newBin") {
						oLineData.Nlpla = sValue;
					}
				}
			}.bind(this));
			var aData = this.getView().byId("toTable").getModel("materialList").getData(); // to get data from model bound to table
			aData.aItems = aItems;
			this.getView().byId("toTable").getModel("materialList").setData(aData); // binding new data to the model & table control
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded); // close the loaded fragment
		},

		// ========================================================
		// method to provide new bin values for stocking materials
		// ========================================================
		onHandleNewBin: function() {
			var objects = utilities.getObjects(this); // function call to get objects 
			this.modelObjects = objects.getProperty(); // function call to get property details from object
			var DestBinChg = this.modelObjects.DestBinChg; // get specific field value from model objects
			if (this.getView().byId("toTable").getSelectedItems().length === 1 && DestBinChg === "1") {
				this.getModel("globalProperties").setProperty("/currentNltyp", this.modelObjects.Nltyp); // set property to global model properties
				this.Nltyp = this.modelObjects.Nltyp;
				this.getModel("globalProperties").setProperty("/currentLgnum", this.modelObjects.Lgnum); // set property to global model properties
				var Lgnum = this.modelObjects.Lgnum;
				//Fragment code is Move to onInit function
				this.fragmentNewBinLoaded.open();
				var newBinData = {
					matDesc: this.modelObjects.Maktx,
					newBin: ""
				};
				var oModel = new JSONModel();
				oModel.setData(newBinData); // set new data to model
				this.fragmentNewBinLoaded.setModel(oModel, "Bin"); // set model to loaded fragment
			} else if (this.getView().byId("toTable").getSelectedItems().length === 0) {
				MessageToast.show(this.geti18n("toastItemSel"));
			} else if (this.getView().byId("toTable").getSelectedItems().length > 1) {
				MessageToast.show(this.geti18n("toastSelTar"));
			} else {
				MessageToast.show(this.geti18n("toastSelNp"));
			}
		},

		// =================================================
		// method to check whether given bin value is valid
		// =================================================
		onHandleCheck: function() {
			var binValue = sap.ui.core.Fragment.byId(this.getView().getId() + "newBin", "newBinValue").getValue(), //To get the New Bin Details //
				oGlobalModel = this.getModel("globalProperties"); // function call to get global model properties
			oGlobalModel.setProperty("/currentNltyp", this.Nltyp); 
			var oWhenCallReadIsDone;
			var sParentTcode = this.getGlobalModel().getProperty("/currentScreen");
			if (binValue) {
				this.getGlobalModel().setProperty("/currentScreen", "LM111");
				oWhenCallReadIsDone = this.callOdataService().checkNewBin(this, binValue); // odata function call to check new bin value
				oWhenCallReadIsDone.done(function() {
					utilities.bindMessagePop(this, "");
					if (oGlobalModel.getProperty("/messageType") === "S") {
						sap.ui.core.Fragment.byId(this.getView().getId() + "newBin", "newBinConfirm").setEnabled(true); //Response Message Text //
						var errorMessage = oGlobalModel.getProperty("/message"); //Message Test //
						MessageBox.success( //MessageBox// 
							errorMessage + ".");
					}
					this.getGlobalModel().setProperty("/currentScreen", sParentTcode);
				}.bind(this));
			} else {
				MessageBox.information(this.geti18n("toastBinEmp"));
			}
		},

		// =========================================================
		// method to confirm the new bin value and display in table
		// =========================================================
		onNewBinConfirm: function() {
			var newDbin = sap.ui.core.Fragment.byId(this.getView().getId() + "newBin", "newBinValue").getValue(); // get field value from fragment
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
			this._updateTable(destActa, destDifa, destTarget, sValInd, newDbin); // to pass parameters to update table data
			this.gssFragmentsFunction().closeFragment(this.fragmentNewBinLoaded); // function call to close the loaded fragment
		},
		
		// ===================================================
		// method to get selected item details from the table
		// ===================================================
		onHandleSelection: function() {
			this.getModel("globalProperties").setProperty("/controlId", "toTable");
			var objects = utilities.getObjects(this); // function call to get object data from table
		},

		// ============================================
		// method to clode the opened new bin fragment
		// ============================================
		onNewBinCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentNewBinLoaded); // function call to close fragment
		},

		// ============================================================
		// method to destroy all the fragments initialised in the view
		// ============================================================
		onExit: function() {
			if (this.fragmentLoaded) {
				this.fragmentLoaded.destroy(true); // function call to destroy the fragment loaded in the view
			}
		}

	});

});