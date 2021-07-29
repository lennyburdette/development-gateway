# Development Gateway with Dynamic Supergraphs

Allows posting new subgraph schemas to dynamically swap the gateway's supergraph
schema. Intended for development only. Use Apollo Managed Federation and the
Apollo Studio's schema registry in production.

1. `yarn install`
1. Create a graph in Apollo Studio.
1. Create an `.env` file with your API key and graph ref.
1. Update the `graphref` properties in `schemas/supergraph.yaml` to match the
   graph ref in `.env`.
1. Run these commands to publish subgraphs to the schema registry in Studio.
   When you publish a subgraph directly to the gateway, it will be composed with
   other subgraphs in Studio.

   ```
   export APOLLO_KEY=<api key>
   export APOLLO_GRAPH_REF=<your-graph-ref>

   rover subgraph publish $APOLLO_GRAPH_REF \
    --schema schemas/one.graphql \
    --name one \
    --routing-url http://one/graphql \
    --convert

   rover subgraph publish $APOLLO_GRAPH_REF \
    --schema schemas/two.graphql \
    --name two \
    --routing-url http://two/graphql \
    --convert
   ```

1. Run the server with `yarn start` and open the playground at
   [http://localhost:4000/graphql](http://localhost:4000/graphql).
1. Observe that the schema contains two root fields.
1. Run this command to publish some subgraphs directly to the gateway.

   ```
   curl http://localhost:5000/compose \
     --data-urlencode "subgraphs[0][name]=one" \
     --data-urlencode "subgraphs[0][sdl]@schemas/one-v2.graphql" | pbcopy
   ```

1. Paste what's on your clipboard in the "HTTP Headers" section of the playground.
1. Observe that the schema now has three root fields.
