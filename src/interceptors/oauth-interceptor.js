
/**
 * OAuth interceptor.
 *
 * @ngInject
 */

import angular from 'angular';
import queryString from 'query-string';

function oauthInterceptor($q, $rootScope, OAuthToken) {
  return {
    request: function(config) {
      // don't add the authorization header when the client is requesting a new token or refreshing one.
      if(angular.isDefined(config.data)) {
        var data = queryString.parse(config.data);

        if (angular.isDefined(data.grant_type) && (data.grant_type === 'password' || data.grant_type === 'refresh_token')) {
          return config;
        }
      }
      
      if(OAuthToken.getAuthorizationHeader()) {
        config.headers = config.headers || {};
        config.headers.Authorization = OAuthToken.getAuthorizationHeader();
      }
      
      return config;
    },
    responseError: function(rejection) {
      // Catch `invalid_request` and `invalid_grant` errors and ensure that the `token` is removed.
      if (400 === rejection.status && rejection.data &&
        ('invalid_request' === rejection.data.error || 'invalid_grant' === rejection.data.error)
      ) {
        OAuthToken.removeToken();

        $rootScope.$emit('oauth:error', rejection);
      }

      // Catch `invalid_token` and `unauthorized` errors.
      // The token isn't removed here so it can be refreshed when the `invalid_token` error occurs.
      if (401 === rejection.status &&
        (rejection.data && 'invalid_token' === rejection.data.error) ||
        (rejection.headers('www-authenticate') && 0 === rejection.headers('www-authenticate').indexOf('Bearer'))
      ) {
        $rootScope.$emit('oauth:error', rejection);
      }

      return $q.reject(rejection);
    }
  };
}

/**
 * Export `oauthInterceptor`.
 */

export default oauthInterceptor;
