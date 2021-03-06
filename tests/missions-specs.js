/*
 * FLL Robot Game Scorer 2015
 * @author Clark Winkelmann <clark.winkelmann@gmail.com>
 * @license MIT
 */

/* global describe, it, expect */
/* global FllScorer */

/**
 * Robot Game 2015 specifications test suite, based on the official scoring guide
 * @see http://www.firstlegoleague.org/challenge/2015trashtrek
 * @see http://www.firstlegoleague.org/sites/default/files/Challenge/TRASH-TREK/TRASH-TREK-Challenge.pdf
 */
describe('Robot Game 2015 specifications', function() {

	describe('Scorer initial state', function() {

		/**
		 * The scorer script should only take into account what is given in
		 * the missions state argument
		 *
		 * Penalties is the only property where points are given/taken when their
		 * value is 0, but they are only computed if the `penalties` key is given
		 */
		it('Should score no points if nothing is given', function()
		{
			expect(FllScorer.computeScore({})).toEqual(0);
		});

	});

	describe('Match initial sate', function() {

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
		 * 2016.01.16, Page 11, Penalties
		 * "Place four Black Bars off the Field out of the way"
		 *
		 * This means there are 12 black bars in setup position
		 *
		 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
		 * "Value: 8 Per Bar part of a scoring Flower Box, or in their original Setup position"
		 *
		 * As there is nothing else that scores points without touching it, the
		 * initial score is 12 black bars * 8 points = 96 points
		 */
		it('Should score 96 base points', function()
		{
			expect(FllScorer.computeScore(FllScorer.initialMissionsState)).toEqual(12*8);
		});

	});

	describe('Mission 01', function() {

		/**
		 * 2015.08.27, Page 23, M01, Specific physical requirement
		 * "Value: 60 per bin in either safety"
		 */
		it('Scores 60 points per bin', function()
		{
			expect(FllScorer.computeScore({
				m01_own_yellow_bin_in_other_safety: true,
				m04_yellow_bars_in_correct_bin: 1
			})).toEqual(60);

			expect(FllScorer.computeScore({
				m01_own_blue_bin_in_other_safety: true,
				m04_blue_bars_in_correct_bin: 1
			})).toEqual(60);

			expect(FllScorer.computeScore({
				m01_other_yellow_bin_in_own_safety: true
			})).toEqual(60);

			expect(FllScorer.computeScore({
				m01_other_blue_bin_in_own_safety: true
			})).toEqual(60);
		});

		/**
		 * 2016.01.16, Page 23, M01, Specific physical requirement
		 * "Visible at the end of the match: Green Bin containing at least one matching Yellow or Blue Bar"
		 */
		it('Scores nothing if bin is empty', function()
		{
			expect(FllScorer.computeScore({
				m01_own_yellow_bin_in_other_safety: true,
				m04_yellow_bars_in_correct_bin: 0
			})).toEqual(0);

			expect(FllScorer.computeScore({
				m01_own_blue_bin_in_other_safety: true,
				m04_blue_bars_in_correct_bin: 0
			})).toEqual(0);
		});

	});

	describe('Mission 02', function() {

		/**
		 * 2015.08.27, Page 23, M02, Specific physical requirement
		 * "Value: 40 per methane"
		 */
		it('Scores 40 per methane', function()
		{
			expect(FllScorer.computeScore({
				m02_methanes_collected: 1
			})).toEqual(40);

			expect(FllScorer.computeScore({
				m02_methanes_collected: 2
			})).toEqual(40*2);
		});

		/**
		 * 2015.08.27, Page 23, M02, Specific physical requirement
		 * "Methane is in the Truck [...], and/or the Factory [...]"
		 */
		it('Cannot collect more than 2 methanes', function()
		{
			expect(function() {
				FllScorer.computeScore({
					m02_methanes_collected: 3
				});
			}).toThrowError(FllScorer.InvalidValueException);
		});

	});

	describe('Mission 03', function() {

		/**
		 * 2015.08.27, Page 23, M03, Specific physical requirement
		 * "Value: 50 The Truck supports all of the Yellow Bin’s weight"
		 */
		it('Scores 50 points to load the truck', function()
		{
			expect(FllScorer.computeScore({
				m03_truck_supports_bin: true
			})).toEqual(50);
		});

		/**
		 * 2015.08.27, Page 23, M03, Specific physical requirement
		 * "Value: 60 The Yellow Bin is completely east of the Truck’s Guide"
		 */
		it('Scores 60 points to push the bin east', function()
		{
			expect(FllScorer.computeScore({
				m03_bin_east_of_guide: true
			})).toEqual(60);
		});

		/**
		 * 2015.08.27, Page 23, M03, Specific physical requirement
		 * "score one or both"
		 */
		it('It possible to score both', function()
		{
			expect(FllScorer.computeScore({
				m03_truck_supports_bin: true,
				m03_bin_east_of_guide: true
			})).toEqual(50+60);
		});

	});

	describe('Mission 04', function() {

		describe('Yellow and blue bars', function() {

			/**
			 * As stated in the library it has been chosen to use a state for
			 * the bin position and a state for the number of sorted bars
			 *
			 * Because of that, a new test is necessay to ensure that a bin
			 * cannot be in more than one place at once
			 */
			it('It is impossible for a bin to be in two places', function() {
				// Yellow
				expect(function() {
					FllScorer.computeScore({
						m01_own_yellow_bin_in_other_safety: true,
						m04_own_yellow_bin_in_tranfer_area: true
					});
				}).toThrowError(FllScorer.CannotScoreBothException);
				
				// Blue
				expect(function() {
					FllScorer.computeScore({
						m01_own_blue_bin_in_other_safety: true,
						m04_own_blue_bin_in_tranfer_area: true
					});
				}).toThrowError(FllScorer.CannotScoreBothException);
			});

			/**
			 * 2016.01.16, Page 24, M04, Specific physical requirement, Yellow/blue bars
			 * "Value: Per Bin (See M01 on page 23) is completely in the other team’s Safety, by way of your West Transfer"
			 * 2015.08.27, Page 23, M01, Specific physical requirement
			 * "Value: 60 per bin in either safety"
			 *
			 * So regardless to the number of bars in the bin, the score is 60
			 * The empty bin case is tested in Mission 01
			 */
			it('Scores no points per bar when bin is in other team safety', function()
			{
				// Yellow
				expect(FllScorer.computeScore({
					m01_own_yellow_bin_in_other_safety: true,
					m04_yellow_bars_in_correct_bin: 1
				})).toEqual(60 + 0);

				// Blue
				expect(FllScorer.computeScore({
					m01_own_blue_bin_in_other_safety: true,
					m04_blue_bars_in_correct_bin: 1
				})).toEqual(60 + 0);
			});

			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Yellow/blue bars
			 * "Value: 7 Per Bar is completely in your East Transfer Area and/or completely on your East Transfer"
			 */
			it('Scores 7 points per bar in east tranfer area', function()
			{
				// Yellow
				expect(FllScorer.computeScore({
					m04_own_yellow_bin_in_tranfer_area: true,
					m04_yellow_bars_in_correct_bin: 1
				})).toEqual(7);

				expect(FllScorer.computeScore({
					m04_own_yellow_bin_in_tranfer_area: true,
					m04_yellow_bars_in_correct_bin: 2
				})).toEqual(7*2);

				// Blue
				expect(FllScorer.computeScore({
					m04_own_blue_bin_in_tranfer_area: true,
					m04_blue_bars_in_correct_bin: 1
				})).toEqual(7);

				expect(FllScorer.computeScore({
					m04_own_blue_bin_in_tranfer_area: true,
					m04_blue_bars_in_correct_bin: 2
				})).toEqual(7*2);
			});

			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Yellow/blue bars
			 * "Value: 6 Per Bar was never completely in your East Transfer Area"
			 */
			it('Scores 6 points per bar outside east transfer area', function()
			{
				// Yellow
				expect(FllScorer.computeScore({
					m04_yellow_bars_in_correct_bin: 1
				})).toEqual(6);

				expect(FllScorer.computeScore({
					m04_yellow_bars_in_correct_bin: 2
				})).toEqual(6*2);

				// Blue
				expect(FllScorer.computeScore({
					m04_blue_bars_in_correct_bin: 1
				})).toEqual(6);

				expect(FllScorer.computeScore({
					m04_blue_bars_in_correct_bin: 2
				})).toEqual(6*2);
			});

		});

		describe('Black bars', function() {

			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
			 * "Value: 8 Per Bar part of a scoring Flower Box, or in their original Setup position"
			 */
			it('Scores 8 points per bar in flower box or setup position', function()
			{
				expect(FllScorer.computeScore({
					m04_black_bars_in_flower_box_or_setup_position: 1
				})).toEqual(8);

				expect(FllScorer.computeScore({
					m04_black_bars_in_flower_box_or_setup_position: 2
				})).toEqual(8*2);
			});

			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
			 * "Value: 3 Per Bar in their matching Green Bin, or in the Landfill Bin"
			 */
			it('Scores 3 points per bar in matching bin', function()
			{
				expect(FllScorer.computeScore({
					m04_black_bars_in_matching_bin: 1
				})).toEqual(3);

				expect(FllScorer.computeScore({
					m04_black_bars_in_matching_bin: 2
				})).toEqual(3*2);
			});

			/**
			 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
			 * "Value: Minus 8 Per Bar anywhere else"
			 */
			it('Costs 8 points per bar anywhere else', function()
			{
				expect(FllScorer.computeScore({
					m04_black_bars_anywhere_else: 1
				})).toEqual(-8);

				expect(FllScorer.computeScore({
					m04_black_bars_anywhere_else: 2
				})).toEqual(-8*2);
			});

		});

	});

	describe('Mission 05', function() {

		/**
		 * 2015.08.27, Page 24, M05, Specific physical requirement
		 * "At least one Person is completely in the Sorter Area [...] Value: 60"
		 */
		it('Scores 60 points to put one person in sorter area', function()
		{
			expect(FllScorer.computeScore({
				m05_one_person_in_sorter_area: true
			})).toEqual(60);
		});

	});

	describe('Mission 06', function() {

		/**
		 * 2015.08.27, Page 24, M06, Specific physical requirement
		 * "Value: 65 The Engine/Windshield unit is installed in the unfolded Car in the proper space and direction"
		 */
		it('Scores 65 points to install the engine/windshield unit', function()
		{
			expect(FllScorer.computeScore({
				m06_engine_unit_installed: true
			})).toEqual(65);
		});

		/**
		 * 2015.08.27, Page 24, M06, Specific physical requirement
		 * "Value: 50 The Car is completely folded and completely in the East Transfer Area"
		 */
		it('Scores 50 points to fold the car', function()
		{
			expect(FllScorer.computeScore({
				m06_car_folded: true
			})).toEqual(50);
		});

		/**
		 * 2015.08.27, Page 24, M06, Specific physical requirement
		 * "Score Only One Way"
		 */
		it('Is not possible to score both', function()
		{
			expect(function() {
				FllScorer.computeScore({
					m06_engine_unit_installed: true,
					m06_car_folded: true
				});
			}).toThrowError(FllScorer.CannotScoreBothException);
		});

	});

	describe('Mission 07', function() {

		/**
		 * 2015.08.27, Page 24, M07, Specific physical requirement
		 * "Value: 30 Per Bag Plastic Bags are completely in Safety"
		 */
		it('Scores 30 points per plastic bag in safety', function()
		{
			expect(FllScorer.computeScore({
				m07_bags_in_safety: 1
			})).toEqual(30);

			expect(FllScorer.computeScore({
				m07_bags_in_safety: 2
			})).toEqual(30*2);
		});

		/**
		 * 2015.08.27, Page 24, M07, Specific physical requirement
		 * "Value: 20 Per Animal *Animals are completely in any circle which is completely empty of Plastic Bags"
		 */
		it('Scores 20 points per animal in circle', function()
		{
			expect(FllScorer.computeScore({
				m07_animals_in_circle: 1
			})).toEqual(20);

			expect(FllScorer.computeScore({
				m07_animals_in_circle: 2
			})).toEqual(20*2);
		});

		/**
		 * 2016.01.17, Page 24/25, M07, Specific physical requirement
		 * "Score Any That Apply"
		 * "Value: 20 Per Animal *Animals are completely in any circle which is completely empty of Plastic Bags"
		 * "Value: 35 The Chicken is completely in the small circle"
		 *
		 * So the chicken scores 20+35 = 55 points
		 */
		it('Scores 55 points to put the chicken in small circle', function()
		{
			expect(FllScorer.computeScore({
				m07_chicken_in_circle: true
			})).toEqual(20+35);
		});

	});

	describe('Mission 08', function() {

		/**
		 * 2015.08.27, Page 25, M08, Specific physical requirement
		 * "Value: 60 The Compost is ejected, but not completely in Safety"
		 */
		it('Scores 60 points if compost is partly in safety', function()
		{
			expect(FllScorer.computeScore({
				m08_compost_partly_in_safety: true
			})).toEqual(60);
		});

		/**
		 * 2015.08.27, Page 25, M08, Specific physical requirement
		 * "Value: 80 The Compost is completely in Safety"
		 */
		it('Scores 80 points if compost is completely in safety', function()
		{
			expect(FllScorer.computeScore({
				m08_compost_completely_in_safety: true
			})).toEqual(80);
		});

		/**
		 * 2015.08.27, Page 25, M08, Specific physical requirement
		 * "Score Only One Way"
		 */
		it('Is not possible to score both', function()
		{
			expect(function() {
				FllScorer.computeScore({
					m08_compost_partly_in_safety: true,
					m08_compost_completely_in_safety: true
				});
			}).toThrowError(FllScorer.CannotScoreBothException);
		});

	});

	describe('Mission 09', function() {

		/**
		 * 2015.08.27, Page 25, M09, Specific physical requirement
		 * "Value: 60 The Valuables are completely in Safety"
		 */
		it('Scores 60 points move valuables in safety', function()
		{
			expect(FllScorer.computeScore({
				m09_valuables_in_safety: true
			})).toEqual(60);
		});

	});

	describe('Mission 10', function() {

		/**
		 * 2015.08.27, Page 25, M10, Specific physical requirement
		 * "Value: 85 None of the Building’s twelve beams is left standing in Setup position"
		 */
		it('Scores 85 points to demolish the building', function()
		{
			expect(FllScorer.computeScore({
				m10_building_demolished: true
			})).toEqual(85);
		});

	});

	describe('Mission 11', function() {

		/**
		 * 2015.08.27, Page 25, M11, Specific physical requirement
		 * "Value: 40 Per Plane Toy Planes are completely in Safety"
		 */
		it('Scores 40 points per plane in safety', function()
		{
			expect(FllScorer.computeScore({
				m11_planes_in_safety: 1
			})).toEqual(40);

			expect(FllScorer.computeScore({
				m11_planes_in_safety: 2
			})).toEqual(40*2);
		});

	});

	describe('Mission 12', function() {

		/**
		 * 2015.08.27, Page 25, M12, Specific physical requirement
		 * "Value: 40 The Compost is perfectly nested inside one of the Packages [...]"
		 */
		it('Scores 40 points to put compost in package', function()
		{
			expect(FllScorer.computeScore({
				m12_compost_in_package: true
			})).toEqual(40);
		});

	});

	describe('Penalties', function() {

		/**
		 * We will need the points when penalties=0 in the following assertions
		 */
		var pointsWithNoPenalties = FllScorer.computeScore({
			penalties: 0
		});

		/**
		 * 2016.01.16, Page 11, Penalties
		 * "Place four Black Bars off the Field out of the way"
		 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
		 * "Value: 8 Per Bar part of a scoring Flower Box, or in their original Setup position"
		 *
		 * 4 bars * 8 points = 32 initial points
		 */
		it('Scores 32 black bars points when no penalty', function()
		{
			expect(pointsWithNoPenalties).toEqual(4*8);
		});

		/**
		 * 2016.01.16, Page 11, Penalties
		 * "Place four Black Bars off the Field out of the way"
		 * 2015.08.27, Page 25, Penalties
		 * "the Ref will place one Black Bar on the Mat [...] Value: See SORTING mission, black bar details"
		 *
		 * 2015.08.27, Page 24, M04, Specific physical requirement, Black bars
		 * "Value: 8 Per Bar part of a scoring Flower Box, or in their original Setup position"
		 * 2015.08.27, Page 24, M04, Specific physical requirement
		 * "Black bars are [...] Value: Minus 8 Per Bar anywhere else"
		 *
		 * So each penalty costs its "setup position" points and
		 * the "anywhere else" penalty, that is, -(8+8) = -16 per penalty
		 */
		it('Costs 16 points per penalty', function()
		{
			expect(FllScorer.computeScore({
				penalties: 1
			})).toEqual(pointsWithNoPenalties - 16);

			expect(FllScorer.computeScore({
				penalties: 2
			})).toEqual(pointsWithNoPenalties - 16*2);
		});

		/**
		 * 2015.08.27, Page 25, Penalties
		 * "[...] not to exceed four Bars"
		 */
		it('Cannot be more than 4 penalties', function()
		{
			expect(function() {
				FllScorer.computeScore({
					penalties: 5
				});
			}).toThrowError(FllScorer.InvalidValueException);
		});

	});

	describe('Leniency Bonus', function() {

		/**
		 * 2015.08.27, Page 24, M05, Specific physical requirement
		 * "M05 [...] Value: 60 Plus this R10 Leniency Bonus"
		 */
		it('Is granted when M05 is accomplished', function()
		{
			expect(FllScorer.hasLeniencyBonus({
				m05_one_person_in_sorter_area: false
			})).toEqual(false);

			expect(FllScorer.hasLeniencyBonus({
				m05_one_person_in_sorter_area: true
			})).toEqual(true);
		});

	});

	describe('Building demolish macro', function() {

		/**
		 * The Building demolition marco should replicate what append when the
		 * robot triggers the demolition of the building
		 */
		it('Should replicate actual behavior', function()
		{
			var initialState = FllScorer.initialMissionsState;

			var newState = FllScorer.macroDemolishBuilding(initialState);

			/**
			 * The mission should be successful
			 */
			expect(newState.m10_building_demolished).toEqual(true);

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
			expect(newState.m04_black_bars_in_flower_box_or_setup_position)
					.toEqual(initialState.m04_black_bars_in_flower_box_or_setup_position - 4);

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
			expect(newState.m04_black_bars_anywhere_else)
					.toEqual(initialState.m04_black_bars_anywhere_else + 4);
		});

		/**
		 * The macro should not run against a state where the building is
		 * already demolished
		 */
		it('Should do nothing if building is already demolished', function()
		{
			var initialState = FllScorer.initialMissionsState;

			var intermediateState = FllScorer.macroDemolishBuilding(initialState);

			var lastState = FllScorer.macroDemolishBuilding(intermediateState);

			expect(lastState).toEqual(intermediateState);
		});

	});

});
