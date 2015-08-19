/**
 * Created by Roman on 27.07.2015.
 */

var MusicLoud = angular.module("MusicLoud");


MusicLoud.factory("AccountService", ["$http", function ($http) {
    return {
        login: function (data) {
            return $http.post("/api/login", data);
        },
        logout: function () {
            return $http.post("/api/logout");
        },
        init: function () {
            return $http.get("/api/self");
        }
    };
}]);

MusicLoud.factory("TrackService", ["$http", function ($http) {
    return {
        create: function () {
            return $http.post("/api/track/create", Empty);
        },
        upload: function (data, callback) {
            return $.ajax({
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", callback, false);
                    return xhr;
                },
                url: "/api/track/upload",
                type: "POST",
                data: data,
                processData: false,
                contentType: false
            });
        },
        unlink: function (data) {
            return $http.post("/api/track/delete", data);
        },
        edit: function (data) {
            return $http.post("/api/track/edit", data);
        },
        getPeaks: function (id) {
            return $http.get("/peaks/" + id);
        },
        changeArtwork: function (data) {
            return $http.post("/api/track/artwork", data, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }
    };
}]);

MusicLoud.factory("HeadersService", ["$http", function ($http) {
    return {
        artist: function (album_artist) {
            return $http.get("/api/headers/artist?" + serialize_uri({ album_artist: album_artist }));
        },
        genre: function (genre) {
            return $http.get("/api/headers/genre?" + serialize_uri({ genre: genre }));
        }
    }
}]);

MusicLoud.factory("SearchService", ["$http", "SyncService", function ($http, SyncService) {
    return {
        artists: function (opts, offset, special) {
            var uri = {};

            uri.o = offset || 0;

            if (opts.q) { uri.q = opts.q }

            uri.l = opts.limit || 50;

            return $http.get("/api/catalog/artists?" + serialize_uri(uri), special).then(function (response) {
                return deflateCollection(response.data);
            });
        },
        albums: function (opts, offset, special) {
            var uri = {};

            uri.o = offset || 0;

            if (opts.q !== undefined) { uri.q = opts.q }
            if (opts.compilations !== undefined) { uri.compilations = opts.compilations }

            uri.l = opts.limit || 50;

            return $http.get("/api/catalog/albums?" + serialize_uri(uri), special).then(function (response) {
                return deflateCollection(response.data);
            });
        },
        genres: function (opts, offset, special) {
            var uri = {};

            uri.o = offset || 0;

            if (opts.q) { uri.q = opts.q }

            uri.l = opts.limit || 50;

            return $http.get("/api/catalog/genres?" + serialize_uri(uri), special).then(function (response) {
                return deflateCollection(response.data);
            });
        },
        tracks: function (opts, offset, special) {

            var uri = {};

            uri.o = offset || 0;

            if (opts.q !== undefined) { uri.q = opts.q }
            if (opts.s !== undefined) { uri.sort = opts.s }
            if (opts.compilations !== undefined) { uri.compilations = opts.compilations }
            if (opts.artist !== undefined) { uri.artist = opts.artist }
            if (opts.album !== undefined) { uri.album = opts.album }
            if (opts.genre !== undefined) { uri.genre = opts.genre }
            uri.l = opts.limit || 50;

            return $http.get("/api/catalog/tracks?" + serialize_uri(uri), special).then(function (response) {
                return SyncService.tracks(deflateCollection(response.data));
            });
        }
    };
}]);

MusicLoud.factory("GroupingService", [function () {

    return function (key) {

        var groups = [],

            getGroup = function (k) {
                if (groups.length == 0 || groups[groups.length - 1].key !== k) {
                    groups.push({ key: k, items: [] })
                }
                return groups[groups.length - 1].items;
            };

        console.log("Initialized groups with key " + key);
        return {
            addItems: function (coll) {
                console.log("Adding " + coll.length + " items into groups");
                for (var i = 0, length = coll.length; i < length; i += 1) {
                    getGroup(coll[i][key]).push(coll[i]);
                }
            },
            removeItems: function (itemKey, coll) {
                for (var j = 0, groupCount = groups.length; j < groupCount; j += 1) {
                    for (var i = 0, itemsCount = groups[j].items.length; i < itemsCount; i += 1) {
                        for (var k = 0, collItemCount = coll.length; k < collItemCount; k += 1) {
                            if (groups[j].items[i][itemKey] === coll[k][itemKey]) {
                                console.log("Removing " + coll[k][itemKey] + " from group " + groups[j].key);
                                groups[j].items.splice(i, 1);
                            }
                        }
                    }
                }
            },
            removeGroup: function (group) {
                for (var i = 0, length = groups.length; i < length; i += 1) {
                    if (groups[i].key === group) {
                        groups.splice(i, 1);
                        break;
                    }
                }
            },
            getGroups: function () {
                console.log("Requested groups collection");
                return groups;
            },
            clear: function () {
                console.log("Cleaning groups");
                while (groups.length) {
                    groups.shift();
                }
            }
        }
    };

}]);

