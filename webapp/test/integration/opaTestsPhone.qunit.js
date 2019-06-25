/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"com/legstate/fts/app/FlightAcceptanceCockpit/test/integration/PhoneJourneys"
	], function() {
		QUnit.start();
	});
});