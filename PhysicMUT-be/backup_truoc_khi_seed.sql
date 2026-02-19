--
-- PostgreSQL database dump
--

\restrict 81x8ciVUeM84YKkZRmDFamADuqy2qdJhK9ZIsnGiJEkbOQsnU1JmR5cAhVCA7GC

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Chapter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Chapter" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Chapter" OWNER TO postgres;

--
-- Name: Example; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Example" (
    id text NOT NULL,
    lesson_id text NOT NULL,
    title text NOT NULL,
    problem text NOT NULL,
    solution text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    reference text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    type text DEFAULT 'General'::text NOT NULL
);


ALTER TABLE public."Example" OWNER TO postgres;

--
-- Name: Exercise; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Exercise" (
    id text NOT NULL,
    lesson_id text NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    correct_answer text NOT NULL,
    level text DEFAULT 'MEDIUM'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    reference text,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    type text DEFAULT 'General'::text NOT NULL
);


ALTER TABLE public."Exercise" OWNER TO postgres;

--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Lesson" (
    id text NOT NULL,
    name text NOT NULL,
    chapter_id text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lesson" OWNER TO postgres;

--
-- Name: Model3D; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Model3D" (
    id text NOT NULL,
    lesson_id text NOT NULL,
    name text NOT NULL,
    description text,
    source_url text NOT NULL,
    thumbnail_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    type text DEFAULT 'General'::text NOT NULL
);


ALTER TABLE public."Model3D" OWNER TO postgres;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    permissions jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO postgres;

--
-- Name: Theory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Theory" (
    id text NOT NULL,
    lesson_id text NOT NULL,
    title text NOT NULL,
    content_html text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    type text DEFAULT 'General'::text NOT NULL
);


ALTER TABLE public."Theory" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    full_name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    role_id text
);


ALTER TABLE public."User" OWNER TO postgres;

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
-- Data for Name: Chapter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Chapter" (id, name, description, "order", created_at, updated_at) FROM stdin;
3e55b2c8-46d6-4031-8375-ba3772c7edbe	Điện từ trường	Chương về Điện từ trường	1	2026-02-19 13:03:58.429	2026-02-19 13:03:58.429
ed421cfb-72ed-4b0e-932c-42e854b02b68	Điện từ kỹ thuật	Chương về Điện từ kỹ thuật	1	2026-02-19 13:03:58.476	2026-02-19 13:03:58.476
ac55fb13-6d57-4f20-a349-bfc0efcde85c	Vật lý hạt nhân	Chương về Vật lý hạt nhân	1	2026-02-19 13:03:58.481	2026-02-19 13:03:58.481
\.


--
-- Data for Name: Example; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Example" (id, lesson_id, title, problem, solution, created_at, updated_at, reference, status, type) FROM stdin;
b20289e0-b6e4-4fa4-83e3-c62a74022bed	9572510a-8db9-486a-8fbd-a084684d0041	Bài toán Cyclotron 1	Tính tần số quay của hạt đơteri...	Giải quy: f = qB/2πm...	2026-02-19 13:03:58.429	2026-02-19 13:03:58.429	\N	ACTIVE	Calculation
dbf523cf-04f2-4f26-b0f0-3fd525299683	eadcadba-6c56-45ef-985d-87de4555db2f	Ví dụ Loa 1	Tính lực từ tác dụng lên cuộn dây...	F = BIlsin(alpha)...	2026-02-19 13:03:58.476	2026-02-19 13:03:58.476	\N	ACTIVE	Calculation
b2f53284-47f0-4e4e-83b6-eec8b2e45a1c	46296efc-4f9e-4e74-8064-2eb35b8c74af	Ví dụ Quang phổ 1	Tính bán kính quỹ đạo của ion...	R = mv/qB...	2026-02-19 13:03:58.481	2026-02-19 13:03:58.481	\N	ACTIVE	Calculation
\.


