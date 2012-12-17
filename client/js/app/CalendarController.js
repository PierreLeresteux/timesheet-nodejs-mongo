define(['controller','text!html/calendar.html','moment'], function(Controller,Template,Moment){
	return Controller.extend({
		init: function() {
			log('CalendarController > init');
			var that = this;

			$module.factory('$generateCalendar', function(){
				return that.generateCalendar;
			});
			$module.controller('CalendarController', ['$scope','$generateCalendar',that.calendarController]);

			$module.controller('MenuController', ['$scope',that.menuController]);
		},
		render: function() {
			log('CalendarController > render');
			$container.empty().append(Template);

			var menuElem = document.getElementById('menu');
			$(menuElem).foundationAccordion();
			angular.bootstrap(menuElem, ['timesheet']);

			angular.bootstrap(document.getElementById('calendar'), ['timesheet']);
		},
		calendarController: function($scope, $generateCalendar){
			$scope.prevMonth = function() {
				var startDate = $scope.activeDate;
				$generateCalendar($scope, startDate.add('months', -1).startOf('month'));
			};

			$scope.nextMonth = function() {
				var startDate = $scope.activeDate;
				$generateCalendar($scope, startDate.add('months', 1).startOf('month'));
			};

			var days, i, j, className, start=moment().startOf('month');
			$generateCalendar($scope, start);
		},
		menuController: function($scope) {
			$scope.targetType = 'day';

			$scope.changeTargetType = function($event) {
				$scope.targetType = $($event.target).attr('data-value');

				$event.preventDefault();
			};

			$scope.searchChange = function() {
				log('search : '+$scope.search);
			};
		},
		generateCalendar: function($scope, start){
			$scope.activeDate=moment(start);
			var activeMonth = moment().format('M');
			var date=moment(start), now=start.format('dddd');
			var today=activeMonth==date.format('M')?moment().format('D'):undefined;
			$scope.selectedMonth = start.format('MMMM YYYY');

			switch(now){
				case 'Saturday': date.add('days', 2); break;
				case 'Sunday': date.add('days', 1); break;
			}
			$scope.weeks=[];
			for(i=0; i<5; i++){
				days=[];
				for(j=0; j<5; j++){
					switch(j) {
						case 0: className='monday'; break;
						case 1: className='tuesday'; break;
						case 2: className='wednesday'; break;
						case 3: className='thursday'; break;
						case 4: className='friday'; break;
						default: className='';
					}
					if(className==date.format('dddd').toLowerCase() && date.format('M')==start.format('M')){
						days.push({
							'class': className+(today == date.format('D') ? ' today' : ''),
							'text': date.format('D')
						});
						date.add('days', className=='friday' ? 3 : 1);
					} else {
						days.push({
							'class': className+' empty',
							'text': ''
						});
					}
				}

				$scope.weeks.push({
					'days': days,
					top: i*20,
					bottom: 100-((i*20)+20)
				});
			}
		}
	});
});