--
-- PostgreSQL database dump
--

\restrict 5QN0BM3jSxpfjKhw4eNYR34Bi07nr3MepmvV5FzLDFVd00HuwfOre8kLeDFOSDT

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'AVAILABLE',
    'ASSIGNED',
    'EXPENDED',
    'IN_TRANSIT'
);


ALTER TYPE public."AssetStatus" OWNER TO postgres;

--
-- Name: AssetType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetType" AS ENUM (
    'VEHICLE',
    'WEAPON',
    'AMMUNITION'
);


ALTER TYPE public."AssetType" OWNER TO postgres;

--
-- Name: AssignmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssignmentStatus" AS ENUM (
    'ACTIVE',
    'RETURNED'
);


ALTER TYPE public."AssignmentStatus" OWNER TO postgres;

--
-- Name: TransferStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransferStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TransferStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'BASE_COMMANDER',
    'LOGISTICS_OFFICER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Asset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Asset" (
    id integer NOT NULL,
    name text NOT NULL,
    type public."AssetType" NOT NULL,
    "baseId" integer NOT NULL,
    status public."AssetStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Asset" OWNER TO postgres;

--
-- Name: Asset_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Asset_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Asset_id_seq" OWNER TO postgres;

--
-- Name: Asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Asset_id_seq" OWNED BY public."Asset".id;


--
-- Name: Assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Assignment" (
    id integer NOT NULL,
    "assetId" integer NOT NULL,
    "personnelName" text NOT NULL,
    "assignedDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."AssignmentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Assignment" OWNER TO postgres;

--
-- Name: Assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Assignment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Assignment_id_seq" OWNER TO postgres;

--
-- Name: Assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Assignment_id_seq" OWNED BY public."Assignment".id;


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    action text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    details text NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: AuditLog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AuditLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AuditLog_id_seq" OWNER TO postgres;

--
-- Name: AuditLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AuditLog_id_seq" OWNED BY public."AuditLog".id;


--
-- Name: Base; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Base" (
    id integer NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Base" OWNER TO postgres;

--
-- Name: Base_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Base_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Base_id_seq" OWNER TO postgres;

--
-- Name: Base_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Base_id_seq" OWNED BY public."Base".id;


--
-- Name: Expenditure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Expenditure" (
    id integer NOT NULL,
    "assetId" integer NOT NULL,
    "quantityExpended" integer NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Expenditure" OWNER TO postgres;

--
-- Name: Expenditure_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Expenditure_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Expenditure_id_seq" OWNER TO postgres;

--
-- Name: Expenditure_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Expenditure_id_seq" OWNED BY public."Expenditure".id;


--
-- Name: Purchase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Purchase" (
    id integer NOT NULL,
    "assetType" public."AssetType" NOT NULL,
    quantity integer NOT NULL,
    "baseId" integer NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "loggedBy" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Purchase" OWNER TO postgres;

--
-- Name: Purchase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Purchase_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Purchase_id_seq" OWNER TO postgres;

--
-- Name: Purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Purchase_id_seq" OWNED BY public."Purchase".id;


--
-- Name: Transfer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transfer" (
    id integer NOT NULL,
    "assetType" public."AssetType" NOT NULL,
    quantity integer NOT NULL,
    "fromBaseId" integer NOT NULL,
    "toBaseId" integer NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."TransferStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Transfer" OWNER TO postgres;

--
-- Name: Transfer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Transfer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Transfer_id_seq" OWNER TO postgres;

--
-- Name: Transfer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Transfer_id_seq" OWNED BY public."Transfer".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."UserRole" NOT NULL,
    "baseId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Asset id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Asset" ALTER COLUMN id SET DEFAULT nextval('public."Asset_id_seq"'::regclass);


--
-- Name: Assignment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment" ALTER COLUMN id SET DEFAULT nextval('public."Assignment_id_seq"'::regclass);


--
-- Name: AuditLog id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog" ALTER COLUMN id SET DEFAULT nextval('public."AuditLog_id_seq"'::regclass);


--
-- Name: Base id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Base" ALTER COLUMN id SET DEFAULT nextval('public."Base_id_seq"'::regclass);


--
-- Name: Expenditure id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expenditure" ALTER COLUMN id SET DEFAULT nextval('public."Expenditure_id_seq"'::regclass);


--
-- Name: Purchase id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase" ALTER COLUMN id SET DEFAULT nextval('public."Purchase_id_seq"'::regclass);


