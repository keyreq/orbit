/**
 * Daily Brief API
 *
 * Generates comprehensive market intelligence brief covering:
 * - Global macro & policy
 * - Institutional flows
 * - Crypto deep dive
 * - Geopolitical risks
 * - AI/tech cycle
 * - Trigger maps & probabilities
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Extended timeout for comprehensive analysis

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })

    const prompt = `You are a senior CIO at a tier-1 hedge fund. Generate a comprehensive Daily Market Intelligence Brief for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

CRITICAL INSTRUCTIONS:
- Use Google Search to find REAL, CURRENT data from the past 24-48 hours
- Include specific numbers, percentages, and levels
- Cite sources inline (e.g., "Bloomberg reports..." or "per FRED...")
- Focus on ACTIONABLE intelligence, not generic commentary
- Identify regime changes and structural shifts
- Provide clear probability-weighted scenarios

STRUCTURE YOUR BRIEF EXACTLY AS FOLLOWS:

# 1️⃣ EXECUTIVE MACRO SUMMARY

**Current Market Regime:** [Risk-on/Risk-off/Transition/Panic/Melt-up]

**What Changed in Last 24h:**
- [List 3-5 key developments with numbers]

**What Matters Today:**
- [3-4 critical catalysts/events]

**Probability-Weighted Macro Path (3-6 Months):**
- Base case (X%): [scenario]
- Bull case (X%): [scenario]
- Bear case (X%): [scenario]

---

# 2️⃣ US MACRO & POLICY DASHBOARD

Search for latest data on:
- **CPI / Inflation:** Latest print, expectations, trajectory
- **Jobs Data:** Latest NFP, unemployment, wage growth
- **Real Yields:** 10Y TIPS current level and trend
- **DXY:** Current level, momentum
- **VIX / MOVE:** Fear gauges
- **FedWatch:** Probability of next rate decision (use CME FedWatch)
- **Treasury Issuance:** Recent developments
- **Fed Rhetoric:** Recent Fed speaker comments

**Interpretation:**
- Tightening or easing in real terms?
- Liquidity expanding or contracting?
- Policy trajectory over next 6 months?

---

# 3️⃣ INSTITUTIONAL CAPITAL & FLOW SIGNALS

Search for recent reports/data on:
- **Bank Research Themes:** JPM, Goldman, Morgan Stanley positioning
- **ETF Flows:** Equity and crypto ETF flows this week
- **Credit Spreads:** HY, IG levels and trends
- **Equity Breadth:** Advance/decline, new highs/lows
- **Positioning Signals:** Risk parity, CTA positioning if available

**Translation:**
Where is big money leaning? Crowded trades? Reversals?

---

# 4️⃣ GLOBAL REGIONS

**🇺🇸 United States:**
- Equities: S&P 500, Nasdaq levels and momentum
- Key developments

**🇪🇺 Europe:**
- ECB policy, growth outlook
- Sovereign stress signals

**🇨🇳 China:**
- Stimulus measures
- Property sector
- CPI/PPI, liquidity conditions

**🇯🇵 Japan:**
- BOJ policy stance
- Yield curve, yen levels
- Fiscal developments

**🌏 Asia ex-Japan:**
- Taiwan, South Korea (semis)
- India (growth story)

**🌍 Middle East:**
- Oil flows, geopolitical risk premium
- Hormuz tensions

**🌎 South America:**
- Argentina reforms
- Brazil macro conditions

---

# 5️⃣ COMMODITIES & ENERGY

Search for latest prices and trends:
- **Oil:** Brent, WTI (current price, weekly change)
- **Gold:** Current level, trend
- **Copper:** Dr. Copper signal
- **LNG / Shipping:** Supply chain signals
- **Energy Geopolitics:** Key risk factors

**Interpretation:**
Inflation pressure vs demand slowdown signal?

---

# 6️⃣ AI / TECH / SEMICONDUCTOR CYCLE

Search for latest developments:
- **Nvidia, TSMC, ASML:** Supply chain signals, earnings, guidance
- **AI Capex:** Hyperscaler spending trends
- **Data Center Buildout:** Growth trajectory
- **Quantum Computing:** Recent breakthroughs (timeline impact)
- **US-China Tech Policy:** Export controls, restrictions

**Assessment:**
Productivity supercycle thesis intact? Capex sustainability?

---

# 7️⃣ PAYMENTS & FINANCIAL INFRASTRUCTURE

Search for recent updates:
- **Visa/Mastercard/Stripe:** Volume trends, initiatives
- **Stablecoin Supply:** USDT, USDC supply changes (last 7 days)
- **On-chain RWA:** Tokenization adoption trends
- **Cross-border Payments:** Rails shifting?
- **Regulatory:** Key developments (US, EU)

**Signal:**
Digital money rails expanding or contracting?

---

# 8️⃣ CRYPTO & DEFI DEEP DIVE

**Market Structure:**
Search for current data:
- Total crypto market cap
- BTC price, 24h/7d change
- ETH price, 24h/7d change
- BTC dominance %
- 30-day max drawdown

**Flows:**
- BTC/ETH ETF flows (last 24h, last week)
- Stablecoin supply change (7d)
- Exchange inflows/outflows trends

**Leverage:**
- Open interest trends
- Funding rates (positive/negative, extremes?)
- Spot vs perpetual ratio

**Sentiment:**
- Fear & Greed Index (current reading)
- Recent liquidation events
- Social sentiment score

**Narratives:**
- What's hot: L1s, Binance ecosystem, RWAs, AI tokens, memecoins?
- Strategic Bitcoin Reserve developments
- Notable movers (>20% 24h)

**Structural Interpretation:**
Late-stage correction? Beginning of bear? Reset within bull? Accumulation?

---

# 9️⃣ TRIGGER MAP (If/Then Scenarios)

**If CPI Hot (>Consensus):**
- BTC → [direction and %]
- Nasdaq → [direction and %]
- Gold → [direction and %]
- DXY → [direction and %]

**If CPI Cool (<Consensus):**
- [Same structure]

**If Oil Spikes (>$95):**
- Impact chain across assets

**If BOJ Tightens:**
- Global yield impact
- Yen carry unwind risk

**If China Major Stimulus:**
- Commodity response
- Risk asset response

---

# 🔟 PROBABILITY MAP (3-6 Month Outlook)

| Asset Class | Base Case | Left Tail (Bear) | Right Tail (Bull) |
|------------|-----------|------------------|-------------------|
| **Equities** | X% chance: [scenario] | X% chance: [scenario] | X% chance: [scenario] |
| **Bonds** | X% chance: [scenario] | X% chance: [scenario] | X% chance: [scenario] |
| **Crypto** | X% chance: [scenario] | X% chance: [scenario] | X% chance: [scenario] |
| **Dollar** | X% chance: [scenario] | X% chance: [scenario] | X% chance: [scenario] |
| **Commodities** | X% chance: [scenario] | X% chance: [scenario] | X% chance: [scenario] |

---

# 1️⃣1️⃣ STRUCTURAL CYCLE LAYER (Big Picture)

Apply Ray Dalio-style multi-cycle analysis:

- **Debt Cycle:** Where are we? (early/mid/late expansion or contraction)
- **Internal Political Stress:** US, EU, China domestic pressures
- **External Geopolitical Stress:** War risk, trade tensions
- **Technology Cycle:** AI boom sustainability, semiconductor cycle
- **Monetary Regime Transition:** Moving toward/away from QE?

**Anchoring Insight:**
[1-2 sentences on what matters most beyond noise]

---

# 1️⃣2️⃣ CONFIDENCE SCORE

Rate your confidence in this analysis:

- **Cross-Asset Alignment:** [Low/Medium/High]
- **Sentiment Extremes:** [None/Moderate/Extreme]
- **Macro Data Clarity:** [Low/Medium/High]
- **Flow Confirmation:** [Weak/Moderate/Strong]

**Overall Confidence:** [Low/Medium/High]

**Key Uncertainty:** [What could invalidate this view?]

---

**CRITICAL LEVELS TO WATCH:**
- S&P 500: [support/resistance]
- Bitcoin: [support/resistance]
- DXY: [support/resistance]
- 10Y Yield: [support/resistance]
- VIX: [trigger level for risk-off]

---

**BOTTOM LINE (1-2 sentences):**
[Clear, actionable takeaway for portfolio positioning]

---

SOURCES TO PRIORITIZE IN YOUR SEARCH:
- Bloomberg, Reuters, Financial Times, Wall Street Journal
- Federal Reserve (FRED, FedWatch), US Treasury, BLS, BEA
- BIS, IMF, World Bank reports
- JPM, Goldman Sachs, Morgan Stanley research notes
- CoinMarketCap, Glassnode, Messari, CryptoQuant for crypto data
- CME Group for futures data
- X/Twitter for breaking developments
- Nikkei Asia for Asia coverage
- CFR, CSIS for geopolitics

Remember: You're writing for sophisticated investors who need ACTIONABLE INTELLIGENCE with SPECIFIC DATA POINTS, not generic market commentary.`

    console.log('[Daily Brief] Generating comprehensive market intelligence brief...')
    const startTime = Date.now()

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    })

    const brief = result.text

    const generationTime = Date.now() - startTime
    console.log(`[Daily Brief] Generated in ${generationTime}ms`)

    return NextResponse.json({
      success: true,
      data: {
        brief,
        generatedAt: new Date().toISOString(),
        generationTimeMs: generationTime,
      }
    })

  } catch (error) {
    console.error('[Daily Brief] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate daily brief',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
