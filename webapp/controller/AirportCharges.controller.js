sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (Controller, BaseController, JSONModel, Filter) {
	"use strict";

	return BaseController.extend("com.legstate.fts.app.FlightAcceptanceCockpit.controller.AirportCharges", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.legstate.fts.app.FlightAcceptanceCockpit.view.AirportCharges
		 */
		onInit: function () {

			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				title: ""
			});

			this.setModel(oViewModel, "airportChargesView");

			// create the Lob shared view 
			// and add all relevant info to it
			var oLobView = new JSONModel({
				infoPanelTitle: this.getResourceBundle().getText("AC_INFO_PANEL_TITLE"),
				editMode: false
			});

			this.setModel(oLobView, "lobView");

			// handle routing 
			this.getRouter().getRoute("AirportCharges").attachPatternMatched(this._onRouteMatched, this);

			this._oTabBar = this.getView().byId("TabBar");

		},

		toggleEditMode: function (oEvent) {
			// toggle edit mode
			var oLobModel = this.getModel("lobView");
			
			var isInEditMode = oLobModel.getProperty("/editMode");
			
			oLobModel.setProperty("/editMode", !isInEditMode);
		},

		onBeforeRendering: function () {},

		_unbindData: function () {
			var sArrFragmentId = this.getView().createId("arrServices");
			var arrServicesTable = sap.ui.core.Fragment.byId(sArrFragmentId, "servicesTable");

			var sDepFragmentId = this.getView().createId("depServices");
			var depServicesTable = sap.ui.core.Fragment.byId(sDepFragmentId, "servicesTable");

			arrServicesTable.unbindAggregation("items");
			depServicesTable.unbindAggregation("items");

			this._oTabBar.setSelectedKey("ARR");
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
			this._bindPassangerDetails(sObjectPath, sSelectedTabKey);

			// bind airport services fragment 
			this._bindAirportServices(sObjectPath, sSelectedTabKey);

		},

		onTabSelected: function (oEvent) {

			var sBindingPath = "/" + this.sObjectPath;
			var sSelectedKey = oEvent.getParameter("selectedKey");

			// bind passanger details 
			this._bindPassangerDetails(sBindingPath, sSelectedKey);

			// bind services 			
			this._bindAirportServices(sBindingPath, sSelectedKey);

		},

		_bindAirportServices: function (sObjectPath, sSelectedTabKey) {

			var sFragmentId = null;
			var sBindingPath = "";
			var aFilters = [];

			if (sSelectedTabKey === "ARR") {
				sFragmentId = this.getView().createId("arrServices");
				sBindingPath = sObjectPath + "/FlightSegmentItemSetAC";
				var arrFilter = new Filter("Direction", sap.ui.model.FilterOperator.EQ, 1);
				aFilters.push(arrFilter);
			} else if (sSelectedTabKey === "DEP") {
				sFragmentId = this.getView().createId("depServices");
				sBindingPath = sObjectPath + "/FlightSegmentItemSetAC";
				var depFilter = new Filter("Direction", sap.ui.model.FilterOperator.EQ, 2);
				aFilters.push(depFilter);
			}

			var oServicesTable = sap.ui.core.Fragment.byId(sFragmentId, "servicesTable");

			if (!this.oTemplate) {
				this.oTemplate = oServicesTable.getItems()[0];
				oServicesTable.removeAllItems();
			}

			if (!oServicesTable.getBinding("items")) {

				var oViewModel = this.getModel("airportChargesView");

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
		},

		_bindPassangerDetails: function (sObjectPath, sSelectedTabKey) {

			var sPassangerDetailsFragmentId = undefined;
			var sBindingPath = "";

			// get passanger details fragement by selected tab 
			if (sSelectedTabKey === "ARR") {
				sPassangerDetailsFragmentId = this.getView().createId("arrPassangerInfoFragment");
				sBindingPath = sObjectPath + "/FlightSegmentHeaderInboundPax";
			} else if (sSelectedTabKey === "DEP") {
				sPassangerDetailsFragmentId = this.getView().createId("depPassangerInfoFragment");
				sBindingPath = sObjectPath + "/FlightSegmentHeaderOutboundPax";
			}

			if (sPassangerDetailsFragmentId === undefined) {
				return;
			}

			// get passanger details grid
			var oPassangerDetailsGrid = sap.ui.core.Fragment.byId(sPassangerDetailsFragmentId, "gridPassDetails");

			// bind grid only when needed
			if (!oPassangerDetailsGrid.getBindingContext()) {

				var oViewModel = this.getModel("airportChargesView");

				// bind passanger details to odata model
				oPassangerDetailsGrid.bindElement({
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

		onBack: function (oEvent) {
			this.onNavBack();
		},

		_bindServices: function (sObjectPath, sSelectedTabKey) {

		}
	});

});