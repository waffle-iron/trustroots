(function () {
  'use strict';

  /**
   * Service for handing filters
   */
  angular
    .module('core')
    .factory('SearchMapService', SearchMapService);

  /* @ngInject */
  function SearchMapService($q, $log, Authentication, LocationService, locker) {

    // Default location for all TR maps
    // Returns `{lat: Float, lng: Float, zoom: 6}`
    var defaultLocation = LocationService.getDefaultLocation(6);

    // Make cache id unique for this user
    var cachePrefix = (Authentication.user) ? 'search.filters.' + Authentication.user._id : 'search.filters';

    var service = {
      getMapCenter: getMapCenter,
      cacheMapCenter: cacheMapCenter
    };

    return service;

    /**
     * Return map location from cache or fallback to default location
     */
    function getMapCenter() {
      $log.log('->getMapCenter');
      return $q(function(resolve) {

        // Is local/sessionStorage supported? This might fail in browser's incognito mode
        if (locker.supported()) {
          // Get location from cache, return `false` if it doesn't exist in locker
          var cachedLocation = locker.get(cachePrefix, false);

          // Validate cached location or fall back to default
          // If it's older than two days, we won't use it.
          if (cachedLocation &&
             cachedLocation.lat &&
             cachedLocation.lng &&
             cachedLocation.zoom &&
             isFinite(cachedLocation.lat) &&
             isFinite(cachedLocation.lng) &&
             isFinite(cachedLocation.zoom) &&
             cachedLocation.date &&
             moment().diff(moment(cachedLocation.date), 'days') < 2) {
            resolve(cachedLocation);
          } else {
            // No cached location found, it was invalid or it was outdated
            resolve(defaultLocation);
          }

          // Make sure there's something in locker for the next time
          // If the key already exists in locker, then no action will
          // be taken and false will be returned
          $log.log('->getMapCenter: cache location');
          locker.add(cachePrefix, defaultLocation);
        } else {
          // When local/sessionStorage is not supported, use default location:
          resolve(defaultLocation);
        }

      });
    }

    /**
     * Save map state to the cache
     */
    function cacheMapCenter(location) {
      if (angular.isUndefined(location.lat) || angular.isUndefined(location.lng) || angular.isUndefined(location.zoom)) {
        $log.warn('Cannot cache location: missing coordinates or zoom.');
        return;
      }

      locker.put(cachePrefix, {
        'lat': location.lat,
        'lng': location.lng,
        'zoom': location.zoom,
        'date': new Date()
      });
    }

  }

}());