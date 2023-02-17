import * as request from "supertest";
import { port } from "../src/config";
import app from "../src/app";
import { AppDataSource } from "../src/data-source";
import { AccountRolesController } from "../src/controller/AccountRoleController";
import { doesNotMatch } from "assert";

const testUser = {
  user_email: "test@email.com",
  user_password: "password"
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

// able to change/del all 'it' codes('should be no users initially', async() => {
  const response = await request(app).get('/users');
  console.log(response.body);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual([]);
});

it('should create a user', async() => {
  const response = await request(app).post('/users').send(testUser);
  console.log(response.body);
  expect(response.statusCode).toBe(200);
  delete response.body.user_uuid;
  delete response.body.token;
  delete response.body.registration_date;
  delete response.body.last_login_date;
  delete response.body.id;
  expect(response.body).toEqual(testUser);
});

it('should not create a user if no email is given', async() => {
  const response = await request(app).post('/users').send({...testUser, user_email: undefined});
  console.log(response.body);
  expect(response.statusCode).toBe(400);
  expect(response.body.errors).not.toBeNull();
  expect(response.body.errors.length).toBe(1);
  expect(response.body.errors[0]).toEqual({
    "location": "body",
    "msg": "user_email must be a valid email",
    "param": "user_email"
  });
});