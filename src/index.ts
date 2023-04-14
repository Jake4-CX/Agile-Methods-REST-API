import { AppDataSource } from "./data-source";
import { port } from "./config";
import app from './app';
import { AccountRolesController } from "./controller/AccountRoleController";
import fs = require('fs');


AppDataSource.initialize().then(async () => {
    console.log("Database connection has been established successfully.");

    if (!fs.existsSync('./images')) { // Directory is required to exist so that multer can save files to it
        fs.mkdirSync('./images');
    }

    AccountRolesController.add_default_roles();
    app.listen(port);
    console.log(`REST API Express server has started on port ${port}`);

}).catch(error => console.log(error));