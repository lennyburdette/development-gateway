import { ApolloServer } from "apollo-server-express";
import { ApolloGateway } from "@apollo/gateway";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginUsageReportingDisabled,
} from "apollo-server-core";

/**
 * @param {import("@apollo/gateway").GatewayConfig | undefined} [gatewayConfig]
 */
export async function makeGateway(gatewayConfig) {
  const gateway = new ApolloGateway(gatewayConfig);
  const server = new ApolloServer({
    gateway,
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloServerPluginUsageReportingDisabled(),
    ],
  });
  await server.start();
  return server.getMiddleware();
}
