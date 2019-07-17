require("dotenv").config();
// for any testing databases
process.env.TZ = "UTC";
process.env.NODE_ENV = "test";
// process.env.JWT_SECRET = "test-jwt-secret";
// process.env.JWT_EXPIRY = "5m";

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;

/*
run npm t -- --watch
*/
