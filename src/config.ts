require('dotenv').config();

export const port = process.env.PORT || 3000;

export const database_type = process.env.DATABASE_TYPE || "mysql";
export const database_address = process.env.DATABASE_ADDRESS || "127.0.0.1";
export const database_port:number = parseInt(process.env.DATABASE_PORT) || 3306;
export const database_name = process.env.DATABASE_NAME || "reports";
export const database_user = process.env.DATABASE_USER || "council_user";
export const database_password = process.env.DATABASE_NAME || "4*CMgmdI6uv@";