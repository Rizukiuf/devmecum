# Daftar rencana katalog

Daftar teknologi yang direncanakan masuk katalog Devmecum, satu tabel per domain dengan urutan dari `src/data/domains.yaml`. Daftar ini bahan kerja: skill `daftar-teknologi` membacanya untuk memilih entri yang didaftarkan menjadi file YAML di `src/data/tech/`. Ia bukan sumber data; nilai resmi tiap teknologi ada di berkas YAML-nya.

## Aturan

- **Sumber:** benih di Lampiran A rancangan (`docs/superpowers/specs/2026-11-14-buku-panduan-teknologi-design.md`), kecuali baris "Lintas topik: karier" yang menjadi bagian lintas topik M3. Entri bercatatan "Tambahan" berasal dari pelengkapan sesuai §14: masih dipakai industri atau penting untuk belajar, dan punya dokumentasi resmi.
- **Dipisah** bila tiap bagian punya dokumentasi dan rilis sendiri (misalnya Svelte dan SvelteKit). **Disatukan** bila konsep selalu dibahas bersama (misalnya TDD dan BDD).
- **Slug** huruf kecil dan tanda hubung, unik di seluruh katalog.
- **Templat bawaan menurut `type`:** `language` A; `framework` dan `library` B; `tool` dan `platform` C; `database` D; `concept` dan `standard` E. Pengecualian ditulis di kolom Catatan.
- Kolom `domain` tidak ada karena tiap tabel mewakili satu domain.
- "Calon adopsi warisan" atau "calon adopsi mapan" hanyalah dugaan awal; nilai adopsi ditentukan lewat `docs/rubrik-adopsi.md` saat entri didaftarkan.

## Fondasi (fondasi)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `cara-kerja-komputer` | Cara kerja komputer | concept | E | Dipisah dari sistem bilangan |
| `sistem-bilangan` | Sistem bilangan | concept | E | Biner, heksadesimal, representasi bilangan |
| `logika-dan-algoritma` | Logika dan algoritma | concept | E |  |
| `struktur-data` | Struktur data | concept | E |  |
| `kompleksitas-big-o` | Kompleksitas (Big-O) | concept | E |  |
| `paradigma-pemrograman` | Paradigma pemrograman | concept | E |  |
| `sistem-operasi` | Sistem operasi dan proses | concept | E |  |
| `jaringan-komputer` | Jaringan komputer | concept | E |  |
| `http` | HTTP | standard | E |  |
| `terminal-dan-shell` | Terminal dan shell | concept | E | Konsep; alat spesifik ada di domain tools |
| `regular-expression` | Regular expression | concept | E |  |
| `encoding-dan-unicode` | Encoding dan Unicode | standard | E |  |
| `oop` | Pemrograman berorientasi objek (OOP) | concept | E | Dipisah dari SOLID |
| `solid` | Prinsip SOLID | concept | E |  |
| `clean-code` | Clean code | concept | E |  |
| `tcp-ip` | TCP/IP | standard | E | Tambahan; fondasi jaringan |
| `dns` | DNS | standard | E | Tambahan |
| `json` | JSON | standard | E | Tambahan; format tukar data paling umum |
| `kompilator-dan-interpreter` | Kompilator dan interpreter | concept | E | Tambahan |
| `konkurensi-dan-paralelisme` | Konkurensi dan paralelisme | concept | E | Tambahan |
| `matematika-diskret` | Matematika diskret | concept | E | Tambahan; dasar logika, graf, dan kombinatorik |

