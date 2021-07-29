rover subgraph publish $PROD_APOLLO_GRAPH_REF \
  --schema schemas/one.graphql \
  --name one \
  --routing-url http://one/graphql \
  --convert

rover subgraph publish $PROD_APOLLO_GRAPH_REF \
  --schema schemas/two.graphql \
  --name two \
  --routing-url http://two/graphql \
  --convert

rover subgraph publish $DEV_APOLLO_GRAPH_REF \
  --schema schemas/one.graphql \
  --name one \
  --routing-url http://one/graphql \
  --convert

rover subgraph publish $DEV_APOLLO_GRAPH_REF \
  --schema schemas/two.graphql \
  --name two \
  --routing-url http://two/graphql \
  --convert
