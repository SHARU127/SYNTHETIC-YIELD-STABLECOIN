Synthetic Yield Stablecoin — Tech Stack & Scope Decisions


A quick reference for the team before we start building.

1. The Stack I’m Building On: Solidity / Ethereum
Our own PPT had two conflicting stacks mentioned across slides (Solidity/Ethereum on most slides, Move/Aptos on the Methodology Phase 3 slide). I’m locking in Solidity/Ethereum. Reasons:
·	It's what almost every other slide already assumes. Abstract, Objectives, Deliverables, Tools & Technologies, and the Architecture diagram are all Solidity-based (ERC-4626, OpenZeppelin, Foundry, Sepolia Testnet). Only one slide mentioned Move — likely a leftover draft.
·	Far more learning resources and community support , critical since we're all still learning smart contract dev.
·	OpenZeppelin gives us audited, ready-made base contracts (ERC20, ERC4626, AccessControl), so we write far less code from scratch than we would writing raw Move modules.
·	Move/Aptos tooling is comparatively immature — fewer tutorials, smaller community, would cost us learning time we don't have.
Action item: update the Phase 3 slide to say Solidity + Foundry instead of Move + Move Prover, so the deck is internally consistent before review.

2. What I’m  Actually Building vs. the Full Architecture Diagram
Our diagram shows the full production vision . What we're delivering is a working core of it — this is completely normal for an academic project, and reviewers expect scoped-down deliverables. Here's the honest breakdown:
✅ In scope — matches the diagram
Diagram component	What we build
USDn Token (ERC-20)	Stablecoin.sol— real ERC-20 with
mint/burn
Minting Engine + Collateral Vault + Mint Ratio
Controller	Vault.sol— one ERC-4626 contract
handles deposit, collateral tracking, and mint
ratio math
Access Control / Permissioning	AccessControlrole (MINTER_ROLE)
inside Stablecoin.sol
Chainlink Feeds	RealChainlink ETH/USD feed on Sepolia
testnet
Funding Rate Oracle + PnL Tracker	Simulated insidePerpExchange.sol

Diagram component	What we build
Perp DEX	PerpExchange.sol— simulated short
position (matches our own slide, which literally
says "Simulated Shorting")
Frontend dApp + Analytics UI	One React page: wallet connect, mint/redeem,
peg status, APY, collateral health
Sepolia Testnet	Actual deployment target
Yield Distributor	Not a separate contract — the ERC-4626 share
price rising over time_is_our yield distribution


✅ Out of scope — deferred to "future work"
Diagram component	Why we're skipping it
DEX Spot, Lending Protocol, CEX Bridge	Real external DeFi protocol integrations — too
much scope for the timeline. Architected for, not
implemented.
Deviation & Heartbeat monitor	A full circuit-breaker system is out of scope.
(Cheap partial credit: we can add one
require() check that reverts on a stale
Chainlink price — 10 min of work for a truthful
"basic heartbeat check implemented.")
Keeper Bot / Automation Tools	Full autonomous bot is too much. Replaced with
a manualrebalance()function we trigger
ourselves during demo.
IPFS & CI/CD	Irrelevant for a testnet demo — skip entirely.
Formal Verification (Move Prover / Foundry
fuzzing)	Nice-to-have if time permits at the very end, not
a core deliverable.
Mainnet deployment	Never deploy unaudited financial code to
mainnet — Sepolia testnet only.

3. How to Talk About This in the Review
If asked why the full architecture isn't fully implemented:
"We implemented the core protocol and hedging logic end-to-end on testnet — minting, collateral vaulting, simulated delta-neutral hedging, and redemption. Exchange integrations, automated keepers, and monitoring infrastructure are architected in our design ."

4. The Three Contracts, One Line Each
·	Stablecoin.sol — ERC-20 token (USDn), mint/burn restricted to Vault via access control
·	Vault.sol — ERC-4626 vault: takes stETH collateral, mints USDn, tracks yield-bearing shares (the core of the whole project)
·	PerpExchange.sol — mock contract simulating short positions + funding rate payments, so we can demonstrate the delta-neutral hedge without needing a real exchange