## Bahasa pemrograman (bahasa)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `python` | Python | language | A | Sudah terdaftar di src/data/tech/python.yaml |
| `javascript` | JavaScript | language | A |  |
| `typescript` | TypeScript | language | A |  |
| `sql` | SQL | language | A | Bahasa kueri; pembahasan basis data ada di domain database |
| `java` | Java | language | A |  |
| `kotlin` | Kotlin | language | A |  |
| `c` | C | language | A |  |
| `cpp` | C++ | language | A |  |
| `csharp` | C# | language | A |  |
| `go` | Go | language | A | Dirujuk alternatives di python.yaml |
| `rust` | Rust | language | A |  |
| `php` | PHP | language | A |  |
| `swift` | Swift | language | A |  |
| `dart` | Dart | language | A |  |
| `ruby` | Ruby | language | A | Dirujuk alternatives di python.yaml |
| `bash` | Bash | language | A |  |
| `powershell` | PowerShell | language | A |  |
| `r` | R | language | A |  |
| `julia` | Julia | language | A |  |
| `scala` | Scala | language | A |  |
| `elixir` | Elixir | language | A |  |
| `haskell` | Haskell | language | A |  |
| `lua` | Lua | language | A |  |
| `zig` | Zig | language | A |  |
| `assembly` | Assembly | language | A | Konsep arsitektur CPU dibahas di fondasi |
| `webassembly` | WebAssembly | standard | A | Pengecualian: templat A karena punya format teks dan instruksi sendiri |
| `perl` | Perl | language | A | Tambahan |
| `fortran` | Fortran | language | A | Tambahan; komputasi ilmiah |
| `cobol` | COBOL | language | A | Tambahan; calon adopsi warisan |
| `objective-c` | Objective-C | language | A | Tambahan; calon adopsi warisan |
| `fsharp` | F# | language | A | Tambahan |
| `clojure` | Clojure | language | A | Tambahan |
| `erlang` | Erlang | language | A | Tambahan |
| `groovy` | Groovy | language | A | Tambahan; dasar skrip Gradle dan Jenkins |
| `mojo` | Mojo | language | A | Tambahan; bahasa untuk beban kerja AI |

## Web frontend (web-frontend)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `html` | HTML | standard | B | Pengecualian: templat B, bukan E |
| `css` | CSS | standard | B | Pengecualian: templat B, bukan E |
| `tailwind-css` | Tailwind CSS | framework | B |  |
| `web-api-dom` | Web API dan DOM | standard | B | Pengecualian: templat B karena berupa API yang dipakai langsung |
| `aksesibilitas-web` | Aksesibilitas web | standard | E | WCAG dan WAI-ARIA |
| `performa-web` | Performa web dan Core Web Vitals | concept | E |  |
| `react` | React | library | B |  |
| `nextjs` | Next.js | framework | B |  |
| `vue` | Vue | framework | B |  |
| `nuxt` | Nuxt | framework | B |  |
| `angular` | Angular | framework | B |  |
| `svelte` | Svelte | framework | B | Dipisah dari SvelteKit |
| `sveltekit` | SvelteKit | framework | B |  |
| `astro` | Astro | framework | B |  |
| `solidjs` | SolidJS | library | B |  |
| `htmx` | htmx | library | B |  |
| `vite` | Vite | tool | C |  |
| `tanstack-query` | TanStack Query | library | B |  |
| `zustand` | Zustand | library | B |  |
| `redux-toolkit` | Redux Toolkit | library | B |  |
| `pwa` | Progressive Web App (PWA) | standard | E |  |
| `sass` | Sass | tool | C | Tambahan |
| `bootstrap` | Bootstrap | framework | B | Tambahan |
| `shadcn-ui` | shadcn/ui | library | B | Tambahan |
| `mui` | MUI (Material UI) | library | B | Tambahan |
| `webpack` | webpack | tool | C | Tambahan; calon adopsi mapan |
| `react-router` | React Router | library | B | Tambahan |
| `jquery` | jQuery | library | B | Tambahan; calon adopsi warisan |
| `pinia` | Pinia | library | B | Tambahan |
| `rxjs` | RxJS | library | B | Tambahan |
| `storybook` | Storybook | tool | C | Tambahan |
| `web-components` | Web Components | standard | E | Tambahan |
| `threejs` | Three.js | library | B | Tambahan |
| `d3` | D3.js | library | B | Tambahan; visualisasi data di web |
| `desain-responsif` | Desain responsif | concept | E | Tambahan |

