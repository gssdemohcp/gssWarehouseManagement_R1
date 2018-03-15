sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/resource/ResourceModel",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"gss/newWarehouseManage_R1/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"gss/newWarehouseManage_R1/model/utilities"
], function(Controller, ResourceModel, BaseController, formatter, JSONModel, MessageToast, utilities) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.controller.grShipItems", {
		formatter: formatter,

		onInit: function() {
			this.getView().addEventDelegate({
				onBeforeShow: function(evt) {
					this._router = this.getRouter();
					this.seti18nModel();
					this.inputDetails();
					this.titleSet();
					this.gssCallBreadcrumbs().getMainBreadCrumb(this);
					if (this.getGlobalModel().getProperty("/parentScreen")) {
						this.getView().byId("back").setVisible(true);
					}
					this.iGetInput();
				}.bind(this)
			});

			this._router = this.getRouter();
			this.seti18nModel();
			this.inputDetails();
			this.setFragment();
		},
		setFragment: function() {
			var viewId = this.getView().getId();
			this.getGlobalModel().setProperty("/viewId", viewId);
			var callFragment = this.gssFragmentsFunction().loadFragment(this, "difference");
			this.fragmentLoaded = sap.ui.xmlfragment(viewId + "diff", callFragment, this);
		},

		seti18nModel: function() {
			// set i18n model on view
			var i18nModel = new ResourceModel({
				bundleName: "gss.newWarehouseManage_R1.i18n.i18n"
			});
			this.getView().setModel(i18nModel, "i18n");
		},
		inputDetails: function() {
			var Screen = this.getCurrentScrn();
			var ScreenModel = this.getScreenModel(Screen);
			var Text = this.getView().getModel("i18n").getResourceBundle().getText(ScreenModel.placeHolderLabel);
			this.getView().byId("title").setTitle(this.getGlobalModel().getProperty("/title"));
			this.getView().byId("inputValue").setPlaceholder(Text);
			this.getView().byId("inputValue").setMaxLength(10);

		},
		onHandleDifference: function() {
			// for the putaway diff process
			//OLD CODE var items = this.gssCallFunction().selectedItems(this, "toTable");
			var items = utilities.selectedItems(this, "table");

			if (items.length === 1) {
				//fragment code is Moved to OnInit 
				var objects = utilities.getItems(this, "table", "itemList"),
					oItem = objects.getProperty();
				if (oItem.Posnr !== this._item) {
					var newItemSelected = "X";
					this._item = oItem.Posnr;
				}
				var oItemList = this.gssDifferenceFunction().setShipItemsDiffModel(oItem, this.fragmentLoaded);
				var oModel = new JSONModel(oItemList);
				this.fragmentLoaded.setModel(oModel, "handleDiff");
				this.fragmentLoaded.open();
			} else if (items.length === 0) {
				MessageToast.show(this.geti18n("toastItemSel"));
			} else if (items.length > 1) {
				MessageToast.show(this.geti18n("toastSelMat"));
			}
		},

		onHandleSelection: function() {
			this._selectedItem = utilities.selectedItems(this, "table");
		},

		onHandleActual: function(oEvent) {
			var actualVal = oEvent.getParameter("newValue");
			var objects = utilities.getItems(this, "table", "itemList");
			this.modelObjects = objects.getProperty();
			this.gssDifferenceFunction().diffShipCalculation(actualVal, this.modelObjects.TargQty, this.fragmentLoaded, this.getGlobalModel().getProperty(
				"/viewId") + "diff");
		},
		onDiffConfirm: function() {
			var destTarget = this.fragmentLoaded.getModel("handleDiff").getData().destTarget;
			var destActa = sap.ui.core.Fragment.byId(this.getView().getId() + "diff", "actual").getValue();
			var differenceVal = destTarget - destActa;
			var destDifa = differenceVal;
			this.destDifa = "X";
			var sValInd = "Lfimg";
			this._updateTable(destActa, destDifa, destTarget, sValInd);
		},

		onDiffCancel: function() {
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		_updateTable: function(destActa, destDifa, destTarget, sProperty, sValue) {
			// for the GR diff process
			var aItems = this.getView().byId("table").getModel("itemList").getData().aItems;
			aItems.forEach(function(oLineData) {
				var selectItemVal = this.getView().byId("table").getSelectedItem().getBindingContext("itemList").getObject().Posnr;
				this.selectVal = selectItemVal;
				if (oLineData.Posnr === selectItemVal) {
					if (sProperty === "Lfimg") {
						oLineData.Lfimg = destActa;
					}
				}
			}.bind(this));
			var aData = this.getView().byId("table").getModel("itemList").getData();
			aData.aItems = aItems;
			this.getView().byId("table").getModel("itemList").setData(aData);
			this.gssFragmentsFunction().closeFragment(this.fragmentLoaded);
		},
		onHandleScanInput: function(oEvent) {
			utilities.barcodeReader(this, "inputValue","");
			this.iGetInput();
		},

		iGetInput: function(oEvent) {

			var _inputValue = this.getGlobalModel().getProperty("/currentDelNo");
			this.getView().byId("inputValue").setValue(_inputValue);
			this.getView().byId("inputValue").setEnabled(false);

			this.callOdataService().getLoadInq(this, _inputValue, "", "");

		},
		onHandleSave: function() {
			var whenOdataCall = this.callOdataService().onSaveItems(this, this._selectedItem, "table", "I");
			whenOdataCall.done(function() {
				MessageToast.show(this.geti18n(this.getUpdateToast()));
			}.bind(this));
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf gss.newWarehouseManage_R1.view.grItems
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf gss.newWarehouseManage_R1.view.grItems
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf gss.newWarehouseManage_R1.view.grItems
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf gss.newWarehouseManage_R1.view.grItems
		 */
		//	onExit: function() {
		//
		//	}

	});

});