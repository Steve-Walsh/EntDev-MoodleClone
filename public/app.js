var myApp = angular.module('myApp', ['ngRoute', 'ngFileUpload']);



myApp.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: 'partials/stagingArea.html',
                    controller: 'StagingAreaController'
                })
                .when('/module', {
                    templateUrl: 'partials/module_home.html',
                    controller: 'ModuleController'
                })
                .when('/course', {
                    templateUrl: 'partials/course_home.html',
                    controller: 'CourseController'
                })
                .when('/login', {
                    templateUrl: 'partials/login.html',
                    controller: 'UsersController'
                })
                .when('/register', {
                    templateUrl: 'partials/register.html',
                    controller: 'UsersController'
                })
                .when('/createModule', {
                    templateUrl: '/partials/createModule.html',
                    controller: 'CreateModuleController'
                })
                .when('/module/:id', {
                    templateUrl: '/partials/module_details.html',
                    controller: 'ModuleDetailsController'
                })
                .otherwise({
                    redirectTo: "/"
                })
        }
    ])
    .run(function($rootScope, $location, UsersService) {
        $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
            UsersService.isLoggedInApi();
            if ($location.path() != "/login") {
                if ($location.path() != "/register") {
                    if (!$rootScope.loggedInUser) {
                        $location.path('/login');
                    }
                }
            }
        });
    })

//Main

myApp.controller('MainController', ["$scope", "$location", "$rootScope", "ModuleService", "UsersService" , '$window', function($scope, $location, $rootScope, ModuleService, UsersService, $window) {
    $scope.loggedInUser = UsersService.getLoggedInUser();

    if (UsersService.getLoggedInUser()) {

        ModuleService.getAllModules().success(function(modules) {
            $scope.modules = modules
        })

    }

    $scope.logout = function() {
        UsersService.logout()
        $window.location.reload()

    }
}])

// Staging Area
myApp.controller('StagingAreaController', ["$scope", "$location", "ModuleService", "UsersService", "$window", function($scope, $location, ModuleService, UsersService, $window) {
    $scope.text = "stagingArea page"
    $scope.loggedInUser = UsersService.getLoggedInUser();
    ModuleService.getAllModules().success(function(modules) {
        $scope.modules = modules
    })

    $scope.deleteModule = function(id) {
        var module = {
            id: id
        }

        var confirm = $window.confirm("Are you sure you want to delete this module")
        if (confirm) {
            deleteModule(module)
            window.location.reload();
        }

    }
}])


//Module
myApp.controller('ModuleController', ["$scope", "$location", "$rootScope", "UsersService", function($scope, $location, $rootScope, UsersService) {
    $scope.loggedInUser = UsersService.getLoggedInUser();

}])

myApp.controller('CreateModuleController', ["$scope", "$location", "$rootScope", "ModuleService", "UsersService", '$http', function($scope, $location, $rootScope, ModuleService, UsersService, $http) {
    $scope.loggedInUser = UsersService.getLoggedInUser();
    $scope.newModule = {
        private: 'yes'
    };
    $http.get('/api/modules/getMyModules/' + $scope.loggedInUser.id).success(function(res) {
        console.log("my modules is ", res)
        $scope.myModules = res
    })
    $scope.createModule = function() {
        $scope.newModule.lecture = $scope.loggedInUser.id
        createModule($scope.newModule)
        window.location.href = '/'
    }
}])