## Web backend dan API (web-backend)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `nodejs` | Node.js | platform | C | Runtime |
| `deno` | Deno | platform | C | Runtime |
| `bun` | Bun | platform | C | Runtime |
| `express` | Express | framework | B |  |
| `fastify` | Fastify | framework | B |  |
| `hono` | Hono | framework | B |  |
| `nestjs` | NestJS | framework | B |  |
| `django` | Django | framework | B |  |
| `fastapi` | FastAPI | framework | B |  |
| `flask` | Flask | framework | B |  |
| `laravel` | Laravel | framework | B |  |
| `spring-boot` | Spring Boot | framework | B |  |
| `aspnet-core` | ASP.NET Core | framework | B |  |
| `gin` | Gin | framework | B |  |
| `echo` | Echo | framework | B |  |
| `fiber` | Fiber | framework | B |  |
| `ruby-on-rails` | Ruby on Rails | framework | B |  |
| `phoenix` | Phoenix | framework | B |  |
| `desain-rest-api` | Desain REST API | concept | E | Desain API umum ada di arsitektur |
| `graphql` | GraphQL | standard | E |  |
| `grpc` | gRPC | framework | B |  |
| `websocket` | WebSocket | standard | E |  |
| `trpc` | tRPC | library | B |  |
| `oauth2-oidc` | OAuth 2.0 dan OIDC | standard | E | Disatukan |
| `jwt` | JWT | standard | E |  |
| `passkey` | Passkey (WebAuthn) | standard | E |  |
| `caching` | Caching | concept | E |  |
| `message-queue` | Message queue | concept | E | Alat spesifik: rabbitmq (arsitektur), apache-kafka (data) |
| `dotnet` | .NET | platform | C | Tambahan; dasar ASP.NET Core, WPF, dan MAUI |
| `openapi` | OpenAPI | standard | E | Tambahan |
| `axum` | Axum | framework | B | Tambahan |
| `wordpress` | WordPress | platform | C | Tambahan; CMS paling luas |
| `django-rest-framework` | Django REST Framework | framework | B | Tambahan |
| `pydantic` | Pydantic | library | B | Tambahan |
| `zod` | Zod | library | B | Tambahan |
| `soap` | SOAP | standard | E | Tambahan; calon adopsi warisan |

## Mobile (mobile)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `flutter` | Flutter | framework | B |  |
| `react-native` | React Native | framework | B | Dipisah dari Expo |
| `expo` | Expo | framework | B |  |
| `android` | Android | platform | C | Dipisah dari Jetpack Compose |
| `jetpack-compose` | Jetpack Compose | framework | B |  |
| `ios` | iOS | platform | C | Dipisah dari SwiftUI |
| `swiftui` | SwiftUI | framework | B |  |
| `kotlin-multiplatform` | Kotlin Multiplatform | framework | B |  |
| `ionic` | Ionic | framework | B | Dipisah dari Capacitor |
| `capacitor` | Capacitor | framework | B |  |
| `publikasi-aplikasi-mobile` | Publikasi ke Play Store dan App Store | concept | E | Disatukan |
| `uikit` | UIKit | framework | B | Tambahan; calon adopsi mapan |
| `fastlane` | fastlane | tool | C | Tambahan |
| `cordova` | Apache Cordova | framework | B | Tambahan; calon adopsi warisan |
| `xamarin` | Xamarin | framework | B | Tambahan; warisan, digantikan .NET MAUI |

## Desktop (desktop)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `electron` | Electron | framework | B |  |
| `tauri` | Tauri | framework | B |  |
| `wpf` | WPF | framework | B |  |
| `winui` | WinUI | framework | B |  |
| `dotnet-maui` | .NET MAUI | framework | B |  |
| `qt` | Qt | framework | B |  |
| `javafx` | JavaFX | framework | B |  |
| `gtk` | GTK | library | B |  |
| `flutter-desktop` | Flutter Desktop | framework | B |  |
| `compose-multiplatform` | Compose Multiplatform | framework | B |  |
| `winforms` | Windows Forms | framework | B | Tambahan; calon adopsi warisan |
| `avalonia` | Avalonia | framework | B | Tambahan |

