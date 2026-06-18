"""Static educational content for the Learn Hub (ported from the WealthLens app)."""

ASSET_CARDS = [
    {"icon": "📈", "key": "Equity", "title": "Equity — the engine",
     "body": "Shares of companies. Highest long-run growth, biggest swings along the "
             "way. This is what makes the portfolio grow."},
    {"icon": "🛡️", "key": "Fixed Income", "title": "Fixed Income — the seatbelt",
     "body": "Bonds: loans to governments and companies that pay steady interest. They "
             "usually hold their value when stocks fall. This is what keeps you safe."},
    {"icon": "🏛️", "key": "Alternatives", "title": "Alternatives — the spice",
     "body": "Real estate, private markets, commodities, hedge strategies. They move to "
             "their own rhythm, which smooths the overall ride and makes the mix resilient."},
]

BIG_IDEAS = [
    {"icon": "🥚", "title": "Diversification",
     "body": "Don't put all eggs in one basket. Because the three buckets rarely fall "
             "together, mixing them gives you most of the return with much less of the pain."},
    {"icon": "💓", "title": "Volatility",
     "body": "The bumpiness of the ride. A volatility of 12% means a typical year ends "
             "within about ±12% of the expected path. More volatility = a wider fan."},
    {"icon": "🌊", "title": "Drawdown",
     "body": "How far you are below your highest point, peak-to-trough. A 30% drawdown "
             "needs a 43% gain just to break even — which is why we manage downside first."},
    {"icon": "🌦️", "title": "The fan chart is a weather forecast",
     "body": "Nobody knows the exact future, so we simulate thousands. The dark band "
             "holds the middle half of outcomes; the light band holds 9 in 10. The median "
             "is the most typical future — not a promise."},
    {"icon": "🏗️", "title": "A stress test is earthquake-proofing",
     "body": "Engineers shake a building's design before it's built. The Stress Lab "
             "replays famous crises against your mix so a 2008-style shock is a known "
             "quantity, not a surprise."},
    {"icon": "✂️", "title": "Rebalancing is a regular haircut",
     "body": "Winners grow until they dominate the portfolio and quietly raise your risk. "
             "Trimming back to target locks in gains and keeps risk where you chose it."},
]

GLOSSARY = [
    ["Median (50th percentile)", "Half the simulated futures end above this value, half below."],
    ["5th / 95th percentile", "The 1-in-20 bad and 1-in-20 great outcomes — the realistic edges, not the absolute extremes."],
    ["Expected return", "The average yearly growth rate we assume for the mix, before any single year's luck."],
    ["Volatility", "Typical size of yearly swings around the expected path."],
    ["Sharpe ratio", "Return earned per unit of risk taken. Above ~0.5 is solid for a diversified portfolio."],
    ["Max drawdown", "The single worst peak-to-trough fall in the period."],
    ["CAGR / annualised return", "The single steady yearly rate that would produce the same end value."],
    ["Drift", "How far an asset class has wandered from its target weight."],
    ["Monte Carlo simulation", "Rolling the dice thousands of times with realistic market behaviour to map possible futures."],
    ["Stress test", "Applying a historical or hypothetical crisis to today's portfolio to estimate the hit."],
]

LESSONS = [
    {"id": "basics", "icon": "🌱", "title": "Investing basics",
     "minutes": 4, "level": "Beginner",
     "summary": "What stocks, bonds and funds actually are, and why you own a mix."},
    {"id": "risk-return", "icon": "⚖️", "title": "Risk & return",
     "minutes": 5, "level": "Beginner",
     "summary": "Why higher expected returns always come with bigger swings."},
    {"id": "compounding", "icon": "⏳", "title": "The magic of compounding",
     "minutes": 4, "level": "Beginner",
     "summary": "How time turns steady returns into outsized outcomes."},
    {"id": "diversification", "icon": "🥚", "title": "Diversification",
     "minutes": 5, "level": "Core",
     "summary": "Most of the return, much less of the pain — see it in the data."},
    {"id": "monte-carlo", "icon": "🌦️", "title": "Reading a Monte Carlo",
     "minutes": 6, "level": "Core",
     "summary": "What the fan chart and percentiles really tell you."},
    {"id": "stress", "icon": "🏗️", "title": "Stress testing",
     "minutes": 5, "level": "Core",
     "summary": "Pressure-test your plan against 2008, COVID and inflation shocks."},
    {"id": "rebalancing", "icon": "✂️", "title": "Rebalancing",
     "minutes": 4, "level": "Core",
     "summary": "The simple discipline that keeps risk where you chose it."},
    {"id": "behaviour", "icon": "🧠", "title": "Behavioural traps",
     "minutes": 6, "level": "Advanced",
     "summary": "The mind games that make investors buy high and sell low."},
]