--
-- Name: Transfer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transfer" ALTER COLUMN id SET DEFAULT nextval('public."Transfer_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Asset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Asset" (id, name, type, "baseId", status, "createdAt") FROM stdin;
1	Humvee Alpha-1	VEHICLE	1	AVAILABLE	2026-09-30 10:00:20.274
2	Truck Bravo-1	VEHICLE	2	AVAILABLE	2026-09-30 10:00:20.278
3	Rifle M4-001	WEAPON	1	AVAILABLE	2026-09-30 10:00:20.282
4	Rifle M4-002	WEAPON	1	AVAILABLE	2026-09-30 10:00:20.283
5	5.56mm Ammo Batch-1	AMMUNITION	1	AVAILABLE	2026-09-30 10:00:20.284
8	Truck Bravo-1	VEHICLE	2	AVAILABLE	2026-09-30 18:51:23.686
10	Rifle M4-002	WEAPON	1	AVAILABLE	2026-09-30 18:51:23.689
11	5.56mm Ammo Batch-1	AMMUNITION	1	AVAILABLE	2026-09-30 18:51:23.69
12	5.56mm Ammo Batch-2	AMMUNITION	2	AVAILABLE	2026-09-30 18:51:23.692
14	Truck Bravo-1	VEHICLE	2	AVAILABLE	2026-09-30 18:54:55.798
16	Rifle M4-002	WEAPON	1	AVAILABLE	2026-09-30 18:54:55.801
17	5.56mm Ammo Batch-1	AMMUNITION	1	AVAILABLE	2026-09-30 18:54:55.802
18	5.56mm Ammo Batch-2	AMMUNITION	2	AVAILABLE	2026-09-30 18:54:55.804
20	Truck Bravo-1	VEHICLE	2	AVAILABLE	2026-09-30 18:59:40.56
21	Rifle M4-001	WEAPON	1	AVAILABLE	2026-09-30 18:59:40.562
22	Rifle M4-002	WEAPON	1	AVAILABLE	2026-09-30 18:59:40.563
23	5.56mm Ammo Batch-1	AMMUNITION	1	AVAILABLE	2026-09-30 18:59:40.564
24	5.56mm Ammo Batch-2	AMMUNITION	2	AVAILABLE	2026-09-30 18:59:40.566
19	Humvee Alpha-1	VEHICLE	1	AVAILABLE	2026-09-30 18:59:40.557
6	5.56mm Ammo Batch-2	AMMUNITION	2	AVAILABLE	2026-09-30 10:00:20.285
13	Humvee Alpha-1	VEHICLE	1	AVAILABLE	2026-09-30 18:54:55.795
9	Rifle M4-001	WEAPON	1	ASSIGNED	2026-09-30 18:51:23.688
15	Rifle M4-001	WEAPON	1	ASSIGNED	2026-09-30 18:54:55.8
7	Humvee Alpha-1	VEHICLE	1	ASSIGNED	2026-09-30 18:51:23.68
\.


