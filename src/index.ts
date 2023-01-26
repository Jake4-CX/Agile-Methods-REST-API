import { AppDataSource } from "./data-source";
import { port } from "./config";
import app from './app';
import { AccountRolesController } from "./controller/AccountRoleController";


AppDataSource.initialize().then(async () => {
    AccountRolesController.add_default_roles();
    app.listen(port);
    console.log(`REST API Express server has started on port ${port}`);

}).catch(error => console.log(error));