## Database (database)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `dasar-basis-data` | Dasar basis data dan pemodelan | concept | E |  |
| `postgresql` | PostgreSQL | database | D |  |
| `mysql` | MySQL | database | D | Dipisah dari MariaDB |
| `mariadb` | MariaDB | database | D |  |
| `sqlite` | SQLite | database | D |  |
| `sql-server` | SQL Server | database | D |  |
| `mongodb` | MongoDB | database | D |  |
| `redis` | Redis | database | D | Dipisah dari Valkey |
| `valkey` | Valkey | database | D |  |
| `elasticsearch` | Elasticsearch | database | D | Dipisah dari OpenSearch |
| `opensearch` | OpenSearch | database | D |  |
| `cassandra` | Apache Cassandra | database | D |  |
| `dynamodb` | Amazon DynamoDB | database | D |  |
| `firestore` | Cloud Firestore | database | D |  |
| `neo4j` | Neo4j | database | D |  |
| `duckdb` | DuckDB | database | D |  |
| `clickhouse` | ClickHouse | database | D |  |
| `supabase` | Supabase | platform | D | Pengecualian: templat D; membungkus PostgreSQL |
| `firebase` | Firebase | platform | D | Pengecualian: templat D; berpusat pada Firestore dan layanan data |
| `prisma` | Prisma | library | B |  |
| `drizzle` | Drizzle ORM | library | B |  |
| `sqlalchemy` | SQLAlchemy | library | B |  |
| `hibernate` | Hibernate | library | B |  |
| `eloquent` | Eloquent | library | B |  |
| `ef-core` | Entity Framework Core | library | B |  |
| `pgvector` | pgvector | database | D | Ekstensi PostgreSQL untuk vektor |
| `qdrant` | Qdrant | database | D |  |
| `pinecone` | Pinecone | database | D |  |
| `weaviate` | Weaviate | database | D |  |
| `chroma` | Chroma | database | D |  |
| `oracle-database` | Oracle Database | database | D | Tambahan |
| `memcached` | Memcached | database | D | Tambahan |
| `milvus` | Milvus | database | D | Tambahan |
| `flyway` | Flyway | tool | C | Tambahan; migrasi skema |

## Data dan analitik (data)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `numpy` | NumPy | library | B |  |
| `pandas` | pandas | library | B |  |
| `polars` | Polars | library | B |  |
| `matplotlib` | Matplotlib | library | B |  |
| `seaborn` | Seaborn | library | B |  |
| `plotly` | Plotly | library | B |  |
| `jupyter` | Jupyter | tool | C |  |
| `statistika-data` | Statistika untuk data | concept | E |  |
| `apache-spark` | Apache Spark | framework | B |  |
| `apache-kafka` | Apache Kafka | platform | C |  |
| `apache-airflow` | Apache Airflow | tool | C |  |
| `dbt` | dbt | tool | C |  |
| `bigquery` | BigQuery | platform | C |  |
| `snowflake` | Snowflake | platform | C |  |
| `databricks` | Databricks | platform | C |  |
| `apache-iceberg` | Apache Iceberg | standard | E |  |
| `delta-lake` | Delta Lake | standard | E |  |
| `power-bi` | Power BI | tool | C |  |
| `tableau` | Tableau | tool | C |  |
| `looker-studio` | Looker Studio | tool | C |  |
| `metabase` | Metabase | tool | C |  |
| `scipy` | SciPy | library | B | Tambahan |
| `apache-flink` | Apache Flink | framework | B | Tambahan |
| `apache-parquet` | Apache Parquet | standard | E | Tambahan |
| `hadoop` | Apache Hadoop | platform | C | Tambahan; calon adopsi warisan |
| `streamlit` | Streamlit | framework | B | Tambahan |
| `etl-dan-elt` | ETL dan ELT | concept | E | Tambahan |
| `data-warehouse-lakehouse` | Data warehouse dan lakehouse | concept | E | Tambahan |