--
-- Data for Name: Assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Assignment" (id, "assetId", "personnelName", "assignedDate", status, "createdAt") FROM stdin;
1	1	Sergeant Smith	2026-09-30 10:00:20.301	ACTIVE	2026-09-30 10:00:20.301
4	19	Sergeant Smith	2026-09-30 18:59:40.581	RETURNED	2026-09-30 18:59:40.581
5	6	ef	2026-10-01 08:10:03.919	RETURNED	2026-10-01 08:10:03.919
3	13	Sergeant Smith	2026-09-30 18:54:55.817	RETURNED	2026-09-30 18:54:55.817
2	7	Sergeant Smith	2026-09-30 18:51:23.707	RETURNED	2026-09-30 18:51:23.707
6	9	ew	2026-10-01 13:20:43.277	ACTIVE	2026-10-01 13:20:43.277
7	15	ytty	2026-10-01 13:33:26.618	ACTIVE	2026-10-01 13:33:26.618
8	7	iioiuh	2026-10-01 13:33:39.768	ACTIVE	2026-10-01 13:33:39.768
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", action, "timestamp", details) FROM stdin;
1	3	Assignment - POST /	2026-10-01 08:10:03.963	{"body":{"assetId":"6","personnelName":"ef"},"params":{},"query":{}}
2	3	Expenditure - POST /	2026-10-01 08:10:26.691	{"body":{"assetId":"6","quantityExpended":"33232","reason":"urgent need"},"params":{},"query":{}}
3	1	Purchase - POST /	2026-10-01 12:53:49.914	{"body":{"assetType":"AMMUNITION","quantity":"4","baseId":"1","date":"2026-10-01"},"params":{},"query":{}}
4	1	Expenditure - POST /	2026-10-01 13:11:03.047	{"body":{"assetId":"24","quantityExpended":"77","reason":"djkk"},"params":{},"query":{}}
5	4	Purchase - POST /	2026-10-01 13:12:11.075	{"body":{"assetType":"VEHICLE","quantity":"4","baseId":"1","date":"2026-10-01"},"params":{},"query":{}}
6	1	Purchase - POST /	2026-10-01 13:15:26.707	{"body":{"assetType":"WEAPON","quantity":"3","baseId":"1","date":"2026-09-28"},"params":{},"query":{}}
7	1	Assignment - POST /	2026-10-01 13:20:43.307	{"body":{"assetId":"9","personnelName":"ew"},"params":{},"query":{}}
8	1	Expenditure - POST /	2026-10-01 13:20:55.907	{"body":{"assetId":"24","quantityExpended":7,"reason":"ss"},"params":{},"query":{}}
9	1	Assignment - POST /	2026-10-01 13:33:26.631	{"body":{"assetId":"15","personnelName":"ytty"},"params":{},"query":{}}
10	1	Assignment - POST /	2026-10-01 13:33:39.776	{"body":{"assetId":"7","personnelName":"iioiuh"},"params":{},"query":{}}
\.


--
-- Data for Name: Base; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Base" (id, name, location, "createdAt") FROM stdin;
1	Alpha Base	North Sector	2026-09-30 10:00:20.237
2	Bravo Base	South Sector	2026-09-30 10:00:20.248
3	Charlie Base	East Sector	2026-09-30 10:00:20.251
\.


--
-- Data for Name: Expenditure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expenditure" (id, "assetId", "quantityExpended", date, reason, "createdAt") FROM stdin;
1	5	50	2024-04-01 00:00:00	Training exercise	2026-09-30 10:00:20.303
2	11	50	2024-04-01 00:00:00	Training exercise	2026-09-30 18:51:23.711
3	17	50	2024-04-01 00:00:00	Training exercise	2026-09-30 18:54:55.82
4	23	50	2024-04-01 00:00:00	Training exercise	2026-09-30 18:59:40.585
5	6	33232	2026-10-01 08:10:26.591	urgent need	2026-10-01 08:10:26.651
6	24	77	2026-10-01 13:11:03.022	djkk	2026-10-01 13:11:03.028
7	24	7	2026-10-01 13:20:55.847	ss	2026-10-01 13:20:55.886
\.


--
-- Data for Name: Purchase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Purchase" (id, "assetType", quantity, "baseId", date, "loggedBy", "createdAt") FROM stdin;
1	VEHICLE	5	1	2024-01-15 00:00:00	1	2026-09-30 10:00:20.287
2	WEAPON	20	1	2024-02-10 00:00:00	1	2026-09-30 10:00:20.29
3	AMMUNITION	1000	2	2024-03-05 00:00:00	4	2026-09-30 10:00:20.292
4	VEHICLE	5	1	2024-01-15 00:00:00	1	2026-09-30 18:51:23.694
5	WEAPON	20	1	2024-02-10 00:00:00	1	2026-09-30 18:51:23.698
6	AMMUNITION	1000	2	2024-03-05 00:00:00	4	2026-09-30 18:51:23.7
7	VEHICLE	5	1	2024-01-15 00:00:00	1	2026-09-30 18:54:55.805
8	WEAPON	20	1	2024-02-10 00:00:00	1	2026-09-30 18:54:55.809
9	AMMUNITION	1000	2	2024-03-05 00:00:00	4	2026-09-30 18:54:55.811
10	VEHICLE	5	1	2024-01-15 00:00:00	1	2026-09-30 18:59:40.568
11	WEAPON	20	1	2024-02-10 00:00:00	1	2026-09-30 18:59:40.572
12	AMMUNITION	1000	2	2024-03-05 00:00:00	4	2026-09-30 18:59:40.574
13	AMMUNITION	4	1	2026-10-01 00:00:00	1	2026-10-01 12:53:49.889
14	VEHICLE	4	1	2026-10-01 00:00:00	4	2026-10-01 13:12:11.069
15	WEAPON	3	1	2026-09-28 00:00:00	1	2026-10-01 13:15:26.695
\.