myApp.controller('ModuleDetailsController', ["$scope", "$location", "$rootScope", "ModuleService", '$routeParams', '$http', "UsersService", 'Upload', '$window', function($scope, $location, $rootScope, ModuleService, $routeParams, $http, UsersService, Upload, $window) {

    var loggedInUser = UsersService.getLoggedInUser();
    $scope.loggedInUser = loggedInUser;

    $scope.addSectionData = {
        id: {},
        hidden: {}
    }

    $scope.edit = false
    $scope.studentView = loggedInUser.role

    $scope.setEdit = function(change) {
        $scope.edit = change
    }

    $scope.setStudentView = function(change) {
        $scope.studentView = change
        $scope.loggedInUser.role = change
        console.log($scope.loggedInUser)
    }

    $http.get('/api/users/students/', {
            headers: {
                Authorization: 'Bearer ' + UsersService.getTokenApi()
            }
        })
        .success(function(res) {
            $scope.studentsList = res
        })


    $http.get('/api/modules/module/' + $routeParams.id)
        .success(function(res) {
            $scope.module = res
        }).then(function() {
            $http.get('/api/users/students/', {
                    headers: {
                        Authorization: 'Bearer ' + UsersService.getTokenApi()
                    }
                })
                .success(function(res) {
                    res.forEach(function(student) {
                        student.enrolled = false
                        if ($scope.module.students.length > 0) {
                            $scope.module.students.forEach(function(modStudent) {
                                if (student._id == modStudent) {
                                    student.enrolled = true
                                }
                            })
                        }
                    })
                }).then(function(res) {
                    $scope.studentsList = res.data
                })
        }).then(function() {
            if (loggedInUser.role == "lecture") {
                $http.get('/api/modules/getMyModules/' + loggedInUser.id)
                    .success(function(res) {
                        var module = $scope.module
                        var currentSections = []
                        module.sections.forEach(function(res) {
                            currentSections.push(res.sectionDetails._id)
                        })
                        $scope.mySections = []
                        res.forEach(function(dataItem) {
                            if (dataItem._id != $routeParams.id) {
                                dataItem.sections.forEach(function(sectionItem) {
                                    if (currentSections.indexOf(sectionItem.sectionDetails._id) == -1) {
                                        var newSection = sectionItem
                                        newSection.moduleName = dataItem.name
                                        $scope.mySections.push(newSection)
                                    }
                                })
                            }
                        })
                    })
            }
        })





    $scope.addSection = function(newSection) {
        console.log(newSection)
        newSection.moduleId = $routeParams.id
        addSection(newSection)
        window.location.reload();
    }

    $scope.importSection = function() {
        var dataId = $scope.addSectionData.id
        var dataHidden = $scope.addSectionData.hidden
        var importSectionItems = []

        Object.keys(dataId).forEach(function(dataIdItem) {
            if (dataId[dataIdItem]) {
                importSectionItems.push({ id: dataIdItem, hidden: false })
            }
        })

        Object.keys(dataHidden).forEach(function(dataHiddenItem) {
            importSectionItems.forEach(function(item) {
                if (item.id == dataHiddenItem) {
                    if (dataHidden[dataHiddenItem]) {
                        item.hidden = true
                    }
                }
            })
        })
        importSections = {
            moduleId: $routeParams.id,
            section: importSectionItems
        }
        importSection(importSections)
        window.location.reload();
    }

    $scope.unlink = function(sectionId) {
        var section = {
            lecture_id: loggedInUser.id,
            module_id: $routeParams.id,
            id: sectionId
        }
        unlinkSection(section)

    }

    $scope.showSec = function(id) {
        var sectionDetails = {
            moduleId: $routeParams.id,
            sectionId: id
        }
        showSec(sectionDetails)
        window.location.reload();
    }

    $scope.hideSec = function(id) {
        var sectionDetails = {
            moduleId: $routeParams.id,
            sectionId: id
        }
        hideSec(sectionDetails)
        window.location.reload();
    }

    $scope.removeFile = function(fileId, secId) {
        console.log(fileId, secId)
        var file = {
            fileId: fileId,
            secId: secId
        }
        removeFile(file);
    }

    $scope.showFile = function(fileId, SectionId) {
        var fileDetails = {
            moduleId: $routeParams.id,
            sectionId: SectionId,
            fileId: fileId
        }
        showFile(fileDetails)
        window.location.reload();
    }

    $scope.hideFile = function(fileId, SectionId) {
        var fileDetails = {
            moduleId: $routeParams.id,
            sectionId: SectionId,
            fileId: fileId
        }
        hideFile(fileDetails)
        window.location.reload();
    }

    $scope.enrollStudent = function(id) {
        var studentDetails = {
            moduleId: $routeParams.id,
            studentId: id
        }
        enrollStudent(studentDetails)
    }

    $scope.removeStudent = function(id) {
        var studentDetails = {
            moduleId: $routeParams.id,
            studentId: id
        }
        removeStudent(studentDetails)
    }

    $scope.deleteSection = function(id) {
        var sectionDetails = {
            moduleId: $routeParams.id,
            sectionId: id
        }
        var confirm = $window.confirm("Are you sure you want to delete this section")
        if (confirm) {
            deleteSection(sectionDetails)
            window.location.reload();
        }
    }


}])



