sap.ui.define([
	"../constants/Constants"
], function (Constants) {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function (sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		overallStatusStateFormatter: function (sStatus) {
			switch (sStatus) {
			case Constants.FlightSegmentStatus.PENDING:
				return "None";
			case Constants.FlightSegmentStatus.READY:
				return "Indication03";
			case Constants.FlightSegmentStatus.CONFIRMED:
				return "Success";
			}

			return "Indication01";
		},

		overallStatusTextFormatter: function (sStatus) {
			switch (sStatus) {
			case Constants.FlightSegmentStatus.PENDING:
				return "Not Ready";
			case Constants.FlightSegmentStatus.READY:
				return "Ready";
			case Constants.FlightSegmentStatus.CONFIRMED:
				return "Confirmed";
			}

			return "None";
		},

		legstateTypeText: function (sLegstate) {

			// TODO: translate

			switch (sLegstate) {
			case Constants.LegstateType.ARRIVED:
				return "Arrived";
			case Constants.LegstateType.DEPARTED:
				return "Departed";
			case Constants.LegstateType.CANCELED:
				return "Canceled";
			case Constants.LegstateType.RETURNED:
				return "Returned";
			}

			return "Not Arrived";
		},

		legstateTypeState: function (sLegstate) {
			switch (sLegstate) {
			case Constants.LegstateType.ARRIVED:
				return "Success";
			case Constants.LegstateType.DEPARTED:
				return "Success";
			case Constants.LegstateType.CANCELED:
				return "Indication03";
			case Constants.LegstateType.RETURNED:
				return "Indication03";
			}

			return "Indication01";
		},

		interfaceStatusState: function (sStatus) {
			switch (sStatus) {
			case Constants.InterfaceStatus.PENDING:
				return "Indication03";
			case Constants.InterfaceStatus.ARRIVED:
				return "Success";
			}

			return "None";
		},

		interfaceStatusText: function (sStatus) {
			switch (sStatus) {
			case Constants.InterfaceStatus.PENDING:
				return "Pending";
			case Constants.InterfaceStatus.ARRIVED:
				return "Arrived";
			}

			return "Unknown";
		}
	};
});