--
-- Data for Name: Exercise; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Exercise" (id, lesson_id, question, options, correct_answer, level, created_at, updated_at, reference, status, type) FROM stdin;
c4625a31-812e-4163-8a71-82153714733c	9572510a-8db9-486a-8fbd-a084684d0041	Cyclotron dùng để gia tốc hạt nào?	[{"id": "A", "text": "Hạt mang điện"}, {"id": "B", "text": "Hạt không mang điện"}]	A	EASY	2026-02-19 13:03:58.429	2026-02-19 13:03:58.429	\N	ACTIVE	MultipleChoice
820daf9d-e7fc-445f-97a7-c150f5e9b7f6	eadcadba-6c56-45ef-985d-87de4555db2f	Bộ phận nào dao động tạo ra âm thanh?	[{"id": "A", "text": "Màng loa"}, {"id": "B", "text": "Nam châm"}]	A	EASY	2026-02-19 13:03:58.476	2026-02-19 13:03:58.476	\N	ACTIVE	MultipleChoice
12824990-3972-4db4-bedf-9557b6baa9ce	46296efc-4f9e-4e74-8064-2eb35b8c74af	Máy quang phổ khối dùng để làm gì?	[{"id": "A", "text": "Đo khối lượng nguyên tử"}, {"id": "B", "text": "Đo nhiệt độ"}]	A	MEDIUM	2026-02-19 13:03:58.481	2026-02-19 13:03:58.481	\N	ACTIVE	MultipleChoice
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Lesson" (id, name, chapter_id, "order", created_at, updated_at) FROM stdin;
9572510a-8db9-486a-8fbd-a084684d0041	Máy gia tốc Cyclotron	3e55b2c8-46d6-4031-8375-ba3772c7edbe	1	2026-02-19 13:03:58.429	2026-02-19 13:03:58.429
eadcadba-6c56-45ef-985d-87de4555db2f	Loa điện động	ed421cfb-72ed-4b0e-932c-42e854b02b68	1	2026-02-19 13:03:58.476	2026-02-19 13:03:58.476
46296efc-4f9e-4e74-8064-2eb35b8c74af	Máy quang phổ khối	ac55fb13-6d57-4f20-a349-bfc0efcde85c	1	2026-02-19 13:03:58.481	2026-02-19 13:03:58.481
\.


--
-- Data for Name: Model3D; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Model3D" (id, lesson_id, name, description, source_url, thumbnail_url, created_at, updated_at, status, type) FROM stdin;
4720721a-591e-43f0-bac1-372f4e565a5e	9572510a-8db9-486a-8fbd-a084684d0041	Cyclotron	Mô hình 3D Máy gia tốc Cyclotron		/cyclotron.jpg	2026-02-19 13:03:58.429	2026-02-19 13:03:58.429	ACTIVE	CYCLOTRON
d2831d53-0bf5-43b8-9fc2-004dad9fd489	eadcadba-6c56-45ef-985d-87de4555db2f	Loa điện động	Mô hình 3D Loa điện động		/loadiendong.png	2026-02-19 13:03:58.476	2026-02-19 13:03:58.476	ACTIVE	LOUDSPEAKER
bc74f532-5351-4f43-b26d-dfe2d53ea2cf	46296efc-4f9e-4e74-8064-2eb35b8c74af	Máy quang phổ khối	Mô hình 3D Máy quang phổ khối		/mayQuangphokhoi.png	2026-02-19 13:03:58.481	2026-02-19 13:03:58.481	ACTIVE	MASS_SPECTROMETER
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Role" (id, name, description, permissions, created_at, updated_at) FROM stdin;
300c03e0-c1d0-4bb9-b8b8-f454d4da6e8d	STUDENT	Standard student user	{"read": true}	2026-02-08 15:47:22.974	2026-02-08 15:47:22.974
7a72ec58-9e88-4f2e-9015-c2b436a7ea8d	ADMIN	System Administrator with full access	{"Dashboard": ["view_dashboard"], "Admin Management": ["view_admin_list", "edit_admin", "view_admin_details", "delete_admin", "add_new_admin"], "3D Model Management": ["view_model_list", "delete_model", "add_model", "edit_model"]}	2026-02-08 15:47:22.963	2026-02-09 11:32:57.934
8fda478e-9c7e-4991-9aaa-3c292b19cd89	IT support 1	\N	{"Admin Management": ["view_admin_list", "edit_admin", "view_admin_details", "delete_admin", "add_new_admin"]}	2026-02-09 13:31:48.457	2026-02-09 13:31:48.457
07766149-5e62-4e8d-8da0-f672470c7f70	TEACHER	Teacher with content management access	{}	2026-02-08 15:47:22.973	2026-02-09 14:19:12.469
\.


