(function(){
    angular
    .module('users',['FBAngular'])
    .controller('UserController', [
        '$mdSidenav', '$mdBottomSheet', '$log', '$q','$scope','$element','Fullscreen','$mdToast','$animate',
        UserController
    ]);	
    /**
    * Main Controller for the Angular Material Starter App
    * @param $scope
    * @param $mdSidenav
    * @param avatarsService
    * @constructor
    */
	function UserController( $mdSidenav, $mdBottomSheet, $log, $q, $scope, $element, Fullscreen, $mdToast, $animate) {
	 $scope.divshow = false; /** It hides the 'side navigate' tab */
        $scope.toastPosition = {
            bottom: true,
            top: false,
            left: true,
            right: false
        };
        $scope.toggleSidenav = function(ev) {
            $mdSidenav('right').toggle();
        };
        $scope.getToastPosition = function() {
            return Object.keys($scope.toastPosition)
            .filter(function(pos) { return $scope.toastPosition[pos]; })
            .join(' ');
        };
        $scope.showActionToast = function() {        
            var toast = $mdToast.simple()
            .content(helpArray[0])
            .action(helpArray[3])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
        
            var toast1 = $mdToast.simple()
            .content(helpArray[1])
            .action(helpArray[3])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
          
            var toast2 = $mdToast.simple()
            .content(helpArray[2])
            .action(helpArray[4])
            .hideDelay(15000)
            .highlightAction(false)
            .position($scope.getToastPosition());
			
            $mdToast.show(toast).then(function() {
                $mdToast.show(toast1).then(function() {
                    $mdToast.show(toast2).then(function() {
                    });
                });
            });     
        };
  
        var self = this;
        self.selected     = null;
        self.users        = [ ];
        self.toggleList   = toggleUsersList;  	
		$scope.pause_ctrls_disable = true; /** It disable the pause button */
		$scope.showValue = false; /** It hides the 'Control' tab */
        $scope.showVariables = false; /** I hides the 'Variables' tab */
		$scope.isActive = true;
        $scope.isActive1 = true;
        $scope.goFullscreen = function () {
            /** Full screen */
            if (Fullscreen.isEnabled())
                Fullscreen.cancel();
            else
                Fullscreen.all();
            /** Set Full screen to a specific element (bad practice) */
            /** Full screen.enable( document.getElementById('img') ) */
        };
 
        /** Click event function of the Reset button */
        $scope.resetExp = function() {
            resetExperiment($scope); /** Function defined in experiment.js file */
			$mdToast.cancel();
        };
		
		/** Change event function of Population drop down */
		$scope.setBacteria = function() {
			enable_drag = false;
			setBacteriaFn($scope); /** Function defined in experiment.js file */
        };
		
		$scope.toggle = function() {
			$scope.showValue = !$scope.showValue;
			$scope.isActive = !$scope.isActive;
		};
		
		$scope.toggle1 = function() {
			$scope.showVariables = !$scope.showVariables;
			$scope.isActive1 = !$scope.isActive1;
		};
		
        /**
        * First hide the bottom sheet IF visible, then
        * hide or Show the 'left' sideNav area
        */
        function toggleUsersList() {
			$mdSidenav('right').toggle();
        }
    }
})();