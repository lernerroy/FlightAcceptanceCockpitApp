sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (Controller, BaseController, JSONModel, Filter) {
	"use strict";

	return BaseController.extend("com.legstate.fts.app.FlightAcceptanceCockpit.controller.CargoCharges", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.legstate.fts.app.FlightAcceptanceCockpit.view.CargoCharges
		 */
		onInit: function () {
			var oViewModel = new JSONModel({
				busy: false,
				servicesBusy: false,
				delay: 0,
				title: ""
			});

			this.getRouter().getRoute("CargoCharges").attachPatternMatched(this._onRouteMatched, this);

			this.setModel(oViewModel, "cargoChargesView");

			// store tab bar in object 
			this._oTabBar = this.getView().byId("TabBar");

			var oLobView = new JSONModel({
				infoPanelTitle: this.getResourceBundle().getText("CD_INFO_PANEL_TITLE")
			});

			this.setModel(oLobView, "lobView");
		},

		_unbindData: function () {
			var sArrFragmentId = this.getView().createId("arrServices");
			var arrServicesTable = sap.ui.core.Fragment.byId(sArrFragmentId, "servicesTable");

			var sDepFragmentId = this.getView().createId("depServices");
			var depServicesTable = sap.ui.core.Fragment.byId(sDepFragmentId, "servicesTable");

			arrServicesTable.unbindAggregation("items");
			depServicesTable.unbindAggregation("items");
		},

		_onRouteMatched: function (oEvent) {

			// make sure we unbind data in order to make sure
			// we always get the latest data 
			this._unbindData();

			var args = oEvent.getParameter("arguments");

			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("FlightSegmentHeaderSet", {
					Preaufnr: args.objectId,
					Aufnr: args.flightNo
				});

				this._bindView("/" + sObjectPath);

				this.sObjectPath = sObjectPath;

				this.getOwnerComponent().oListSelector.selectAListItem("/" + sObjectPath);
			}.bind(this));
		},

		_bindView: function (sObjectPath) {

			// get selected tab key
			var sSelectedTabKey = this._oTabBar.getSelectedKey();

			// bind passanger details fragment 
			this._bindCargoDetails(sObjectPath, sSelectedTabKey);

			// bind airport services fragment 
			this._bindCargoServices(sObjectPath, sSelectedTabKey);

		},

		onTabSelected: function (oEvent) {

			var sBindingPath = "/" + this.sObjectPath;
			var sSelectedKey = oEvent.getParameter("selectedKey");

			// bind cargo details 
			this._bindCargoDetails(sBindingPath, sSelectedKey);

			// bind services 			
			this._bindCargoServices(sBindingPath, sSelectedKey);

		},

		_bindCargoDetails: function (sObjectPath, sSelectedTabKey) {

			// TODO: change the binding to point to cargo details endpoint
			// right now we show the passanger details 

			var sCargoDetailsFragmentId = undefined;
			var sBindingPath = "";

			// get passanger details fragement by selected tab 
			if (sSelectedTabKey === "ARR") {
				sCargoDetailsFragmentId = this.getView().createId("arrCargoDetails");
				sBindingPath = sObjectPath + "/FlightSegmentHeaderInboundPax";
			} else if (sSelectedTabKey === "DEP") {
				sCargoDetailsFragmentId = this.getView().createId("depCargoDetails");
				sBindingPath = sObjectPath + "/FlightSegmentHeaderOutboundPax";
			}

			if (sCargoDetailsFragmentId === undefined) {
				return;
			}

			// get passanger details grid
			var oCargoDetailsGrid = sap.ui.core.Fragment.byId(sCargoDetailsFragmentId, "gridPassDetails");

			// bind grid only when needed
			if (!oCargoDetailsGrid.getBindingContext()) {

				var oViewModel = this.getModel("cargoChargesView");

				// bind passanger details to odata model
				oCargoDetailsGrid.bindElement({
					path: sBindingPath,
					events: {
						change: function (oEvent) {},
						dataRequested: function (oEvent) {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function (oEvent) {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			}
		},

		_bindCargoServices: function (sObjectPath, sSelectedTabKey) {
			var sFragmentId = null;
			var sBindingPath = "";
			var aFilters = [];

			if (sSelectedTabKey === "ARR") {
				sFragmentId = this.getView().createId("arrServices");
				sBindingPath = sObjectPath + "/FlightSegmentItemSetCG";
				var arrFilter = new Filter("Direction", sap.ui.model.FilterOperator.EQ, 1);
				aFilters.push(arrFilter);
			} else if (sSelectedTabKey === "DEP") {
				sFragmentId = this.getView().createId("depServices");
				sBindingPath = sObjectPath + "/FlightSegmentItemSetCG";
				var depFilter = new Filter("Direction", sap.ui.model.FilterOperator.EQ, 2);
				aFilters.push(depFilter);
			}

			var oServicesTable = sap.ui.core.Fragment.byId(sFragmentId, "servicesTable");

			if (!this.oTemplate) {
				this.oTemplate = oServicesTable.getItems()[0];
				oServicesTable.removeAllItems();
			}

			if (!oServicesTable.getBinding("items")) {
				
				var oViewModel = this.getModel("cargoChargesView");
				
				// bind the services table 
				oServicesTable.bindAggregation("items", {
					path: sBindingPath,
					template: this.oTemplate,
					filters: aFilters,
					events: {
						change: function (oEvent) {},
						dataRequested: function (oEvent) {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function (oEvent) {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			}
		}

	});

});