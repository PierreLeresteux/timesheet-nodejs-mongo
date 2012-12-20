define(['controller', 'text!html/calendar.html', 'moment'], function (Controller, Template, Moment) {
	return Controller.extend({
		init: function() {
			log('CalendarController > init');
			var that = this;

			var $template = $(Template);
			that.mainTemplate = $template.find('#main-template').html();
			that.projectTemplate = $template.find('#project-template').html();
			that.dayItemTemplate = $template.find('#day-item-template').html();

			$.event.props.push('dataTransfer');
			$module.factory('$generateCalendar', function(){
				return that.generateCalendar;
			}).factory('$that', function(){
				return that;
			});

			$module.directive('project', function(){
				return {
					restrict: 'E',
					replace: true,
					scope: true,
					template: that.projectTemplate
				};
			}).directive('projectReady', function(){
				return that.projectDirective;
			}).directive('dragOver', function(){
				return that.dragOver;
			}).directive('accordion', function(){
				return that.loadAccordion;
			});

			$module.controller('MainController', ['$scope',that.mainController]);
			$module.controller('CalendarController', ['$scope','$resource','$generateCalendar',that.calendarController]);
			$module.controller('MenuController', ['$scope','$resource','$that',that.menuController]);
			$module.controller('DayItemController', ['$scope','$that','$rootScope',that.dayItemController]);
		},
		render: function() {
			log('CalendarController > render');
			var that = this;

			$container.empty().append(this.mainTemplate);
			angular.bootstrap(document.getElementById('mainController'), ['timesheet']);

			var $calendar = $(document.getElementById('calendar'));
			$calendar.on('addDayItemEvent', function(event){
				log('addDayItemEvent handler');
				that.dayItemData = {
					'id': event.projectId,
					'name': event.projectName,
					'hours': event.projectHours
				};

				var appendItems = function($days) {
					var i=0, length=$days.length;
					for(; i<length; i++){
						$day = $($days.get(i));
						if(!$day.hasClass('empty')) {
							$item = $(that.dayItemTemplate);
							$day.append($item);
							angular.bootstrap($item.get(0), ['timesheet']);
						}
					}
				};
				
				switch(that.targetType) {
					case 'week':
						var $week = $(event.dayElem).parent();
						appendItems($week.find('.day'));
						break;
					case 'month':
						var $month = $calendar.find('.month');
						var $weeks = $month.find('.week');
						var i=0, length=$weeks.length;
						for(; i<length; i++){
							appendItems($($weeks.get(i)).find('.day'));
						}
						break;
					default:
						var $item = $(that.dayItemTemplate);
						$(event.dayElem).append($item);
						angular.bootstrap($item.get(0), ['timesheet']);
						break;
				}
			});
		},
		mainController: function($scope) {
			$scope.dayItemHours = 8;
			$scope.$modal = $(document.getElementById('day-item-edit-modal'));

			$scope.close = function() {
				$scope.$modal.trigger('reveal:close');
			};

			$scope.cancel = function(event) {
				event.preventDefault();
				$scope.close();
			};

			$scope.confirm = function(event) {
				event.preventDefault();
				$rootScope.$broadcast('updateDayItemHoursEvent');
				$scope.close();
			};

			$scope.$on('editDayItemEvent', function() {
				log('editDayItemEvent');
				$scope.$modal.reveal();
			});
		},
		calendarController: function($scope, $resource, $generateCalendar){
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
			var Activities = $resource('/activities?user=:user&year=:year&month=:month',
				{user: 'sjob', year:start.format('YYYY'), month:start.format('M')});
			$scope.activities = Activities.query(function(){
				log($scope.activities);
			});
		},
		menuController: function ($scope, $resource, $that) {
			$scope.targetType = 'day';
			var Categories = $resource('/categories');
			$scope.categories = Categories.query();

			$scope.changeTargetType = function($event) {
				var value = $($event.target).attr('data-value');
				$scope.targetType = value;
				$that.targetType = value;
				$event.preventDefault();
			};

			$scope.searchChange = function() {
				log('search : '+$scope.search);
			};

			$scope.noEvent = function($event) {
				$event.stopPropagation();
				$event.preventDefault();
				return false;
			};
		},
		dayItemController: function($scope, $that, $rootScope) {
			$scope.id = $that.dayItemData.id;
			$scope.label = $that.dayItemData.name;
			$scope.hours = $that.dayItemData.hours;

			$scope.removeItem = function(event) {
				event.stopPropagation();
				$(event.target).parent().remove();
			};

			$scope.edit = function(event) {
				log('emit');
				$scope.$emit('editDayItemEvent');
				$scope.$broadcast('editDayItemEvent');
				$rootScope.$emit('editDayItemEvent');
				$rootScope.$broadcast('editDayItemEvent');
			};

			$scope.$on('updateDayItemHoursEvent', function() {
				log('updateDayItemHoursEvent');
				$scope.hours = $rootScope.hours;
			});
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
		},
		projectDirective: function($scope, element, attrs) {
			element.ready(function(){
				element.attr('draggable', 'true');
				element.on({
					dragstart: function(e){
						e.dataTransfer.effectAllowed = 'copy';
						e.dataTransfer.dropEffect = 'copy';
						e.dataTransfer.setData('text/project-id', $(this).attr('data-projectid'));
						e.dataTransfer.setData('text/project-name', $(this).attr('data-project-name'));
						e.dataTransfer.setData('text/project-hours', $(this).find('.input').val());
						$(element).addClass('dragged');
					},
					dragend: function(e){
						e.dataTransfer.setData('object/project-data', {});
						$(element).removeClass('dragged');
					}
				});
			});
		},
		dragOver: function($scope, element, attrs) {
			if($scope.$eval('day.class').indexOf('empty')<0){
				element.on({
					dragenter: function(event){
						$(this).addClass('dayInHover');
					},
					dragleave: function(event){
						$(this).removeClass('dayInHover');
					},
					dragover: function(event){
						event.preventDefault();
					},
					drop: function(event){
						$(this).removeClass('dayInHover');
						var addDayItemEvent = new $.Event('addDayItemEvent');
						addDayItemEvent.dayElem = event.target;
						addDayItemEvent.projectId = event.dataTransfer.getData('text/project-id');
						addDayItemEvent.projectName = event.dataTransfer.getData('text/project-name');
						addDayItemEvent.projectHours = event.dataTransfer.getData('text/project-hours');
						log('trigger addDayItemEvent');
						$(document.getElementById('calendar')).trigger(addDayItemEvent);
					}
				});
			}
		},
		loadAccordion: function($scope, element, attrs) {
			if ($scope.$last){
				var menuElem = document.getElementById('menu');
				$(menuElem).foundationAccordion();
			}
		}
	});
});