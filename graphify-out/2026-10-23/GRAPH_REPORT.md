# Graph Report - cxe  (2026-10-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3520 nodes · 5475 edges · 152 communities (92 shown, 60 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 160 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a6ce9f25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151

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
- `Frontend CI Job` --calls--> `Vite Build System`  [INFERRED]
  .github/workflows/ci.yml → frontend/README.md
- `#a()` --indirect_call--> `t()`  [INFERRED]
  backend/generated/prisma/runtime/client.js → backend/generated/prisma/runtime/wasm-compiler-edge.js
- `ol()` --indirect_call--> `cl()`  [INFERRED]
  backend/generated/prisma/runtime/wasm-compiler-edge.js → backend/generated/prisma/runtime/client.js

## Import Cycles
- None detected.

## Communities (152 total, 60 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.00
Nodes (530): AggregateBalance, AggregateFill, AggregateOrder, AggregateStock, AggregateUser, At, AtBasic, AtLeast (+522 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (306): AccelerateExtensionFetch, AccelerateExtensionFetchDecorator, Action, ActiveConnectorType, Aggregate, AllModelsToStringIndex, ApplyOmit, Args (+298 more)

### Community 2 - "Community 2"
Cohesion: 0.02
Nodes (83): Ad(), ai(), Am(), an(), bn(), Bp(), bs(), $c() (+75 more)

### Community 3 - "Community 3"
Cohesion: 0.02
Nodes (58): aa(), ap(), apiKey(), Bn(), cd(), clone(), _cloneInto(), cs() (+50 more)

### Community 4 - "Community 4"
Cohesion: 0.02
Nodes (118): AnyNull, Args, At, AtLeast, AtLoose, AtStrict, BalanceScalarFieldEnum, BatchPayload (+110 more)

### Community 5 - "Community 5"
Cohesion: 0.02
Nodes (99): AggregateUser, GetUserAggregateType, GetUserGroupByPayload, IntFieldUpdateOperationsInput, StringFieldUpdateOperationsInput, User$balanceArgs, User$fillsArgs, User$ordersArgs (+91 more)

### Community 6 - "Community 6"
Cohesion: 0.02
Nodes (85): AggregateOrder, DateTimeFieldUpdateOperationsInput, EnumOrderSideFieldUpdateOperationsInput, EnumOrderStatusFieldUpdateOperationsInput, EnumOrderTypeFieldUpdateOperationsInput, FloatFieldUpdateOperationsInput, GetOrderAggregateType, GetOrderGroupByPayload (+77 more)

### Community 7 - "Community 7"
Cohesion: 0.03
Nodes (79): AggregateFill, FillAggregateArgs, FillAvgAggregateInputType, FillAvgAggregateOutputType, FillAvgOrderByAggregateInput, FillCountAggregateInputType, FillCountAggregateOutputType, FillCountArgs (+71 more)

### Community 8 - "Community 8"
Cohesion: 0.03
Nodes (73): AggregateBalance, BalanceAggregateArgs, BalanceAvgAggregateInputType, BalanceAvgAggregateOutputType, BalanceAvgOrderByAggregateInput, BalanceCountAggregateInputType, BalanceCountAggregateOutputType, BalanceCountArgs (+65 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (70): _a(), Ae(), cm(), commitTransaction(), connect(), disconnect(), dm(), Dp() (+62 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (61): #a(), apiKey(), Ba(), Bd(), r(), br(), cl(), commitTransaction() (+53 more)

### Community 11 - "Community 11"
Cohesion: 0.10
Nodes (60): ac(), addErrorMessage(), addField(), addSuggestion(), ar(), asObject(), Be(), cc() (+52 more)

### Community 12 - "Community 12"
Cohesion: 0.03
Nodes (58): AggregateStock, GetStockAggregateType, GetStockGroupByPayload, StockAggregateArgs, StockAvgAggregateInputType, StockAvgAggregateOutputType, StockAvgOrderByAggregateInput, StockCountAggregateInputType (+50 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (48): le(), alloc(), allocUnsafe(), allocUnsafeSlow(), am(), ao(), byteLength(), construct() (+40 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (42): ac(), addErrorMessage(), addSuggestion(), asObject(), _c(), cc(), dc(), es() (+34 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (41): append(), bo(), Bu(), clone(), _cloneInto(), connect(), destroy(), digest() (+33 more)

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (39): ap(), cp(), Dd(), ee(), Ei(), Fd(), getAllClientExtensions(), getAllModelExtensions() (+31 more)

### Community 17 - "Community 17"
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

### Community 18 - "Community 18"
Cohesion: 0.06
Nodes (34): DateTimeFilter, DateTimeWithAggregatesFilter, EnumOrderSideFilter, EnumOrderSideWithAggregatesFilter, EnumOrderStatusFilter, EnumOrderStatusWithAggregatesFilter, EnumOrderTypeFilter, EnumOrderTypeWithAggregatesFilter (+26 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (32): da(), de(), dt(), ep(), findField(), Gc(), getArgumentName(), getArgumentPath() (+24 more)

### Community 20 - "Community 20"
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

### Community 21 - "Community 21"
Cohesion: 0.08
Nodes (5): ge(), m(), q(), R(), y

### Community 22 - "Community 22"
Cohesion: 0.10
Nodes (29): as(), bc(), Bt(), cp(), get(), getAllComputedFields(), getOrCreate(), Ho() (+21 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (6): Prisma__BalanceClient, Prisma__FillClient, Prisma__OrderClient, Prisma__StockClient, Prisma__UserClient, PrismaPromise

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (27): aa(), as(), cs(), Do(), Ep(), get(), Id(), il() (+19 more)

### Community 25 - "Community 25"
Cohesion: 0.10
Nodes (25): bp(), bs(), concat(), ei(), fp(), Fs(), getAllClientExtensions(), getAllModelExtensions() (+17 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (23): addItem(), ae(), At(), bc(), de(), Fe(), getArgumentName(), getArgumentPath() (+15 more)

### Community 27 - "Community 27"
Cohesion: 0.09
Nodes (23): Ca(), constructor(), dispatchEngineSpans(), forSql(), getActiveContext(), getAllBatchQueryCallbacks(), getTraceParent(), getTracingHelper() (+15 more)

### Community 28 - "Community 28"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, allowJs, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (15): app, httpServer, requireAuth(), TokenPayload, env, attachWebSocketServer(), AuthenticatedSocket, PnLSnapshot (+7 more)

### Community 30 - "Community 30"
Cohesion: 0.12
Nodes (18): typescript, name, private, type, version, eslint, @eslint/js, eslint-plugin-react-hooks (+10 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (10): Balance, $Enums, Fill, Order, PrismaClient, Stock, User, config (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (7): AdapterInfo, DriverAdapterFactory, Queryable, SqlDriverAdapter, SqlDriverAdapterFactory, SqlQueryable, $transaction()

### Community 33 - "Community 33"
Cohesion: 0.10
Nodes (20): ModelAction, aggregate, aggregateRaw, count, create, createMany, createManyAndReturn, delete (+12 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (10): signin(), signup(), adapter, prisma, authSchema, createToken(), connectRedis(), updateRedisBalance() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, jsx, lib, module, moduleDetection, moduleResolution (+11 more)

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (19): Bd(), cr(), cu(), em(), Hd(), jd(), ki(), Ks() (+11 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (12): OrderBookEntry, OrderBookProps, OrderFormProps, api, AuthResponse, BalanceResponse, DepthOrder, DepthResponse (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (18): gt(), addMarginSymbol(), afterNextNewline(), copy(), getCurrentLineLength(), getPrintWidth(), indent(), newLine() (+10 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (18): au(), _d(), dispatchEngineSpans(), #f(), fl(), getActiveContext(), getTraceParent(), getTracingHelper() (+10 more)

### Community 51 - "Community 51"
Cohesion: 0.12
Nodes (18): bu(), constructor(), deserialize(), dispatchBatches(), execute(), getConnectionInfo(), ju(), mapQueryEngineResult() (+10 more)

### Community 52 - "Community 52"
Cohesion: 0.11
Nodes (17): devDependencies, @types/bun, dotenv, pg, prisma, @prisma/adapter-pg, @prisma/client, redis (+9 more)

### Community 53 - "Community 53"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 54 - "Community 54"
Cohesion: 0.12
Nodes (15): AnyNull, BalanceScalarFieldEnum, DbNull, Decimal, FillScalarFieldEnum, JsonNull, ModelName, NullsOrder (+7 more)

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (17): addMarginSymbol(), afterNextNewline(), getCurrentLineLength(), getPrintWidth(), indent(), newLine(), setColor(), underline() (+9 more)

### Community 56 - "Community 56"
Cohesion: 0.19
Nodes (17): bl(), en(), enabled(), fm(), hl(), indentedCurrentLine(), Ki(), ku() (+9 more)

### Community 57 - "Community 57"
Cohesion: 0.12
Nodes (16): pg, redis, zod, module, name, peerDependencies, typescript, private (+8 more)

### Community 58 - "Community 58"
Cohesion: 0.13
Nodes (16): addField(), addItem(), go(), Gr(), Ir(), is(), isBuffer(), jc() (+8 more)

### Community 59 - "Community 59"
Cohesion: 0.35
Nodes (13): cancelOrder(), createOrder(), depositFunds(), getBalance(), getDepth(), getOrder(), getPositions(), getUserId() (+5 more)

### Community 61 - "Community 61"
Cohesion: 0.14
Nodes (11): EarnPage(), EarnPageProps, Pool, PoolCard(), POOLS, riskColor, tagBg, FooterProps (+3 more)

### Community 62 - "Community 62"
Cohesion: 0.25
Nodes (11): DonutChart(), makeSpark(), PortfolioPage(), PortfolioPageProps, Sparkline(), OpenOrder, PositionsTableProps, ConnectionStatus (+3 more)

### Community 64 - "Community 64"
Cohesion: 0.29
Nodes (14): compare(), G(), Jl(), Ql(), readIntBE(), readIntLE(), readUIntBE(), readUIntLE() (+6 more)

### Community 65 - "Community 65"
Cohesion: 0.14
Nodes (14): dependencies, bcryptjs, cors, dotenv, express, ioredis, jsonwebtoken, pg (+6 more)

### Community 66 - "Community 66"
Cohesion: 0.24
Nodes (11): PendingResponse, pendingResponses, resolveEngineResponse(), waitForEngineResponse(), EngineCommandType, EngineRequest, EngineResponse, listenForEngineResponses() (+3 more)

### Community 67 - "Community 67"
Cohesion: 0.14
Nodes (14): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/canvas-confetti, @types/node (+6 more)

### Community 68 - "Community 68"
Cohesion: 0.15
Nodes (10): Prisma Client, Docker Compose Configuration, Prisma Client, Vite Build System, Backend CI Job, SSH Deployment Job, Docker Build & Push Job, Engine CI Job (+2 more)

### Community 70 - "Community 70"
Cohesion: 0.15
Nodes (13): default, exports, ./client, ./generator-build, ./index-browser, ./package.json, default, import (+5 more)

### Community 71 - "Community 71"
Cohesion: 0.15
Nodes (8): adapter, engine, hydrateLimitOrders(), hydratePositionsFromFills(), oracle, pnlCalculator, pool, prisma

### Community 72 - "Community 72"
Cohesion: 0.15
Nodes (11): book, btcOrders, ethOrders, ethRemaining, order1, order2, order3, removed1 (+3 more)

### Community 74 - "Community 74"
Cohesion: 0.26
Nodes (12): import, ./sql, browser, default, edge-light, node, types, worker (+4 more)

### Community 76 - "Community 76"
Cohesion: 0.18
Nodes (9): Balance, $Enums, Fill, Order, Stock, User, OrderSide, OrderStatus (+1 more)

### Community 79 - "Community 79"
Cohesion: 0.33
Nodes (10): require, require, browser, default, edge-light, node, types, worker (+2 more)

### Community 80 - "Community 80"
Cohesion: 0.27
Nodes (3): PnLSnapshot, RedisClient, PriceOracle

### Community 81 - "Community 81"
Cohesion: 0.22
Nodes (8): browser, dependencies, @prisma/client-runtime-utils, main, name, sideEffects, types, version

### Community 82 - "Community 82"
Cohesion: 0.31
Nodes (9): a(), g, I(), J(), k(), l(), u(), V() (+1 more)

### Community 84 - "Community 84"
Cohesion: 0.22
Nodes (9): devDependencies, prisma, @types/bun, @types/cors, @types/express, @types/jsonwebtoken, @types/pg, @types/uuid (+1 more)

### Community 85 - "Community 85"
Cohesion: 0.22
Nodes (9): dependencies, dotenv, pg, prisma, @prisma/adapter-pg, @prisma/client, redis, @types/pg (+1 more)

### Community 88 - "Community 88"
Cohesion: 0.25
Nodes (8): ./runtime/client, default, require, default, import, node, require, types

### Community 89 - "Community 89"
Cohesion: 0.25
Nodes (8): imports, #main-entry-point, #wasm-compiler-loader, default, default, edge-light, worker, workerd

### Community 90 - "Community 90"
Cohesion: 0.29
Nodes (5): C(), N(), c(), k(), @prisma/client-runtime-utils

### Community 92 - "Community 92"
Cohesion: 0.25
Nodes (8): Jm(), Bm(), Cl(), Fr(), qm(), renderAllMessages(), Um(), vl()

### Community 93 - "Community 93"
Cohesion: 0.25
Nodes (7): Args, Exact, GetRuntimeOutput, Narrowable, Operation, Public, RuntimeName

### Community 94 - "Community 94"
Cohesion: 0.39
Nodes (5): authRouter, exchangeRouter, appRouter, asyncHandler(), express

### Community 99 - "Community 99"
Cohesion: 0.29
Nodes (7): es(), getAllQueryCallbacks(), Go(), hr(), Ie(), isEmpty(), Wo()

### Community 100 - "Community 100"
Cohesion: 0.29
Nodes (3): Position, PositionUpdateResult, tracker

### Community 101 - "Community 101"
Cohesion: 0.48
Nodes (6): AuthScreen(), AuthScreenProps, FloatingCoin(), PixelMario(), PowerUpMeter(), StarParticle()

### Community 102 - "Community 102"
Cohesion: 0.38
Nodes (5): data, getBlockContent(), getTitle(), printBlockAndChildren(), rawData

### Community 104 - "Community 104"
Cohesion: 0.33
Nodes (6): SpanKind, CLIENT, CONSUMER, INTERNAL, PRODUCER, SERVER

### Community 106 - "Community 106"
Cohesion: 0.33
Nodes (6): dependencies, canvas-confetti, lightweight-charts, lucide-react, react, react-dom

### Community 107 - "Community 107"
Cohesion: 0.40
Nodes (5): CandleData, generateMockHistory(), PriceChart(), PriceChartProps, lightweight-charts

### Community 111 - "Community 111"
Cohesion: 0.40
Nodes (5): default, import, require, types, ./edge

### Community 112 - "Community 112"
Cohesion: 0.40
Nodes (5): ./extension, default, import, require, types

### Community 113 - "Community 113"
Cohesion: 0.40
Nodes (5): ./index, default, import, require, types

### Community 114 - "Community 114"
Cohesion: 0.40
Nodes (5): ./runtime/index-browser, default, import, require, types

### Community 115 - "Community 115"
Cohesion: 0.40
Nodes (5): ./runtime/wasm-compiler-edge, default, import, require, types

### Community 117 - "Community 117"
Cohesion: 0.60
Nodes (5): getPlaceholderValues(), ii(), oi(), parameterizeFieldSelection(), root()

### Community 118 - "Community 118"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 122 - "Community 122"
Cohesion: 0.50
Nodes (4): SpanStatusCode, ERROR, OK, UNSET

### Community 124 - "Community 124"
Cohesion: 0.50
Nodes (4): scripts, dev, test, typecheck

### Community 126 - "Community 126"
Cohesion: 0.67
Nodes (3): scripts, dev, typecheck

### Community 129 - "Community 129"
Cohesion: 0.67
Nodes (3): Favicon, Frontend Index, Frontend Main Entry

## Knowledge Gaps
- **1751 isolated node(s):** `AggregateBalance`, `AggregateFill`, `AggregateOrder`, `AggregateStock`, `AggregateUser` (+1746 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2367 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client-runtime-utils` connect `Community 90` to `Community 1`, `Community 2`, `Community 3`, `Community 81`, `Community 93`?**
  _High betweenness centrality (0.386) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `t()` (e.g. with `k()` and `q()`) actually correct?**
  _`t()` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AggregateBalance`, `AggregateFill`, `AggregateOrder` to the rest of the system?**
  _1751 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.003766478342749529 - nodes in this community are weakly interconnected._
- **Why does `decodeBase64AsWasm()` connect `Community 17` to `Community 31`?**
  _High betweenness centrality (0.326) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `e()` (e.g. with `#a()` and `$c()`) actually correct?**
  _`e()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0061162079510703364 - nodes in this community are weakly interconnected._