var homecloud = angular.module("HomeCloud");

homecloud.run(["$rootScope", "StatsService", "SyncService", "$cookies", "$timeout",

    function ($rootScope, StatsService, SyncService, $cookies, $timeout) {

        var jFrame = $("<div>").appendTo("body"),
            timeout,
            player = {
                isLoaded: false,
                isPlaying: false,
                isBuffering: false,
                volume: 1,
                playlist: {
                    tracks: [],
                    track: null,
                    fetch: null,
                    position: {
                        duration: null,
                        position: null,
                        load: null
                    }
                },
                eventSkip: function () {
                    if (!(player.playlist.track && player.playlist.position.length))
                        return;

                    if (100 / player.playlist.position.duration * player.playlist.position.position < 10) {
                        SyncService.incrementSkips(player.playlist.track);
                    }
                },
                doVolume: function (vol) {
                    jFrame.jPlayer("volume", vol);
                    player.volume = vol;
                    $cookies.put("volume", vol);
                },
                doPlay: function (track, playlist, resolver) {

                    $rootScope.$applyAsync(function () {

                        if (playlist !== undefined && playlist !== player.playlist.tracks) {
                            player.playlist.tracks = playlist;
                        }

                        if (resolver !== undefined) {
                            player.playlist.fetch = resolver;
                        }

                        player.playlist.track = track;

                        jFrame.jPlayer("setMedia", {mp3: "/preview/" + track.id}).jPlayer("play");

                        player.playlist.position.duration = track.length;

                        player.isLoaded = true;
                        player.isPlaying = true;

                        StatsService.nowPlaying(track);

                    });

                },
                doFetch: function () {
                    if (!player.playlist.fetch) return;
                    player.playlist.fetch(player.playlist.tracks.length).success(function (data) {
                        if (data.tracks.length > 0) {
                            player.playlist.tracks = player.playlist.tracks.concat(SyncService.tracks(data.tracks));
                        } else {
                            player.playlist.fetch = null;
                        }
                    });
                },
                doPlayPause: function () {

                    if (!player.isLoaded) {
                        return;
                    }

                    if (player.isPlaying) {
                        player.isPlaying = false;
                        jFrame.jPlayer("pause");
                    } else {
                        player.isPlaying = true;
                        jFrame.jPlayer("play");
                    }

                },
                doStop: function () {

                    $rootScope.$applyAsync(function () {

                        jFrame.jPlayer("stop").jPlayer("clearMedia");

                        player.isLoaded = false;
                        player.isPlaying = false;
                        player.playlist.track = null;
                        player.playlist.tracks = [];
                        player.playlist.fetch = null;

                        player.playlist.position = {
                            duration: null,
                            position: null,
                            load: null
                        };

                    });

                },
                doSeek: function (percent) {

                    var timeIndex;

                    if (!(player.isLoaded && jFrame.data("jPlayer"))) return;

                    timeIndex = player.playlist.position.duration / 100 * percent;

                    if ( jFrame.data("jPlayer").status.paused ) {
                        jFrame.jPlayer( "pause", timeIndex );
                    } else {
                        jFrame.jPlayer( "play", timeIndex );
                    }

                },
                doPlayNext: function () {

                    if (!player.isLoaded) {
                        return;
                    }

                    player.eventSkip();

                    var index = player.playlist.tracks.indexOf(player.playlist.track);

                    if (index < player.playlist.tracks.length - 1) {
                        player.doPlay(player.playlist.tracks[index + 1])
                    } else {
                        player.doStop();
                    }

                    if (index + 1 == player.playlist.tracks.length - 1 && player.playlist.fetch) {
                        // If it's last try to fetch new tracks
                        console.log("Fetching new tracks...");
                        player.doFetch();
                    }

                },
                doPlayPrev: function () {

                    if (!player.isLoaded) {
                        return;
                    }

                    player.eventSkip();

                    var index = player.playlist.tracks.indexOf(player.playlist.track);

                    if (index > 0) {
                        player.doPlay(player.playlist.tracks[index - 1])
                    } else {
                        player.doStop();
                    }

                }
            };

        jFrame.jPlayer({
            ready: function () {
            },
            ended: function () {
                if (player.playlist.track) {
                    StatsService.incrementPlays(player.playlist.track);
                    player.doPlayNext();
                }
            },
            error: function () {
                player.doStop();
            },
            timeupdate: function (e) {
                $rootScope.$applyAsync(function () {
                    player.playlist.position.position = e.jPlayer.status.currentTime;
                });
            },
            swfPath: "/public/js/application/libs/jplayer/",
            supplied: "mp3",
            solution: "html, flash"
        });

        jFrame.bind($.jPlayer.event.canplay, function(){
            $timeout.cancel(timeout);
            $rootScope.$applyAsync(player.isBuffering = false)
        });

        jFrame.bind($.jPlayer.event.waiting, function(){
            timeout = $timeout(function () {
                player.isBuffering = true
            }, 500);
        });

        player.doVolume(Math.min(1, parseFloat($cookies.get("volume")) || 1));

        $rootScope.player = player;


    }

]);