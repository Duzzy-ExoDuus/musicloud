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
import * as trackAggregators from '../util/trackAggregators';
import * as trackAggregatorsHtml from '../util/trackAggregatorsHtml';
import type { Track } from "../types";

export const aggregateAlbumTitle = () => trackAggregators.aggregateAlbumTitle;

export const aggregateGenres = () => trackAggregators.aggregateGenres;

export const aggregateTracksDuration = () => trackAggregators.aggregateTracksDuration;

export const aggregateYears = () => trackAggregators.aggregateYears;

export const aggregateTrackArtists = ['$sce', ($sce: *) =>
  (tracks: Array<Track>) => $sce.trustAsHtml(trackAggregatorsHtml.aggregateTrackArtists(tracks))
];

export const isVariousArtists = () => trackAggregators.isVariousArtists;
