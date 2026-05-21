# flystr-api

GraphQL API server for **flystr / tripfixed**, a flight-deal discovery product. Built with
Apollo Server on Express and backed by MongoDB (Mongoose), it is the system of record for
users, deals, trips and payments — exposing crawled fare data to the web app via a single
GraphQL contract, handling Google OAuth + JWT auth, and processing Stripe checkout. It is
one of five services in the flystr architecture; for the full multi-repo overview see the
pinned [**flystr**](https://github.com/sam-maass/flystr) repository.
