# Toronto Store Sources (Draft)

Goal: identify source URLs and extraction plans for initial Toronto-area chains.

Notes:

- URLs below are likely official domains; verify exact flyer/deals endpoints and robots/ToS before scraping.
- Prefer static HTML/JSON endpoints over dynamic pages; capture source URL for each scrape.

## No Frills

- Domain: https://www.nofrills.ca
- Weekly flyer/deals: TBD (likely /flyer or /weekly-flyer; verify)
- Store locator: TBD (likely /store-locator; verify)
- Extraction plan: check for JSON behind flyer tiles; fallback to HTML parsing.
- ToS/robots: verify.

## Sobeys

- Domain: https://www.sobeys.com
- Weekly flyer/deals: TBD (likely /flyer or /weekly-flyer; verify)
- Store locator: TBD (likely /store-locator; verify)
- Extraction plan: flyer tiles or JSON feed; confirm with network inspection.
- ToS/robots: verify.

## FreshCo

- Domain: https://www.freshco.com
- Weekly flyer/deals: TBD (likely /flyer; verify)
- Store locator: TBD (likely /store-locator; verify)
- Extraction plan: flyer HTML/JSON; validate for pagination.
- ToS/robots: verify.

## Food Basics

- Domain: https://www.foodbasics.ca
- Weekly flyer/deals: TBD (likely /flyer; verify)
- Store locator: TBD (likely /store-locator; verify)
- Extraction plan: flyer HTML/JSON; confirm item schema.
- ToS/robots: verify.

## Metro

- Domain: https://www.metro.ca
- Weekly flyer/deals: TBD (likely /flyer; verify)
- Store locator: TBD (likely /store-locator; verify)
- Extraction plan: flyer tiles or JSON feed.
- ToS/robots: verify.

## Loblaws

- Domain: https://www.loblaws.ca
- Weekly flyer/deals: TBD (likely /flyer; verify)
- Store locator: TBD (likely /store-locator; verify)
- Extraction plan: flyer tiles or API; confirm structure.
- ToS/robots: verify.

## Walmart (Supercenter)

- Domain: https://www.walmart.ca
- Weekly flyer/deals: TBD (likely /flyer; verify)
- Store locator: TBD (likely /store-finder; verify)
- Extraction plan: flyer/deals page; check for structured data.
- ToS/robots: verify.

## Longo's

- Domain: https://www.longos.com
- Weekly flyer/deals: TBD (likely /flyer; verify)
- Store locator: TBD (likely /store-locator; verify)
- Extraction plan: flyer HTML or JSON feed.
- ToS/robots: verify.

## Real Canadian Superstore

- Domain: https://www.realcanadiansuperstore.ca
- Weekly flyer/deals: TBD (likely /flyer; verify)
- Store locator: TBD (likely /store-locator; verify)
- Extraction plan: flyer tiles or JSON feed.
- ToS/robots: verify.

## Exclusions

- Costco: explicitly excluded.
