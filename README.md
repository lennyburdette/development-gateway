# Development Gateway with Dynamic Supergraphs

Allows publishing new subgraph schemas directly to a gateway to dynamically
swap supergraph schema. Intended for development only. Use Apollo Managed
Federation and Apollo Studio's schema registry in production.

1. `yarn install`
1. Create a graph in Apollo Studio.
1. Run these commands to publish subgraphs to two different variants in Studio.

   - This gateway won't use the production variant directly, but the
     `supergraph.yaml` config file references subgraphs in the production
     variant. When you publish a subgraph directly to the gateway, you're
     composing it with subgraphs from your production variant, ensuring all
     services are up-to-date.
   - The gateway doesn't directly use the development variant either, but it's
     there to make sure you're not accidentally publishing production usage
     metrics from your development environment.

   ```
   export APOLLO_KEY=<api key>
   export PROD_APOLLO_GRAPH_REF=<your-production-graph-ref>
   export DEV_APOLLO_GRAPH_REF=<your-development-graph-ref>

   bash ./boostrap-variants.sh
   ```

1. Create an `.env` file with your API key, and set your graph ref to the
   **development** variant.
1. Update the `graphref` properties in `schemas/supergraph.yaml` to reference
   subgraphs in your **production** variant.
1. Run the server with `docker compose up` and open the playground at
   [http://localhost:4000/graphql](http://localhost:4000/graphql).
1. Observe that the schema contains two root fields.
1. Run this command to publish some subgraphs directly to the gateway.

   ```
   curl http://localhost:4000/compose \
     --data-urlencode "subgraphs[0][name]=one" \
     --data-urlencode "subgraphs[0][sdl]@schemas/one-v2.graphql" | pbcopy
   ```

1. Paste what's on your clipboard in the "HTTP Headers" section of the
   playground.
1. Observe that the schema now has three root fields.
1. Bonus: simulate a composition error:

   ```
   curl http://localhost:4000/compose \
     --data-urlencode "subgraphs[0][name]=one" \
     --data-urlencode "subgraphs[0][sdl]@schemas/one-broken.graphql"
   ```
