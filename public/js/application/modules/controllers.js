/**
 * Created by Roman on 27.07.2015.
 */

var homecloud = angular.module("HomeCloud");

homecloud.controller("ArtistViewController", [
    "Resolved", "SearchService", "SyncService", "$scope", "$routeParams",
    function (Resolved, SearchService, SyncService, $scope, $routeParams) {

        $scope.artist = $routeParams.artist || "";
        $scope.tracks = SyncService.tracks(Resolved.tracks);
        $scope.tracks_selected = [];
        $scope.busy = false;
        $scope.end = false;

        $scope.fetch = SearchService.tracks.curry({artist: $scope.artist});

        $scope.load = function () {
            $scope.busy = true;
            $scope.fetch($scope.tracks.length).success(function (data) {
                if (data.tracks.length > 0) {
                    $scope.tracks = $scope.tracks.concat(SyncService.tracks(data.tracks));
                    $scope.busy = false;
                } else {
                    $scope.end = true;
                }
            })
        };

    }
]);

homecloud.controller("AllTracksAlbumViewController", [
    "Resolved", "SearchService", "SyncService", "$scope",
    function (Resolved, SearchService, SyncService, $scope) {

        $scope.tracks = SyncService.tracks(Resolved.tracks);
        $scope.tracks_selected = [];
        $scope.busy = false;
        $scope.end = false;

        $scope.fetch = SearchService.tracks.curry(Empty);

        $scope.load = function () {
            $scope.busy = true;
            $scope.fetch($scope.tracks.length).success(function (data) {
                if (data.tracks.length > 0) {
                    $scope.tracks = $scope.tracks.concat(SyncService.tracks(data.tracks));
                    $scope.busy = false;
                } else {
                    $scope.end = true;
                }
            })
        };

    }
]);

homecloud.controller("AllArtistsViewController", [
    "AllArtistsContent", "SearchService", "$scope", function (AllArtistsContent, SearchService, $scope) {

        $scope.artists = AllArtistsContent.artists;
        $scope.busy = false;
        $scope.end = false;

        $scope.load = function () {
            $scope.busy = true;
            SearchService.artists($scope.artists.length, "").success(function (data) {
                if (data.artists.length > 0) {
                    $scope.artists = $scope.artists.concat(data.artists);
                    $scope.busy = false;
                } else {
                    $scope.end = true;
                }
            })
        };

    }
]);