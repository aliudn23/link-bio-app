require('dotenv').config();

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://dev:12345678@localhost:5432/linkbiodb?schema=public",
  },
};
