--
-- PostgreSQL database dump
--

\restrict 0xcO72MPWBG5XLGORA7Xmjpa0lyfmtXejcAR1R92u9SHaQtdlHpdaoAmYGpdZ26

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres_admin
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    precio numeric(10,2) NOT NULL,
    stock integer NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres_admin;

--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres_admin
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_seq OWNER TO postgres_admin;

--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres_admin
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres_admin
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres_admin
--

COPY public.productos (id, nombre, precio, stock) FROM stdin;
2	Ibuprofeno 200mg	2000.00	50
3	Ibuprofeno 500gm	500.00	100
4	Aspirina 500gr	3500.00	10
\.


--
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres_admin
--

SELECT pg_catalog.setval('public.productos_id_seq', 4, true);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres_admin
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict 0xcO72MPWBG5XLGORA7Xmjpa0lyfmtXejcAR1R92u9SHaQtdlHpdaoAmYGpdZ26

