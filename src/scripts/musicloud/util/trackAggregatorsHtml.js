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
import { encodeHTML } from 'entities';
import { uniq, first, last, join } from 'lodash';
import type { Track } from '../types';

export const aggregateTrackArtists = (tracks: Array<Track>): ?string => {
  const artists = uniq(tracks.map(t => t.track_artist));
  const artistsAsHtml = artists.map(encodeHTML).map(a => `<b>${a}</b>`);
  const prefix = 'Including';

  switch (artistsAsHtml.length) {
    case 0:
      return null;
    case 1:
      return `${prefix} ${first(artistsAsHtml)}`;
    case 2:
      return `${prefix} ${join(artistsAsHtml, ' and ')}`;
    case 3:
      return `${prefix} ${artistsAsHtml.slice(0, 2).join(", ")} and ${last(artistsAsHtml)}`;
    default:
      return `${prefix} ${artistsAsHtml.slice(0, 3).join(", ")} and ${artistsAsHtml.length - 3} other artists`;
  }
};
