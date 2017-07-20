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
import { uniq, join, min, max } from 'lodash';
import type { Track } from '../types';

export const aggregateGenres = (tracks: Array<Track>): string => {
  const genres = uniq(tracks.map(t => t.track_genre));
  switch (genres.length) {
    case 0:
      return '-';
    case 1:
      return first(genres);
    case 2:
      return join(genres, ', ');
    case 3:
      return `${genres[0]}, ${genres[1]} and ${genres[2]}`;
    default:
      return `${genres[0]}, ${genres[1]} and ${genres.length - 2} others`;
  }
};

export const aggregateYears = (tracks: Array<Track>): string => {
  const isNumeric = (str: string): boolean => !isNaN(parseInt(str));
  const years = uniq(tracks.map(t => t.track_year)).filter(isNumeric);
  switch (years.length) {
    case 0:
      return '-';
    case 1:
      return join(years, ', ');
    default:
      return `${min(years)} - ${max(years)}`;
  }
};

export const aggregateAlbumTitle = (tracks: Array<Track>): string => {
  return tracks.map(t => t.track_album).reduce((a, b) => a || b, "");
};

export const aggregateTracksDuration = (tracks: Array<Track>) => {
  return sum(tracks.map(t => t.length));
};

export const isVariousArtists = (tracks: Array<Track>): boolean =>
  tracks.some(t => t.album_artist !== t.track_artist);