--
-- Data for Name: Theory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Theory" (id, lesson_id, title, content_html, created_at, updated_at, status, type) FROM stdin;
eb04c50a-ac9b-40ac-8199-8e34f25dd928	9572510a-8db9-486a-8fbd-a084684d0041	Lý thuyết mô hình Máy gia tốc hạt Cyclotron	<p>Cyclotron là máy gia tốc hạt sử dụng từ trường để làm hạt chuyển động theo quỹ đạo tròn...</p>	2026-02-19 13:03:58.429	2026-02-19 13:03:58.429	ACTIVE	Theory
be9746ed-e24b-4365-a7d8-a98f1e168d67	eadcadba-6c56-45ef-985d-87de4555db2f	Lý thuyết mô hình Loa điện động	<p>Hoạt động dựa trên lực từ tác dụng lên dòng điện trong từ trường...</p>	2026-02-19 13:03:58.476	2026-02-19 13:03:58.476	ACTIVE	Theory
95af27cc-1a9f-4818-bf89-79c1cff808e9	46296efc-4f9e-4e74-8064-2eb35b8c74af	Lý thuyết mô hình Máy quang phổ khối	<p>Dùng để tách các đồng vị dựa trên tỉ số điện tích trên khối lượng...</p>	2026-02-19 13:03:58.481	2026-02-19 13:03:58.481	ACTIVE	Theory
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, username, email, password_hash, full_name, created_at, updated_at, role_id) FROM stdin;
90fe4d55-b533-4046-b60a-4623e3fe124a	admin	admin@physicmut.com	123456	Quản trị viên	2026-02-07 07:20:44.17	2026-02-09 05:13:53.8	7a72ec58-9e88-4f2e-9015-c2b436a7ea8d
cbee3a0e-084b-4e3a-b4f7-6bfdf03b88b1	teacher	teacher@physicmut.com	123456	Giáo viên Vật Lý	2026-02-07 07:20:44.175	2026-02-09 05:13:53.822	07766149-5e62-4e8d-8da0-f672470c7f70
0266d2aa-0d0f-476e-8ed6-863d13eaca89	student	student@physicmut.com	123456	Nguyễn Văn A	2026-02-07 07:20:44.176	2026-02-09 05:13:53.826	300c03e0-c1d0-4bb9-b8b8-f454d4da6e8d
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
7a1a79ee-d52b-435c-8c3c-e3e8df1ea92c	ca73b5401914dd910ceace6fdfc5588b8bc4393e712d26dc84132510eca898cd	2026-02-07 14:20:43.648898+07	20260207052033_init	\N	\N	2026-02-07 14:20:43.61847+07	1
\.


--
-- Name: Chapter Chapter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Chapter"
    ADD CONSTRAINT "Chapter_pkey" PRIMARY KEY (id);


--
-- Name: Example Example_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Example"
    ADD CONSTRAINT "Example_pkey" PRIMARY KEY (id);


--
-- Name: Exercise Exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Model3D Model3D_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Model3D"
    ADD CONSTRAINT "Model3D_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Theory Theory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Theory"
    ADD CONSTRAINT "Theory_pkey" PRIMARY KEY (id);


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
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Example Example_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Example"
    ADD CONSTRAINT "Example_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Exercise Exercise_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lesson Lesson_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_chapter_id_fkey" FOREIGN KEY (chapter_id) REFERENCES public."Chapter"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Model3D Model3D_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Model3D"
    ADD CONSTRAINT "Model3D_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Theory Theory_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Theory"
    ADD CONSTRAINT "Theory_lesson_id_fkey" FOREIGN KEY (lesson_id) REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 81x8ciVUeM84YKkZRmDFamADuqy2qdJhK9ZIsnGiJEkbOQsnU1JmR5cAhVCA7GC

