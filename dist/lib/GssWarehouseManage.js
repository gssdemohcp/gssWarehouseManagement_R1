sap.ui.define(["sap/ui/core/mvc/Controller",
	"gss/newWarehouseManage_R1/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"gss/newWarehouseManage_R1/model/utilities",
	"gss/newWarehouseManage_R1/controller/errorHandling",
	"gss/newWarehouseManage_R1/lib/ODataModelInterface",
	"sap/m/MessageToast"

], function(Controller, BaseController, JSONModel, MessageBox, utilities, errorHandling, ODataModelInterface, MessageToast) {
	"use strict";

	return BaseController.extend("gss.newWarehouseManage_R1.lib.GssWarehouseManage", {
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

			this._ODataModelInterface = new ODataModelInterface(this);

		},

		checkNewBin: function(oView, sInputValue) {
			var promise = jQuery.Deferred();
			var oFilterFields = oView.getFilterFields();
			oFilterFields.Nlpla = sInputValue;
			oFilterFields.Nltyp = oView.getGlobalModel().getProperty("/currentNltyp");
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");

			var oWhenCallReadIsDone = this._ODataModelInterface.filterModelPopulate(oView, "");
			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oRfData) {
				promise.resolve(oRfData);
			}.bind(this));

			return promise;

		},

		loadMenuConfiguration: function(oView) {
			var promise = jQuery.Deferred(),
				pQueue = "",
				pLgnum = "";

			var oWhenCallReadIsDone = this._ODataModelInterface.filterModelPopulate(oView);

			//Handle response from oData Call
			oWhenCallReadIsDone.done(function(oRfModel) {
				//code start - selvan
				//capture queue number for filter option
				var aRfMenu = oRfModel.getData().aItems;
				aRfMenu.forEach(function(oRfMenu) {
					if (oRfMenu.Queue && oRfMenu.Lgnum) {
						pQueue = oRfMenu.Queue;
						pLgnum = oRfMenu.Lgnum;
					}
				}.bind(this));
				var oGlobalModel = oView.getModel("globalProperties");
				oGlobalModel.setProperty("/currentQueue", pQueue);
				oGlobalModel.setProperty("/currentLgnum", pLgnum);
				//code end -selvan

				promise.resolve();

			}.bind(this));

			return promise;
		},

		getMaterial: function(oView, sInputValue) {
			var promise = jQuery.Deferred();
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}

			oFilterFields.Queue = oView.getGlobalModel().getProperty("/currentQueue");
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");

			var whenOdataCall = this._ODataModelInterface.filterModelPopulate(oView, "");
			whenOdataCall.done(function(oResult) {
				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},
		grKeyFields: function(oView, sInputValue, shipInd) {
			var promise = jQuery.Deferred();
			var oKeyFields = oView.getKeyFields();
			var property = "";
			var _inpVal = 0;
			for (property in oKeyFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oKeyFields).length; i++) {
				oKeyFields[_inpVal] = sInputValue;
			}
			if (shipInd) {
				oKeyFields.ShipInd = shipInd;
			}

			oKeyFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");

			var whenOdataCall = this._ODataModelInterface.keyFieldModelPopulate(oView);
			whenOdataCall.done(function(oResult) {
				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},
		grPackKeyFields: function(oView, sInputValue, huVal) {
			var promise = jQuery.Deferred();
			var oKeyFields = oView.getKeyFields();
			var property = "";
			var _inpVal = 0;
			for (property in oKeyFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oKeyFields).length; i++) {
				oKeyFields[_inpVal] = sInputValue;
			}

			if (huVal) {
				oKeyFields.Exidv = huVal;
				oKeyFields.ShipInd = oView.getGlobalModel().getProperty("/shipInd");
			}
			if (!oView.getGlobalModel().getProperty("/parentScreen")) {
				oKeyFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			}

			var whenOdataCall = this._ODataModelInterface.keyFieldModelPopulate(oView);
			whenOdataCall.done(function(oResult) {
				promise.resolve(oResult);
			}.bind(this));

			return promise;

		},

		getLoadInq: function(oView, sInputValue, shipInd, Vbeln) {
			var promise = jQuery.Deferred();
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}
			if (!shipInd) {

				oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			} else {
				oFilterFields.ShipInd = shipInd;
			}
			if (Vbeln) {
				oFilterFields.Vbeln = Vbeln;
			}
			var whenOdataCall = this._ODataModelInterface.filterModelPopulate(oView, "");
			whenOdataCall.done(function(oResult) {
				promise.resolve(oResult);
			}.bind(this));

			return promise;
		},

		materialSave: function(oView, mat, quant, unit, controlId, model) {
			var oWhenOdataUpdateDone;
			/*var oViewModel = new JSONModel();*/
			var promise = jQuery.Deferred();
			var oFilterFields = {};
			oFilterFields.Vbeln = oView.getGlobalModel().getProperty("/currentDelNo");
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			oFilterFields.Matnr = mat;
			oFilterFields.Lfimg = quant;
			oFilterFields.Vrkme = unit;

			oWhenOdataUpdateDone = this._ODataModelInterface.filterModelPopulate(oView, oFilterFields);
			oWhenOdataUpdateDone.done(function(oResult) {
				promise.resolve(oResult);
			}.bind(this));
			return promise;

		},
		huSave: function(oView, hu, controlId, model) {
			var oWhenOdataUpdateDone;
			var oViewModel = new JSONModel();
			var promise = jQuery.Deferred();
			var oFilterFields;
			oFilterFields.Vbeln = oView.getGlobalModel().getProperty("/currentDelNo");
			oFilterFields.Exidv = oView.getGlobalModel().getProperty("/currentHuVal");
			oFilterFields.Unvel = hu;

			oWhenOdataUpdateDone = this._ODataModelInterface.filterModelPopulate(oView, oFilterFields);
			oWhenOdataUpdateDone.done(function(oResult) {
				var viewData = this.getView().byId(controlId).getModel(model).getData();
				for (var i = 0; i < oResult.length; i++) {
					viewData.aItems.push(oResult.results[i]);
				}
				oViewModel.setData(viewData);
				this.getView().byId(controlId).setModel(oViewModel, model);
				promise.resolve(oResult);
			}.bind(this));
			return promise;

		},

		LoadDetails: function(oView, sInputValue, huVal, procInd) {
			var oWhenOdataUpdateDone;
			var promise = jQuery.Deferred();
			//SET INPUT VALUE
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}
			oFilterFields.Exidv = huVal;
			oFilterFields.ProcInd = procInd;
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			oWhenOdataUpdateDone = this._ODataModelInterface.filterModelPopulate(oView, "");
			oWhenOdataUpdateDone.done(function(oResult) {
				promise.resolve(oResult);
			}.bind(this));
			return promise;
		},

		LoadUnloadKeyFields: function(oView, modelData, HuStatus, loadInd) {
			var oWhenOdataUpdateDone;
			var promise = jQuery.Deferred();
			var oKeyFields = oView.getKeyFields();
			oKeyFields.Vbeln = modelData.aItems[0].Vbeln;
			oKeyFields.Exidv = modelData.aItems[0].Exidv;
			oKeyFields.Exida = modelData.aItems[0].Exida;
			oKeyFields.Tknum = modelData.aItems[0].Tknum;
			oKeyFields.LoadInd = loadInd;
			oKeyFields.HuStatus = HuStatus;
			oKeyFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			oKeyFields.ProcInd = "";
			oWhenOdataUpdateDone = this._ODataModelInterface.keyFieldModelPopulate(oView);
			oWhenOdataUpdateDone.done(function(oResult) {
				promise.resolve(oResult);
			}.bind(this));
			return promise;
		},

		UnloadDetails: function(oView, sInputValue, huVal, procInd, loadInd) {
			var oWhenOdataUpdateDone;
			var promise = jQuery.Deferred();
			//SET INPUT VALUE
			var oFilterFields = oView.getFilterFields();
			var property = "";
			var _inpVal = 0;
			for (property in oFilterFields) {
				_inpVal = property;
				break;
			}
			for (var i = 0; i < Object.keys(oFilterFields).length; i++) {
				oFilterFields[_inpVal] = sInputValue;
			}
			oFilterFields.Exidv = huVal;
			oFilterFields.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			oFilterFields.ProcInd = procInd;
			oFilterFields.LoadInd = loadInd;

			oWhenOdataUpdateDone = this._ODataModelInterface.filterModelPopulate(oView, "");
			oWhenOdataUpdateDone.done(function(oResult) {
				promise.resolve(oResult);
			}.bind(this));
			return promise;
		},

		confirmItems: function(oView, oSelectItems, controlId) {
			var oWhenOdataUpdateDone;
			var promise = jQuery.Deferred();
			var activeModel = oView.getModelName();
			var oKeyFields = oView.getKeyFields();

			oSelectItems.forEach(function(mItem) {
				var updateItem = mItem.getBindingContext(activeModel).getObject();
				oKeyFields.Queue = updateItem.Queue;
				oKeyFields.Lgnum = updateItem.Lgnum;
				oKeyFields.Tanum = updateItem.Tanum;
				oKeyFields.Tapos = updateItem.Tapos;
				oWhenOdataUpdateDone = this._ODataModelInterface.keyFieldModelUpdate(oView, updateItem);
				oWhenOdataUpdateDone.done(function(oRfModel) {
					var oNewModel = oView.byId(controlId).getModel(activeModel).getData().aItems;
					var oStatText = {
						stat: "",
						text: "",
						mItems: ""
					};
					this.aTotStat = [];
					this.errorOccured = "";
					// this.aFilter = [];
					this.finalItem = updateItem.Tanum;
					this.finalPos = updateItem.Tapos;
					// MessageToast.show("Transfer Order confirmed successfully");
					oStatText.stat = oView.getGlobalModel().getProperty("/messageType");
					oStatText.mItems = updateItem;
					this.aTotStat.push(oStatText);
					//Check the filter message
					this.currentItem = updateItem.Tanum;
					this.currentPos = updateItem.Tapos;
					var oStatMessage = {
						Msgtext: '',
						Msgtyp: ''
					};
					this.aTotStat.forEach(function(oStat) {
						oStatMessage = {
							Msgtext: '',
							Msgtyp: ''
						};
						if (oStat.stat === "E") {
							// var errText = {
							oStatMessage.Msgtext = oStat.mItems.Matnr + " " + oRfModel.getData().aItems[0].statusText;
							oStatMessage.Msgtyp = "Error";
							// };
							if (this.itemNo) {
								var aItems = this.getView().byId(controlId).getemSelectedItems();
								aItems.forEach(function(mItem) {
									var selectedItem = mItem.getBindingContext(activeModel).getObject();
									var response = "";
									var responseText = "";
									if (oRfModel.getData().aItems[0].responseText[0] === "{") {
										response = JSON.parse(oRfModel.getData().aItems[0].responseText).error.message.value;
										if (response[0] === "~") {
											var aResponse = response.split("~");
											MessageBox.error(
												aResponse[2] + " " + aResponse[3]
											);
											delete this.itemNo;
											delete this.matnr;
											this.itemNo = aResponse[1];
											this.matnr = aResponse[2];
											responseText = aResponse[2] + " " + aResponse[3];
											oStatText.text = responseText;
										}
									}
									if (selectedItem.Tapos < this.itemNo) {
										oStatMessage = {
											Msgtext: '',
											Msgtyp: ''
										};
										oStatMessage.Msgtext = "Material" + " " + selectedItem.Matnr + " " + "Confirmed Successfully";
										oStatMessage.Msgtyp = "Success";
									}
								}.bind(this));
								oStatMessage = {
									Msgtext: '',
									Msgtyp: ''
								};
								oStatMessage.Msgtext = "Material" + " " + oStat.text;
								oStatMessage.Msgtyp = "Error";
								oView.getGlobalModel().setProperty("/message",oStatMessage.Msgtext);
								oView.getGlobalModel().setProperty("/messageType",oStatMessage.Msgtyp);
								utilities.bindMessagePop(oView, oStatMessage);

							}
						} else if (oStat.stat === "S") {
							// var successText = {
							if (oStat.text === "") {
								oStat.text = "Confirmed successfully";
							}
							oStatMessage.Msgtext = "Material" + " " + oStat.mItems.Matnr + " " + oStat.text;
							oStatMessage.Msgtyp = "Success";
							if (this.finalPos === this.currentPos) {
								oView.getGlobalModel().setProperty("/message",oStatMessage.Msgtext);
								oView.getGlobalModel().setProperty("/messageType",oStatMessage.Msgtyp);
								utilities.bindMessagePop(oView, oStatMessage);
							}

						}

					}.bind(this));

					var index;
					for (var i = 0; i < oNewModel.length; i++) {
						if (oNewModel[i].Tanum === this.currentItem && oNewModel[i].Tapos === this.currentPos) {
							index = i;
							break;
						}
					}
					oNewModel.splice(index, 1);
					var oJSONModel = new JSONModel();
					oJSONModel.setData({
						aItems: oNewModel
					});
					oView.setModel(oJSONModel, activeModel);
					var tabLen = oView.byId(controlId).getItems().length;
					if (tabLen === 0) {
						if (oView.getGlobalModel().getProperty("/parentScreen")) {
							sap.ui.getCore().byId(oView.getGlobalModel().getProperty("/viewCid") + "--TOEx").setVisible(false);
							sap.ui.getCore().byId(oView.getGlobalModel().getProperty("/viewCid") + "--post").setVisible(true);

							oView.onNavBack();
						}
					}
					promise.resolve(oRfModel);
				});
			}.bind(this));
			return promise;

		},
		acceptItems: function(oView, oSelectItems, controlId, shipInd) {
			var oWhenOdataUpdateDone;
			var promise = jQuery.Deferred();
			var activeModel = oView.getModelName();

			oSelectItems.forEach(function(mItem) {
				var updateItem = mItem.getBindingContext(activeModel).getObject();
				updateItem.ShipInd = shipInd;
				updateItem.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
				updateItem.Exidv = oView.getGlobalModel().getProperty("/currentHuVal");
				oWhenOdataUpdateDone = this._ODataModelInterface.keyFieldModelUpdate(oView, updateItem);
				oWhenOdataUpdateDone.done(function(oRfModel) {
					var oStatMessage = {
						Msgtext: oView.getGlobalModel().getProperty("/message"),
						Msgtyp: oView.getGlobalModel().getProperty("/messageType")
					};
					utilities.bindMessagePop(oView, oStatMessage);
					var oNewModel = oView.byId(controlId).getModel(activeModel).getData().aItems;
					var index;
					for (var i = 0; i < oNewModel.length; i++) {
						if (oNewModel[i].Matnr === oNewModel[i].Matnr) {
							index = i;
							break;
						}
					}
					if (shipInd === "U") {
						oNewModel.splice(index, 1);
					}
					var oJSONModel = new JSONModel();
					oJSONModel.setData({
						aItems: oNewModel
					});
					oView.setModel(oJSONModel, activeModel);
					promise.resolve(oRfModel);
					utilities.removeItems(oView, controlId);

				});
			}.bind(this));
			return promise;

		},
		onSaveItems: function(oView, oSelectItems, controlId, shipInd) {
			var oWhenOdataUpdateDone;
			var promise = jQuery.Deferred();
			var activeModel = oView.getModelName();
			oSelectItems.forEach(function(mItems) {
				var updateItem = mItems.getBindingContext(activeModel).getObject();
				updateItem.ShipInd = shipInd;
				updateItem.Vbeln = oView.getGlobalModel().getProperty("/currentDelNo");
				updateItem.Lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
				oWhenOdataUpdateDone = this._ODataModelInterface.keyFieldModelUpdate(oView, updateItem);
				oWhenOdataUpdateDone.done(function(oResult) {
					promise.resolve(oResult);
					utilities.bindMessagePop(oView, "");
					utilities.removeItems(oView, controlId);
					

				}.bind(this));

			}.bind(this));
			return promise;

		},
		giShipUpdate: function(oView, startDate, endDate, startTime, endTime, tkNum) {
			var oWhenOdataUpdateDone;
			var promise = jQuery.Deferred();
			var oEntry = {};
			var oKeyFields = oView.getKeyFields();
			oKeyFields.Vbeln = "";
			oKeyFields.Lgnum = "";
			oKeyFields.ShipInd = "";
			oEntry.StartDate = startDate;
			oEntry.StartTime = startTime;
			oEntry.EndDate = endDate;
			oEntry.EndTime = endTime;
			oEntry.Tknum = tkNum;
			oWhenOdataUpdateDone = this._ODataModelInterface.keyFieldModelUpdate(oView, oEntry);
			oWhenOdataUpdateDone.done(function(oResult) {
				promise.resolve(oResult);
				oView.onNavBack();
			}.bind(this));
			return promise;

		},
		handleShipTO: function(oView, controlId, model, shipInd) {
			var promise = jQuery.Deferred();
			var vbeln = oView.byId(controlId).getSelectedItem().getBindingContext(model).getObject().Vbeln;
			var lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			var objects = {
				"Vbeln": vbeln,
				"Lgnum": lgnum,
				"ShipInd": shipInd
			};
			var oWhenCallCreateIsDone = this._ODataModelInterface.keyFieldModelCreate(oView, objects);
			oWhenCallCreateIsDone.done(function(oResult) {
				if (shipInd === "T") {
					var shipTabModel = oView.byId(controlId).getModel(model).getData().aItems;
					shipTabModel.forEach(function(shItems) {
						if (vbeln === shItems.Vbeln) {
							shItems.ToInd = "X";
							var data = oView.getModelData(oView.getModelName());
							data.aItems[0].ToInd = "X";
							oView.getModel(oView.getModelName()).setData(data);
						}
					}.bind(this));
					oView.checkInd(shipTabModel, "false");
					
				} else {
					oView.gssFragmentsFunction().fragmentFalse(oView, "S");
					utilities.bindMessagePop(oView, "");

				}
				promise.resolve(oResult);
			}.bind(this));
			return promise;

		},
		handleDelTO: function(oView, controlId, model, shipInd) {
			var promise = jQuery.Deferred();
			var vbeln = oView.getGlobalModel().getProperty("/currentDelNo");
			var lgnum = oView.getGlobalModel().getProperty("/currentLgnum");
			var objects = {
				"Vbeln": vbeln,
				"Lgnum": lgnum,
				"ShipInd": shipInd
			};
			var oWhenCallCreateIsDone = this._ODataModelInterface.keyFieldModelCreate(oView, objects);
			oWhenCallCreateIsDone.done(function(oResult) {
				if (shipInd === "T") {
					var GIDelData = oView.byId(controlId).getModel(model).getData().aItems;
					GIDelData.ToInd = "X";
					var data = oView.getModelData(oView.getModelName());
					data.aItems[0].ToInd = "X";
					oView.getModel(oView.getModelName()).setData(data);
					oView.checkInd(GIDelData, "false");
				} else {
					oView.gssFragmentsFunction().fragmentFalse(oView, "S");
					utilities.bindMessagePop(oView, "");

				}
				promise.resolve(oResult);
			}.bind(this));

			return promise;

		}
	});
});