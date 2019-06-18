// for any testing databases
process.env.TZ = 'UTC'
require("dotenv").config();

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;

/*
run npm t -- --watch
*/