MusicLoud.factory("Library", [function () {
    var obj = {
        groupAlbums: function (tracks) {
            var albumsList = [];
            obj.addToGroup(albumsList, tracks);
            return albumsList;
        },
        addToGroup: function (coll, tracks) {
            var key, last;
            for (var i = 0; i < tracks.length; i += 1) {
                key = tracks[i].album_artist + " :: " + tracks[i].track_album;
                if (coll.length == 0 || (last = coll[coll.length - 1]).key != key) {
                    coll.push({
                        key: key,
                        title: tracks[i].track_album,
                        album_artist: tracks[i].album_artist,
                        small_cover_id: tracks[i].small_cover_id,
                        middle_cover_id: tracks[i].middle_cover_id,
                        big_cover_id: tracks[i].big_cover_id,
                        year: tracks[i].track_year,
                        various_artists: (tracks[i].album_artist !== tracks[i].track_artist),
                        artist_url: tracks[i].artist_url,
                        album_url: tracks[i].album_url,
                        tracks: [
                            tracks[i]
                        ]
                    });
                } else {
                    last.tracks.push(tracks[i]);
                    if (tracks[i].album_artist !== tracks[i].track_artist) {
                        last.various_artists = true;
                    }
                }
            }
        }
    };
    return obj;
}]);

MusicLoud.factory("StatsService", ["$http", "$filter", function ($http, $filter) {
    return {
        incrementPlays: function (track) {
            // todo: maybe it will be good if stats will return an updated track data
            return $http.post("/api/stats/played", {id: track.id}).success(function () {
                track.times_played += 1;
                track.last_played_date = new Date().getTime() / 1000;
            });
        },
        incrementSkips: function (track) {
            return $http.post("/api/stats/skipped", {id: track.id}).success(function () {
                track.times_skipped += 1;
            });
        },
        rateTrack: function (track, rating) {
            track.track_rating = rating;
            return $http.post("/api/stats/rate", {id: track.id, rating: rating});
        },
        unrateTrack: function (track) {
            track.track_rating = null;
            return $http.post("/api/stats/unrate", {id: track.id});
        },
        scrobbleStart: function (track) {
            return $http.post("/api/scrobbler/nowPlaying", {id: track.id});
        },
        scrobbleFinish: function (track) {
            return $http.post("/api/scrobbler/scrobble", {id: track.id});
        }
    }
}]);

MusicLoud.factory("SyncService", [function () {
    var trackSync  = sync("id");
    var artistSync = sync("id");
    var albumSync  = sync("id");
    return {
        tracks: trackSync,
        track: function (track) {
            return trackSync([track]).shift();
        },

        artists: artistSync,
        artist: function (artist) {
            return artistSync([artist]).shift();
        },

        albums: albumSync,
        album: function (album) {
            return albumSync([album]).shift();
        }
    };
}]);



MusicLoud.service("ModalWindow", ["$templateRequest", "$controller", "$rootScope", "$compile", "$document",
    function ($templateRequest, $controller, $rootScope, $compile, $document) {
        var defaults = {
                controller: null,
                closeOnEscape: true,
                closeOnClick: true,
                data: {},
                scope: null
            },

            $an = angular;

        return function (opts) {

            var options = $an.copy(defaults);

            $an.extend(options, opts);

            $templateRequest(options.template).then(function (template) {

                var newScope = $an.isObject(options.scope) ? options.scope.$new() : $rootScope.$new(),
                    body = $an.element("body"),
                    modal = $an.element(template).appendTo(body),

                    onEscapeEvent = function (event) {
                        if (event.which == 27) {
                            newScope.closeThisWindow()
                        }
                    },

                    onMouseClickEvent = function (event) {
                        if ($an.element(event.target).parents(modal).length == 0) {
                            newScope.closeThisWindow()
                        }
                    };

                newScope.closeThisWindow = function () {
                    modal.remove();
                    newScope.$destroy();
                };

                newScope.$on("$destroy", function () {
                    body.off("keyup", onEscapeEvent);
                    body.off("click", onMouseClickEvent);
                });

                for (var k in options.data) if (options.data.hasOwnProperty(k)) {
                    newScope[k] = options.data[k]
                }

                if (options.closeOnEscape) {
                    body.bind("keyup", onEscapeEvent);
                }

                if (options.closeOnClick) {
                    body.bind("click", onMouseClickEvent);
                }

                $compile(modal)(newScope);

                if (options.controller) {
                    var controllerInstance = $controller(options.controller, {
                        $scope: newScope,
                        $element: modal
                    });
                    modal.data('$modalWindowController', controllerInstance);
                }



            });
        };
    }
]);