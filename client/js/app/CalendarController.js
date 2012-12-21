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
			}).factory('$dayItemTemplate', function(){
				return that.dayItemTemplate;
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
			$module.controller('CalendarController', ['$rootScope','$scope','$resource','$compile','$generateCalendar','$dayItemTemplate',that.calendarController]);
			$module.controller('MenuController', ['$rootScope', '$scope','$resource',that.menuController]);
			$module.controller('DayItemController', ['$scope',that.dayItemController]);
		},
		render: function() {
			log('CalendarController > render');
			var that = this;
			$container.empty().append(this.mainTemplate);
			angular.bootstrap(document.getElementById('mainController'), ['timesheet']);
		},
		mainController: function($scope) {
			$scope.dayItemHours = 8;
			$scope.$modal = $(document.getElementById('day-item-edit-modal'));
			$scope.$hoursInput = $scope.$modal.find('input');

			$scope.close = function() {
				$scope.$modal.trigger('reveal:close');
			};

			$scope.cancel = function(event) {
				event.preventDefault();
				$scope.close();
			};

			$scope.confirm = function(event) {
				event.preventDefault();
				$scope.scopeToEdit.hours = $scope.dayItemHours;
				$scope.close();
			};

			$scope.$on('editDayItemEvent', function(event, data){
				$scope.dayItemHours = data.hours;
				$scope.$modal.reveal({'opened': function(){
					$scope.$hoursInput.focus().select();
				}});
				$scope.scopeToEdit = event.targetScope;
			});

			$scope.$hoursInput.on('keyup', function(event){
				if(event.keyCode == 13){
					$scope.confirm(event);
				}
			});
		},
		calendarController: function($rootScope, $scope, $resource, $compile, $generateCalendar, $dayItemTemplate){
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

			var $calendar = $(document.getElementById('calendar'));
			$scope.$on('addDayItemEvent', function(event, data){
				event.stopPropagation();
				$scope.dayItemData = {
					'id': data.projectId,
					'name': data.projectName,
					'hours': data.projectHours
				};

				var addItem = function() {
					$compile($dayItemTemplate)($scope, function(elem, $scope){
						$(data.dayElem).append(elem);
					});
					$scope.$apply();
				};

				var appendItems = function($days) {
					var i=0, length=$days.length;
					for(; i<length; i++){
						$day = $($days.get(i));
						if(!$day.hasClass('empty')) {
							addItem();
						}
					}
				};
				
				switch($rootScope.targetType) {
					case 'week':
						var $week = $(data.dayElem).parent();
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
						addItem();
						break;
				}
			});
		},
		menuController: function ($rootScope, $scope, $resource) {
			$scope.targetType = 'day';
			var Categories = $resource('/categories');
			$scope.categories = Categories.query();

			$scope.changeTargetType = function($event) {
				var value = $($event.target).attr('data-value');
				$scope.targetType = value;
				$rootScope.targetType = value;
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
		dayItemController: function($scope) {
			log('dayItemController');
			$scope.id = $scope.$parent.dayItemData.id;
			$scope.label = $scope.$parent.dayItemData.name;
			$scope.hours = $scope.$parent.dayItemData.hours;

			$scope.removeItem = function(event) {
				event.stopPropagation();
				$(event.target).parent().remove();
				$scope.$destroy();
			};

			$scope.edit = function(event) {
				$scope.$emit('editDayItemEvent', {'hours': $scope.hours});
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
						var data = {
							'dayElem': event.target,
							'projectId': event.dataTransfer.getData('text/project-id'),
							'projectName': event.dataTransfer.getData('text/project-name'),
							'projectHours': event.dataTransfer.getData('text/project-hours')
						};
						$scope.$emit('addDayItemEvent', data);
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