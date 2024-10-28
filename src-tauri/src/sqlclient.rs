#[allow(dead_code)]
pub mod sqlclient {
    use dotenv::dotenv;
    use sqlx::{query, query_as, query_scalar, Connection, FromRow, PgConnection, Type};
    use std::env;

    pub async fn sql_exec<T: for<'a> FromRow<'a, sqlx::postgres::PgRow> + Send + Sync + Unpin>(
        command: &str,
    ) -> sqlx::Result<Vec<T>> {
        dotenv().ok();

        let conn_string =
            env::var("SQL_CONNECTION_STRING").expect("Failed to get SQL_CONNECTION_STRING");

        let mut conn = PgConnection::connect(&conn_string).await?;

        let select_query = query_as::<_, T>(command);
        let rows: Vec<T> = select_query.fetch_all(&mut conn).await?;
        conn.close().await?;
        Ok(rows)
    }

    pub async fn sql_exec_scalar<T: Type<sqlx::Postgres> + Send + Sync + Unpin + for<'r> sqlx::Decode<'r, sqlx::Postgres>>(
        command: &str,
    ) -> sqlx::Result<T> {
        dotenv().ok();

        let conn_string =
            env::var("SQL_CONNECTION_STRING").expect("Failed to get SQL_CONNECTION_STRING");
        let mut conn = PgConnection::connect(&conn_string).await?;

        let result: T = query_scalar(command).fetch_one(&mut conn).await?;
        let _ = conn.close().await?;
        Ok(result)
    }

    pub async fn sql_exec_non_query(command: &str) -> sqlx::Result<()> {
        dotenv().ok();

        let conn_string =
            env::var("SQL_CONNECTION_STRING").expect("Failed to get SQL_CONNECTION_STRING");
        let mut conn = PgConnection::connect(&conn_string).await?;

        query(command).execute(&mut conn).await?;
        let _ = conn.close().await?;
        Ok(())
    }
}

#[allow(dead_code)]
#[cfg(test)]
mod tests {
    use super::sqlclient::{sql_exec, sql_exec_non_query, sql_exec_scalar};
    use sqlx::FromRow;

    #[derive(Debug, FromRow)]
    struct Users {
        user_name: String,
        user_role: String,
    }

    #[tokio::test]
    async fn test_sql_exec() -> Result<(), Box<dyn std::error::Error>> {
        let users = sql_exec::<Users>(
            "SELECT user_name, user_role::text as user_role FROM users WHERE user_name = 'Duxa'",
        )
        .await?;
        println!("{:?}", users);
        Ok(())
    }

    #[tokio::test]
    async fn test_sql_exec_non_query() -> Result<(), Box<dyn std::error::Error>> {
        sql_exec_non_query("INSERT INTO users (user_name, user_role) VALUES ('Duxa123', 'Admin')")
            .await?;

        println!("Insert successful");
        Ok(())
    }

    #[tokio::test]
    async fn test_sql_exec_scalar() -> Result<(), Box<dyn std::error::Error>> {
        let count: i64 = sql_exec_scalar("SELECT COUNT(*) FROM users").await?;

        println!("User count: {}", count);
        Ok(())
    }
}
