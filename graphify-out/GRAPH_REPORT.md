# Graph Report - cxe  (2026-10-27)

## Corpus Check
- 125 files · ~129,038 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: (none) 9, .example 4, .lock 3)

## Summary
- 3716 nodes · 5862 edges · 179 communities (96 shown, 83 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 164 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f3682da8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.d.ts
- runtime/client.d.ts
- runtime/client.js
- wasm-compiler-edge.js
- prismaNamespace.ts
- User.ts
- Order.ts
- Fill.ts
- Balance.ts
- t
- r
- addErrorMessage
- Stock.ts
- slice
- addErrorMessage
- e
- T
- index.js
- commonInputTypes.ts
- ys
- edge.js
- get
- Prisma__UserClient
- interpretNode
- ve
- from
- AuthScreen.tsx
- compilerOptions
- engine-client.ts
- frontend/package.json
- client.ts
- $transaction
- ModelAction
- db.ts
- compilerOptions
- St
- api.ts
- compilerOptions
- BalanceDelegate
- FillDelegate
- OrderDelegate
- StockDelegate
- UserDelegate
- BalanceDelegate
- FillDelegate
- OrderDelegate
- StockDelegate
- UserDelegate
- write
- _d
- m
- engine/package.json
- compilerOptions
- prismaNamespaceBrowser.ts
- write
- ii
- backend/package.json
- scripts
- exchange-controller.ts
- PrismaClient
- EarnPage.tsx
- OrderBook.tsx
- PrismaClient
- G
- dependencies
- cn
- devDependencies
- Docker Build & Push Job
- prisma/index-browser.js
- exports
- engine/src/index.ts
- OrderBook.test.ts
- Prisma
- import
- Span
- enums.ts
- MergedExtensionsList
- App.tsx
- require
- PriceOracle
- prisma/package.json
- l
- RequestHandler
- devDependencies
- frontend/vercel.json
- PositionTracker
- interpretNode
- ./runtime/client
- #wasm-compiler-loader
- runtime/index-browser.js
- Engine
- getTracingHelper
- index-browser.d.ts
- auth-controller.ts
- toString
- PaperEngine
- Prisma__UserClient
- PaperEngine.ts
- dependencies
- OrderForm.tsx
- app.ts
- parse.js
- PrismaPromise_2
- SpanKind
- TracingHelper
- dependencies
- PriceChart.tsx
- Prisma__BalanceClient
- Prisma__FillClient
- Prisma__OrderClient
- ./edge
- ./extension
- ./index
- ./runtime/index-browser
- ./runtime/wasm-compiler-edge
- TraceState
- hr
- Prisma__StockClient
- Context
- DataLoader
- SpanStatusCode
- TypedSql
- PositionTracker.ts
- Skip
- compilerOptions
- Backend README
- express.d.ts
- Favicon
- frontend/tsconfig.json
- AnyNull
- DbNull
- JsonNull
- AccelerateEngineConfig
- CallSite
- DecimalJsLike
- ExtendedSpanOptions
- JsonConvertible
- Hero Image
- start.sh
- stop.sh
- defineExtension
- dmmf
- type
- Engine Overview
- Icon Sprite Sheet
- React Logo
- Vite Logo
- backend-to-engine-broker
- digest
- devDependencies
- scripts
- vercel.json
- scripts
- y

## God Nodes (most connected - your core abstractions)
1. `t()` - 40 edges
2. `e()` - 38 edges
3. `L()` - 38 edges
4. `r()` - 28 edges
5. `interpretNode()` - 28 edges
6. `r()` - 28 edges
7. `cn()` - 26 edges
8. `react` - 26 edges
9. `slice()` - 25 edges
10. `toString()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Backend README` --semantically_similar_to--> `Engine README`  [INFERRED] [semantically similar]
  backend/README.md → engine/README.md
- `Hero Image` --conceptually_related_to--> `Mini Centralized Exchange (CEX) Assignment`  [INFERRED]
  frontend/src/assets/hero.png → README.md
- `q()` --indirect_call--> `t()`  [INFERRED]
  backend/generated/prisma/query_compiler_fast_bg.js → backend/generated/prisma/runtime/wasm-compiler-edge.js
- `Mt()` --indirect_call--> `N()`  [INFERRED]
  backend/generated/prisma/runtime/wasm-compiler-edge.js → backend/generated/prisma/query_compiler_fast_bg.js
- `Frontend CI Job` --calls--> `Vite Build System`  [INFERRED]
  .github/workflows/ci.yml → frontend/README.md

## Import Cycles
- None detected.

## Communities (179 total, 83 thin omitted)

### Community 0 - "index.d.ts"
Cohesion: 0.00
Nodes (530): AggregateBalance, AggregateFill, AggregateOrder, AggregateStock, AggregateUser, At, AtBasic, AtLeast (+522 more)

### Community 1 - "runtime/client.d.ts"
Cohesion: 0.01
Nodes (306): AccelerateExtensionFetch, AccelerateExtensionFetchDecorator, Action, ActiveConnectorType, Aggregate, AllModelsToStringIndex, ApplyOmit, Args (+298 more)

### Community 2 - "runtime/client.js"
Cohesion: 0.02
Nodes (82): Ad(), ai(), Am(), an(), bn(), Bp(), $c(), Cd() (+74 more)

### Community 3 - "wasm-compiler-edge.js"
Cohesion: 0.02
Nodes (65): aa(), ap(), apiKey(), bc(), Bn(), bu(), clone(), _cloneInto() (+57 more)

### Community 4 - "prismaNamespace.ts"
Cohesion: 0.02
Nodes (118): AnyNull, Args, At, AtLeast, AtLoose, AtStrict, BalanceScalarFieldEnum, BatchPayload (+110 more)

### Community 5 - "User.ts"
Cohesion: 0.02
Nodes (99): AggregateUser, GetUserAggregateType, GetUserGroupByPayload, IntFieldUpdateOperationsInput, StringFieldUpdateOperationsInput, User$balanceArgs, User$fillsArgs, User$ordersArgs (+91 more)

### Community 6 - "Order.ts"
Cohesion: 0.02
Nodes (85): AggregateOrder, DateTimeFieldUpdateOperationsInput, EnumOrderSideFieldUpdateOperationsInput, EnumOrderStatusFieldUpdateOperationsInput, EnumOrderTypeFieldUpdateOperationsInput, FloatFieldUpdateOperationsInput, GetOrderAggregateType, GetOrderGroupByPayload (+77 more)

### Community 7 - "Fill.ts"
Cohesion: 0.03
Nodes (79): AggregateFill, FillAggregateArgs, FillAvgAggregateInputType, FillAvgAggregateOutputType, FillAvgOrderByAggregateInput, FillCountAggregateInputType, FillCountAggregateOutputType, FillCountArgs (+71 more)

### Community 8 - "Balance.ts"
Cohesion: 0.03
Nodes (73): AggregateBalance, BalanceAggregateArgs, BalanceAvgAggregateInputType, BalanceAvgAggregateOutputType, BalanceAvgOrderByAggregateInput, BalanceCountAggregateInputType, BalanceCountAggregateOutputType, BalanceCountArgs (+65 more)

### Community 9 - "t"
Cohesion: 0.06
Nodes (61): _a(), am(), as(), Bt(), cm(), connect(), cp(), dispatchBatches() (+53 more)

### Community 10 - "r"
Cohesion: 0.07
Nodes (55): #a(), ae(), apiKey(), r(), cl(), commitTransaction(), constructor(), Da() (+47 more)

### Community 11 - "addErrorMessage"
Cohesion: 0.09
Nodes (66): ac(), addErrorMessage(), addField(), addSuggestion(), ar(), asObject(), Be(), cc() (+58 more)

### Community 12 - "Stock.ts"
Cohesion: 0.03
Nodes (58): AggregateStock, GetStockAggregateType, GetStockGroupByPayload, StockAggregateArgs, StockAvgAggregateInputType, StockAvgAggregateOutputType, StockAvgOrderByAggregateInput, StockCountAggregateInputType (+50 more)

### Community 13 - "slice"
Cohesion: 0.09
Nodes (39): Ju(), ao(), byteLength(), _e(), Ee(), enabled(), Fa(), Fr() (+31 more)

### Community 14 - "addErrorMessage"
Cohesion: 0.13
Nodes (47): ac(), addErrorMessage(), addField(), addSuggestion(), asObject(), _c(), cc(), dc() (+39 more)

### Community 15 - "e"
Cohesion: 0.06
Nodes (42): append(), bo(), Bu(), Ca(), clone(), _cloneInto(), connect(), destroy() (+34 more)

### Community 16 - "T"
Cohesion: 0.08
Nodes (36): ap(), cp(), Dd(), ee(), Ei(), Fd(), getAllClientExtensions(), getAllModelExtensions() (+28 more)

### Community 17 - "index.js"
Cohesion: 0.05
Nodes (7): config, path, Prisma, PrismaClient, {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  DbNull,
  JsonNull,
  AnyNull,
  NullTypes,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
}, decodeBase64AsWasm(), app

### Community 18 - "commonInputTypes.ts"
Cohesion: 0.06
Nodes (34): DateTimeFilter, DateTimeWithAggregatesFilter, EnumOrderSideFilter, EnumOrderSideWithAggregatesFilter, EnumOrderStatusFilter, EnumOrderStatusWithAggregatesFilter, EnumOrderTypeFilter, EnumOrderTypeWithAggregatesFilter (+26 more)

### Community 19 - "ys"
Cohesion: 0.13
Nodes (30): concat(), da(), de(), dt(), ep(), findField(), Gc(), getArgumentName() (+22 more)

### Community 20 - "edge.js"
Cohesion: 0.07
Nodes (5): config, Prisma, PrismaClient, {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  DbNull,
  JsonNull,
  AnyNull,
  NullTypes,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
}, empty()

### Community 22 - "get"
Cohesion: 0.18
Nodes (12): aa(), Do(), Ep(), get(), il(), Io(), it(), ji() (+4 more)

### Community 23 - "Prisma__UserClient"
Cohesion: 0.07
Nodes (6): Prisma__BalanceClient, Prisma__FillClient, Prisma__OrderClient, Prisma__StockClient, Prisma__UserClient, PrismaPromise

### Community 24 - "interpretNode"
Cohesion: 0.07
Nodes (37): as(), Ba(), Bd(), br(), bs(), cs(), ds(), enumValues() (+29 more)

### Community 25 - "ve"
Cohesion: 0.09
Nodes (27): bp(), bs(), ei(), fp(), Fs(), getAllClientExtensions(), getAllComputedFields(), getAllModelExtensions() (+19 more)

### Community 26 - "from"
Cohesion: 0.06
Nodes (40): Jm(), addItem(), alloc(), allocUnsafe(), allocUnsafeSlow(), Bm(), Cl(), construct() (+32 more)

### Community 27 - "AuthScreen.tsx"
Cohesion: 0.39
Nodes (7): AuthScreen(), AuthScreenProps, clerkRetroAppearance, FloatingCoin(), PixelMario(), PowerUpMeter(), StarParticle()

### Community 28 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, allowJs, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 29 - "engine-client.ts"
Cohesion: 0.13
Nodes (20): httpServer, PendingResponse, pendingResponses, resolveEngineResponse(), waitForEngineResponse(), EngineCommandType, EngineRequest, EngineResponse (+12 more)

### Community 30 - "frontend/package.json"
Cohesion: 0.09
Nodes (24): typescript, name, private, type, version, @clerk/clerk-react, clsx, eslint (+16 more)

### Community 31 - "client.ts"
Cohesion: 0.11
Nodes (11): Balance, $Enums, Fill, Order, PrismaClient, Stock, User, config (+3 more)

### Community 32 - "$transaction"
Cohesion: 0.11
Nodes (7): AdapterInfo, DriverAdapterFactory, Queryable, SqlDriverAdapter, SqlDriverAdapterFactory, SqlQueryable, $transaction()

### Community 33 - "ModelAction"
Cohesion: 0.10
Nodes (20): ModelAction, aggregate, aggregateRaw, count, create, createMany, createManyAndReturn, delete (+12 more)

### Community 34 - "db.ts"
Cohesion: 0.21
Nodes (6): adapter, prisma, connectRedis(), main(), bcryptjs, @prisma/adapter-pg

### Community 35 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 36 - "St"
Cohesion: 0.16
Nodes (15): Bd(), cu(), Hd(), jd(), ki(), Ks(), kt(), lu() (+7 more)

### Community 37 - "api.ts"
Cohesion: 0.12
Nodes (19): DonutChart(), makeSpark(), PortfolioPage(), PortfolioPageProps, Sparkline(), OpenOrder, PositionsTableProps, TabKey (+11 more)

### Community 38 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, ignoreDeprecations, jsx, lib, module, moduleDetection (+12 more)

### Community 49 - "write"
Cohesion: 0.24
Nodes (17): gt(), addMarginSymbol(), afterNextNewline(), getCurrentLineLength(), getPrintWidth(), indent(), newLine(), setColor() (+9 more)

### Community 50 - "_d"
Cohesion: 0.14
Nodes (16): au(), _d(), dispatchEngineSpans(), #f(), fl(), getActiveContext(), getTraceParent(), getTracingHelper() (+8 more)

### Community 51 - "m"
Cohesion: 0.33
Nodes (5): a(), le(), m(), q(), R()

### Community 52 - "engine/package.json"
Cohesion: 0.06
Nodes (32): dependencies, dotenv, pg, prisma, @prisma/adapter-pg, @prisma/client, redis, @types/pg (+24 more)

### Community 53 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 54 - "prismaNamespaceBrowser.ts"
Cohesion: 0.12
Nodes (15): AnyNull, BalanceScalarFieldEnum, DbNull, Decimal, FillScalarFieldEnum, JsonNull, ModelName, NullsOrder (+7 more)

### Community 55 - "write"
Cohesion: 0.22
Nodes (17): addMarginSymbol(), afterNextNewline(), getCurrentLineLength(), getPrintWidth(), indent(), newLine(), setColor(), underline() (+9 more)

### Community 56 - "ii"
Cohesion: 0.60
Nodes (5): getPlaceholderValues(), ii(), oi(), parameterizeFieldSelection(), root()

### Community 57 - "backend/package.json"
Cohesion: 0.07
Nodes (32): dotenv, pg, prisma, @prisma/adapter-pg, @prisma/client, redis, @types/bun, @types/pg (+24 more)

### Community 58 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 59 - "exchange-controller.ts"
Cohesion: 0.27
Nodes (15): cancelOrder(), createOrder(), depositFunds(), getBalance(), getDepth(), getOrder(), getPositions(), getUserId() (+7 more)

### Community 61 - "EarnPage.tsx"
Cohesion: 0.25
Nodes (8): EarnPage(), EarnPageProps, Pool, PoolCard(), POOLS, riskColor, tagBg, lucide-react

### Community 62 - "OrderBook.tsx"
Cohesion: 0.50
Nodes (4): formatNumber(), OrderBook(), OrderBookEntry, OrderBookProps

### Community 64 - "G"
Cohesion: 0.22
Nodes (16): compare(), copy(), equals(), G(), readIntBE(), readIntLE(), readUIntBE(), readUIntLE() (+8 more)

### Community 65 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, @clerk/express, cors, dotenv, express, ioredis, jsonwebtoken (+8 more)

### Community 66 - "cn"
Cohesion: 0.06
Nodes (65): LogoIcon(), Landing01Demo(), Landing01DemoProps, AGENTS, AnimatedBento(), FeatureCard(), slides, BgFrame() (+57 more)

### Community 67 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/canvas-confetti, @types/node (+6 more)

### Community 68 - "Docker Build & Push Job"
Cohesion: 0.15
Nodes (10): Prisma Client, Docker Compose Configuration, Prisma Client, Vite Build System, Backend CI Job, SSH Deployment Job, Docker Build & Push Job, Engine CI Job (+2 more)

### Community 70 - "exports"
Cohesion: 0.15
Nodes (13): default, exports, ./client, ./generator-build, ./index-browser, ./package.json, default, import (+5 more)

### Community 71 - "engine/src/index.ts"
Cohesion: 0.15
Nodes (8): adapter, engine, hydrateOrderBook(), hydratePositionsFromFills(), oracle, pool, prisma, pg

### Community 72 - "OrderBook.test.ts"
Cohesion: 0.18
Nodes (9): book, btcOrders, ethOrders, nonExistent, order1, order2, order3, removed (+1 more)

### Community 74 - "import"
Cohesion: 0.26
Nodes (12): import, ./sql, browser, default, edge-light, node, types, worker (+4 more)

### Community 76 - "enums.ts"
Cohesion: 0.18
Nodes (9): Balance, $Enums, Fill, Order, Stock, User, OrderSide, OrderStatus (+1 more)

### Community 78 - "App.tsx"
Cohesion: 0.14
Nodes (6): App(), AppLegacy(), AppWithClerk(), useWebSocket(), @clerk/react, react-dom

### Community 79 - "require"
Cohesion: 0.33
Nodes (10): require, require, browser, default, edge-light, node, types, worker (+2 more)

### Community 80 - "PriceOracle"
Cohesion: 0.24
Nodes (4): PnLSnapshot, RedisClient, PriceOracle, redis

### Community 81 - "prisma/package.json"
Cohesion: 0.22
Nodes (8): browser, dependencies, @prisma/client-runtime-utils, main, name, sideEffects, types, version

### Community 82 - "l"
Cohesion: 0.21
Nodes (10): F, g, I(), J(), k(), l(), u(), V() (+2 more)

### Community 84 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, prisma, @types/bun, @types/cors, @types/express, @types/jsonwebtoken, @types/pg, @types/uuid (+1 more)

### Community 87 - "interpretNode"
Cohesion: 0.09
Nodes (28): Ae(), commitTransaction(), cr(), disconnect(), em(), getGlobalOmit(), getTransaction(), gu() (+20 more)

### Community 88 - "./runtime/client"
Cohesion: 0.25
Nodes (8): ./runtime/client, default, require, default, import, node, require, types

### Community 89 - "#wasm-compiler-loader"
Cohesion: 0.25
Nodes (8): imports, #main-entry-point, #wasm-compiler-loader, default, default, edge-light, worker, workerd

### Community 90 - "runtime/index-browser.js"
Cohesion: 0.29
Nodes (4): N(), c(), k(), @prisma/client-runtime-utils

### Community 92 - "getTracingHelper"
Cohesion: 0.29
Nodes (8): dispatchEngineSpans(), #f(), getActiveContext(), getTraceParent(), getTracingHelper(), isEnabled(), runInChildSpan(), xr()

### Community 93 - "index-browser.d.ts"
Cohesion: 0.25
Nodes (7): Args, Exact, GetRuntimeOutput, Narrowable, Operation, Public, RuntimeName

### Community 94 - "auth-controller.ts"
Cohesion: 0.21
Nodes (15): clerkWebhook(), signin(), signup(), syncUser(), authSchema, createToken(), ensureUserProvisioned(), Express (+7 more)

### Community 95 - "toString"
Cohesion: 0.09
Nodes (34): addItem(), At(), bc(), bl(), de(), en(), enabled(), Fe() (+26 more)

### Community 99 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, @clerk/express, cors, dotenv, express, jsonwebtoken, pg (+8 more)

### Community 100 - "OrderForm.tsx"
Cohesion: 0.50
Nodes (4): formatNumber(), OrderForm(), OrderFormProps, canvas-confetti

### Community 101 - "app.ts"
Cohesion: 0.24
Nodes (8): handler(), app, authRouter, exchangeRouter, appRouter, pingRedis(), @clerk/express, cors

### Community 102 - "parse.js"
Cohesion: 0.38
Nodes (5): data, getBlockContent(), getTitle(), printBlockAndChildren(), rawData

### Community 104 - "SpanKind"
Cohesion: 0.33
Nodes (6): SpanKind, CLIENT, CONSUMER, INTERNAL, PRODUCER, SERVER

### Community 106 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, canvas-confetti, @clerk/clerk-react, @clerk/react, clsx, @hugeicons/core-free-icons, @hugeicons/react, lightweight-charts (+9 more)

### Community 107 - "PriceChart.tsx"
Cohesion: 0.29
Nodes (7): CandleData, generateMockHistory(), intervalSeconds, PriceChart(), PriceChartProps, Timeframe, lightweight-charts

### Community 111 - "./edge"
Cohesion: 0.40
Nodes (5): default, import, require, types, ./edge

### Community 112 - "./extension"
Cohesion: 0.40
Nodes (5): ./extension, default, import, require, types

### Community 113 - "./index"
Cohesion: 0.40
Nodes (5): ./index, default, import, require, types

### Community 114 - "./runtime/index-browser"
Cohesion: 0.40
Nodes (5): ./runtime/index-browser, default, import, require, types

### Community 115 - "./runtime/wasm-compiler-edge"
Cohesion: 0.40
Nodes (5): ./runtime/wasm-compiler-edge, default, import, require, types

### Community 117 - "hr"
Cohesion: 0.29
Nodes (7): es(), getAllQueryCallbacks(), Go(), hr(), Ie(), isEmpty(), Wo()

### Community 122 - "SpanStatusCode"
Cohesion: 0.50
Nodes (4): SpanStatusCode, ERROR, OK, UNSET

### Community 124 - "PositionTracker.ts"
Cohesion: 0.29
Nodes (3): Position, PositionUpdateResult, tracker

### Community 126 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, esModuleInterop, module, moduleResolution, resolveJsonModule, skipLibCheck, strict, target (+1 more)

### Community 152 - "digest"
Cohesion: 0.17
Nodes (15): cd(), destroy(), digest(), digestInto(), finish(), keccak(), ld(), pd() (+7 more)

### Community 153 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @types/cors, @types/express, @types/jsonwebtoken, @types/pg, @types/uuid, @types/ws, typescript (+1 more)

### Community 155 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, postinstall, preview

### Community 156 - "vercel.json"
Cohesion: 0.40
Nodes (4): framework, outputDirectory, rewrites, $schema

### Community 157 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, dev, start, typecheck

## Knowledge Gaps
- **1841 isolated node(s):** `PriceChartProps`, `CandleData`, `Timeframe`, `intervalSeconds`, `AggregateBalance` (+1836 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2460 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **83 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client-runtime-utils` connect `runtime/index-browser.js` to `runtime/client.d.ts`, `runtime/client.js`, `wasm-compiler-edge.js`, `prisma/package.json`, `index-browser.d.ts`?**
  _High betweenness centrality (0.383) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `t()` (e.g. with `k()` and `q()`) actually correct?**
  _`t()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PriceChartProps`, `CandleData`, `Timeframe` to the rest of the system?**
  _1841 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.d.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.003766478342749529 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `client.ts` to `prismaNamespace.ts`, `User.ts`, `Order.ts`, `Fill.ts`, `Balance.ts`, `Stock.ts`, `commonInputTypes.ts`, `prismaNamespaceBrowser.ts`, `backend/package.json`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `e()` (e.g. with `#a()` and `$c()`) actually correct?**
  _`e()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `runtime/client.d.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0061162079510703364 - nodes in this community are weakly interconnected._