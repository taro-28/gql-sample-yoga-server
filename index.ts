import { createSchema, createYoga } from "graphql-yoga";
import { useDeferStream } from "@graphql-yoga/plugin-defer-stream";
import { users } from "./users";
import { tasks } from "./tasks";
import { companies } from "./companies";

const typeDefs = /* GraphQL */ `
  type User {
    name: String!
    email: String!
    company: Company!
  }

  type Task {
    id: String!
  }

  type Company {
    id: String!
    name: String!
    branch: String!
  }

  type Query {
    alphabet: [String!]!
    """
    A field that resolves fast.
    """
    fastField: String!

    users: [User!]!
    tasks: [Task!]!
    companies: [Company!]!

    """
    A field that resolves slowly.
    Maybe you want to @defer this field ;)
    """
    slowField(waitFor: Int! = 2000): String
  }
`;

const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const resolvers = {
  Query: {
    async *alphabet() {
      for (const character of ["a", "b", "c", "d", "e", "f", "g"]) {
        yield character;
        await wait(1000);
      }
    },
    users: async () => {
      await wait(2000);
      return users.map((user) => ({
        ...user,
        company: companies.find((company) => company.id === user.company),
      }));
    },
    tasks: async () => {
      await wait(500);
      return tasks;
    },
    companies: async () => {
      await wait(1000);
      return companies;
    },
    fastField: async () => {
      await wait(100);
      return "I am speed";
    },
    // @ts-ignore
    slowField: async (_, { waitFor }) => {
      await wait(waitFor);
      return "I am slow";
    },
  },
};

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  plugins: [useDeferStream()],
});

// @ts-ignore
const server = Bun.serve(yoga);

console.info(
  `Server is running on ${new URL(
    yoga.graphqlEndpoint,
    `http://${server.hostname}:${server.port}`
  )}`
);
