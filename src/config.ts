require('dotenv').config();

export const port = process.env.PORT || 3000;
export const site_base_url = process.env.SITE_BASE_URL || "http://127.0.0.1:5173";

export const database_type = process.env.DATABASE_TYPE || "mariadb";
export const database_address = process.env.DATABASE_ADDRESS || "127.0.0.1";
export const database_port:number = parseInt(process.env.DATABASE_PORT) || 3306;
export const database_name = process.env.DATABASE_NAME || "Reports";
export const database_user = process.env.DATABASE_USER || "council_user";
export const database_password = process.env.DATABASE_PASSWORD || "4*CMgmdI6uv@";

export const recaptcha_secret_key = process.env.RECAPTCHA_SECRET_KEY || '';

export const email_host = process.env.EMAIL_HOST || "redbull.mxrouting.net";
export const email_port = process.env.EMAIL_USE_SSL.toLocaleLowerCase() == "true" ? 465 : 587;
export const email_username = process.env.EMAIL_HOST_USER || "";
export const email_password = process.env.EMAIL_HOST_PASSWORD || "";