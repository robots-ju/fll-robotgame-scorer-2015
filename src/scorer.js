/*
 * FLL Robot Game Scorer 2015
 * @author Clark Winkelmann <clark.winkelmann@gmail.com>
 * @license MIT
 */

/* global module */

(function(sc) {

	/**
	 * Exception for the incorrect values, like too high
	 * @param {String} description Description of error
	 */
	sc.InvalidValueException = function(description)
	{
		this.name = 'InvalidValueException';
		this.description = description;
	};
	// Thanks to the tutorial about exception from Chad Campbell
	// @see http://www.ecofic.com/about/blog/testing-for-exceptions-with-jasmine
	sc.InvalidValueException.prototype = new Error();
	sc.InvalidValueException.prototype.constructor = sc.InvalidValueException;

	/**
	 * Exception for missions that cannot be scored simultaneously
	 * @param {String} description Description of error
	 */
	sc.CannotScoreBothException = function(description) {
		this.name = 'CannotScoreBothException';
		this.description = description;
	};
	sc.CannotScoreBothException.prototype = new Error();
	sc.CannotScoreBothException.prototype.constructor = sc.CannotScoreBothException;

	/**
	 * Object representing the missions state at the start of the game
	 */
	sc.initialMissionsState = {
		// Own bins are reprensented by booleans because we need to distinguish
		// each other when computing points for the M04 mission
		m01_own_yellow_bin_in_other_safety: false,
		m01_own_blue_bin_in_other_safety: false,
		m01_other_yellow_bin_in_own_safety: false,
		m01_other_blue_bin_in_own_safety: false,
		m02_methanes_collected: 0,
		m03_truck_supports_bin: false,
		m03_bin_east_of_guide: false,
		m04_yellow_bars_in_correct_bin: 0,
		m04_blue_bars_in_correct_bin: 0,
		// The two following states are linked with M01 as they are mutually exclusive
		m04_own_yellow_bin_in_tranfer_area: false,
		m04_own_blue_bin_in_tranfer_area: false,
		/**
		 * 2015.08.27, Page 12, Bracket + Building + Valuables
		 * "Then use four of each color Bars to make the Building as shown"
		 *
		 * 2015.08.27, Page 10, Toys in packaging
		 * "place the other Toy Plane in the Large Package which gets inserted in the Factory"
		 * The big package is composed of two black bars
		 *
		 * 2016.01.16, Page 11, Sorter
		 * "Load two Blue and two Black Bars in the red tray as shown"
		 *
		 * This means there are 8 black bars in setup position
		 */
		m04_black_bars_in_flower_box_or_setup_position: 8,
		m04_black_bars_in_matching_bin: 0,
		m04_black_bars_anywhere_else: 0,
		m05_one_person_in_sorter_area: false,
		m06_engine_unit_installed: false,
		m06_car_folded: false,
		m07_bags_in_safety: 0,
		m07_animals_in_circle: 0,
		m07_chicken_in_circle: false,
		m08_compost_partly_in_safety: false,
		m08_compost_completely_in_safety: false,
		m09_valuables_in_safety: false,
		m10_building_demolished: false,
		m11_planes_in_safety: 0,
		m12_compost_in_package: false,
		penalties: 0
	};

	/**
	 * Score calculator for the 2015 missions
	 * @param {Object} missions Associative array of the missions states
	 * @returns {Number} Score
	 */
	sc.computeScore = function(missions)
	{
		var score = 0;

		// TODO: check for attribute type ?

		/*
		|
		| Mission 01
		|
		*/

		if(missions.hasOwnProperty('m01_own_yellow_bin_in_other_safety'))
		{
			/**
			 * 2016.01.16, Page 23, M01, Specific physical requirement
			 * "Visible at the end of the match: Green Bin containing at least one matching Yellow or Blue Bar"
			 * "Value: 60 per bin in either safety"
			 */
			if(missions.m04_yellow_bars_in_correct_bin > 0) {
				score += missions.m01_own_yellow_bin_in_other_safety ? 60 : 0;
			}
		}

		if(missions.hasOwnProperty('m01_own_blue_bin_in_other_safety'))
		{
			/**
			 * 2016.01.16, Page 23, M01, Specific physical requirement
			 * "Visible at the end of the match: Green Bin containing at least one matching Yellow or Blue Bar"
			 * "Value: 60 per bin in either safety"
			 */
			if(missions.m04_blue_bars_in_correct_bin > 0) {
				score += missions.m01_own_blue_bin_in_other_safety ? 60 : 0;
			}
		}

		if(missions.hasOwnProperty('m01_other_yellow_bin_in_own_safety'))
		{
			/**
			 * 2015.08.27, Page 23, M01, Specific physical requirement
			 * "Value: 60 per bin in either safety"
			 */
			score += missions.m01_other_yellow_bin_in_own_safety ? 60 : 0;
		}

		if(missions.hasOwnProperty('m01_other_blue_bin_in_own_safety'))
		{
			/**
			 * 2015.08.27, Page 23, M01, Specific physical requirement
			 * "Value: 60 per bin in either safety"
			 */
			score += missions.m01_other_blue_bin_in_own_safety ? 60 : 0;
		}

		/*
		|
		| Mission 02
		|
		*/

		if(missions.hasOwnProperty('m02_methanes_collected'))
		{
			/**
			 * 2015.08.27, Page 23, M02, Specific physical requirement
			 * "Methane is in the Truck [...], and/or the Factory [...]"
			 */
			if(missions.m02_methanes_collected > 2)
			{
				throw new sc.InvalidValueException('M02');
			}

			/**
			 * 2015.08.27, Page 23, M02, Specific physical requirement
			 * "Value: 40 per methane"
			 */
			score += missions.m02_methanes_collected * 40;
		}

		/*
		|
		| Mission 03
		|
		*/

		if(missions.hasOwnProperty('m03_truck_supports_bin'))
		{
			/**
			 * 2015.08.27, Page 23, M03, Specific physical requirement
			 * "Value: 50 The Truck supports all of the Yellow Bin’s weight"
			 */
			score += missions.m03_truck_supports_bin ? 50 : 0;
		}

		if(missions.hasOwnProperty('m03_bin_east_of_guide'))
		{
			/**
			 * 2015.08.27, Page 23, M03, Specific physical requirement
			 * "Value: 60 The Yellow Bin is completely east of the Truck’s Guide"
			 */
			score += missions.m03_bin_east_of_guide ? 60 : 0;
		}

		/*
		|
		| Mission 04
		| Yellow/blue bars
		|
		*/

		['yellow', 'blue']
		.forEach(function(color)
		{
			var binInOtherSafety = missions.hasOwnProperty('m01_own_' + color + '_bin_in_other_safety')
					&& missions['m01_own_' + color + '_bin_in_other_safety'];

			var binInTransferArea = missions.hasOwnProperty('m04_own_' + color + '_bin_in_tranfer_area')
					&& missions['m04_own_' + color + '_bin_in_tranfer_area'];

			var barsInCorrectBin = missions.hasOwnProperty('m04_' + color + '_bars_in_correct_bin')
					? missions['m04_' + color + '_bars_in_correct_bin'] : 0;

			/**
			 * We could have stored how much yellow/blue bars are in each of the
			 * 3 places, but as they can only be all together in one of them
			 * (there is only one bin), it is cleaner to store how much bars
			 * are correcty sorted and where is each bin.
			 *
			 * But we need to check that a bin is not in two places at once
			 */
			if(binInOtherSafety && binInTransferArea)
			{
				throw new sc.CannotScoreBothException('M04');
			}

			/**
			 * 2016.01.16, Page 24, M04, Specific physical requirement, Yellow/blue bars
			 * "Value: Per Bin (See M01 on page 23) is completely in the other team’s Safety, by way of your West Transfer"
			 *
			 * Only the bin points (M01) are taken in account. We add nothing here
			 */
			if(binInOtherSafety)
			{
				// No point is added
			}
			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Yellow/blue bars
			 * "Value: 7 Per Bar is completely in your East Transfer Area and/or completely on your East Transfer"
			 */
			else if(binInTransferArea)
			{
				score += barsInCorrectBin * 7;
			}
			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Yellow/blue bars
			 * "Value: 6 Per Bar was never completely in your East Transfer Area"
			 */
			else
			{
				score += barsInCorrectBin * 6;
			}
		});

		/*
		|
		| Mission 04
		| Black bars
		|
		*/

		if(missions.hasOwnProperty('m04_black_bars_in_flower_box_or_setup_position'))
		{
			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
			 * "Value: 8 Per Bar part of a scoring Flower Box, or in their original Setup position"
			 */
			score += missions.m04_black_bars_in_flower_box_or_setup_position * 8;
		}

		if(missions.hasOwnProperty('m04_black_bars_in_matching_bin'))
		{
			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
			 * "Value: 3 Per Bar in their matching Green Bin, or in the Landfill Bin"
			 */
			score += missions.m04_black_bars_in_matching_bin * 3;
		}

		if(missions.hasOwnProperty('m04_black_bars_anywhere_else'))
		{
			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
			 * "Value: Minus 8 Per Bar anywhere else"
			 */
			score += missions.m04_black_bars_anywhere_else * -8;
		}

		/*
		|
		| Mission 05
		|
		*/

		if(missions.hasOwnProperty('m05_one_person_in_sorter_area'))
		{
			/**
			 * 2015.08.27, Page 24, M05, Specific physical requirement
			 * "At least one Person is completely in the Sorter Area [...] Value: 60"
			 */
			score += missions.m05_one_person_in_sorter_area ? 60 : 0;
		}

		/*
		|
		| Mission 06
		|
		*/

		var m06EngineUnitInstalled = missions.hasOwnProperty('m06_engine_unit_installed')
				&& missions.m06_engine_unit_installed;


		var m06CarFolded = missions.hasOwnProperty('m06_car_folded')
				&& missions.m06_car_folded;

		/**
		 * 2015.08.27, Page 24, M06, Specific physical requirement
		 * "Score Only One Way"
		 */
		if(m06EngineUnitInstalled && m06CarFolded)
		{
			throw new sc.CannotScoreBothException('M06');
		}

		/**
		 * 2015.08.27, Page 24, M06, Specific physical requirement
		 * "Value: 65 The Engine/Windshield unit is installed in the unfolded Car in the proper space and direction"
		 */
		if(m06EngineUnitInstalled)
		{
			score += 65;
		}

		/**
		 * 2015.08.27, Page 24, M06, Specific physical requirement
		 * "Value: 50 The Car is completely folded and completely in the East Transfer Area"
		 */
		if(m06CarFolded)
		{
			score += 50;
		}

		/*
		|
		| Mission 07
		|
		*/

		if(missions.hasOwnProperty('m07_bags_in_safety'))
		{
			/**
			 * 2015.08.27, Page 24, M07, Specific physical requirement
			 * "Value: 30 Per Bag Plastic Bags are completely in Safety"
			 */
			score += missions.m07_bags_in_safety * 30;
		}

		if(missions.hasOwnProperty('m07_animals_in_circle'))
		{
			/**
			 * 2015.08.27, Page 24, M07, Specific physical requirement
			 * "Value: 20 Per Animal *Animals are completely in any circle which is completely empty of Plastic Bags"
			 */
			score += missions.m07_animals_in_circle * 20;
		}

		if(missions.hasOwnProperty('m07_chicken_in_circle'))
		{
			/**
			 * 2016.01.17, Page 24/25, M07, Specific physical requirement
			 * "Score Any That Apply"
			 * "Value: 20 Per Animal *Animals are completely in any circle which is completely empty of Plastic Bags"
			 * "Value: 35 The Chicken is completely in the small circle"
			 *
			 * So the chicken scores 20+35 = 55 points
			 */
			score += missions.m07_chicken_in_circle ? 55 : 0;
		}

		/*
		|
		| Mission 08
		|
		*/

		var m08CompostPartlyInSafety = missions.hasOwnProperty('m08_compost_partly_in_safety')
				&& missions.m08_compost_partly_in_safety;


		var m08CompostCompletelyInSafety = missions.hasOwnProperty('m08_compost_completely_in_safety')
				&& missions.m08_compost_completely_in_safety;

		/**
		 * 2015.08.27, Page 25, M08, Specific physical requirement
		 * "Score Only One Way"
		 */
		if(m08CompostPartlyInSafety && m08CompostCompletelyInSafety)
		{
			throw new sc.CannotScoreBothException('M08');
		}

		/**
		 * 2015.08.27, Page 25, M08, Specific physical requirement
		 * "Value: 60 The Compost is ejected, but not completely in Safety"
		 */
		if(m08CompostPartlyInSafety)
		{
			score += 60;
		}

		/**
		 * 2015.08.27, Page 25, M08, Specific physical requirement
		 * "Value: 80 The Compost is completely in Safety"
		 */
		if(m08CompostCompletelyInSafety)
		{
			score += 80;
		}

		/*
		|
		| Mission 09
		|
		*/

		if(missions.hasOwnProperty('m09_valuables_in_safety'))
		{
			/**
			 * 2015.08.27, Page 25, M09, Specific physical requirement
			 * "Value: 60 The Valuables are completely in Safety"
			 */
			score += missions.m09_valuables_in_safety ? 60 : 0;
		}

		/*
		|
		| Mission 10
		|
		*/

		if(missions.hasOwnProperty('m10_building_demolished'))
		{
			/**
			 * 2015.08.27, Page 25, M10, Specific physical requirement
			 * "Value: 85 None of the Building’s twelve beams is left standing in Setup position"
			 */
			score += missions.m10_building_demolished ? 85 : 0;
		}

		/*
		|
		| Mission 11
		|
		*/

		if(missions.hasOwnProperty('m11_planes_in_safety'))
		{
			/**
			 * 2015.08.27, Page 25, M11, Specific physical requirement
			 * "Value: 40 Per Plane Toy Planes are completely in Safety"
			 */
			score += missions.m11_planes_in_safety * 40;
		}

		/*
		|
		| Mission 12
		|
		*/

		if(missions.hasOwnProperty('m12_compost_in_package'))
		{
			/**
			 * 2015.08.27, Page 25, M12, Specific physical requirement
			 * "Value: 40 The Compost is perfectly nested inside one of the Packages [...]"
			 */
			score += missions.m12_compost_in_package ? 40 : 0;
		}

		/*
		|
		| Penalties
		|
		*/

		if(missions.hasOwnProperty('penalties'))
		{

			/**
			 * 2015.08.27, Page 25, Penalties
			 * "[...] not to exceed four Bars"
			 */
			if(missions.penalties > 4)
			{
				throw new sc.InvalidValueException('Penalties');
			}

			/**
			 * 
			 * 2016.01.16, Page 11, Penalties
			 * "Place four Black Bars off the Field out of the way"
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
			 * "Value: 8 Per Bar part of a scoring Flower Box, or in their original Setup position"
			 * 
			 * As we put penalties in a separate counter, having 0 penalties must
			 * score the equivalent of the 4 black bars in "setup position"
			 */
			score += 4 * 8;

			/**
			 * 2015.08.27, Page 25, Penalties
			 * "the Ref will place one Black Bar on the Mat [...] Value: See SORTING mission, black bar details"
			 * 2015.08.27, Page 24, M04, Specific physical requirement
			 * "Black bars are [...] Value: Minus 8 Per Bar anywhere else"
			 */
			score += missions.penalties * -16;
		}

		return score;
	};

	/**
	 * Determines whether the missions state gives access to the leniency bonus
	 * @param {Object} missions Missions state
	 * @returns {Boolean}
	 */
	sc.hasLeniencyBonus = function(missions)
	{
		return missions.hasOwnProperty('m05_one_person_in_sorter_area')
				&& missions.m05_one_person_in_sorter_area === true;
	};

	/**
	 * Computes the missions state changes when triggering the building demolition
	 * @param {Object} missions Missions state
	 * @return {Object} New missions state
	 */
	sc.macroDemolishBuilding = function(missions)
	{
		/**
		 * Since this method will usually be called with the full missions object,
		 * there is no check for the existance of the properties
		 */

		/**
		 * We can only demolish the building once, so we immediately return
		 * if it is already demolished
		 */
		if(missions.m10_building_demolished) {
			return missions;
		}

		/**
		 * We clone the object to prevent any unexpected behavior
		 * @see http://stackoverflow.com/a/10869248/3133038
		 */
		var newMissions = JSON.parse(JSON.stringify(missions));

		/**
		 * We destroy the building, as this marco is meant to
		 */
		newMissions.m10_building_demolished = true;


		/**
		 * 2015.08.27, Page 12, Bracket + Building + Valuables
		 * "Then use four of each color Bars to make the Building as shown"
		 *
		 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
		 * "Value: 8 Per Bar part of a scoring Flower Box, or in their original Setup position"
		 *
		 * The building contains four black bars that quit their original
		 * setup position
		 */
		newMissions.m04_black_bars_in_flower_box_or_setup_position -= 4;


		/**
		 * 2015.08.27, Page 12, Bracket + Building + Valuables
		 * "Then use four of each color Bars to make the Building as shown"
		 *
		 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
		 * "Value: Minus 8 Per Bar anywhere else"
		 *
		 * The building contains four black bars that land "anywhere else"
		 * on the ground
		 */
		newMissions.m04_black_bars_anywhere_else += 4;

		return newMissions;
	};

}(this.FllScorer = this.FllScorer || {}));
if(typeof module === "object") module.exports = this.FllScorer;
