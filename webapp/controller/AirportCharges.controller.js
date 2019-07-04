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
				infoPanelTitle: this.getResourceBundle().getText("AC_INFO_PANEL_TITLE")          
			});
			
			this.setModel(oLobView, "lobView");


			// handle routing 
			this.getRouter().getRoute("AirportCharges").attachPatternMatched(this._onRouteMatched, this);

			this._oTabBar = this.getView().byId("TabBar");
		
		},
		
		onBeforeRendering: function(){
		},
		
		_unbindData: function() {
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
				// bind the services table 
				oServicesTable.bindAggregation("items", {
					path: sBindingPath,
					template: this.oTemplate,
					filters: aFilters,
					events: {
						change: function (oEvent) {}
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
				// bind passanger details to odata model
				oPassangerDetailsGrid.bindElement({
					path: sBindingPath,
					events: {
						change: function (oEvent) {},
						dataRequested: function (oEvent) {},
						dataReceived: function (oEvent) {}
					}
				});
			}

			// var oACModel = this.getView().getModel("airportCharges");
			// var oDataModel = this.getView().getModel();

			// map passanger details to airport charges model according to the current 
			// selected tab

			// var sPath = null;
			// var sDestPath = null;
			// var sPassangerFragmentId = null;

			// if (sSelectedTabKey === "ARR") {
			// 	sPath = sObjectPath + "/FlightSegmentHeaderInboundPax";
			// 	sDestPath = "/arrival/passanger";
			// 	sPassangerFragmentId = this.getView().createId("arrPassangerInfoFragment");
			// } else if (sSelectedTabKey === "DEP") {
			// 	sPath = sObjectPath + "/FlightSegmentHeaderOutboundPax";
			// 	sDestPath = "/departure/passanger";
			// 	sPassangerFragmentId = this.getView().createId("depPassangerInfoFragment");
			// }

			// get the Grid view inside the relevant fragment 
			// var oPassangerDetailsGrid = sap.ui.core.Fragment.byId(sPassangerFragmentId, "gridPassDetails");
			// debugger;
			// oDataModel.read(sPath, {
			// 	success: function (data, response) {
			// 		// map data from the odata model to the airport charges model
			// 		oACModel.setProperty(sDestPath,data);

			// 		oPassangerDetailsGrid.bindElement({
			// 			path: sDestPath,
			// 			model: "airportCharges"
			// 		});

			// 	},
			// 	error: function(err){
			// 		debugger;
			// 		console.log("error");
			// 	}
			// });

			// Make read request to the server to get the passanger details 

			// var sPassangerDetailsArrFragmentId = this.getView().createId("arrPassangerInfoFragment");
			// var sPassangerDetailsDepFragmentId = this.getView().createId("depPassangerInfoFragment");

			// var oPassangerDetailsArrGrid = sap.ui.core.Fragment.byId(sPassangerDetailsArrFragmentId, "gridPassDetails");
			// var oPassangerDetailsDepGrid = sap.ui.core.Fragment.byId(sPassangerDetailsDepFragmentId, "gridPassDetails");

			// var sArrBindingPath = sObjectPath + "/FlightSegmentHeaderInboundPax";
			// var sDepBindingPath = sObjectPath + "/FlightSegmentHeaderOutboundPax";

			// oPassangerDetailsArrGrid.bindElement({
			// 	path: sArrBindingPath
			// });

			// oPassangerDetailsDepGrid.bindElement({
			// 	path: sDepBindingPath
			// });

		},
		
		onBack: function(oEvent){
			this.onNavBack();
		},

		_bindServices: function (sObjectPath, sSelectedTabKey) {

		}
	});

});