# Lesson reading content — list of paragraphs, "> " prefix renders as a highlight.
LESSON_BODIES = {
    "basics": [
        "Investing simply means putting money to work so it can grow faster than it would sitting in a bank account. You do that by owning small pieces of the economy.",
        "A **stock** (or share) is part-ownership of a company. When the company prospers, your slice becomes more valuable. A **bond** is a loan you make to a government or company that pays you interest and returns your money at the end.",
        "Most people don't buy individual stocks and bonds one by one. They buy **funds** (like ETFs) that hold hundreds or thousands at once — instant variety for a tiny fee.",
        "> WealthLens groups everything into three buckets: Equity (stocks), Fixed Income (bonds) and Alternatives (real assets). Your mix of the three is the single biggest driver of your results.",
    ],
    "risk-return": [
        "There is no free lunch in investing. Assets that can grow faster also fall harder along the way — that wobble is called **risk** (or volatility).",
        "Stocks have earned more than bonds over long periods precisely because they're a bumpier ride. You're paid a premium for tolerating the bumps.",
        "The art isn't avoiding risk — it's taking the *right amount* for your goals and your stomach. Too little and you fall short; too much and you panic-sell at the worst moment.",
        "> That's what your risk score does: it sizes how much growth-vs-safety fits your age, time horizon and comfort with swings.",
    ],
    "compounding": [
        "Compounding is earning returns on your past returns. Each year's growth becomes next year's starting line, so gains snowball.",
        "At 7% a year, money roughly **doubles every decade**. $10,000 becomes ~$20k in 10 years, ~$40k in 20, ~$80k in 30 — the last decade adds more than the first two combined.",
        "The fuel for compounding is *time*, which is why starting early beats investing more later. Reinvesting dividends and interest keeps the snowball rolling.",
        "> Small, regular contributions plus time are more powerful than trying to pick the perfect moment to invest.",
    ],
    "diversification": [
        "Diversification is the one genuinely free lunch in finance: spreading across assets that don't move in lockstep lowers your risk without giving up much expected return.",
        "When stocks fall, high-quality bonds often hold up or rise; alternatives march to their own beat. Blended together, the rough patches partly cancel out.",
        "The result is a smoother ride — most of the destination, far less of the white-knuckle journey. You can see it in the Learn Hub's 100%-equity vs balanced chart.",
        "> Diversification won't stop every loss, but it stops any single bet from sinking your whole plan.",
    ],
    "monte-carlo": [
        "Nobody can predict markets, so instead of one guess we run **thousands** of plausible futures using realistic return and risk behaviour. That's a Monte Carlo simulation.",
        "The **fan chart** shows the spread: the dark band holds the middle half of outcomes, the light band holds about 9 in 10. The line down the middle is the **median** — the most typical path, not a promise.",
        "**Percentiles** label the edges: the 5th percentile is a 1-in-20 bad case, the 95th a 1-in-20 great case. Looking at the whole range keeps your expectations honest.",
        "> A wider fan means more uncertainty. More time and more diversification both narrow it.",
    ],
    "stress": [
        "A stress test asks a blunt question: if a specific crisis happened *today*, what would it do to my portfolio? Engineers shake a bridge design before building it — same idea.",
        "WealthLens replays real episodes — 2008, the COVID crash, the 2022 rate shock — against your actual mix, then estimates how long recovery might take.",
        "Knowing your worst case in advance is what stops panic. A drop you've already rehearsed is a plan in motion, not a surprise.",
        "> If a scenario's hit feels unbearable, that's a signal to hold less of the risky asset — better to learn it here than in a real crash.",
    ],
    "rebalancing": [
        "Left alone, your winners grow until they dominate the portfolio — quietly pushing your risk far above what you chose. Rebalancing trims them back to target.",
        "Mechanically, it means selling a little of what's grown and buying what's lagged, which enforces 'sell high, buy low' without any forecasting.",
        "Most people rebalance once or twice a year, or whenever a bucket drifts more than ~5% from target — exactly the drift alert on your dashboard.",
        "> Rebalancing is boring on purpose. Its job is to keep your risk where you decided it should be.",
    ],
    "behaviour": [
        "The biggest threat to your returns usually isn't the market — it's the investor in the mirror. Our instincts are tuned for survival, not for markets.",
        "**Loss aversion** makes a loss sting about twice as much as an equal gain feels good, tempting us to sell in downturns. **Herding** makes us buy what's already soared.",
        "**Recency bias** assumes whatever just happened will continue; **overconfidence** convinces us we can time the exit. Together they drive the classic buy-high, sell-low cycle.",
        "> The cure is a written plan and automation: decide the rules when you're calm, then let them run when you're not.",
    ],
}

