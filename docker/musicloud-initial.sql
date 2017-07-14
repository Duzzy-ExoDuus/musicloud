--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.3
-- Dumped by pg_dump version 9.6.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: action_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE action_type AS ENUM (
    'add',
    'delete',
    'update'
);


--
-- Name: file_link_counter(character, character); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION file_link_counter(old_file_id character, new_file_id character) RETURNS void
    LANGUAGE plpgsql
    AS $$BEGIN

IF (old_file_id != new_file_id) THEN
  IF (old_file_id IS NOT NULL) THEN
    UPDATE files SET links = links - 1 WHERE id = old_file_id;
  END IF;
  IF (new_file_id IS NOT NULL) THEN
    UPDATE files SET links = links + 1 WHERE id = new_file_id;
  END IF;
END IF;

END;$$;


--
-- Name: files_link_trigger(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION files_link_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN

IF (TG_OP = 'UPDATE') THEN
	PERFORM file_link_counter(OLD.file_id, NEW.file_id);
	PERFORM file_link_counter(OLD.preview_id, NEW.preview_id);
	PERFORM file_link_counter(OLD.small_cover_id, NEW.small_cover_id);
	PERFORM file_link_counter(OLD.middle_cover_id, NEW.middle_cover_id);
	PERFORM file_link_counter(OLD.big_cover_id, NEW.big_cover_id);
	PERFORM file_link_counter(OLD.peaks_id, NEW.peaks_id);
ELSIF (TG_OP = 'INSERT') THEN
	PERFORM file_link_counter(NULL, NEW.file_id);
	PERFORM file_link_counter(NULL, NEW.preview_id);
	PERFORM file_link_counter(NULL, NEW.small_cover_id);
	PERFORM file_link_counter(NULL, NEW.middle_cover_id);
	PERFORM file_link_counter(NULL, NEW.big_cover_id);
	PERFORM file_link_counter(NULL, NEW.peaks_id);
ELSE
	PERFORM file_link_counter(OLD.file_id, NULL);
	PERFORM file_link_counter(OLD.preview_id, NULL);
	PERFORM file_link_counter(OLD.small_cover_id, NULL);
	PERFORM file_link_counter(OLD.middle_cover_id, NULL);
	PERFORM file_link_counter(OLD.big_cover_id, NULL);
	PERFORM file_link_counter(OLD.peaks_id, NULL);
END IF;

RETURN NULL;

END;$$;


--
-- Name: first(anyelement, anyelement); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION first(value1 anyelement, value2 anyelement) RETURNS anyelement
    LANGUAGE sql
    AS $$SELECT CASE WHEN value1 IS NOT NULL THEN value1 ELSE value2 END$$;


--
-- Name: first4(anyarray, anyelement); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION first4(state anyarray, elem anyelement) RETURNS anyarray
    LANGUAGE sql
    AS $_$SELECT CASE WHEN COALESCE(ARRAY_LENGTH($1, 1),0) < 4 THEN ARRAY_APPEND($1, $2) ELSE $1 END$_$;


--
-- Name: letterify(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION letterify(number bigint) RETURNS text
    LANGUAGE plpgsql
    AS $$declare
  chars text[] := '{A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9}';
  result text := '';
  len integer := array_length(chars, 1);
  i integer := number;
begin
  loop
    result := chars[(i % len) + 1] || result;
    i = floor(i / len);
    exit when i = 0;
  end loop;
  return result;
end;$$;


--
-- Name: on_song_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION on_song_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
IF TG_OP = 'INSERT' THEN
	INSERT INTO "songs_log" ("user_id", "song_id", "action") VALUES (NEW.user_id, NEW.id, 'add');
ELSEIF TG_OP = 'UPDATE' THEN
	DELETE FROM "songs_log" WHERE "user_id" = NEW.user_id AND "song_id" = NEW.id AND "action" = 'update';
	INSERT INTO "songs_log" ("user_id", "song_id", "action") VALUES (NEW.user_id, NEW.id, 'update');
ELSE
	DELETE FROM "songs_log" WHERE "user_id" = OLD.user_id AND "song_id" = OLD.id;
	INSERT INTO "songs_log" ("user_id", "song_id", "action") VALUES (OLD.user_id, OLD.id, 'delete');
END IF;
RETURN null;
END;$$;


--
-- Name: random_string(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION random_string(length integer) RETURNS text
    LANGUAGE plpgsql
    AS $$declare
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
  result text := '';
  i integer := 0;
begin
  if length < 0 then
    raise exception 'Given length cannot be less than 0';
  end if;
  for i in 1..length loop
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  end loop;
  return result;
end;$$;


--
-- Name: trg_update_fts(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION trg_update_fts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
	updated boolean := false;
BEGIN
	IF TG_OP = 'INSERT' THEN
		updated := true;
	ELSEIF TG_OP = 'UPDATE' THEN
		IF concat_ws('', NEW.album_artist, NEW.track_album, NEW.track_title, NEW.track_genre, NEW.track_artist) <> concat_ws('', OLD.album_artist, OLD.track_album, OLD.track_title, OLD.track_genre, OLD.track_artist) THEN
			updated := true;
		END IF;
	END IF;

	IF updated = true THEN
		NEW.fts_artist := setweight(to_tsvector('simple', NEW.album_artist), 'A');
		NEW.fts_album := setweight(to_tsvector('simple', NEW.track_album), 'A');
		NEW.fts_genre := setweight(to_tsvector('simple', NEW.track_genre), 'A');
		NEW.fts_any := concat_ws(' ', setweight(to_tsvector('simple', NEW.album_artist), 'B'),
				setweight(to_tsvector('simple', NEW.track_album), 'C'),
				setweight(to_tsvector('simple', NEW.track_title), 'A'), 
				setweight(to_tsvector('simple', NEW.file_name), 'D'),
				setweight(to_tsvector('simple', NEW.track_artist), 'B'));
	END IF;
	RETURN NEW;
END;$$;


--
-- Name: trg_update_last_played(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION trg_update_last_played() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
  IF NEW.times_played > OLD.times_played THEN
    NEW.last_played_date = CAST(EXTRACT(EPOCH FROM NOW()) AS integer);
  END IF;
  RETURN NEW;
END;$$;


--
-- Name: unique_id(regclass, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION unique_id(table_name regclass, field_name text) RETURNS text
    LANGUAGE plpgsql
    AS $$declare
  rs text;
  val boolean;
begin
  loop
    rs = random_string(10);
    execute format('SELECT EXISTS(SELECT * FROM %s WHERE %s = %s)', table_name, quote_ident(field_name), quote_literal(rs)) INTO val;
    exit when not val;
  end loop;
  return rs;
end;$$;


--
-- Name: user_stats_calculate(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION user_stats_calculate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN

IF (TG_OP = 'INSERT') THEN
  --SELECT COUNT("album_artist") INTO @artists FROM songs WHERE user_id = NEW.user_id;
ELSEIF (TG_OP = 'UPDATE') THEN

ELSEIF (TG_OP = 'DELETE') THEN

END IF;

END;$$;


--
-- Name: first(anyelement); Type: AGGREGATE; Schema: public; Owner: -
--

CREATE AGGREGATE first(anyelement) (
    SFUNC = public.first,
    STYPE = anyelement,
    INITCOND = 'null'
);


--
-- Name: first4(anyelement); Type: AGGREGATE; Schema: public; Owner: -
--

CREATE AGGREGATE first4(anyelement) (
    SFUNC = public.first4,
    STYPE = anyarray,
    INITCOND = '{}'
);


SET default_with_oids = false;

--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE files (
    id character(10) DEFAULT unique_id('files'::regclass, 'id'::text) NOT NULL,
    sha1 character(40),
    size integer,
    used integer,
    mtime integer,
    content_type character varying(255)
);


--
-- Name: playlist_song_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE playlist_song_links (
    playlist_id character(10) NOT NULL,
    song_id character(10) NOT NULL,
    order_id integer NOT NULL,
    link_id integer NOT NULL
);


--
-- Name: playlist_song_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE playlist_song_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: playlist_song_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE playlist_song_links_id_seq OWNED BY playlist_song_links.link_id;


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE playlists (
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    id character(10) DEFAULT unique_id('playlists'::regclass, 'id'::text) NOT NULL
);


--
-- Name: scrobbler; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE scrobbler (
    user_key character varying(255),
    user_name text,
    enabled boolean DEFAULT true NOT NULL,
    id integer NOT NULL
);


--
-- Name: songs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE songs (
    id character(10) DEFAULT unique_id('songs'::regclass, 'id'::text) NOT NULL,
    user_id integer NOT NULL,
    file_id character(10),
    file_name text DEFAULT ''::text NOT NULL,
    bitrate integer,
    length integer,
    track_title text DEFAULT ''::text NOT NULL,
    track_artist text DEFAULT ''::text NOT NULL,
    track_album text DEFAULT ''::text NOT NULL,
    track_genre text DEFAULT ''::text NOT NULL,
    track_number smallint,
    track_comment text DEFAULT ''::text NOT NULL,
    track_year character varying(255) DEFAULT ''::character varying NOT NULL,
    track_rating smallint,
    is_favourite boolean DEFAULT false NOT NULL,
    is_compilation boolean DEFAULT false NOT NULL,
    disc_number smallint,
    album_artist text DEFAULT ''::text NOT NULL,
    times_played integer DEFAULT 0 NOT NULL,
    times_skipped integer DEFAULT 0 NOT NULL,
    created_date integer,
    last_played_date integer,
    small_cover_id character(10),
    middle_cover_id character(10),
    big_cover_id character(10),
    fts_artist tsvector,
    fts_album tsvector,
    fts_any tsvector,
    preview_id character(10),
    format character varying(16),
    fts_genre tsvector,
    peaks_id character(10)
);


--
-- Name: songs_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE songs_log (
    id integer NOT NULL,
    user_id integer NOT NULL,
    song_id character(10),
    action action_type
);


--
-- Name: songs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE songs_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: songs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE songs_log_id_seq OWNED BY songs_log.id;


--
-- Name: songs_log_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE songs_log_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: songs_log_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE songs_log_user_id_seq OWNED BY songs_log.user_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    id integer NOT NULL,
    name character varying(32) NOT NULL,
    email character varying(64) NOT NULL,
    password character varying(255) NOT NULL,
    tracks_count integer DEFAULT 0 NOT NULL,
    artists_count integer DEFAULT 0 NOT NULL,
    albums_count integer DEFAULT 0 NOT NULL,
    genres_count integer DEFAULT 0 NOT NULL,
    compilations_count integer DEFAULT 0 NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: playlist_song_links link_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY playlist_song_links ALTER COLUMN link_id SET DEFAULT nextval('playlist_song_links_id_seq'::regclass);


--
-- Name: songs_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs_log ALTER COLUMN id SET DEFAULT nextval('songs_log_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: files files_sha1_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY files
    ADD CONSTRAINT files_sha1_key UNIQUE (sha1);


--
-- Name: playlist_song_links playlist_song_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY playlist_song_links
    ADD CONSTRAINT playlist_song_links_pkey PRIMARY KEY (link_id);


--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id);


--
-- Name: scrobbler scrobbler_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY scrobbler
    ADD CONSTRAINT scrobbler_pkey PRIMARY KEY (id);


--
-- Name: songs_log songs_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs_log
    ADD CONSTRAINT songs_log_pkey PRIMARY KEY (id);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: album_artist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX album_artist ON songs USING btree (album_artist);


--
-- Name: albums_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX albums_index ON songs USING btree (album_artist, track_album) WHERE (is_compilation = false);


--
-- Name: compilations_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX compilations_index ON songs USING btree (album_artist, track_album) WHERE (is_compilation = true);


--
-- Name: email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX email ON users USING btree (email);


--
-- Name: file_format; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX file_format ON songs USING btree (format);


--
-- Name: fki_playlist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fki_playlist ON playlist_song_links USING btree (playlist_id);


--
-- Name: fki_song; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fki_song ON playlist_song_links USING btree (song_id);


--
-- Name: fki_songs_peaks_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fki_songs_peaks_id ON songs USING btree (peaks_id);


--
-- Name: fki_user_id_link; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fki_user_id_link ON scrobbler USING btree (id);


--
-- Name: fts_album; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fts_album ON songs USING gist (fts_album);


--
-- Name: fts_any; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fts_any ON songs USING gist (fts_any);


--
-- Name: fts_artist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fts_artist ON songs USING gist (fts_artist);


--
-- Name: fts_genre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fts_genre ON songs USING gist (fts_genre);


--
-- Name: is_compilation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX is_compilation ON songs USING btree (is_compilation);


--
-- Name: is_fav; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX is_fav ON songs USING btree (is_favourite);


--
-- Name: mime; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mime ON files USING btree (content_type);


--
-- Name: track_artist; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX track_artist ON songs USING btree (track_artist);


--
-- Name: track_genre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX track_genre ON songs USING btree (track_genre);


--
-- Name: track_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX track_rating ON songs USING btree (track_rating);


--
-- Name: track_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX track_year ON songs USING btree (track_year);


--
-- Name: unused_files; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unused_files ON files USING btree (id) WHERE (used = 0);


--
-- Name: songs fts_songs_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER fts_songs_trigger BEFORE INSERT OR UPDATE ON songs FOR EACH ROW EXECUTE PROCEDURE trg_update_fts();


--
-- Name: songs on_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_change AFTER INSERT OR DELETE OR UPDATE ON songs FOR EACH ROW EXECUTE PROCEDURE on_song_change();


--
-- Name: songs played_times_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER played_times_updated BEFORE UPDATE ON songs FOR EACH ROW EXECUTE PROCEDURE trg_update_last_played();


--
-- Name: playlist_song_links playlist; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY playlist_song_links
    ADD CONSTRAINT playlist FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: songs preview_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs
    ADD CONSTRAINT preview_id FOREIGN KEY (preview_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: playlist_song_links song; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY playlist_song_links
    ADD CONSTRAINT song FOREIGN KEY (song_id) REFERENCES songs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: songs songs_big_cover_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_big_cover_id_fkey FOREIGN KEY (big_cover_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: songs songs_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_file_id_fkey FOREIGN KEY (file_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: songs_log songs_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs_log
    ADD CONSTRAINT songs_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: songs songs_middle_cover_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_middle_cover_id_fkey FOREIGN KEY (middle_cover_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: songs songs_peaks_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_peaks_id FOREIGN KEY (peaks_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: songs songs_small_cover_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_small_cover_id_fkey FOREIGN KEY (small_cover_id) REFERENCES files(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: songs user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY songs
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: playlists user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY playlists
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scrobbler user_id_link; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY scrobbler
    ADD CONSTRAINT user_id_link FOREIGN KEY (id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

