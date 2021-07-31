const express = require("express");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
  GraphQLSchema, 
  GraphQLObjectType,
  GraphQLString, 
  GraphQLList,
  GraphQLNonNull
} = require("graphql");

const app = express();

const shops = [
  {
    id: 1,
    name: "Walmart Super Shop",
    countryOrigin: "America"
  },
  {
    id: 2,
    name: "Keel Super",
    countryOrigin: "United Kindom"
  },
  {
    id: 3,
    name: "Shengshon Market",
    countryOrigin: "Singapore"
  },
  {
    id: 4,
    name: "FairPrice",
    countryOrigin: "Singapore"
  }
];

const foodItems = [
  {
    id: 1,
    name: "Fresh Spinach",
    shopId: 2
  },
  {
    id: 2,
    name: "Coconut",
    shopId: 1
  },
  {
    id: 3,
    name: "Baby corn",
    shopId: 3
  },
  {
    id: 4,
    name: "Salmon Fish",
    shopId: 2
  },
  {
    id: 5,
    name: "Fresh Milk 1L",
    shopId: 3
  }
];

// Initial Object types
const FoodItemType = new GraphQLObjectType({
  name: "FoodItem",
  description: "This objectType is representing the FoodItem datastructure",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    shopId: { type: GraphQLString },
    shops: {
      type: new GraphQLList(ShopType),
      resolve: food => {
        return shops.filter(shop => shop.id == food.shopId);
      }
    }
  })
});

// Initial Object types shop
const ShopType = new GraphQLObjectType({
  name: "Shops",
  description: "This objectType is representing the Shops datastructure",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    countryOrigin: { type: GraphQLString },
    foodItems: {
      type: new GraphQLList(FoodItemType),
      resolve: shop => {
        return foodItems.filter(foodIem => foodIem.shopId == shop.id);
      }
    }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    foodItems: {
      type: new GraphQLList(FoodItemType),
      description: "List of all food items",
      resolve: () => foodItems
    },
    shops: {
      type: new GraphQLList(ShopType),
      description: "List of all Shops",
      resolve: () => shops
    },
    foodItem: {
      type: FoodItemType,
      description: "returns a single foodiem based on ID",
      args: {
        id: { type: GraphQLString }
      },
      resolve: (parent, args) => foodItems.find(food => food.id == args.id)
    },
    shop: {
      type: ShopType,
      description: "returns a single shop based on ID",
      args: {
        id: { type: GraphQLString }
      },
      resolve: (parent, args) =>
        shops.find(shop => shop.id == args.id)
    },
    shopByCountry: {
      type: new GraphQLList(ShopType),
      description: "returns shops based on Country Origin",
      args: {
        countryOrigin: { type: GraphQLString }
      },
      resolve: (parent, args) => {
        return shops.filter(shop => shop.countryOrigin == args.countryOrigin);
      }
    }
  })
});



const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation Type',
    fields: ()=> ({
        addShop: {
            type: ShopType,
            description: 'add a shop to DB',
            args: {
                name:  { type : GraphQLString },
                countryOrigin:  { type : GraphQLString }
            },
            resolve: (parent, args) => {
                const shop = { id: (shops.length +1).toString(), name: args.name, countryOrigin: args.countryOrigin}
                shops.push(shop)
                return shop
            }
        }
    })
})


const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

app.use(
  "/graphql",
  expressGraphQL({
    schema: schema,
    graphiql: true
  })
);

app.listen(5000, () => {
  console.log("Server started");
});
