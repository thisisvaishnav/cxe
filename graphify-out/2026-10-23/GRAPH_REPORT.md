# Graph Report - cxe  (2026-10-23)

## Corpus Check
- 94 files · ~120,666 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: (none) 9, .example 3, .lock 3)

## Summary
- 3550 nodes · 5485 edges · 170 communities (89 shown, 81 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 162 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8f01bb35`
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
- L
- r
- addErrorMessage
- Stock.ts
- r
- addErrorMessage
- e
- T
- index.js
- commonInputTypes.ts
- ys
- edge.js
- m
- t
- Prisma__UserClient
- interpretNode
- concat
- from
- constructor
- compilerOptions
- backend/src/index.ts
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
- Fe
- constructor
- engine/package.json
- compilerOptions
- prismaNamespaceBrowser.ts
- write
- toString
- backend/package.json
- digest
- exchange-controller.ts
- PrismaClient
- EarnPage.tsx
- react
- PrismaClient
- G
- dependencies
- engine-client.ts
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
- vercel.json
- PositionTracker
- getTracingHelper
- ./runtime/client
- #wasm-compiler-loader
- runtime/index-browser.js
- Engine
- getTracingHelper
- index-browser.d.ts
- auth-controller.ts
- backend/index.ts
- PaperEngine
- Prisma__UserClient
- AuthScreen.tsx
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
- scripts
- Prisma__StockClient
- Context
- DataLoader
- SpanStatusCode
- TypedSql
- Skip
- Backend README
- express.d.ts
- Frontend Index
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
- y

## God Nodes (most connected - your core abstractions)
1. `t()` - 40 edges
2. `e()` - 38 edges
3. `L()` - 38 edges
4. `r()` - 28 edges
5. `r()` - 28 edges
6. `interpretNode()` - 28 edges
7. `interpretNode()` - 25 edges
8. `slice()` - 25 edges
9. `toString()` - 25 edges
10. `write()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Backend README` --semantically_similar_to--> `Engine README`  [INFERRED] [semantically similar]
  backend/README.md → engine/README.md
- `Hero Image` --conceptually_related_to--> `Mini Centralized Exchange (CEX) Assignment`  [INFERRED]
  frontend/src/assets/hero.png → README.md
- `Mt()` --indirect_call--> `N()`  [INFERRED]
  backend/generated/prisma/runtime/wasm-compiler-edge.js → backend/generated/prisma/query_compiler_fast_bg.js
- `q()` --indirect_call--> `t()`  [INFERRED]
  backend/generated/prisma/query_compiler_fast_bg.js → backend/generated/prisma/runtime/wasm-compiler-edge.js
- `Frontend CI Job` --calls--> `Vite Build System`  [INFERRED]
  .github/workflows/ci.yml → frontend/README.md

## Import Cycles
- None detected.

## Communities (170 total, 81 thin omitted)

### Community 0 - "index.d.ts"
Cohesion: 0.00
Nodes (530): AggregateBalance, AggregateFill, AggregateOrder, AggregateStock, AggregateUser, At, AtBasic, AtLeast (+522 more)

### Community 1 - "runtime/client.d.ts"
Cohesion: 0.01
Nodes (306): AccelerateExtensionFetch, AccelerateExtensionFetchDecorator, Action, ActiveConnectorType, Aggregate, AllModelsToStringIndex, ApplyOmit, Args (+298 more)

### Community 2 - "runtime/client.js"
Cohesion: 0.02
Nodes (84): Ad(), ai(), Am(), an(), bn(), Bp(), $c(), Cd() (+76 more)

### Community 3 - "wasm-compiler-edge.js"
Cohesion: 0.02
Nodes (43): aa(), ap(), apiKey(), Bn(), clone(), _cloneInto(), commitTransaction(), cs() (+35 more)

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

### Community 9 - "L"
Cohesion: 0.07
Nodes (49): _a(), Ae(), cm(), connect(), dm(), Dp(), ea(), Fi() (+41 more)

### Community 10 - "r"
Cohesion: 0.07
Nodes (53): #a(), apiKey(), r(), br(), cl(), commitTransaction(), Da(), deserialize() (+45 more)

### Community 11 - "addErrorMessage"
Cohesion: 0.09
Nodes (66): ac(), addErrorMessage(), addField(), addSuggestion(), ar(), asObject(), Be(), cc() (+58 more)

### Community 12 - "Stock.ts"
Cohesion: 0.03
Nodes (58): AggregateStock, GetStockAggregateType, GetStockGroupByPayload, StockAggregateArgs, StockAvgAggregateInputType, StockAvgAggregateOutputType, StockAvgOrderByAggregateInput, StockCountAggregateInputType (+50 more)

### Community 13 - "r"
Cohesion: 0.08
Nodes (45): le(), Ju(), ao(), dispatchBatches(), _e(), Ee(), enabled(), Fr() (+37 more)

### Community 14 - "addErrorMessage"
Cohesion: 0.13
Nodes (47): ac(), addErrorMessage(), addField(), addSuggestion(), asObject(), _c(), cc(), dc() (+39 more)

### Community 15 - "e"
Cohesion: 0.07
Nodes (40): append(), bo(), Bu(), clone(), _cloneInto(), connect(), destroy(), digest() (+32 more)

### Community 16 - "T"
Cohesion: 0.06
Nodes (43): ap(), cp(), Dd(), ee(), Ei(), Ep(), es(), Fd() (+35 more)

### Community 17 - "index.js"
Cohesion: 0.06
Nodes (5): config, path, Prisma, {
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
}, decodeBase64AsWasm()

### Community 18 - "commonInputTypes.ts"
Cohesion: 0.06
Nodes (34): DateTimeFilter, DateTimeWithAggregatesFilter, EnumOrderSideFilter, EnumOrderSideWithAggregatesFilter, EnumOrderStatusFilter, EnumOrderStatusWithAggregatesFilter, EnumOrderTypeFilter, EnumOrderTypeWithAggregatesFilter (+26 more)

### Community 19 - "ys"
Cohesion: 0.10
Nodes (36): da(), de(), dt(), ep(), findField(), Gc(), getArgumentName(), getArgumentPath() (+28 more)

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

### Community 21 - "m"
Cohesion: 0.40
Nodes (4): a(), m(), q(), R()

### Community 22 - "t"
Cohesion: 0.07
Nodes (31): addItem(), as(), bc(), Bt(), cp(), get(), go(), Gr() (+23 more)

### Community 23 - "Prisma__UserClient"
Cohesion: 0.07
Nodes (6): Prisma__BalanceClient, Prisma__FillClient, Prisma__OrderClient, Prisma__StockClient, Prisma__UserClient, PrismaPromise

### Community 24 - "interpretNode"
Cohesion: 0.08
Nodes (32): as(), Ba(), Bd(), bs(), cs(), ds(), enumValues(), Ge() (+24 more)

### Community 25 - "concat"
Cohesion: 0.09
Nodes (28): bp(), bs(), concat(), ei(), fp(), Fs(), getAllClientExtensions(), getAllComputedFields() (+20 more)

### Community 26 - "from"
Cohesion: 0.12
Nodes (19): alloc(), allocUnsafe(), allocUnsafeSlow(), am(), byteLength(), construct(), eo(), Fa() (+11 more)

### Community 27 - "constructor"
Cohesion: 0.08
Nodes (26): ae(), Ca(), constructor(), de(), forSql(), getAllBatchQueryCallbacks(), getGlobalOmit(), gi() (+18 more)

### Community 28 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, allowJs, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 29 - "backend/src/index.ts"
Cohesion: 0.14
Nodes (15): app, httpServer, appRouter, pingRedis(), env, attachWebSocketServer(), AuthenticatedSocket, PnLSnapshot (+7 more)

### Community 30 - "frontend/package.json"
Cohesion: 0.12
Nodes (19): typescript, name, private, type, version, @clerk/clerk-react, eslint, @eslint/js (+11 more)

### Community 31 - "client.ts"
Cohesion: 0.11
Nodes (10): Balance, $Enums, Fill, Order, PrismaClient, Stock, User, config (+2 more)

### Community 32 - "$transaction"
Cohesion: 0.11
Nodes (7): AdapterInfo, DriverAdapterFactory, Queryable, SqlDriverAdapter, SqlDriverAdapterFactory, SqlQueryable, $transaction()

### Community 33 - "ModelAction"
Cohesion: 0.10
Nodes (20): ModelAction, aggregate, aggregateRaw, count, create, createMany, createManyAndReturn, delete (+12 more)

### Community 34 - "db.ts"
Cohesion: 0.16
Nodes (5): adapter, prisma, connectRedis(), main(), bcryptjs

### Community 35 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 36 - "St"
Cohesion: 0.11
Nodes (22): Bd(), cr(), cu(), em(), equals(), Hd(), jd(), ki() (+14 more)

### Community 37 - "api.ts"
Cohesion: 0.12
Nodes (12): OrderBookEntry, OrderBookProps, OrderFormProps, api, AuthResponse, BalanceResponse, DepthOrder, DepthResponse (+4 more)

### Community 38 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 49 - "write"
Cohesion: 0.20
Nodes (19): gt(), addMarginSymbol(), afterNextNewline(), copy(), getCurrentLineLength(), getPrintWidth(), indent(), indentedCurrentLine() (+11 more)

### Community 50 - "Fe"
Cohesion: 0.10
Nodes (21): Jm(), au(), Bm(), Cl(), _d(), Fe(), generate(), getGlobalOmit() (+13 more)

### Community 51 - "constructor"
Cohesion: 0.11
Nodes (18): bu(), constructor(), deserialize(), du(), forSql(), getConnectionInfo(), im(), Jp() (+10 more)

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

### Community 56 - "toString"
Cohesion: 0.10
Nodes (32): aa(), addItem(), At(), bc(), bl(), en(), enabled(), Fe() (+24 more)

### Community 57 - "backend/package.json"
Cohesion: 0.07
Nodes (27): dotenv, pg, prisma, @prisma/adapter-pg, @prisma/client, redis, @types/bun, @types/pg (+19 more)

### Community 58 - "digest"
Cohesion: 0.21
Nodes (13): cd(), destroy(), digest(), digestInto(), finish(), keccak(), ld(), pd() (+5 more)

### Community 59 - "exchange-controller.ts"
Cohesion: 0.25
Nodes (14): cancelOrder(), createOrder(), depositFunds(), getBalance(), getDepth(), getOrder(), getPositions(), getUserId() (+6 more)

### Community 61 - "EarnPage.tsx"
Cohesion: 0.14
Nodes (11): EarnPage(), EarnPageProps, Pool, PoolCard(), POOLS, riskColor, tagBg, FooterProps (+3 more)

### Community 62 - "react"
Cohesion: 0.25
Nodes (11): DonutChart(), makeSpark(), PortfolioPage(), PortfolioPageProps, Sparkline(), OpenOrder, PositionsTableProps, ConnectionStatus (+3 more)

### Community 64 - "G"
Cohesion: 0.18
Nodes (19): compare(), disconnect(), #f(), G(), #h(), #m(), readIntBE(), readIntLE() (+11 more)

### Community 65 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, bcryptjs, @clerk/express, cors, dotenv, express, ioredis, jsonwebtoken (+8 more)

### Community 66 - "engine-client.ts"
Cohesion: 0.27
Nodes (10): PendingResponse, pendingResponses, resolveEngineResponse(), waitForEngineResponse(), EngineCommandType, EngineRequest, EngineResponse, listenForEngineResponses() (+2 more)

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
Nodes (7): adapter, engine, hydrateOrderBook(), hydratePositionsFromFills(), oracle, pool, prisma

### Community 72 - "OrderBook.test.ts"
Cohesion: 0.13
Nodes (11): OrderBook, book, btcOrders, ethOrders, nonExistent, order1, order2, order3 (+3 more)

### Community 74 - "import"
Cohesion: 0.26
Nodes (12): import, ./sql, browser, default, edge-light, node, types, worker (+4 more)

### Community 76 - "enums.ts"
Cohesion: 0.18
Nodes (9): Balance, $Enums, Fill, Order, Stock, User, OrderSide, OrderStatus (+1 more)

### Community 78 - "App.tsx"
Cohesion: 0.17
Nodes (5): App(), AppLegacy(), AppWithClerk(), useWebSocket(), @clerk/react

### Community 79 - "require"
Cohesion: 0.33
Nodes (10): require, require, browser, default, edge-light, node, types, worker (+2 more)

### Community 80 - "PriceOracle"
Cohesion: 0.27
Nodes (3): PnLSnapshot, RedisClient, PriceOracle

### Community 81 - "prisma/package.json"
Cohesion: 0.22
Nodes (8): browser, dependencies, @prisma/client-runtime-utils, main, name, sideEffects, types, version

### Community 82 - "l"
Cohesion: 0.21
Nodes (10): F, g, I(), J(), k(), l(), u(), V() (+2 more)

### Community 84 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, prisma, @types/bun, @types/cors, @types/express, @types/jsonwebtoken, @types/pg, @types/uuid (+1 more)

### Community 86 - "PositionTracker"
Cohesion: 0.16
Nodes (5): PnLCalculator, Position, PositionTracker, PositionUpdateResult, tracker

### Community 87 - "getTracingHelper"
Cohesion: 0.29
Nodes (8): dispatchEngineSpans(), fl(), getActiveContext(), getTraceParent(), getTracingHelper(), isEnabled(), runInChildSpan(), Yr()

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
Cohesion: 0.33
Nodes (7): dispatchEngineSpans(), getActiveContext(), getTraceParent(), getTracingHelper(), isEnabled(), runInChildSpan(), xr()

### Community 93 - "index-browser.d.ts"
Cohesion: 0.25
Nodes (7): Args, Exact, GetRuntimeOutput, Narrowable, Operation, Public, RuntimeName

### Community 94 - "auth-controller.ts"
Cohesion: 0.19
Nodes (17): clerkWebhook(), signin(), signup(), syncUser(), authRouter, exchangeRouter, asyncHandler(), createToken() (+9 more)

### Community 101 - "AuthScreen.tsx"
Cohesion: 0.39
Nodes (7): AuthScreen(), AuthScreenProps, clerkRetroAppearance, FloatingCoin(), PixelMario(), PowerUpMeter(), StarParticle()

### Community 102 - "parse.js"
Cohesion: 0.38
Nodes (5): data, getBlockContent(), getTitle(), printBlockAndChildren(), rawData

### Community 104 - "SpanKind"
Cohesion: 0.33
Nodes (6): SpanKind, CLIENT, CONSUMER, INTERNAL, PRODUCER, SERVER

### Community 106 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, canvas-confetti, @clerk/clerk-react, @clerk/react, lightweight-charts, lucide-react, react, react-dom

### Community 107 - "PriceChart.tsx"
Cohesion: 0.40
Nodes (5): CandleData, generateMockHistory(), PriceChart(), PriceChartProps, lightweight-charts

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

### Community 118 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 122 - "SpanStatusCode"
Cohesion: 0.50
Nodes (4): SpanStatusCode, ERROR, OK, UNSET

### Community 129 - "Frontend Index"
Cohesion: 0.67
Nodes (3): Favicon, Frontend Index, Frontend Main Entry

## Knowledge Gaps
- **1774 isolated node(s):** `AuthScreenProps`, `clerkRetroAppearance`, `AggregateBalance`, `AggregateFill`, `AggregateOrder` (+1769 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2394 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **81 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client-runtime-utils` connect `runtime/index-browser.js` to `runtime/client.d.ts`, `runtime/client.js`, `wasm-compiler-edge.js`, `prisma/package.json`, `index-browser.d.ts`?**
  _High betweenness centrality (0.412) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `t()` (e.g. with `k()` and `q()`) actually correct?**
  _`t()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AuthScreenProps`, `clerkRetroAppearance`, `AggregateBalance` to the rest of the system?**
  _1774 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.d.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.003766478342749529 - nodes in this community are weakly interconnected._
- **Why does `decodeBase64AsWasm()` connect `index.js` to `client.ts`?**
  _High betweenness centrality (0.296) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `e()` (e.g. with `#a()` and `$c()`) actually correct?**
  _`e()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `runtime/client.d.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0061162079510703364 - nodes in this community are weakly interconnected._