## AI dan machine learning (ai-ml)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `matematika-ml` | Matematika untuk ML | concept | E |  |
| `machine-learning-dasar` | Dasar machine learning | concept | E | Tambahan |
| `scikit-learn` | scikit-learn | library | B |  |
| `xgboost` | XGBoost | library | B |  |
| `lightgbm` | LightGBM | library | B |  |
| `catboost` | CatBoost | library | B |  |
| `feature-engineering` | Feature engineering | concept | E |  |
| `evaluasi-model-ml` | Evaluasi model ML | concept | E | Tambahan |
| `dasar-deep-learning` | Dasar deep learning | concept | E |  |
| `pytorch` | PyTorch | framework | B |  |
| `tensorflow` | TensorFlow | framework | B | Dipisah dari Keras |
| `keras` | Keras | framework | B |  |
| `jax` | JAX | framework | B |  |
| `computer-vision` | Computer vision | concept | E |  |
| `opencv` | OpenCV | library | B |  |
| `cnn` | Convolutional neural network (CNN) | concept | E |  |
| `yolo` | YOLO | framework | B |  |
| `vision-transformer` | Vision Transformer (ViT) | concept | E |  |
| `nlp` | NLP | concept | E | Dipisah dari arsitektur Transformer |
| `arsitektur-transformer` | Arsitektur Transformer | concept | E |  |
| `hugging-face` | Hugging Face | platform | C | Termasuk pustaka Transformers |
| `time-series` | Time series | concept | E |  |
| `sistem-rekomendasi` | Sistem rekomendasi | concept | E |  |
| `reinforcement-learning` | Reinforcement learning | concept | E |  |
| `mlflow` | MLflow | tool | C |  |
| `dvc` | DVC | tool | C |  |
| `kubeflow` | Kubeflow | platform | C |  |
| `onnx` | ONNX | standard | E |  |
| `kuantisasi-model` | Kuantisasi model | concept | E | Dipisah dari model serving |
| `model-serving` | Model serving | concept | E |  |
| `mlops` | MLOps | concept | E | Tambahan |
| `model-difusi` | Model difusi | concept | E | Tambahan |
| `spacy` | spaCy | library | B | Tambahan |

## Generative AI dan LLM (genai)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `cara-kerja-llm` | Cara kerja LLM | concept | E |  |
| `prompt-engineering` | Prompt engineering | concept | E | Dipisah dari context engineering |
| `context-engineering` | Context engineering | concept | E |  |
| `claude-api` | Claude API | platform | C | API model; dipisah per penyedia |
| `openai-api` | OpenAI API | platform | C |  |
| `gemini-api` | Gemini API | platform | C |  |
| `model-open-weight` | Model open-weight | concept | E | Llama, Mistral, Qwen, dan sejenisnya |
| `embeddings-vector-search` | Embeddings dan vector search | concept | E | Disatukan |
| `rag` | Retrieval-Augmented Generation (RAG) | concept | E |  |
| `fine-tuning-llm` | Fine-tuning LLM | concept | E | Dipisah dari LoRA dan QLoRA |
| `lora-qlora` | LoRA dan QLoRA | concept | E |  |
| `agen-ai` | Agen AI dan tool use | concept | E |  |
| `model-context-protocol` | Model Context Protocol (MCP) | standard | E |  |
| `langchain` | LangChain | framework | B | Dipisah dari LangGraph |
| `langgraph` | LangGraph | framework | B |  |
| `llamaindex` | LlamaIndex | framework | B |  |
| `vercel-ai-sdk` | Vercel AI SDK | library | B |  |
| `pydantic-ai` | Pydantic AI | framework | B |  |
| `claude-agent-sdk` | Claude Agent SDK | library | B |  |
| `openai-agents-sdk` | OpenAI Agents SDK | library | B |  |
| `evaluasi-llm` | Evaluasi LLM | concept | E |  |
| `keamanan-llm` | Keamanan LLM | concept | E | Prompt injection dan sejenisnya; keamanan aplikasi AI umum ada di domain keamanan |
| `ollama` | Ollama | tool | C |  |
| `llama-cpp` | llama.cpp | library | B |  |
| `vllm` | vLLM | framework | B |  |
| `model-multimodal` | Model multimodal | concept | E |  |
| `structured-output-llm` | Structured output LLM | concept | E | Tambahan |
| `dspy` | DSPy | framework | B | Tambahan |
| `a2a` | Agent2Agent Protocol (A2A) | standard | E | Tambahan |

