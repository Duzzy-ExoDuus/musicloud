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
// @flow
import angular from 'angular';

import tracksMenu from './ui/tracksMenu';
import type { Track } from "./types";

const app = angular.module('MusicLoud', ["ngRoute", "ngCookies", "httpPostFix",
  "infinite-scroll", "MLContextMenu", "indexedDB"]);

app.run(['$rootScope', ($rootScope) => {
  $rootScope.selectedTracksMenu = (selectedTracks: Array<Track>) =>
    tracksMenu(selectedTracks, $rootScope.playlists, {
      editSongs: tracks =>
        $rootScope.action.editSongs(tracks),
      deleteSongs: tracks =>
        $rootScope.action.deleteSongs(tracks),
      removeTracksFromPlaylist: tracks =>
        $rootScope.playlistMethods.removeTracksFromPlaylist(tracks),
      addTracksToPlaylist: (playlist, tracks) =>
        $rootScope.playlistMethods.addTracksToPlaylist(playlist, tracks),
    })
}]);

export default app;
