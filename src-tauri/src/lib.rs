use product::product::{get_products, ProductEntity};
use serde::{Deserialize, Serialize};
use sqlclient::sqlclient::{sql_exec, sql_exec_non_query, sql_exec_scalar};
use sqlx::prelude::FromRow;
mod product;
mod sqlclient;
mod stored_procedures;
#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
async fn register_user(login: &str, password: &str) -> Result<(), String> {
    if password.len() < 8 {
        return Err("bad password".to_string());
    }
    if login.len() < 5 {
        return Err("bad login".to_string());
    }
    if sql_exec_scalar::<i64>(
        format!("SELECT COUNT(1) FROM users WHERE user_name = '{}'", login).as_str(),
    )
    .await
    .expect("failed to verify user")
        > 0
    {
        return Err("user already exists".to_string());
    }
    sql_exec_non_query(
        format!(
            "INSERT INTO users (user_name, user_password, user_role) VALUES ('{}', '{}', '{}')",
            login, password, "User"
        )
        .as_str(),
    )
    .await
    .map_err(|e| format!("FAILED TO REGISTER USER: {}", e.to_string()))?;

    Ok(())
}

#[tauri::command]
async fn login_user(login: &str, password: &str) -> Result<bool, String> {
    if password.len() < 8 {
        return Err("bad password".to_string());
    }
    if login.len() < 5 {
        return Err("bad login".to_string());
    }

    let user_exists = sql_exec_scalar::<i64>(
        format!(
            "
        SELECT 
            COUNT(1) 
        FROM users 
        WHERE 
            user_name = '{}' AND user_password = '{}'",
            login, password
        )
        .as_str(),
    )
    .await
    .map_err(|e| format!("failed to verify user: {}", e))?;

    Ok(user_exists > 0)
}
#[tauri::command]
async fn change_user_password(login: &str, password: &str,new_password: &str) -> Result<bool, String> {

    sql_exec_non_query(
        format!("
        UPDATE USERS
            SET USER_PASSWORD = '{}'
        WHERE 
            user_name = '{}' AND user_password = '{}'",
            new_password,login, password
        )
        .as_str(),
    )
    .await
    .map_err(|e| format!("failed to verify user: {}", e))?;

    Ok(true)
}
#[tauri::command]
async fn get_user_role(login: &str, password: &str) -> Result<String, String> {
    if password.len() < 8 {
        return Err( "bad password".to_string());
    
    }
    if login.len() < 5 {
        return Err("bad login".to_string());
    }
    let user_role = sql_exec_scalar::<String>(
        format!(
            "
        SELECT
            USER_ROLE::TEXT 
        FROM users 
        WHERE 
            user_name = '{}' AND user_password = '{}'",
            login, password
        )
        .as_str(),
    )
    .await
    .map_err(|e| format!("failed to verify user: {}", e))?;

    Ok(user_role)
}
#[tauri::command]
async fn get_products_where(where_statment: &str) -> Result<Vec<ProductEntity>, Error> {
    let products = get_products(where_statment).await;
    Ok(products)
}
#[derive(FromRow,Debug,Serialize)]
struct Users {
    user_id:String,
    user_name: String,
    user_role: String,
    user_password: Option<String>
}

#[tauri::command]
async fn get_all_users() -> Result<Vec<Users>, Error> {
    let users = sql_exec::<Users>("SELECT user_id::TEXT, user_name, user_role::TEXT ,user_password FROM users")
        .await
        .map_err(|e| format!("failed to fetch users: {}", e)).expect("Failed to load users");
    Ok(users)
}
#[derive(Serialize,Deserialize)]
struct Order {
    product_id:i64,
    quantity:i8,
    price:i8
}
/*
SELECT create_order(
    'john_doe', 
    NOW(), 
    49.99,
    '[{"product_id": 1, "quantity": 2, "price": 19.99}, {"product_id": 2, "quantity": 1, "price": 9.99}]'::JSONB
);
*/
#[tauri::command]//        PRODUCT_ID|QUANTITY|USER_LOGIN
async fn place_order(products:Vec<Order>,total:i64,user:String) -> Result<(),Error> {
    let products = serde_json::to_string(&products).unwrap();
    let _ = sql_exec_non_query(format!("SELECT create_order('{}'::VARCHAR,NOW(),{}::DECIMAL,'{}'::JSONB);",user,total,products).as_str()).await.unwrap();
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            register_user,
            login_user,
            get_products_where,
            get_user_role,
            change_user_password,
            get_all_users,
            place_order
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
