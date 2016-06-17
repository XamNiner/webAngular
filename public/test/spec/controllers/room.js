'use strict';

describe('Controller: RoomctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('publicApp'));

  var RoomctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RoomctrlCtrl = $controller('RoomctrlCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(RoomctrlCtrl.awesomeThings.length).toBe(3);
  });
});
