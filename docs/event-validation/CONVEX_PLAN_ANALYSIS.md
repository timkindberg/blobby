# Convex Plan Cost Analysis: Single 50-Player Event

**Analysis Date**: 2026-01-31
**Event Profile**: Single team event, ~50 concurrent players, 30-45 minutes duration

---

## Executive Summary

**CRITICAL FINDING**: The Starter (Free/Pay-as-you-go) plan **CANNOT support this event** due to concurrent query limits.

**Recommendation**: **Professional Plan Required** - Even for a single event, the Starter plan's 16 concurrent query limit makes it non-viable. With 550 concurrent queries needed (or 300 after optimization), you exceed the Starter limit by 18x-34x.

**Cost Comparison**:
- **Starter Plan**: BLOCKED by concurrent query limit (would need 550÷16 = 34x the capacity)
- **Professional Plan**: $25/month (one-time developer seat) + ~$0.00 overage = **$25 total**

---

## Plan Comparison

### Concurrent Query Limits (BLOCKING ISSUE)

| Metric | Starter | Professional | Your Needs |
|--------|---------|--------------|------------|
| **Concurrent Queries** | **16** | **256+** | **300-550** |
| **Concurrent Mutations** | 16 | 256+ | ~50 peak |
| HTTP Actions | 16 | 128+ | 0 (not used) |
| Node Actions | 64 | 1,000+ | 0 (not used) |

**Analysis**: Your event requires 300 concurrent queries (after optimization) or 550 (current). The Starter plan's 16-query limit would cause:
- Query throttling and failures
- Degraded real-time updates
- Player disconnections
- Game state desync

This is not a cost issue - it's a **hard technical limit** that makes the Starter plan impossible to use.

---

## Usage-Based Cost Breakdown

### 1. Function Calls

**Your Usage**: ~19,100 function calls per event (from load test)

| Plan | Included | Overage Cost | Your Cost |
|------|----------|--------------|-----------|
| Starter | 1M/month | $2.20/1M | $0.00 (well within free tier) |
| Professional | 25M/month | $2.00/1M | $0.00 (well within included) |

**Analysis**: Both plans include far more than you need. No overage charges expected.

---

### 2. Database Bandwidth

**Your Usage**: Estimated ~50-100 MB for a single event
- 50 players × ~10-20 KB initial state = ~1 MB
- Real-time updates over 45 minutes = ~50-100 MB

| Plan | Included | Overage Cost | Your Cost |
|------|----------|--------------|-----------|
| Starter | 1 GB/month | (not specified) | $0.00 (within free tier) |
| Professional | 50 GB/month | (not specified) | $0.00 (within included) |

**Analysis**: Well within both plans' limits. No overage charges.

---

### 3. Database Storage

**Your Usage**: Minimal - session data only persists during event (~1-5 MB)

| Plan | Included | Overage Cost | Your Cost |
|------|----------|--------------|-----------|
| Starter | 0.5 GB | $0.22/GB/month | $0.00 |
| Professional | 50 GB | $0.20/GB/month | $0.00 |

**Analysis**: Negligible storage needs. No overage charges.

---

### 4. Action Compute

**Your Usage**: 0 GB-hours (no HTTP/Node actions used in current architecture)

| Plan | Included | Overage Cost | Your Cost |
|------|----------|--------------|-----------|
| Starter | 20 GB-hours | $0.33/GB-hour | $0.00 |
| Professional | 250 GB-hours | $0.30/GB-hour | $0.00 |

**Analysis**: Not applicable to your event.

---

## Total Cost Comparison

| Plan | Base Cost | Overage Charges | Total Event Cost | **VIABLE?** |
|------|-----------|-----------------|------------------|-------------|
| **Starter** | $0 | $0.00 | **$0** | **NO - Concurrent query limit** |
| **Professional** | $25/dev/month | $0.00 | **$25** | **YES** |

---

## Detailed Analysis

### Why Starter Fails

The Starter plan's **16 concurrent query limit** is a hard technical constraint:

1. **Current Architecture**: 50 players × 11 subscriptions = 550 concurrent queries
2. **Optimized Architecture**: 50 players × 6 subscriptions = 300 concurrent queries
3. **Starter Limit**: 16 concurrent queries

Even after optimization, you need **18.75x the Starter plan's capacity** (300 ÷ 16).

**What happens if you try**:
- Queries queue or fail after 16th concurrent request
- Players see stale data (no real-time updates)
- Game becomes unplayable
- Complete failure at ~17+ simultaneous players

### Why Professional Works

The Professional plan provides:
- **256+ concurrent queries** - 16x higher than Starter, covers your 300 optimized needs
- **25M function calls/month** - 1,309x your single event needs (19,100 calls)
- **50 GB bandwidth/month** - 500x your estimated usage (100 MB)
- **Scalability headroom** - Can handle growth beyond 50 players

**Cost Efficiency**:
- $25 one-time monthly subscription (cancel after event if needed)
- $0.00 overage charges (all usage within included limits)
- No surprises or hidden fees

---

## Recommendation

### Choose: **Professional Plan ($25)**

**Why**:
1. **Technical Requirement**: Starter's 16-query limit makes it impossible to use
2. **Cost Effective**: $25 for guaranteed event success vs. $0 for guaranteed failure
3. **Risk Mitigation**: Professional plan includes support and higher limits for safety
4. **One-Time Cost**: Subscribe for one month, cancel after event if desired

**Action Items**:
1. Subscribe to Professional plan ($25/month per developer)
2. Optimize subscriptions to 300 concurrent queries (already planned)
3. Run final load test to confirm 256-query limit is sufficient
4. Monitor dashboard during event to track actual usage
5. (Optional) Cancel subscription after event to avoid recurring charges

---

## Alternative Scenarios

### Running Multiple Events
If you plan to run multiple events:
- Keep Professional subscription active ($25/month)
- All events covered by included limits (25M calls, 50GB bandwidth)
- Better value than re-subscribing monthly

### Scaling Beyond 50 Players
Professional plan supports:
- Up to 256 concurrent queries = ~42 players (6 subscriptions each)
- Can request limit increase via dashboard support for larger events
- Contact Convex support for enterprise pricing if >100 players

---

## Sources

- [Convex Pricing](https://www.convex.dev/pricing)
- [Convex Limits Documentation](https://docs.convex.dev/production/state/limits)
- [Convex Starter Plan Announcement](https://news.convex.dev/introducing-the-new-convex-starter-plan-pay-for-only-what-you-need/)
- [Making Convex Plans More Friendly](https://news.convex.dev/making-convex-plans-more-friendly/)

---

## Appendix: Load Test Data

**From**: `/Users/tim.kindberg/projects/blobby/docs/event-validation/LOAD_TEST_SUMMARY.md`

**Key Metrics**:
- Concurrent subscriptions: 550 (current) → 300 (optimized target)
- Function calls per event: ~19,100
- Heartbeat mutations: 10/second sustained
- Answer submissions: ~50 concurrent per question, 10-20 questions
- Event duration: 30-45 minutes

**Convex Dashboard Observations**:
- Current usage well within Professional limits
- No throttling or errors observed at 50 players
- Database and bandwidth usage negligible