--
-- Data for Name: Transfer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transfer" (id, "assetType", quantity, "fromBaseId", "toBaseId", "timestamp", status, "createdAt") FROM stdin;
1	WEAPON	5	1	2	2026-09-30 10:00:20.295	COMPLETED	2026-09-30 10:00:20.295
2	AMMUNITION	200	2	3	2026-09-30 10:00:20.299	PENDING	2026-09-30 10:00:20.299
3	WEAPON	5	1	2	2026-09-30 18:51:23.701	COMPLETED	2026-09-30 18:51:23.701
4	AMMUNITION	200	2	3	2026-09-30 18:51:23.705	PENDING	2026-09-30 18:51:23.705
5	WEAPON	5	1	2	2026-09-30 18:54:55.813	COMPLETED	2026-09-30 18:54:55.813
6	AMMUNITION	200	2	3	2026-09-30 18:54:55.815	PENDING	2026-09-30 18:54:55.815
7	WEAPON	5	1	2	2026-09-30 18:59:40.576	COMPLETED	2026-09-30 18:59:40.576
8	AMMUNITION	200	2	3	2026-09-30 18:59:40.579	PENDING	2026-09-30 18:59:40.579
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "passwordHash", role, "baseId", "createdAt") FROM stdin;
1	System Administrator	admin@military.gov	$2b$10$PJ.vjLWbzhY.qu6AJcjSXuYCmfsazy.ILD3njBEz4fUkuwIxTb/7.	ADMIN	\N	2026-09-30 10:00:20.257
2	John Commander	commander1@military.gov	$2b$10$PJ.vjLWbzhY.qu6AJcjSXuYCmfsazy.ILD3njBEz4fUkuwIxTb/7.	BASE_COMMANDER	1	2026-09-30 10:00:20.265
3	Jane Commander	commander2@military.gov	$2b$10$PJ.vjLWbzhY.qu6AJcjSXuYCmfsazy.ILD3njBEz4fUkuwIxTb/7.	BASE_COMMANDER	2	2026-09-30 10:00:20.268
4	Logistics Officer	logistics@military.gov	$2b$10$PJ.vjLWbzhY.qu6AJcjSXuYCmfsazy.ILD3njBEz4fUkuwIxTb/7.	LOGISTICS_OFFICER	\N	2026-09-30 10:00:20.271
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
60f26cc5-9bf5-47d5-8a3b-3ffba890a132	ac158a9eaf09a008b692d1f251f3ec780be0d0db3773903fef588a641a51f4d0	2026-09-30 15:30:11.258241+05:30	20260930100011_init	\N	\N	2026-09-30 15:30:11.166096+05:30	1
\.


--
-- Name: Asset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Asset_id_seq"', 24, true);


--
-- Name: Assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Assignment_id_seq"', 8, true);


--
-- Name: AuditLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AuditLog_id_seq"', 10, true);


--
-- Name: Base_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Base_id_seq"', 3, true);


--
-- Name: Expenditure_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Expenditure_id_seq"', 7, true);


--
-- Name: Purchase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Purchase_id_seq"', 15, true);


--
-- Name: Transfer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Transfer_id_seq"', 8, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 16, true);


--
-- Name: Asset Asset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_pkey" PRIMARY KEY (id);


--
-- Name: Assignment Assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Base Base_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Base"
    ADD CONSTRAINT "Base_pkey" PRIMARY KEY (id);


--
-- Name: Expenditure Expenditure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expenditure"
    ADD CONSTRAINT "Expenditure_pkey" PRIMARY KEY (id);


--
-- Name: Purchase Purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY (id);


--
-- Name: Transfer Transfer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Base_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Base_name_key" ON public."Base" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Asset Asset_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Assignment Assignment_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Assignment"
    ADD CONSTRAINT "Assignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."Asset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Expenditure Expenditure_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expenditure"
    ADD CONSTRAINT "Expenditure_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."Asset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Purchase Purchase_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Purchase Purchase_loggedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_loggedBy_fkey" FOREIGN KEY ("loggedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transfer Transfer_fromBaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_fromBaseId_fkey" FOREIGN KEY ("fromBaseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transfer Transfer_toBaseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_toBaseId_fkey" FOREIGN KEY ("toBaseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_baseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES public."Base"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 5QN0BM3jSxpfjKhw4eNYR34Bi07nr3MepmvV5FzLDFVd00HuwfOre8kLeDFOSDT

