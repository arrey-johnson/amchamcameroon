-- =============================================================================
-- Payload CMS schema dump (Postgres / Supabase)
-- =============================================================================
-- RUN THIS ONLY on a BLANK Supabase project (no public tables / enums yet).
--
-- Your current "amcham" project already has this schema. Do NOT re-run this
-- file there — you will get errors like:
--   ERROR: 42710: type "_locales" already exists
--
-- Safe to run anytime:
--   supabase/migrations/20260820_amcham_app_role.sql
--
-- To check what exists:
--   select typname from pg_type where typname = '_locales';
--   select tablename from pg_tables where schemaname = 'public' order by 1;
-- =============================================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- CREATE SCHEMA public; -- already exists on Supabase


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: _locales; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public._locales AS ENUM (
    'en',
    'fr'
);


--
-- Name: enum__events_v_published_locale; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum__events_v_published_locale AS ENUM (
    'en',
    'fr'
);


--
-- Name: enum__events_v_version_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum__events_v_version_category AS ENUM (
    'conference',
    'networking',
    'trade-mission',
    'training',
    'gala'
);


--
-- Name: enum__events_v_version_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum__events_v_version_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum__news_v_published_locale; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum__news_v_published_locale AS ENUM (
    'en',
    'fr'
);


--
-- Name: enum__news_v_version_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum__news_v_version_category AS ENUM (
    'news',
    'press-release',
    'op-ed',
    'policy'
);


--
-- Name: enum__news_v_version_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum__news_v_version_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum__pages_v_published_locale; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum__pages_v_published_locale AS ENUM (
    'en',
    'fr'
);


--
-- Name: enum__pages_v_version_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum__pages_v_version_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum_board_members_group; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_board_members_group AS ENUM (
    'board',
    'executive'
);


--
-- Name: enum_events_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_events_category AS ENUM (
    'conference',
    'networking',
    'trade-mission',
    'training',
    'gala'
);


--
-- Name: enum_events_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_events_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum_members_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_members_category AS ENUM (
    'patron',
    'sponsor',
    'corporate',
    'sme',
    'individual'
);


--
-- Name: enum_news_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_news_category AS ENUM (
    'news',
    'press-release',
    'op-ed',
    'policy'
);


--
-- Name: enum_news_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_news_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum_pages_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_pages_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum_settings_us_news_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_settings_us_news_mode AS ENUM (
    'curated',
    'feed'
);


--
-- Name: enum_submissions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_submissions_status AS ENUM (
    'new',
    'in-review',
    'handled'
);


--
-- Name: enum_submissions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_submissions_type AS ENUM (
    'contact',
    'membership',
    'subscribe'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'superadmin',
    'editor',
    'contributor'
);


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _events_v; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._events_v (
    id integer NOT NULL,
    parent_id integer,
    version_slug character varying,
    version_cover_image_id integer,
    version_start_at timestamp(3) with time zone,
    version_end_at timestamp(3) with time zone,
    version_category public.enum__events_v_version_category DEFAULT 'networking'::public.enum__events_v_version_category,
    version_registration_url character varying,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__events_v_version_status DEFAULT 'draft'::public.enum__events_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    snapshot boolean,
    published_locale public.enum__events_v_published_locale,
    latest boolean
);


--
-- Name: _events_v_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._events_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _events_v_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._events_v_id_seq OWNED BY public._events_v.id;