myApp.factory('ModuleService', ['$http', '$rootScope', "$location", "UsersService", function($http, $rootScope, $location, UsersService) {


    createModule = function(newModule) {
        $http.post('/api/modules/createNewModule', newModule)
    }

    addSection = function(newSection) {
        $http.post('/api/modules/addSection', newSection)
    }

    importSection = function(newSections) {
        $http.post('/api/modules/importSections', importSections)
    }
    unlinkSection = function(section) {
        $http.post('/api/modules/unlinkSection', section)
    }
    showSec = function(sectionDetails) {
        $http.post('/api/modules/showSection', sectionDetails)
    }
    hideSec = function(sectionDetails) {
        $http.post('/api/modules/hideSection', sectionDetails)
    }
    removeFile = function(file) {
        $http.post('/api/sections/removeFile', file)
    }
    showFile = function(fileDetails) {
        $http.post('/api/sections/showFile', fileDetails)
    }
    hideFile = function(fileDetails) {
        $http.post('/api/sections/hideFile', fileDetails)
    }
    enrollStudent = function(studentDetails) {
        $http.post('/api/modules/enrollStudent', studentDetails)
    }
    removeStudent = function(studentDetails) {
        $http.post('/api/modules/removeStudent', studentDetails)
    }
    deleteSection = function(sectionDetails) {
        $http.post('/api/modules/removeSection', sectionDetails)
    }
    deleteModule = function(id) {
        $http.post('/api/modules/deleteModule', id)
    }

    var api = {
        getAllStudnets: function() {
            return $http.get('/api/users/studnets')
        },
        getAllModules: function() {
            return $http.get('/api/modules/', {
                headers: {
                    Authorization: 'Bearer ' + UsersService.getTokenApi()
                }
            })
        }

    }
    return api


}])






//Course
myApp.controller('CourseController', ["$scope", "$location", "$rootScope", '$window', function($scope, $location, $rootScope, $window) {
    $scope.text = "course page"
}])

//Login

myApp.controller('UsersController', ['$scope', '$http', '$location', 'UsersService' , '$window'	,function($scope, $http, $location, UsersService, $window) {

        var loggedInUser = null;

        $scope.register = function(newAccount) {
            console.log("register called")
            register($scope.newAccount);
            $scope.newAccount = '';
        }
        var loggedInUser = null;

        $scope.login = function(userDetails) {
            login($scope.userDetails)
            // $window.location.path('/')
            console.log("logged")
            // window.location.href = '/'
            // $scope.userDetails = '';
        }

        $scope.remove = function(id) {
            console.log(id);
            $http.delete('/api/users/' + id);
            $location.path('/users')
            console.log($location.path())

        };

        $scope.editUser = function(user) {
            $http.put('/api/user/' + user._id, user)
        }


    }
])


myApp.factory('UsersService', ['$http', '$window', '$rootScope', function($http, $window, $rootScope) {

    var saveToken = function(token) {
        $window.localStorage['mean-token'] = token;
    };


    var getToken = function() {
        return $window.localStorage['mean-token'];
    };

    logout = function() {
        $window.localStorage.removeItem('mean-token');
    };

    isLoggedIn = function() {
        var token = getToken();
        var payload;
        if (token === "undefined") {
            console.log("bad token")
            return false
        } else if (token != null && token != "") {
            payload = token.split('.')[1];
            payload = $window.atob(payload);
            payload = JSON.parse(payload);


            return payload;
        } else {
            return false;
        }
    };

    var currentUser = function() {
        if (isLoggedIn()) {
            var token = getToken();
            var payload = token.split('.')[1];
            payload = $window.atob(payload);
            payload = JSON.parse(payload);
            return {
                email: payload.email,
                name: payload.name,
                id: payload._id,
                role: payload.role
            };
        } else {
            return false;
        }
    };




    register = function(newAccount) {
        $http.post('api/users/registerNewUser', newAccount).then(function(res) {
            console.log(res)
        })
    }

    remove = function(id) {
        $http.delete('api/users/' + id);
    }


    login = function(userDetails) {

        $http.post('/authenticate', userDetails).then(function(res) {
            if (res.success = true) {
                console.log(res.success)

                saveToken(res.data.token)
                 window.location.href = '/'

            } else {
                logout();
            }

        })


    }

    loggedIn = function() {
        return loggedInUser;
    }


    var api = {
        getUsers: function() {
            return $http.get('/api/users')
        },

        loggedIn: function() {
            return loggedInUser;
        },
        getTokenApi: function() {
            return getToken();
        },
        isLoggedInApi: function() {
            $rootScope.loggedInUser = isLoggedIn();
            isLoggedIn();
        },

        getLoggedInUser: function() {
            return currentUser();
        },
        logout: function() {
            return logout()
        }
    }

    return api
}])