# 2-3 multiple-choice questions per lesson: {q, options, answer (index), explain}
QUIZZES = {
    "basics": [
        {"q": "What is a stock?", "options": ["A loan to a company", "Part-ownership of a company", "A type of bank account"],
         "answer": 1, "explain": "A stock is a share of ownership in a company."},
        {"q": "Why do most people use funds (ETFs)?", "options": ["They guarantee profits", "They own many assets at once for a small fee", "They avoid all risk"],
         "answer": 1, "explain": "Funds give instant diversification across many holdings cheaply."},
    ],
    "risk-return": [
        {"q": "Higher expected return generally comes with…", "options": ["Lower risk", "Bigger swings (more risk)", "No change in risk"],
         "answer": 1, "explain": "You're paid a premium for tolerating bigger ups and downs."},
        {"q": "What's the goal when choosing risk?", "options": ["Avoid all risk", "Take the maximum risk", "Take the right amount for your goals and stomach"],
         "answer": 2, "explain": "Too little falls short; too much causes panic-selling."},
    ],
    "compounding": [
        {"q": "At about 7% a year, money roughly doubles every…", "options": ["Year", "Decade", "Century"],
         "answer": 1, "explain": "~7% annual growth doubles your money about every 10 years."},
        {"q": "The most important fuel for compounding is…", "options": ["Time", "Luck", "Picking the perfect day"],
         "answer": 0, "explain": "Time lets returns build on past returns — start early."},
    ],
    "diversification": [
        {"q": "Diversification mainly helps by…", "options": ["Guaranteeing gains", "Lowering risk without giving up much return", "Eliminating all losses"],
         "answer": 1, "explain": "Assets that don't move together smooth the ride."},
        {"q": "When stocks fall, high-quality bonds often…", "options": ["Fall just as hard", "Hold up or rise", "Disappear"],
         "answer": 1, "explain": "Bonds frequently cushion equity drawdowns."},
    ],
    "monte-carlo": [
        {"q": "The median path on a fan chart is…", "options": ["A guarantee", "The most typical outcome, not a promise", "The best possible case"],
         "answer": 1, "explain": "Half of simulations end above it, half below."},
        {"q": "The 5th percentile represents…", "options": ["A 1-in-20 bad case", "The average", "An impossible outcome"],
         "answer": 0, "explain": "It's a realistic poor outcome, not the absolute worst."},
        {"q": "A wider fan means…", "options": ["More certainty", "More uncertainty", "Higher guaranteed returns"],
         "answer": 1, "explain": "More time and diversification both narrow the fan."},
    ],
    "stress": [
        {"q": "A stress test answers…", "options": ["What will definitely happen", "What a specific crisis would do to your portfolio today", "Which stock to buy"],
         "answer": 1, "explain": "It replays real crises against your actual mix."},
        {"q": "Knowing your worst case in advance helps you…", "options": ["Avoid all losses", "Stay calm and stick to the plan", "Predict the next crash"],
         "answer": 1, "explain": "A rehearsed drop is a plan, not a panic."},
    ],
    "rebalancing": [
        {"q": "Rebalancing means…", "options": ["Selling everything in a crash", "Trimming winners and topping up laggards back to target", "Never touching the portfolio"],
         "answer": 1, "explain": "It enforces 'sell high, buy low' mechanically."},
        {"q": "A common trigger to rebalance is when a bucket drifts about…", "options": ["0.1% from target", "5% from target", "50% from target"],
         "answer": 1, "explain": "That's exactly the dashboard's drift alert."},
    ],
    "behaviour": [
        {"q": "Loss aversion means…", "options": ["Losses hurt about twice as much as equal gains feel good", "We love losing money", "Losses don't affect us"],
         "answer": 0, "explain": "That sting tempts people to sell at the bottom."},
        {"q": "The best cure for behavioural traps is…", "options": ["Watching markets all day", "A written plan plus automation", "Following the crowd"],
         "answer": 1, "explain": "Decide rules when calm; let them run when you're not."},
    ],
}

# Earned client-side from progress; `cond` documents the rule.
BADGES = [
    {"id": "first-steps", "icon": "👣", "title": "First steps", "desc": "Complete your first lesson.", "cond": "lessons>=1"},
    {"id": "getting-serious", "icon": "📚", "title": "Getting serious", "desc": "Complete 3 lessons.", "cond": "lessons>=3"},
    {"id": "scholar", "icon": "🎓", "title": "Scholar", "desc": "Complete every lesson.", "cond": "lessons>=8"},
    {"id": "quiz-whiz", "icon": "🧠", "title": "Quiz whiz", "desc": "Ace a quiz with 100%.", "cond": "perfect>=1"},
    {"id": "perfectionist", "icon": "💯", "title": "Perfectionist", "desc": "Ace 5 quizzes.", "cond": "perfect>=5"},
    {"id": "on-a-roll", "icon": "🔥", "title": "On a roll", "desc": "Reach a 3-day streak.", "cond": "streak>=3"},
    {"id": "week-warrior", "icon": "⚡", "title": "Week warrior", "desc": "Reach a 7-day streak.", "cond": "streak>=7"},
    {"id": "level-5", "icon": "🚀", "title": "Rising star", "desc": "Reach level 5.", "cond": "level>=5"},
]