## Cloud (cloud)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `konsep-cloud` | Konsep cloud | concept | E |  |
| `aws` | Amazon Web Services (AWS) | platform | C |  |
| `google-cloud` | Google Cloud | platform | C |  |
| `azure` | Microsoft Azure | platform | C |  |
| `cloudflare` | Cloudflare | platform | C |  |
| `vercel` | Vercel | platform | C |  |
| `netlify` | Netlify | platform | C |  |
| `serverless` | Serverless | concept | E |  |
| `edge-computing` | Edge computing | concept | E |  |
| `finops` | FinOps | concept | E |  |
| `amazon-s3` | Amazon S3 | platform | C | Tambahan |
| `aws-lambda` | AWS Lambda | platform | C | Tambahan |
| `amazon-ec2` | Amazon EC2 | platform | C | Tambahan |
| `cloudflare-workers` | Cloudflare Workers | platform | C | Tambahan |
| `cdn` | Content Delivery Network (CDN) | concept | E | Tambahan |

## DevOps dan infrastruktur (devops)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `git` | Git | tool | C | Dipisah dari GitHub |
| `github` | GitHub | platform | C |  |
| `linux` | Administrasi Linux | platform | C |  |
| `docker` | Docker | tool | C |  |
| `kubernetes` | Kubernetes | platform | C |  |
| `helm` | Helm | tool | C |  |
| `terraform` | Terraform | tool | C | Dipisah dari OpenTofu |
| `opentofu` | OpenTofu | tool | C |  |
| `ansible` | Ansible | tool | C |  |
| `github-actions` | GitHub Actions | platform | C |  |
| `gitlab-ci` | GitLab CI/CD | platform | C |  |
| `jenkins` | Jenkins | tool | C |  |
| `nginx` | Nginx | tool | C |  |
| `caddy` | Caddy | tool | C |  |
| `prometheus` | Prometheus | tool | C |  |
| `grafana` | Grafana | tool | C |  |
| `opentelemetry` | OpenTelemetry | standard | E |  |
| `elk-stack` | ELK Stack | platform | C |  |
| `argo-cd` | Argo CD | tool | C |  |
| `flux` | Flux | tool | C |  |
| `service-mesh` | Service mesh | concept | E |  |
| `platform-engineering` | Platform engineering | concept | E | Dipisah dari SRE |
| `sre` | Site Reliability Engineering (SRE) | concept | E |  |
| `podman` | Podman | tool | C | Tambahan |
| `pulumi` | Pulumi | tool | C | Tambahan |
| `istio` | Istio | tool | C | Tambahan |
| `envoy` | Envoy | tool | C | Tambahan |
| `kustomize` | Kustomize | tool | C | Tambahan |
| `ssh` | SSH | standard | E | Tambahan |
| `systemd` | systemd | tool | C | Tambahan |
| `ci-cd` | CI/CD | concept | E | Tambahan |
| `infrastructure-as-code` | Infrastructure as Code | concept | E | Tambahan |
| `gitops` | GitOps | concept | E | Tambahan |
| `observability` | Observability | concept | E | Tambahan |

## Keamanan (keamanan)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `dasar-keamanan-informasi` | Dasar keamanan informasi | concept | E |  |
| `owasp-top-10` | OWASP Top 10 | standard | E |  |
| `kriptografi-terapan` | Kriptografi terapan | concept | E |  |
| `identity-access-management` | Identitas dan akses (IAM) | concept | E |  |
| `secure-coding` | Secure coding | concept | E |  |
| `keamanan-jaringan` | Keamanan jaringan | concept | E |  |
| `keamanan-cloud` | Keamanan cloud | concept | E |  |
| `devsecops` | DevSecOps | concept | E | Dipisah dari keamanan supply chain |
| `keamanan-supply-chain` | Keamanan supply chain | concept | E |  |
| `manajemen-secret` | Manajemen secret | concept | E |  |
| `pentest-etis` | Dasar pengujian penetrasi yang etis | concept | E |  |
| `keamanan-aplikasi-ai` | Keamanan aplikasi AI | concept | E | Beririsan dengan keamanan-llm |
| `tls` | TLS | standard | E | Tambahan |
| `hashicorp-vault` | HashiCorp Vault | tool | C | Tambahan |
| `wireshark` | Wireshark | tool | C | Tambahan |
| `nmap` | Nmap | tool | C | Tambahan |
| `zero-trust` | Zero trust | concept | E | Tambahan |
| `mitre-attack` | MITRE ATT&CK | standard | E | Tambahan |
| `cve-cvss` | CVE dan CVSS | standard | E | Tambahan |
| `threat-modeling` | Threat modeling | concept | E | Tambahan |