--
-- Name: _events_v_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._events_v_locales (
    version_title character varying,
    version_venue character varying,
    version_description jsonb,
    version_price_member character varying,
    version_price_non_member character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: _events_v_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._events_v_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _events_v_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._events_v_locales_id_seq OWNED BY public._events_v_locales.id;


--
-- Name: _events_v_version_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._events_v_version_gallery (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    image_id integer,
    _uuid character varying
);


--
-- Name: _events_v_version_gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._events_v_version_gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _events_v_version_gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._events_v_version_gallery_id_seq OWNED BY public._events_v_version_gallery.id;


--
-- Name: _news_v; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._news_v (
    id integer NOT NULL,
    parent_id integer,
    version_slug character varying,
    version_category public.enum__news_v_version_category DEFAULT 'news'::public.enum__news_v_version_category,
    version_cover_image_id integer,
    version_author character varying,
    version_published_at timestamp(3) with time zone,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__news_v_version_status DEFAULT 'draft'::public.enum__news_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    snapshot boolean,
    published_locale public.enum__news_v_published_locale,
    latest boolean
);


--
-- Name: _news_v_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._news_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _news_v_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._news_v_id_seq OWNED BY public._news_v.id;


--
-- Name: _news_v_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._news_v_locales (
    version_title character varying,
    version_excerpt character varying,
    version_body jsonb,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: _news_v_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._news_v_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _news_v_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._news_v_locales_id_seq OWNED BY public._news_v_locales.id;


--
-- Name: _news_v_version_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._news_v_version_tags (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    tag character varying,
    _uuid character varying
);


--
-- Name: _news_v_version_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._news_v_version_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _news_v_version_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._news_v_version_tags_id_seq OWNED BY public._news_v_version_tags.id;


--
-- Name: _pages_v; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._pages_v (
    id integer NOT NULL,
    parent_id integer,
    version_slug character varying,
    version_cover_image_id integer,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__pages_v_version_status DEFAULT 'draft'::public.enum__pages_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    snapshot boolean,
    published_locale public.enum__pages_v_published_locale,
    latest boolean
);


--
-- Name: _pages_v_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._pages_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _pages_v_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._pages_v_id_seq OWNED BY public._pages_v.id;


--
-- Name: _pages_v_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._pages_v_locales (
    version_title character varying,
    version_intro character varying,
    version_body jsonb,
    version_seo_meta_title character varying,
    version_seo_meta_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: _pages_v_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public._pages_v_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: _pages_v_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public._pages_v_locales_id_seq OWNED BY public._pages_v_locales.id;


--
-- Name: board_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.board_members (
    id integer NOT NULL,
    name character varying NOT NULL,
    company character varying,
    photo_id integer,
    linkedin character varying,
    "group" public.enum_board_members_group DEFAULT 'board'::public.enum_board_members_group NOT NULL,
    "order" numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: board_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.board_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: board_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.board_members_id_seq OWNED BY public.board_members.id;


--
-- Name: board_members_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.board_members_locales (
    role character varying NOT NULL,
    bio character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: board_members_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.board_members_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: board_members_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.board_members_locales_id_seq OWNED BY public.board_members_locales.id;


--
-- Name: committees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees (
    id integer NOT NULL,
    slug character varying NOT NULL,
    chair character varying,
    cover_image_id integer,
    "order" numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: committees_focus_areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees_focus_areas (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL
);


--
-- Name: committees_focus_areas_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees_focus_areas_locales (
    area character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: committees_focus_areas_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.committees_focus_areas_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: committees_focus_areas_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.committees_focus_areas_locales_id_seq OWNED BY public.committees_focus_areas_locales.id;


--
-- Name: committees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.committees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: committees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.committees_id_seq OWNED BY public.committees.id;


--
-- Name: committees_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees_locales (
    name character varying NOT NULL,
    summary character varying,
    description jsonb,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: committees_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.committees_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: committees_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.committees_locales_id_seq OWNED BY public.committees_locales.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    slug character varying,
    cover_image_id integer,
    start_at timestamp(3) with time zone,
    end_at timestamp(3) with time zone,
    category public.enum_events_category DEFAULT 'networking'::public.enum_events_category,
    registration_url character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    _status public.enum_events_status DEFAULT 'draft'::public.enum_events_status
);


--
-- Name: events_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_gallery (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    image_id integer
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: events_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events_locales (
    title character varying,
    venue character varying,
    description jsonb,
    price_member character varying,
    price_non_member character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: events_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_locales_id_seq OWNED BY public.events_locales.id;


--
-- Name: gallery_albums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_albums (
    id integer NOT NULL,
    date timestamp(3) with time zone NOT NULL,
    cover_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: gallery_albums_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gallery_albums_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gallery_albums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gallery_albums_id_seq OWNED BY public.gallery_albums.id;


--
-- Name: gallery_albums_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_albums_images (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    image_id integer NOT NULL
);


--
-- Name: gallery_albums_images_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_albums_images_locales (
    caption character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: gallery_albums_images_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gallery_albums_images_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gallery_albums_images_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gallery_albums_images_locales_id_seq OWNED BY public.gallery_albums_images_locales.id;


--
-- Name: gallery_albums_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_albums_locales (
    title character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: gallery_albums_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gallery_albums_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gallery_albums_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gallery_albums_locales_id_seq OWNED BY public.gallery_albums_locales.id;


--
-- Name: hero_slides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hero_slides (
    id integer NOT NULL,
    image_id integer NOT NULL,
    cta_url character varying,
    start_date timestamp(3) with time zone,
    end_date timestamp(3) with time zone,
    "order" numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: hero_slides_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hero_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hero_slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hero_slides_id_seq OWNED BY public.hero_slides.id;


--
-- Name: hero_slides_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hero_slides_locales (
    title character varying NOT NULL,
    subtitle character varying,
    cta_label character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: hero_slides_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hero_slides_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hero_slides_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hero_slides_locales_id_seq OWNED BY public.hero_slides_locales.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id integer NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric,
    sizes_thumbnail_url character varying,
    sizes_thumbnail_width numeric,
    sizes_thumbnail_height numeric,
    sizes_thumbnail_mime_type character varying,
    sizes_thumbnail_filesize numeric,
    sizes_thumbnail_filename character varying,
    sizes_card_url character varying,
    sizes_card_width numeric,
    sizes_card_height numeric,
    sizes_card_mime_type character varying,
    sizes_card_filesize numeric,
    sizes_card_filename character varying,
    sizes_hero_url character varying,
    sizes_hero_width numeric,
    sizes_hero_height numeric,
    sizes_hero_mime_type character varying,
    sizes_hero_filesize numeric,
    sizes_hero_filename character varying
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: media_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_locales (
    alt character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: media_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_locales_id_seq OWNED BY public.media_locales.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id integer NOT NULL,
    name character varying NOT NULL,
    logo_id integer,
    category public.enum_members_category DEFAULT 'corporate'::public.enum_members_category NOT NULL,
    sector character varying,
    website character varying,
    featured boolean DEFAULT false,
    "order" numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: members_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members_locales (
    description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: members_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.members_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: members_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.members_locales_id_seq OWNED BY public.members_locales.id;


--
-- Name: news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news (
    id integer NOT NULL,
    slug character varying,
    category public.enum_news_category DEFAULT 'news'::public.enum_news_category,
    cover_image_id integer,
    author character varying,
    published_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    _status public.enum_news_status DEFAULT 'draft'::public.enum_news_status
);


--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: news_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_locales (
    title character varying,
    excerpt character varying,
    body jsonb,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: news_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.news_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: news_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.news_locales_id_seq OWNED BY public.news_locales.id;


--
-- Name: news_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.news_tags (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    tag character varying
);


--
-- Name: newsletters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletters (
    id integer NOT NULL,
    issue_number character varying,
    date timestamp(3) with time zone NOT NULL,
    cover_image_id integer,
    pdf_id integer NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: newsletters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: newsletters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletters_id_seq OWNED BY public.newsletters.id;


--
-- Name: newsletters_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletters_locales (
    title character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: newsletters_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletters_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: newsletters_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletters_locales_id_seq OWNED BY public.newsletters_locales.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    slug character varying,
    cover_image_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    _status public.enum_pages_status DEFAULT 'draft'::public.enum_pages_status
);


--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: pages_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_locales (
    title character varying,
    intro character varying,
    body jsonb,
    seo_meta_title character varying,
    seo_meta_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: pages_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pages_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pages_locales_id_seq OWNED BY public.pages_locales.id;


--
-- Name: payload_kv; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_kv (
    id integer NOT NULL,
    key character varying NOT NULL,
    data jsonb NOT NULL
);


--
-- Name: payload_kv_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_kv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_kv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_kv_id_seq OWNED BY public.payload_kv.id;


--
-- Name: payload_locked_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_locked_documents (
    id integer NOT NULL,
    global_slug character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_locked_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_locked_documents_id_seq OWNED BY public.payload_locked_documents.id;


--
-- Name: payload_locked_documents_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_locked_documents_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    hero_slides_id integer,
    ticker_items_id integer,
    news_id integer,
    events_id integer,
    newsletters_id integer,
    members_id integer,
    board_members_id integer,
    committees_id integer,
    pages_id integer,
    gallery_albums_id integer,
    us_news_id integer,
    submissions_id integer,
    media_id integer,
    users_id integer
);


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_locked_documents_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_locked_documents_rels_id_seq OWNED BY public.payload_locked_documents_rels.id;


--
-- Name: payload_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_migrations (
    id integer NOT NULL,
    name character varying,
    batch numeric,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_migrations_id_seq OWNED BY public.payload_migrations.id;


--
-- Name: payload_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_preferences (
    id integer NOT NULL,
    key character varying,
    value jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_preferences_id_seq OWNED BY public.payload_preferences.id;


--
-- Name: payload_preferences_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_preferences_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer
);


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_preferences_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_preferences_rels_id_seq OWNED BY public.payload_preferences_rels.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    map_embed_url character varying,
    whatsapp_number character varying,
    call_number character varying,
    facebook character varying,
    twitter character varying,
    linkedin character varying,
    youtube character varying,
    from_address character varying,
    admin_notify_email character varying,
    auto_reply_enabled boolean DEFAULT true,
    us_news_mode public.enum_settings_us_news_mode DEFAULT 'curated'::public.enum_settings_us_news_mode,
    us_news_feed_url character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: settings_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings_emails (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    email character varying NOT NULL
);


--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: settings_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings_locales (
    address character varying,
    whatsapp_message character varying,
    auto_reply_subject character varying,
    auto_reply_body character varying,
    site_title character varying,
    site_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: settings_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_locales_id_seq OWNED BY public.settings_locales.id;


--
-- Name: settings_phones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings_phones (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    phone character varying NOT NULL
);


--
-- Name: settings_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings_stats (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    value character varying NOT NULL
);


--
-- Name: settings_stats_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings_stats_locales (
    label character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: settings_stats_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.settings_stats_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: settings_stats_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.settings_stats_locales_id_seq OWNED BY public.settings_stats_locales.id;


--
-- Name: submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.submissions (
    id integer NOT NULL,
    type public.enum_submissions_type NOT NULL,
    name character varying,
    email character varying NOT NULL,
    phone character varying,
    company character varying,
    message character varying,
    meta jsonb,
    locale character varying DEFAULT 'en'::character varying,
    status public.enum_submissions_status DEFAULT 'new'::public.enum_submissions_status,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.submissions_id_seq OWNED BY public.submissions.id;


--
-- Name: ticker_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticker_items (
    id integer NOT NULL,
    url character varying,
    "order" numeric DEFAULT 0,
    active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: ticker_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticker_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ticker_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticker_items_id_seq OWNED BY public.ticker_items.id;


--
-- Name: ticker_items_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticker_items_locales (
    text character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: ticker_items_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticker_items_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ticker_items_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticker_items_locales_id_seq OWNED BY public.ticker_items_locales.id;


--
-- Name: us_news; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.us_news (
    id integer NOT NULL,
    source character varying NOT NULL,
    published_at timestamp(3) with time zone NOT NULL,
    url character varying NOT NULL,
    approved boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: us_news_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.us_news_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: us_news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.us_news_id_seq OWNED BY public.us_news.id;


--
-- Name: us_news_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.us_news_locales (
    title character varying NOT NULL,
    summary character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: us_news_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.us_news_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: us_news_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.us_news_locales_id_seq OWNED BY public.us_news_locales.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying,
    role public.enum_users_role DEFAULT 'contributor'::public.enum_users_role NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);


--
-- Name: _events_v id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v ALTER COLUMN id SET DEFAULT nextval('public._events_v_id_seq'::regclass);


--
-- Name: _events_v_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v_locales ALTER COLUMN id SET DEFAULT nextval('public._events_v_locales_id_seq'::regclass);


--
-- Name: _events_v_version_gallery id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v_version_gallery ALTER COLUMN id SET DEFAULT nextval('public._events_v_version_gallery_id_seq'::regclass);


--
-- Name: _news_v id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v ALTER COLUMN id SET DEFAULT nextval('public._news_v_id_seq'::regclass);


--
-- Name: _news_v_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v_locales ALTER COLUMN id SET DEFAULT nextval('public._news_v_locales_id_seq'::regclass);


--
-- Name: _news_v_version_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v_version_tags ALTER COLUMN id SET DEFAULT nextval('public._news_v_version_tags_id_seq'::regclass);


--
-- Name: _pages_v id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._pages_v ALTER COLUMN id SET DEFAULT nextval('public._pages_v_id_seq'::regclass);


--
-- Name: _pages_v_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._pages_v_locales ALTER COLUMN id SET DEFAULT nextval('public._pages_v_locales_id_seq'::regclass);


--
-- Name: board_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members ALTER COLUMN id SET DEFAULT nextval('public.board_members_id_seq'::regclass);


--
-- Name: board_members_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members_locales ALTER COLUMN id SET DEFAULT nextval('public.board_members_locales_id_seq'::regclass);


--
-- Name: committees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees ALTER COLUMN id SET DEFAULT nextval('public.committees_id_seq'::regclass);


--
-- Name: committees_focus_areas_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees_focus_areas_locales ALTER COLUMN id SET DEFAULT nextval('public.committees_focus_areas_locales_id_seq'::regclass);


--
-- Name: committees_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees_locales ALTER COLUMN id SET DEFAULT nextval('public.committees_locales_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: events_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_locales ALTER COLUMN id SET DEFAULT nextval('public.events_locales_id_seq'::regclass);


--
-- Name: gallery_albums id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums ALTER COLUMN id SET DEFAULT nextval('public.gallery_albums_id_seq'::regclass);


--
-- Name: gallery_albums_images_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_images_locales ALTER COLUMN id SET DEFAULT nextval('public.gallery_albums_images_locales_id_seq'::regclass);


--
-- Name: gallery_albums_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_locales ALTER COLUMN id SET DEFAULT nextval('public.gallery_albums_locales_id_seq'::regclass);


--
-- Name: hero_slides id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides ALTER COLUMN id SET DEFAULT nextval('public.hero_slides_id_seq'::regclass);


--
-- Name: hero_slides_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides_locales ALTER COLUMN id SET DEFAULT nextval('public.hero_slides_locales_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: media_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_locales ALTER COLUMN id SET DEFAULT nextval('public.media_locales_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: members_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members_locales ALTER COLUMN id SET DEFAULT nextval('public.members_locales_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: news_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_locales ALTER COLUMN id SET DEFAULT nextval('public.news_locales_id_seq'::regclass);


--
-- Name: newsletters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters ALTER COLUMN id SET DEFAULT nextval('public.newsletters_id_seq'::regclass);


--
-- Name: newsletters_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters_locales ALTER COLUMN id SET DEFAULT nextval('public.newsletters_locales_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: pages_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_locales ALTER COLUMN id SET DEFAULT nextval('public.pages_locales_id_seq'::regclass);


--
-- Name: payload_kv id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_kv ALTER COLUMN id SET DEFAULT nextval('public.payload_kv_id_seq'::regclass);


--
-- Name: payload_locked_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_id_seq'::regclass);


--
-- Name: payload_locked_documents_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_rels_id_seq'::regclass);


--
-- Name: payload_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_migrations ALTER COLUMN id SET DEFAULT nextval('public.payload_migrations_id_seq'::regclass);


--
-- Name: payload_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_id_seq'::regclass);


--
-- Name: payload_preferences_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_rels_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: settings_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_locales ALTER COLUMN id SET DEFAULT nextval('public.settings_locales_id_seq'::regclass);


--
-- Name: settings_stats_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_stats_locales ALTER COLUMN id SET DEFAULT nextval('public.settings_stats_locales_id_seq'::regclass);


--
-- Name: submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions ALTER COLUMN id SET DEFAULT nextval('public.submissions_id_seq'::regclass);


--
-- Name: ticker_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticker_items ALTER COLUMN id SET DEFAULT nextval('public.ticker_items_id_seq'::regclass);


--
-- Name: ticker_items_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticker_items_locales ALTER COLUMN id SET DEFAULT nextval('public.ticker_items_locales_id_seq'::regclass);


--
-- Name: us_news id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.us_news ALTER COLUMN id SET DEFAULT nextval('public.us_news_id_seq'::regclass);


--
-- Name: us_news_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.us_news_locales ALTER COLUMN id SET DEFAULT nextval('public.us_news_locales_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: _events_v_locales _events_v_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v_locales
    ADD CONSTRAINT _events_v_locales_pkey PRIMARY KEY (id);


--
-- Name: _events_v _events_v_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v
    ADD CONSTRAINT _events_v_pkey PRIMARY KEY (id);


--
-- Name: _events_v_version_gallery _events_v_version_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v_version_gallery
    ADD CONSTRAINT _events_v_version_gallery_pkey PRIMARY KEY (id);


--
-- Name: _news_v_locales _news_v_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v_locales
    ADD CONSTRAINT _news_v_locales_pkey PRIMARY KEY (id);


--
-- Name: _news_v _news_v_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v
    ADD CONSTRAINT _news_v_pkey PRIMARY KEY (id);


--
-- Name: _news_v_version_tags _news_v_version_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v_version_tags
    ADD CONSTRAINT _news_v_version_tags_pkey PRIMARY KEY (id);


--
-- Name: _pages_v_locales _pages_v_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._pages_v_locales
    ADD CONSTRAINT _pages_v_locales_pkey PRIMARY KEY (id);


--
-- Name: _pages_v _pages_v_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._pages_v
    ADD CONSTRAINT _pages_v_pkey PRIMARY KEY (id);


--
-- Name: board_members_locales board_members_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members_locales
    ADD CONSTRAINT board_members_locales_pkey PRIMARY KEY (id);


--
-- Name: board_members board_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_pkey PRIMARY KEY (id);


--
-- Name: committees_focus_areas_locales committees_focus_areas_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees_focus_areas_locales
    ADD CONSTRAINT committees_focus_areas_locales_pkey PRIMARY KEY (id);


--
-- Name: committees_focus_areas committees_focus_areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees_focus_areas
    ADD CONSTRAINT committees_focus_areas_pkey PRIMARY KEY (id);


--
-- Name: committees_locales committees_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees_locales
    ADD CONSTRAINT committees_locales_pkey PRIMARY KEY (id);


--
-- Name: committees committees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);


--
-- Name: events_gallery events_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_gallery
    ADD CONSTRAINT events_gallery_pkey PRIMARY KEY (id);


--
-- Name: events_locales events_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_locales
    ADD CONSTRAINT events_locales_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: gallery_albums_images_locales gallery_albums_images_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_images_locales
    ADD CONSTRAINT gallery_albums_images_locales_pkey PRIMARY KEY (id);


--
-- Name: gallery_albums_images gallery_albums_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_images
    ADD CONSTRAINT gallery_albums_images_pkey PRIMARY KEY (id);


--
-- Name: gallery_albums_locales gallery_albums_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_locales
    ADD CONSTRAINT gallery_albums_locales_pkey PRIMARY KEY (id);


--
-- Name: gallery_albums gallery_albums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_pkey PRIMARY KEY (id);


--
-- Name: hero_slides_locales hero_slides_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides_locales
    ADD CONSTRAINT hero_slides_locales_pkey PRIMARY KEY (id);


--
-- Name: hero_slides hero_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides
    ADD CONSTRAINT hero_slides_pkey PRIMARY KEY (id);


--
-- Name: media_locales media_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_locales
    ADD CONSTRAINT media_locales_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: members_locales members_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members_locales
    ADD CONSTRAINT members_locales_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: news_locales news_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_locales
    ADD CONSTRAINT news_locales_pkey PRIMARY KEY (id);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: news_tags news_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT news_tags_pkey PRIMARY KEY (id);


--
-- Name: newsletters_locales newsletters_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters_locales
    ADD CONSTRAINT newsletters_locales_pkey PRIMARY KEY (id);


--
-- Name: newsletters newsletters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_pkey PRIMARY KEY (id);


--
-- Name: pages_locales pages_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_locales
    ADD CONSTRAINT pages_locales_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: payload_kv payload_kv_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_kv
    ADD CONSTRAINT payload_kv_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents payload_locked_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents
    ADD CONSTRAINT payload_locked_documents_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pkey PRIMARY KEY (id);


--
-- Name: payload_migrations payload_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_migrations
    ADD CONSTRAINT payload_migrations_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences payload_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences
    ADD CONSTRAINT payload_preferences_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences_rels payload_preferences_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_pkey PRIMARY KEY (id);


--
-- Name: settings_emails settings_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_emails
    ADD CONSTRAINT settings_emails_pkey PRIMARY KEY (id);


--
-- Name: settings_locales settings_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_locales
    ADD CONSTRAINT settings_locales_pkey PRIMARY KEY (id);


--
-- Name: settings_phones settings_phones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_phones
    ADD CONSTRAINT settings_phones_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: settings_stats_locales settings_stats_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_stats_locales
    ADD CONSTRAINT settings_stats_locales_pkey PRIMARY KEY (id);


--
-- Name: settings_stats settings_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_stats
    ADD CONSTRAINT settings_stats_pkey PRIMARY KEY (id);


--
-- Name: submissions submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.submissions
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- Name: ticker_items_locales ticker_items_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticker_items_locales
    ADD CONSTRAINT ticker_items_locales_pkey PRIMARY KEY (id);


--
-- Name: ticker_items ticker_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticker_items
    ADD CONSTRAINT ticker_items_pkey PRIMARY KEY (id);


--
-- Name: us_news_locales us_news_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.us_news_locales
    ADD CONSTRAINT us_news_locales_pkey PRIMARY KEY (id);


--
-- Name: us_news us_news_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.us_news
    ADD CONSTRAINT us_news_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_sessions users_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_pkey PRIMARY KEY (id);


--
-- Name: _events_v_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_created_at_idx ON public._events_v USING btree (created_at);


--
-- Name: _events_v_latest_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_latest_idx ON public._events_v USING btree (latest);


--
-- Name: _events_v_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX _events_v_locales_locale_parent_id_unique ON public._events_v_locales USING btree (_locale, _parent_id);


--
-- Name: _events_v_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_parent_idx ON public._events_v USING btree (parent_id);


--
-- Name: _events_v_published_locale_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_published_locale_idx ON public._events_v USING btree (published_locale);


--
-- Name: _events_v_snapshot_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_snapshot_idx ON public._events_v USING btree (snapshot);


--
-- Name: _events_v_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_updated_at_idx ON public._events_v USING btree (updated_at);


--
-- Name: _events_v_version_gallery_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_version_gallery_image_idx ON public._events_v_version_gallery USING btree (image_id);


--
-- Name: _events_v_version_gallery_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_version_gallery_order_idx ON public._events_v_version_gallery USING btree (_order);


--
-- Name: _events_v_version_gallery_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_version_gallery_parent_id_idx ON public._events_v_version_gallery USING btree (_parent_id);


--
-- Name: _events_v_version_version__status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_version_version__status_idx ON public._events_v USING btree (version__status);


--
-- Name: _events_v_version_version_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_version_version_cover_image_idx ON public._events_v USING btree (version_cover_image_id);


--
-- Name: _events_v_version_version_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_version_version_created_at_idx ON public._events_v USING btree (version_created_at);


--
-- Name: _events_v_version_version_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_version_version_slug_idx ON public._events_v USING btree (version_slug);


--
-- Name: _events_v_version_version_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _events_v_version_version_updated_at_idx ON public._events_v USING btree (version_updated_at);


--
-- Name: _news_v_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_created_at_idx ON public._news_v USING btree (created_at);


--
-- Name: _news_v_latest_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_latest_idx ON public._news_v USING btree (latest);


--
-- Name: _news_v_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX _news_v_locales_locale_parent_id_unique ON public._news_v_locales USING btree (_locale, _parent_id);


--
-- Name: _news_v_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_parent_idx ON public._news_v USING btree (parent_id);


--
-- Name: _news_v_published_locale_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_published_locale_idx ON public._news_v USING btree (published_locale);


--
-- Name: _news_v_snapshot_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_snapshot_idx ON public._news_v USING btree (snapshot);


--
-- Name: _news_v_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_updated_at_idx ON public._news_v USING btree (updated_at);


--
-- Name: _news_v_version_tags_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_version_tags_order_idx ON public._news_v_version_tags USING btree (_order);


--
-- Name: _news_v_version_tags_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_version_tags_parent_id_idx ON public._news_v_version_tags USING btree (_parent_id);


--
-- Name: _news_v_version_version__status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_version_version__status_idx ON public._news_v USING btree (version__status);


--
-- Name: _news_v_version_version_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_version_version_cover_image_idx ON public._news_v USING btree (version_cover_image_id);


--
-- Name: _news_v_version_version_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_version_version_created_at_idx ON public._news_v USING btree (version_created_at);


--
-- Name: _news_v_version_version_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_version_version_slug_idx ON public._news_v USING btree (version_slug);


--
-- Name: _news_v_version_version_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _news_v_version_version_updated_at_idx ON public._news_v USING btree (version_updated_at);


--
-- Name: _pages_v_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_created_at_idx ON public._pages_v USING btree (created_at);


--
-- Name: _pages_v_latest_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_latest_idx ON public._pages_v USING btree (latest);


--
-- Name: _pages_v_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX _pages_v_locales_locale_parent_id_unique ON public._pages_v_locales USING btree (_locale, _parent_id);


--
-- Name: _pages_v_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_parent_idx ON public._pages_v USING btree (parent_id);


--
-- Name: _pages_v_published_locale_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_published_locale_idx ON public._pages_v USING btree (published_locale);


--
-- Name: _pages_v_snapshot_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_snapshot_idx ON public._pages_v USING btree (snapshot);


--
-- Name: _pages_v_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_updated_at_idx ON public._pages_v USING btree (updated_at);


--
-- Name: _pages_v_version_version__status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_version_version__status_idx ON public._pages_v USING btree (version__status);


--
-- Name: _pages_v_version_version_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_version_version_cover_image_idx ON public._pages_v USING btree (version_cover_image_id);


--
-- Name: _pages_v_version_version_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_version_version_created_at_idx ON public._pages_v USING btree (version_created_at);


--
-- Name: _pages_v_version_version_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_version_version_slug_idx ON public._pages_v USING btree (version_slug);


--
-- Name: _pages_v_version_version_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX _pages_v_version_version_updated_at_idx ON public._pages_v USING btree (version_updated_at);


--
-- Name: board_members_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX board_members_created_at_idx ON public.board_members USING btree (created_at);


--
-- Name: board_members_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX board_members_locales_locale_parent_id_unique ON public.board_members_locales USING btree (_locale, _parent_id);


--
-- Name: board_members_photo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX board_members_photo_idx ON public.board_members USING btree (photo_id);


--
-- Name: board_members_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX board_members_updated_at_idx ON public.board_members USING btree (updated_at);


--
-- Name: committees_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committees_cover_image_idx ON public.committees USING btree (cover_image_id);


--
-- Name: committees_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committees_created_at_idx ON public.committees USING btree (created_at);


--
-- Name: committees_focus_areas_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX committees_focus_areas_locales_locale_parent_id_unique ON public.committees_focus_areas_locales USING btree (_locale, _parent_id);


--
-- Name: committees_focus_areas_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committees_focus_areas_order_idx ON public.committees_focus_areas USING btree (_order);


--
-- Name: committees_focus_areas_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committees_focus_areas_parent_id_idx ON public.committees_focus_areas USING btree (_parent_id);


--
-- Name: committees_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX committees_locales_locale_parent_id_unique ON public.committees_locales USING btree (_locale, _parent_id);


--
-- Name: committees_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX committees_slug_idx ON public.committees USING btree (slug);


--
-- Name: committees_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX committees_updated_at_idx ON public.committees USING btree (updated_at);


--
-- Name: events__status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events__status_idx ON public.events USING btree (_status);


--
-- Name: events_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_cover_image_idx ON public.events USING btree (cover_image_id);


--
-- Name: events_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_created_at_idx ON public.events USING btree (created_at);


--
-- Name: events_gallery_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_gallery_image_idx ON public.events_gallery USING btree (image_id);


--
-- Name: events_gallery_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_gallery_order_idx ON public.events_gallery USING btree (_order);


--
-- Name: events_gallery_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_gallery_parent_id_idx ON public.events_gallery USING btree (_parent_id);


--
-- Name: events_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_locales_locale_parent_id_unique ON public.events_locales USING btree (_locale, _parent_id);


--
-- Name: events_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX events_slug_idx ON public.events USING btree (slug);


--
-- Name: events_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_updated_at_idx ON public.events USING btree (updated_at);


--
-- Name: gallery_albums_cover_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_albums_cover_idx ON public.gallery_albums USING btree (cover_id);


--
-- Name: gallery_albums_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_albums_created_at_idx ON public.gallery_albums USING btree (created_at);


--
-- Name: gallery_albums_images_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_albums_images_image_idx ON public.gallery_albums_images USING btree (image_id);


--
-- Name: gallery_albums_images_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gallery_albums_images_locales_locale_parent_id_unique ON public.gallery_albums_images_locales USING btree (_locale, _parent_id);


--
-- Name: gallery_albums_images_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_albums_images_order_idx ON public.gallery_albums_images USING btree (_order);


--
-- Name: gallery_albums_images_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_albums_images_parent_id_idx ON public.gallery_albums_images USING btree (_parent_id);


--
-- Name: gallery_albums_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX gallery_albums_locales_locale_parent_id_unique ON public.gallery_albums_locales USING btree (_locale, _parent_id);


--
-- Name: gallery_albums_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gallery_albums_updated_at_idx ON public.gallery_albums USING btree (updated_at);


--
-- Name: hero_slides_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hero_slides_created_at_idx ON public.hero_slides USING btree (created_at);


--
-- Name: hero_slides_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hero_slides_image_idx ON public.hero_slides USING btree (image_id);


--
-- Name: hero_slides_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX hero_slides_locales_locale_parent_id_unique ON public.hero_slides_locales USING btree (_locale, _parent_id);


--
-- Name: hero_slides_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX hero_slides_updated_at_idx ON public.hero_slides USING btree (updated_at);


--
-- Name: media_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_created_at_idx ON public.media USING btree (created_at);


--
-- Name: media_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_filename_idx ON public.media USING btree (filename);


--
-- Name: media_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_locales_locale_parent_id_unique ON public.media_locales USING btree (_locale, _parent_id);


--
-- Name: media_sizes_card_sizes_card_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_card_sizes_card_filename_idx ON public.media USING btree (sizes_card_filename);


--
-- Name: media_sizes_hero_sizes_hero_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_hero_sizes_hero_filename_idx ON public.media USING btree (sizes_hero_filename);


--
-- Name: media_sizes_thumbnail_sizes_thumbnail_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_thumbnail_sizes_thumbnail_filename_idx ON public.media USING btree (sizes_thumbnail_filename);


--
-- Name: media_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_updated_at_idx ON public.media USING btree (updated_at);


--
-- Name: members_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX members_created_at_idx ON public.members USING btree (created_at);


--
-- Name: members_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX members_locales_locale_parent_id_unique ON public.members_locales USING btree (_locale, _parent_id);


--
-- Name: members_logo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX members_logo_idx ON public.members USING btree (logo_id);


--
-- Name: members_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX members_updated_at_idx ON public.members USING btree (updated_at);


--
-- Name: news__status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news__status_idx ON public.news USING btree (_status);


--
-- Name: news_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_cover_image_idx ON public.news USING btree (cover_image_id);


--
-- Name: news_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_created_at_idx ON public.news USING btree (created_at);


--
-- Name: news_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_locales_locale_parent_id_unique ON public.news_locales USING btree (_locale, _parent_id);


--
-- Name: news_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX news_slug_idx ON public.news USING btree (slug);


--
-- Name: news_tags_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_tags_order_idx ON public.news_tags USING btree (_order);


--
-- Name: news_tags_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_tags_parent_id_idx ON public.news_tags USING btree (_parent_id);


--
-- Name: news_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX news_updated_at_idx ON public.news USING btree (updated_at);


--
-- Name: newsletters_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletters_cover_image_idx ON public.newsletters USING btree (cover_image_id);


--
-- Name: newsletters_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletters_created_at_idx ON public.newsletters USING btree (created_at);


--
-- Name: newsletters_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX newsletters_locales_locale_parent_id_unique ON public.newsletters_locales USING btree (_locale, _parent_id);


--
-- Name: newsletters_pdf_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletters_pdf_idx ON public.newsletters USING btree (pdf_id);


--
-- Name: newsletters_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX newsletters_updated_at_idx ON public.newsletters USING btree (updated_at);


--
-- Name: pages__status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages__status_idx ON public.pages USING btree (_status);


--
-- Name: pages_cover_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_cover_image_idx ON public.pages USING btree (cover_image_id);


--
-- Name: pages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_created_at_idx ON public.pages USING btree (created_at);


--
-- Name: pages_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pages_locales_locale_parent_id_unique ON public.pages_locales USING btree (_locale, _parent_id);


--
-- Name: pages_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pages_slug_idx ON public.pages USING btree (slug);


--
-- Name: pages_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_updated_at_idx ON public.pages USING btree (updated_at);


--
-- Name: payload_kv_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payload_kv_key_idx ON public.payload_kv USING btree (key);


--
-- Name: payload_locked_documents_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_created_at_idx ON public.payload_locked_documents USING btree (created_at);


--
-- Name: payload_locked_documents_global_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_global_slug_idx ON public.payload_locked_documents USING btree (global_slug);


--
-- Name: payload_locked_documents_rels_board_members_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_board_members_id_idx ON public.payload_locked_documents_rels USING btree (board_members_id);


--
-- Name: payload_locked_documents_rels_committees_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_committees_id_idx ON public.payload_locked_documents_rels USING btree (committees_id);


--
-- Name: payload_locked_documents_rels_events_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_events_id_idx ON public.payload_locked_documents_rels USING btree (events_id);


--
-- Name: payload_locked_documents_rels_gallery_albums_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_gallery_albums_id_idx ON public.payload_locked_documents_rels USING btree (gallery_albums_id);


--
-- Name: payload_locked_documents_rels_hero_slides_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_hero_slides_id_idx ON public.payload_locked_documents_rels USING btree (hero_slides_id);


--
-- Name: payload_locked_documents_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_media_id_idx ON public.payload_locked_documents_rels USING btree (media_id);


--
-- Name: payload_locked_documents_rels_members_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_members_id_idx ON public.payload_locked_documents_rels USING btree (members_id);


--
-- Name: payload_locked_documents_rels_news_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_news_id_idx ON public.payload_locked_documents_rels USING btree (news_id);


--
-- Name: payload_locked_documents_rels_newsletters_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_newsletters_id_idx ON public.payload_locked_documents_rels USING btree (newsletters_id);


--
-- Name: payload_locked_documents_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_order_idx ON public.payload_locked_documents_rels USING btree ("order");


--
-- Name: payload_locked_documents_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_pages_id_idx ON public.payload_locked_documents_rels USING btree (pages_id);


--
-- Name: payload_locked_documents_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_parent_idx ON public.payload_locked_documents_rels USING btree (parent_id);


--
-- Name: payload_locked_documents_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_path_idx ON public.payload_locked_documents_rels USING btree (path);


--
-- Name: payload_locked_documents_rels_submissions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_submissions_id_idx ON public.payload_locked_documents_rels USING btree (submissions_id);


--
-- Name: payload_locked_documents_rels_ticker_items_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_ticker_items_id_idx ON public.payload_locked_documents_rels USING btree (ticker_items_id);


--
-- Name: payload_locked_documents_rels_us_news_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_us_news_id_idx ON public.payload_locked_documents_rels USING btree (us_news_id);


--
-- Name: payload_locked_documents_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_users_id_idx ON public.payload_locked_documents_rels USING btree (users_id);


--
-- Name: payload_locked_documents_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_updated_at_idx ON public.payload_locked_documents USING btree (updated_at);


--
-- Name: payload_migrations_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_migrations_created_at_idx ON public.payload_migrations USING btree (created_at);


--
-- Name: payload_migrations_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_migrations_updated_at_idx ON public.payload_migrations USING btree (updated_at);


--
-- Name: payload_preferences_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_created_at_idx ON public.payload_preferences USING btree (created_at);


--
-- Name: payload_preferences_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_key_idx ON public.payload_preferences USING btree (key);


--
-- Name: payload_preferences_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_order_idx ON public.payload_preferences_rels USING btree ("order");


--
-- Name: payload_preferences_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_parent_idx ON public.payload_preferences_rels USING btree (parent_id);


--
-- Name: payload_preferences_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_path_idx ON public.payload_preferences_rels USING btree (path);


--
-- Name: payload_preferences_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_users_id_idx ON public.payload_preferences_rels USING btree (users_id);


--
-- Name: payload_preferences_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_updated_at_idx ON public.payload_preferences USING btree (updated_at);


--
-- Name: settings_emails_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_emails_order_idx ON public.settings_emails USING btree (_order);


--
-- Name: settings_emails_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_emails_parent_id_idx ON public.settings_emails USING btree (_parent_id);


--
-- Name: settings_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX settings_locales_locale_parent_id_unique ON public.settings_locales USING btree (_locale, _parent_id);


--
-- Name: settings_phones_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_phones_order_idx ON public.settings_phones USING btree (_order);


--
-- Name: settings_phones_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_phones_parent_id_idx ON public.settings_phones USING btree (_parent_id);


--
-- Name: settings_stats_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX settings_stats_locales_locale_parent_id_unique ON public.settings_stats_locales USING btree (_locale, _parent_id);


--
-- Name: settings_stats_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_stats_order_idx ON public.settings_stats USING btree (_order);


--
-- Name: settings_stats_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX settings_stats_parent_id_idx ON public.settings_stats USING btree (_parent_id);


--
-- Name: submissions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX submissions_created_at_idx ON public.submissions USING btree (created_at);


--
-- Name: submissions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX submissions_updated_at_idx ON public.submissions USING btree (updated_at);


--
-- Name: ticker_items_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ticker_items_created_at_idx ON public.ticker_items USING btree (created_at);


--
-- Name: ticker_items_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ticker_items_locales_locale_parent_id_unique ON public.ticker_items_locales USING btree (_locale, _parent_id);


--
-- Name: ticker_items_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ticker_items_updated_at_idx ON public.ticker_items USING btree (updated_at);


--
-- Name: us_news_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX us_news_created_at_idx ON public.us_news USING btree (created_at);


--
-- Name: us_news_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX us_news_locales_locale_parent_id_unique ON public.us_news_locales USING btree (_locale, _parent_id);


--
-- Name: us_news_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX us_news_updated_at_idx ON public.us_news USING btree (updated_at);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_sessions_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_sessions_order_idx ON public.users_sessions USING btree (_order);


--
-- Name: users_sessions_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_sessions_parent_id_idx ON public.users_sessions USING btree (_parent_id);


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_updated_at_idx ON public.users USING btree (updated_at);


--
-- Name: _events_v_locales _events_v_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v_locales
    ADD CONSTRAINT _events_v_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._events_v(id) ON DELETE CASCADE;


--
-- Name: _events_v _events_v_parent_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v
    ADD CONSTRAINT _events_v_parent_id_events_id_fk FOREIGN KEY (parent_id) REFERENCES public.events(id) ON DELETE SET NULL;


--
-- Name: _events_v _events_v_version_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v
    ADD CONSTRAINT _events_v_version_cover_image_id_media_id_fk FOREIGN KEY (version_cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _events_v_version_gallery _events_v_version_gallery_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v_version_gallery
    ADD CONSTRAINT _events_v_version_gallery_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _events_v_version_gallery _events_v_version_gallery_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._events_v_version_gallery
    ADD CONSTRAINT _events_v_version_gallery_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._events_v(id) ON DELETE CASCADE;


--
-- Name: _news_v_locales _news_v_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v_locales
    ADD CONSTRAINT _news_v_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._news_v(id) ON DELETE CASCADE;


--
-- Name: _news_v _news_v_parent_id_news_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v
    ADD CONSTRAINT _news_v_parent_id_news_id_fk FOREIGN KEY (parent_id) REFERENCES public.news(id) ON DELETE SET NULL;


--
-- Name: _news_v _news_v_version_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v
    ADD CONSTRAINT _news_v_version_cover_image_id_media_id_fk FOREIGN KEY (version_cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: _news_v_version_tags _news_v_version_tags_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._news_v_version_tags
    ADD CONSTRAINT _news_v_version_tags_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._news_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v_locales _pages_v_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._pages_v_locales
    ADD CONSTRAINT _pages_v_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._pages_v(id) ON DELETE CASCADE;


--
-- Name: _pages_v _pages_v_parent_id_pages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._pages_v
    ADD CONSTRAINT _pages_v_parent_id_pages_id_fk FOREIGN KEY (parent_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- Name: _pages_v _pages_v_version_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._pages_v
    ADD CONSTRAINT _pages_v_version_cover_image_id_media_id_fk FOREIGN KEY (version_cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: board_members_locales board_members_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members_locales
    ADD CONSTRAINT board_members_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.board_members(id) ON DELETE CASCADE;


--
-- Name: board_members board_members_photo_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_photo_id_media_id_fk FOREIGN KEY (photo_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: committees committees_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_cover_image_id_media_id_fk FOREIGN KEY (cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: committees_focus_areas_locales committees_focus_areas_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees_focus_areas_locales
    ADD CONSTRAINT committees_focus_areas_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.committees_focus_areas(id) ON DELETE CASCADE;


--
-- Name: committees_focus_areas committees_focus_areas_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees_focus_areas
    ADD CONSTRAINT committees_focus_areas_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: committees_locales committees_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees_locales
    ADD CONSTRAINT committees_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: events events_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_cover_image_id_media_id_fk FOREIGN KEY (cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: events_gallery events_gallery_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_gallery
    ADD CONSTRAINT events_gallery_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: events_gallery events_gallery_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_gallery
    ADD CONSTRAINT events_gallery_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: events_locales events_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events_locales
    ADD CONSTRAINT events_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: gallery_albums gallery_albums_cover_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_cover_id_media_id_fk FOREIGN KEY (cover_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: gallery_albums_images gallery_albums_images_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_images
    ADD CONSTRAINT gallery_albums_images_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: gallery_albums_images_locales gallery_albums_images_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_images_locales
    ADD CONSTRAINT gallery_albums_images_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.gallery_albums_images(id) ON DELETE CASCADE;


--
-- Name: gallery_albums_images gallery_albums_images_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_images
    ADD CONSTRAINT gallery_albums_images_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- Name: gallery_albums_locales gallery_albums_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums_locales
    ADD CONSTRAINT gallery_albums_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- Name: hero_slides hero_slides_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides
    ADD CONSTRAINT hero_slides_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: hero_slides_locales hero_slides_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides_locales
    ADD CONSTRAINT hero_slides_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.hero_slides(id) ON DELETE CASCADE;


--
-- Name: media_locales media_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_locales
    ADD CONSTRAINT media_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: members_locales members_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members_locales
    ADD CONSTRAINT members_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: members members_logo_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_logo_id_media_id_fk FOREIGN KEY (logo_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: news news_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_cover_image_id_media_id_fk FOREIGN KEY (cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: news_locales news_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_locales
    ADD CONSTRAINT news_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.news(id) ON DELETE CASCADE;


--
-- Name: news_tags news_tags_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.news_tags
    ADD CONSTRAINT news_tags_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.news(id) ON DELETE CASCADE;


--
-- Name: newsletters newsletters_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_cover_image_id_media_id_fk FOREIGN KEY (cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: newsletters_locales newsletters_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters_locales
    ADD CONSTRAINT newsletters_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.newsletters(id) ON DELETE CASCADE;


--
-- Name: newsletters newsletters_pdf_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_pdf_id_media_id_fk FOREIGN KEY (pdf_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages pages_cover_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_cover_image_id_media_id_fk FOREIGN KEY (cover_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_locales pages_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_locales
    ADD CONSTRAINT pages_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_board_members_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_board_members_fk FOREIGN KEY (board_members_id) REFERENCES public.board_members(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_committees_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_committees_fk FOREIGN KEY (committees_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_events_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_events_fk FOREIGN KEY (events_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_gallery_albums_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_gallery_albums_fk FOREIGN KEY (gallery_albums_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_hero_slides_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_hero_slides_fk FOREIGN KEY (hero_slides_id) REFERENCES public.hero_slides(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_media_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_members_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_members_fk FOREIGN KEY (members_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_news_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_news_fk FOREIGN KEY (news_id) REFERENCES public.news(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_newsletters_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_newsletters_fk FOREIGN KEY (newsletters_id) REFERENCES public.newsletters(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_locked_documents(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_submissions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_submissions_fk FOREIGN KEY (submissions_id) REFERENCES public.submissions(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_ticker_items_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_ticker_items_fk FOREIGN KEY (ticker_items_id) REFERENCES public.ticker_items(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_us_news_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_us_news_fk FOREIGN KEY (us_news_id) REFERENCES public.us_news(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_preferences(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: settings_emails settings_emails_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_emails
    ADD CONSTRAINT settings_emails_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.settings(id) ON DELETE CASCADE;


--
-- Name: settings_locales settings_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_locales
    ADD CONSTRAINT settings_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.settings(id) ON DELETE CASCADE;


--
-- Name: settings_phones settings_phones_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_phones
    ADD CONSTRAINT settings_phones_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.settings(id) ON DELETE CASCADE;


--
-- Name: settings_stats_locales settings_stats_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_stats_locales
    ADD CONSTRAINT settings_stats_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.settings_stats(id) ON DELETE CASCADE;


--
-- Name: settings_stats settings_stats_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings_stats
    ADD CONSTRAINT settings_stats_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.settings(id) ON DELETE CASCADE;


--
-- Name: ticker_items_locales ticker_items_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticker_items_locales
    ADD CONSTRAINT ticker_items_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.ticker_items(id) ON DELETE CASCADE;


--
-- Name: us_news_locales us_news_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.us_news_locales
    ADD CONSTRAINT us_news_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.us_news(id) ON DELETE CASCADE;


--
-- Name: users_sessions users_sessions_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


