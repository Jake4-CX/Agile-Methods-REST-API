import * as request from "supertest";
import { port } from "../src/config";
import app from "../src/app";
import { AppDataSource } from "../src/data-source";
import { AccountRolesController } from "../src/controller/AccountRoleController";
import { doesNotMatch } from "assert";

const testUser = {
  firstName: "John",
  lastName: "Doe",
  age: 25
};

let connection, server;


beforeEach(async() => {
  connection = await AppDataSource.initialize();
  await connection.synchronize(true);
  // await AccountRolesController.add_default_roles(); // 'Error: Called end on pool more than once' issue with this uncommented

  server = app.listen(port);
});

afterEach(() => {
  server.close();
  connection.close();
});

it('should be no users initially', async() => {
  const response = await request(app).get('/users');
  console.log(response.body);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual([]);
});

it('should create a user', async() => {
  const response = await request(app).post('/users').send(testUser);
  console.log(response.body);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({...testUser, id: 1});
});

it('should not create a user if no firstName is given', async() => {
  const response = await request(app).post('/users').send({...testUser, firstName: undefined});
  console.log(response.body);
  expect(response.statusCode).toBe(400);
  expect(response.body.errors).not.toBeNull();
  expect(response.body.errors.length).toBe(1);
  expect(response.body.errors[0]).toEqual({
    "location": "body",
    "msg": "firstName must be a string",
    "param": "firstName"
  });
});

it('should not create a user if age is less than 0', async() => {
  const response = await request(app).post('/users').send({...testUser, age: -1});
  console.log(response.body);
  expect(response.statusCode).toBe(400);
  expect(response.body.errors).not.toBeNull();
  expect(response.body.errors.length).toBe(1);
  expect(response.body.errors[0]).toEqual({
    "location": "body",
    "msg": "age must be a positive integer",
    "param": "age",
    "value": -1
  });
});