## Arsitektur dan rekayasa perangkat lunak (arsitektur)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `sdlc` | SDLC | concept | E |  |
| `agile-dan-scrum` | Agile dan Scrum | concept | E | Disatukan |
| `rekayasa-kebutuhan` | Rekayasa kebutuhan | concept | E | Dipisah dari UML |
| `uml` | UML | standard | E |  |
| `design-patterns` | Design patterns | concept | E |  |
| `clean-hexagonal-architecture` | Clean dan hexagonal architecture | concept | E | Disatukan |
| `domain-driven-design` | Domain-Driven Design | concept | E |  |
| `monolith-dan-microservices` | Monolith dan microservices | concept | E | Disatukan |
| `event-driven-architecture` | Event-driven architecture | concept | E |  |
| `rabbitmq` | RabbitMQ | tool | C |  |
| `system-design` | System design | concept | E |  |
| `sistem-terdistribusi` | Sistem terdistribusi | concept | E |  |
| `desain-api` | Desain API | concept | E | Umum: kontrak dan versi; REST ada di web-backend |
| `dokumentasi-teknis` | Dokumentasi teknis | concept | E |  |
| `code-review` | Code review | concept | E |  |
| `kanban` | Kanban | concept | E | Tambahan |
| `cqrs-event-sourcing` | CQRS dan event sourcing | concept | E | Tambahan |
| `twelve-factor-app` | Twelve-Factor App | concept | E | Tambahan |
| `refactoring` | Refactoring | concept | E | Tambahan |
| `dependency-injection` | Dependency injection | concept | E | Tambahan |
| `pola-arsitektur-ui` | Pola arsitektur UI (MVC, MVVM) | concept | E | Tambahan |
| `semantic-versioning` | Semantic Versioning | standard | E | Tambahan |

## Testing dan kualitas (testing)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `piramida-testing` | Piramida testing | concept | E |  |
| `tdd-bdd` | TDD dan BDD | concept | E | Disatukan |
| `jest` | Jest | framework | B |  |
| `vitest` | Vitest | framework | B |  |
| `pytest` | Pytest | framework | B |  |
| `junit` | JUnit | framework | B |  |
| `playwright` | Playwright | framework | B |  |
| `cypress` | Cypress | framework | B |  |
| `selenium` | Selenium | framework | B |  |
| `k6` | k6 | tool | C | Dipisah dari JMeter |
| `jmeter` | Apache JMeter | tool | C |  |
| `mutation-testing` | Mutation testing | concept | E |  |
| `analisis-statis` | Analisis statis | concept | E |  |
| `testing-library` | Testing Library | library | B | Tambahan |
| `appium` | Appium | framework | B | Tambahan |
| `sonarqube` | SonarQube | tool | C | Tambahan |
| `eslint` | ESLint | tool | C | Tambahan |
| `ruff` | Ruff | tool | C | Tambahan |
| `contract-testing` | Contract testing | concept | E | Tambahan |
| `code-coverage` | Code coverage | concept | E | Tambahan |

