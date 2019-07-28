sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"com/legstate/fts/app/FlightAcceptanceCockpit/vendor/lodash.min",
	"../constants/Constants",
	"com/legstate/fts/app/FlightAcceptanceCockpit/dialog/BusyDialogController",
	"sap/m/MessageBox"
], function (Controller, BaseController, JSONModel, lodash, Constants, BusyDialog, MessageBox) {
	"use strict";

	return BaseController.extend("com.legstate.fts.app.FlightAcceptanceCockpit.controller.LobBase", {

		// ========================= Common Setup/Init =========================

		setupLobModel: function (sTitle, sLobType) {
			var oLobView = new JSONModel({
				infoPanelTitle: sTitle,
				lobType: sLobType,
				editMode: false,
				busy: false,
				delay: 0,
				entryIsLocked: false
			});

			this.setModel(oLobView, "lobView");
		},

		// ========================= End of Common Setup/Init =========================

		// ========================= Common Helpers =========================

		unbindData: function () {

			this._oTabBar.setSelectedKey(Constants.FlightSegmentType.ARRIVAL);

			var oServicesModel = this.getModel("flightServices");

			if (!oServicesModel) {
				return;
			}

			// clear the services table 
			oServicesModel.setData({
				allServices: [],
				currentServices: [],
				moreServices: []
			});
		},

		getLobModel: function () {
			return this.getModel("lobView");
		},

		handleRouteMatched: function (oEvent) {

			// make sure we unbind data in order to make sure
			// we always get the latest data 
			this.unbindData();

			// Get arguemnts and save them 
			this.oRouteArgs = oEvent.getParameter("arguments");

			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

			this.getModel().metadataLoaded().then(function () {

				var sObjectPath = this.getModel().createKey("FlightSegmentHeaderSet", {
					Preaufnr: this.oRouteArgs.arrFlightNo,
					Aufnr: this.oRouteArgs.depFlightNo
				});

				// bind the view 
				this.bindView("/" + sObjectPath);

				this.sObjectPath = sObjectPath;

				// Select last selected row
				this.getOwnerComponent().oListSelector.selectAListItem("/" + sObjectPath);

			}.bind(this));
		},

		bindView: function (sObjectPath) {
			// Should be override by child controller
		},

		getFlightNumberByDirection: function () {
			var sDirection = this._getDirection();
			if (sDirection === Constants.FlightSegmentType.ARRIVAL) {
				return this.oRouteArgs.arrFlightNo;
			} else {
				return this.oRouteArgs.depFlightNo;
			}
		},

		// ========================= End of Common Helpers =========================

		// ========================= Common Action Handlers =========================

		onEditPressed: function (oEvent) {

			// Get the flight number by the current selected direction
			// (Arrival or Departure)
			var sFlightNumber = this.getFlightNumberByDirection();

			if (!sFlightNumber) {
				return;
			}

			// Here we need to make a call to the service to enqueu this record
			// if the service call will succeed then we can go into edit mode
			var oDataModel = this.getModel();

			var self = this;

			var oDialog = new BusyDialog(null, "Enqueue...");
			oDialog.present(this.getView());

			oDataModel.callFunction("/EnqueueSegment", {
				method: "POST",
				urlParameters: {
					"FlightNumber": sFlightNumber
				},
				success: function (oData, response) {
					oDialog.dismiss();
					var result = oData.EnqueueSegment;
					if (oData.IsLocked === true) {
						self.getLobModel().setProperty("/entryIsLocked", true);
						// modify the lob view model that we're in edit mode
						self.getLobModel().setProperty("/editMode", true);
					} else {
						// present error message that we cannot enqueu this object
						MessageBox.alert(result.Error);
						self.getLobModel().setProperty("/entryIsLocked", false);
					}
				},
				error: function (oErr) {
					oDialog.dismiss();
					// Error handling here
				}
			});

		},

		onCancelEdit: function (oEvent) {
			// cancel edit mode
			this.getLobModel().setProperty("/editMode", false);
		},

		onServiceQuantityChanged: function (oEvent) {

			debugger;

			// get the parent row where this input field is located
			var oParent = oEvent.getSource().getParent();

			// get the binding path of this row 

		},

		// ========================= End of Common Action Handlers =========================

		// ========================= Flight Services =========================

		loadServices: function (sObjectPath) {

			var oDataModel = this.getModel();

			var self = this; // save context 

			// Get all services from the server 
			oDataModel.read(sObjectPath, {
				success: function (response, oData) {
					// handle the loaded services
					self.handleServicesLoaded(oData.data.results)

				},
				error: function (oError) {}
			});

			// var sFragmentId = null;
			// var sBindingPath = "";
			// var aFilters = [];

			// if (sSelectedTabKey === "ARR") {
			// 	sFragmentId = this.getView().createId("arrServices");
			// 	sBindingPath = sObjectPath + "/FlightSegmentItemSetAC";
			// 	var arrFilter = new Filter("Direction", sap.ui.model.FilterOperator.EQ, 1);
			// 	aFilters.push(arrFilter);
			// } else if (sSelectedTabKey === "DEP") {
			// 	sFragmentId = this.getView().createId("depServices");
			// 	sBindingPath = sObjectPath + "/FlightSegmentItemSetAC";
			// 	var depFilter = new Filter("Direction", sap.ui.model.FilterOperator.EQ, 2);
			// 	aFilters.push(depFilter);
			// }

			// var oServicesTable = sap.ui.core.Fragment.byId(sFragmentId, "servicesTable");

			// if (!this.oTemplate) {
			// 	this.oTemplate = oServicesTable.getItems()[0];
			// 	oServicesTable.removeAllItems();
			// }

			// if (!oServicesTable.getBinding("items")) {

			// 	var oViewModel = this.getModel("airportChargesView");

			// 	// bind the services table 
			// 	oServicesTable.bindAggregation("items", {
			// 		path: sBindingPath,
			// 		template: this.oTemplate,
			// 		filters: aFilters,
			// 		events: {
			// 			change: function (oEvent) {},
			// 			dataRequested: function (oEvent) {
			// 				oViewModel.setProperty("/busy", true);
			// 			},
			// 			dataReceived: function (oEvent) {
			// 				oViewModel.setProperty("/busy", false);
			// 			}
			// 		}
			// 	});
			// }
		},

		_getDirection: function () {
			return this._oTabBar.getSelectedKey();
		},

		/**
		 * 
		 * 
		 * */
		handleServicesLoaded: function (aServices) {

			// here we map all entry sheet services 
			// and routine services into a dedicated JSON model
			// current services are the services which currently displayed on the 
			// services table and these are actually the services that this LOB has
			// more services are services that can be added 
			var oServicesModel = new JSONModel({
				allServices: aServices, // all services from server 
				currentServices: [], // current services that will be displayed on table 
				moreServices: [], // more services that will be displayed on table 
				1: {
					currentServices: [], // current services for inbound flight
					moreServices: [], // more services for inbound flight
				},
				2: {
					currentServices: [], // current services for outbound flight 
					moreServices: [], // more services for outbound flight
				}
			});

			// set the flight services model
			// to render the data in the UI 
			this.setModel(oServicesModel, "flightServices");

			// map services for inbound and outbound flight 
			this.mapAndBindServices();

			this.renderServicesByDirection();

		},

		getServicesModel: function () {
			return this.getModel("flightServices");
		},

		renderServicesByDirection: function () {
			// copy the services from the relevant direction to displayed services 
			let nDirection = this._getDirection() === Constants.FlightSegmentType.ARRIVAL ? 1 : 2;
			var oServicesModel = this.getServicesModel();

			// We can do this because all model changes are done "by refrerence" so when
			// we will delete a service from the displayed services it will also be deleted 
			// from the inbound/outbound list 
			oServicesModel.setProperty("/currentServices", oServicesModel.getProperty("/" + nDirection + "/currentServices"));
			oServicesModel.setProperty("/moreServices", oServicesModel.getProperty("/" + nDirection + "/moreServices"));

			// refresh model to apply changes to the UI
			oServicesModel.refresh(true);
		},

		mapAndBindServices: function () {

			// make sure that the services has been loaded
			var oServicesModel = this.getModel("flightServices");

			if (!oServicesModel) {
				return;
			}

			var aServices = oServicesModel.getProperty("/allServices");

			// get all directions from services and map them into array 
			var aDirections = _.map(_.uniqBy(aServices, function (oSrv) {
				return oSrv.Direction;
			}), function (oSrv) {
				return oSrv.Direction;
			});

			// iterate on direction and collect all services per direction
			_.forEach(aDirections, function (nDirection) {

				let aEntrySheetServices = _.filter(aServices, function (s) {
					// TODO: request from Roy to replace it to Edm.Boolean
					return s.EssrExists === "X" && s.Direction === nDirection;
				});

				// if there are entry sheet services then 
				// set them as the current services and all other services 
				// will be the additional services 
				if (aEntrySheetServices.length > 0) {
					// filter all more services
					let aMoreServices = _.filter(aServices, function (s) {
						// TODO: request from Roy to replace it to Edm.Boolean
						return s.EssrExists !== "X" && s.Direction === nDirection;
					});

					oServicesModel.setProperty("/" + nDirection, {
						currentServices: aEntrySheetServices,
						moreServices: aMoreServices
					});

				} else {
					// if there are no entry sheet services we need to present 
					// the routine services and all other services will be 
					// additional services

					let aMoreServices = _.filter(aServices, function (s) {
						return s.AdditionalFlag === "X" && s.Direction === nDirection;
					});

					let aRoutineServices = _.filter(aServices, function (s) {
						return s.AdditionalFlag !== "X" && s.Direction === nDirection;
					});

					oServicesModel.setProperty("/" + nDirection, {
						currentServices: aEntrySheetServices,
						moreServices: aMoreServices
					});
				}

			});
		},

		/**
		 * Function that handle the remove of service from the current 
		 * services table. Removing service from the current services table 
		 * will transfer the deleted service to the more services table 
		 */
		onRemoveService: function (oEvent) {
			// get the parent row
			// because the click event captured on the table column 
			// the parent row will be the parent of the table column which is 
			// the one who capture the event 
			var oServiceRow = oEvent.getSource().getParent();

			// after we have the row we can simply get the item we want to transfer 
			// using the row binding path 
			var sBindingPath = oServiceRow.getBindingContextPath();

			var oServicesModel = this.getServicesModel();

			// take the service that needs to be removed from the current services 
			var oServiceToDelete = oServicesModel.getProperty(sBindingPath);

			// delete the service from the current services table 
			_.remove(oServicesModel.getData().currentServices, function (oSrv) {
				return oSrv.SrvcCode === oServiceToDelete.SrvcCode
			});

			// add the deleted service to the more services table 
			oServicesModel.getData().moreServices.push(oServiceToDelete);

			// refresh the model to apply changes in the UI
			oServicesModel.refresh(true);

		},

		onMoreServicesButtonPressed: function (oEvent) {
			if (!this._oMoreServicesDialog) {
				this._oMoreServicesDialog = sap.ui.xmlfragment("com.legstate.fts.app.FlightAcceptanceCockpit.fragments.MoreServices", this);
			}

			this.getView().addDependent(this._oMoreServicesDialog);

			this._oMoreServicesDialog.open();
		},

		onConfirmMoreServicesDialog: function (oEvent) {
			// get the selected items 
			var aSelectedItems = oEvent.getParameter("selectedItems");

			// if user did not select items then we can do nothing
			if (!aSelectedItems || aSelectedItems.length === 0) {
				return;
			}

			// extract the services that needs to be added from the services model
			// and then add them to the current services table 
			var oServicesModel = this.getModel("flightServices");
			var aServicesToRemove = [];

			for (var i = 0; i < aSelectedItems.length; i++) {
				var sServiceBindingPath = aSelectedItems[i].getBindingContextPath();
				// take the relevant service from the model 
				var oServiceToAdd = oServicesModel.getProperty(sServiceBindingPath);

				if (!oServiceToAdd) {

					continue;
				}

				// add the service to the current services (push to bottom)
				oServicesModel.getData().currentServices.push(oServiceToAdd);

				aServicesToRemove.push(oServiceToAdd);

				// _.remove(aMoreServices, function (oSrv) {
				// 	return oSrv.SrvcCode === oServiceToAdd.SrvcCode
				// });
			}

			// remove all selected services from the more services table
			_.remove(oServicesModel.getData().moreServices, function (oSrv) {
				return _.includes(aServicesToRemove, oSrv);
			});

			oServicesModel.refresh(true);

			// make sure to destroy dialog after finish
			this._oMoreServicesDialog.destroy();
			this._oMoreServicesDialog = null;
		},

		onCancelMoreServicesDialog: function (oEvent) {
			// make sure to destroy dialog after finish
			this._oMoreServicesDialog.destroy();
			this._oMoreServicesDialog = null;
		}

		// ========================= End of Flight Services =========================

	});

});