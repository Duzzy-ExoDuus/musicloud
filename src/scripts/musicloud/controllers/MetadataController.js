/*
 * Copyright (c) 2017 Roman Lakhtadyr
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { first } from 'lodash';

export default ["$scope", "TrackService", "SyncService", "$filter", "$route",
  ($scope, TrackService, SyncService, $filter, $route) => {

    const songs = $scope.songs;
    const artists_list = songs.map(field("album_artist")).distinct();
    const cover_url = songs.map(field("middle_cover_id")).reduce(or);
    const is_compilation = songs.all(field("is_compilation"));
    const unmodified  = "[unmodified]";

    $scope.fields = {
      track_title: "",
      track_artist: "",
      track_album: "",
      album_artist: "",
      track_number: "",
      disc_number: "",
      track_genre: "",
      track_year: ""
    };

    $scope.flags = {
      is_compilation: is_compilation
    };

    $scope.current_cover = cover_url;

    $scope.selected = {
      artists: (artists_list.length === 1)
        ? $filter("normalizeArtist")(first(artists_list))
        : ` ${artists_list.length} artist(s)`,
      songs: (songs.length === 1)
        ? $filter("normalizeTrackTitle")(first(songs))
        : "" + songs.length + " song(s)"
    };

    $scope.load = function () {
      for (let i = 0; i < songs.length; i += 1) {
        for (let key in $scope.fields) if ($scope.fields.hasOwnProperty(key)) {
          if (i === 0) {
            $scope.fields[key] = songs[0][key];
          } else if (songs[0][key] !== songs[i][key]) {
            $scope.fields[key] = unmodified;
          }
        }
      }
    };

    $scope.save = function () {
      const song_id = songs.map(function (e) {
          return e.id
        }).join(",");
      const submission = { song_id: song_id, metadata: {} };

      for (let key in $scope.fields) if ($scope.fields.hasOwnProperty(key)) {
        if ($scope.fields[key] !== unmodified) {
          submission.metadata[key] = $scope.fields[key];
        }
      }

      if ($scope.flags.is_compilation !== is_compilation) {
        submission.metadata.is_compilation = $scope.flags.is_compilation
      }

      TrackService.edit(submission).success(function (updated) {
        SyncService.tracks(updated.tracks);
        $scope.closeThisWindow();
      });

    };

    $scope.load();

  }
];
