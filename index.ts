import { createSchema, createYoga } from "graphql-yoga";
import { useDeferStream } from "@graphql-yoga/plugin-defer-stream";
import { users } from "./users";
import { companies } from "./companies";

const typeDefs = /* GraphQL */ `
  type User {
    name: String!
    email: String!
    company: Company!
  }

  type Company {
    id: String!
    name: String!
    branch: String!
  }

  type Query {
    company(id: String!): Company
    users(companyId: String!): [User!]!
  }
`;

const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const resolvers = {
  Query: {
    // @ts-ignore
    company: async (_, { id }) => {
      return companies.find((company) => company.id === id);
    },
    // @ts-ignore
    users: async (_, { companyId }) => {
      await wait(2000);
      return users
        .filter(({ company }) => !companyId || company === companyId)
        .map((user) => ({
          ...user,
          company: companies.find((company) => company.id === user.company),
        }));
    },
  },
};

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  plugins: [useDeferStream()],
  logging: "debug",
});

// @ts-ignore
const server = Bun.serve(yoga);

console.info(
  `Server is running on ${new URL(
    yoga.graphqlEndpoint,
    `http://${server.hostname}:${server.port}`
  )}`
);