## Tools dan produktivitas (tools)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `vs-code` | Visual Studio Code | tool | C |  |
| `jetbrains-ide` | JetBrains IDE | tool | C |  |
| `vim` | Vim | tool | C | Dipisah dari Neovim |
| `neovim` | Neovim | tool | C |  |
| `terminal-modern` | Terminal modern | tool | C | Windows Terminal, WezTerm, dan sejenisnya |
| `package-manager` | Package manager | concept | E | Konsep umum; tiap manajer paket punya entri sendiri |
| `postman` | Postman | tool | C | Dipisah dari Bruno |
| `bruno` | Bruno | tool | C |  |
| `markdown` | Markdown | standard | E |  |
| `figma-dasar` | Figma dasar | tool | C |  |
| `claude-code` | Claude Code | tool | C |  |
| `github-copilot` | GitHub Copilot | tool | C |  |
| `cursor` | Cursor | tool | C |  |
| `codex` | Codex | tool | C |  |
| `bekerja-dengan-asisten-ai` | Bekerja efektif dengan asisten AI | concept | E |  |
| `npm` | npm | tool | C | Tambahan |
| `pnpm` | pnpm | tool | C | Tambahan |
| `pip` | pip | tool | C | Tambahan |
| `uv` | uv | tool | C | Tambahan |
| `cargo` | Cargo | tool | C | Tambahan |
| `maven` | Apache Maven | tool | C | Tambahan |
| `gradle` | Gradle | tool | C | Tambahan |
| `prettier` | Prettier | tool | C | Tambahan |
| `wsl` | Windows Subsystem for Linux (WSL) | tool | C | Tambahan |
| `curl` | curl | tool | C | Tambahan |
| `dev-containers` | Dev Containers | tool | C | Tambahan |
| `mermaid` | Mermaid | tool | C | Tambahan |

## Game (game)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `matematika-fisika-game` | Matematika dan fisika game | concept | E |  |
| `unity` | Unity | framework | B |  |
| `unreal-engine` | Unreal Engine | framework | B |  |
| `godot` | Godot | framework | B |  |
| `gdscript` | GDScript | language | A | Tambahan |
| `pygame` | Pygame | library | B | Tambahan |
| `opengl` | OpenGL | standard | E | Tambahan |
| `vulkan` | Vulkan | standard | E | Tambahan |
| `webgpu` | WebGPU | standard | E | Tambahan |

## Embedded, IoT, dan bidang khusus (embedded)

| slug | Nama | type | Templat | Catatan |
|---|---|---|---|---|
| `arduino` | Arduino | platform | C |  |
| `esp32` | ESP32 | platform | C |  |
| `micropython` | MicroPython | platform | C |  |
| `raspberry-pi` | Raspberry Pi | platform | C |  |
| `mqtt` | MQTT | standard | E | Dipisah dari protokol IoT lain |
| `protokol-iot` | Protokol IoT lain (CoAP, LoRaWAN, Zigbee) | concept | E |  |
| `solidity` | Solidity | language | A | Dipisah dari konsep smart contract |
| `smart-contract` | Smart contract | concept | E |  |
| `komputasi-kuantum` | Dasar komputasi kuantum | concept | E | Dipisah dari Qiskit |
| `qiskit` | Qiskit | library | B |  |
| `webxr` | WebXR | standard | E |  |
| `platformio` | PlatformIO | tool | C | Tambahan |
| `freertos` | FreeRTOS | platform | C | Tambahan |
| `protokol-serial` | Protokol serial (I2C, SPI, UART) | concept | E | Tambahan |
| `blockchain-dasar` | Dasar blockchain | concept | E | Tambahan |
| `ethereum` | Ethereum | platform | C | Tambahan |

## Jumlah per domain

| Domain | Jumlah |
|---|---|
| Fondasi (fondasi) | 21 |
| Bahasa pemrograman (bahasa) | 35 |
| Web frontend (web-frontend) | 35 |
| Web backend dan API (web-backend) | 36 |
| Mobile (mobile) | 15 |
| Desktop (desktop) | 12 |
| Database (database) | 34 |
| Data dan analitik (data) | 28 |
| AI dan machine learning (ai-ml) | 33 |
| Generative AI dan LLM (genai) | 29 |
| Cloud (cloud) | 15 |
| DevOps dan infrastruktur (devops) | 34 |
| Keamanan (keamanan) | 20 |
| Arsitektur dan rekayasa perangkat lunak (arsitektur) | 22 |
| Testing dan kualitas (testing) | 20 |
| Tools dan produktivitas (tools) | 27 |
| Game (game) | 9 |
| Embedded, IoT, dan bidang khusus (embedded) | 16 |
| **Total** | **441** |
