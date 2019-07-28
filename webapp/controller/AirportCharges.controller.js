sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./LobBase.controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/core/Fragment",
	"../constants/Constants",
	"com/legstate/fts/app/FlightAcceptanceCockpit/vendor/lodash.min"
], function (Controller, LobBase, JSONModel, Filter, Fragment, Constants, lodash) {
	"use strict";

	return LobBase.extend("com.legstate.fts.app.FlightAcceptanceCockpit.controller.AirportCharges", {

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

			// setup			
			this.setupLobModel(
				this.getResourceBundle().getText("AC_INFO_PANEL_TITLE"),
				Constants.LobType.AIRPORT_CHARGES
			);
			
			this._oTabBar = this.getView().byId("TabBar");

			// handle routing 
			this.getRouter().getRoute("AirportCharges").attachPatternMatched(this.handleRouteMatched, this);
		},

		// setupServicesFragment: function(oController, oDataModel){

		// 	// make sure controller and oDataModel are not null 
		// 	if (!oController || !oDataModel){
		// 		return;
		// 	}

		// 	// Create the fragment controller
		// 	var oServicesFragmentController = new ServicesFragmentController(oController, oDataModel);

		// 	// Load the services fragment 
		// 	Fragment.load({
		// 		type: "XML",
		// 		id: "arrServices",
		// 		name: "com.legstate.fts.app.FlightAcceptanceCockpit.fragments.Services",
		// 		controller: oServicesFragmentController
		// 	}).then(function(fragment){
		// 		// add the fragment to content
		// 		var oScrollContainer = oController.getView().byId("scrollContArrival");
		// 		oScrollContainer.addContent(fragment);
		// 	});			
		// },

		// toggleEditMode: function (oEvent) {
		// 	// toggle edit mode
		// 	var oLobModel = this.getModel("lobView");

		// 	var isInEditMode = oLobModel.getProperty("/editMode");

		// 	oLobModel.setProperty("/editMode", !isInEditMode);
		// },

		onBeforeRendering: function () {},

		_onRouteMatched: function (oEvent) {

			// // make sure we unbind data in order to make sure
			// // we always get the latest data 
			// this.unbindData();

			// var args = oEvent.getParameter("arguments");

			// this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

			// this.getModel().metadataLoaded().then(function () {
			// 	var sObjectPath = this.getModel().createKey("FlightSegmentHeaderSet", {
			// 		Preaufnr: args.arrFlightNo,
			// 		Aufnr: args.depFlightNo
			// 	});

			// 	// bind the view 
			// 	this._bindView("/" + sObjectPath);

			// 	this.sObjectPath = sObjectPath;

			// 	this.getOwnerComponent().oListSelector.selectAListItem("/" + sObjectPath);


			// }.bind(this));
		},

		bindView: function (sObjectPath) {

			// get selected tab key
			var sSelectedTabKey = this._oTabBar.getSelectedKey();

			// bind passanger details fragment 
			this._bindPassangerDetails(sObjectPath, sSelectedTabKey);

			// bind airport services fragment 
			this.loadServices(sObjectPath + "/FlightSegmentItemSetAC");
		},

		onTabSelected: function (oEvent) {
			
			var oLobModel = this.getLobModel();
			
			
			
			if (oLobModel.getData().entryIsLocked === true){
				// cancel tab selection
				this._oTabBar.setSelectedKey(this._sCurrentSelectedTabKey);	
				// oEvent.cancelBubble();
				// oEvent.preventDefault();
				return;
			}
			
			

			var sBindingPath = "/" + this.sObjectPath;
			var sSelectedKey = oEvent.getParameter("selectedKey");
			
			// bind passanger details 
			this._bindPassangerDetails(sBindingPath, sSelectedKey);

			this.renderServicesByDirection();
			
			this._sCurrentSelectedTabKey = sSelectedKey;
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
		}
	});

});