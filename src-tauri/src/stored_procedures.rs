pub mod stored_procedures {
    use crate::sqlclient::sqlclient::sql_exec_non_query;


    pub async fn create_procedure(name:String,params:Vec<(String,String)>,body:String) {

        let mut command = "CREATE PROCEDURE ".to_string();
        command.push_str(name.as_str());
        command.push('(');
        for (param_name,param_type) in params {
            command.push_str(format!("{} {}",param_name,param_type).as_str());
        }
        command.push(')');
        command.push_str(" LANGUAGE SQL ");
        command.push_str("AS $$ \n");
        command.push_str(&body);
        command.push_str("$$");

        let _ = sql_exec_non_query(&command).await;
    }


    #[cfg(test)]
    mod test {
        use super::*;
        #[tokio::test]
        pub async fn test_create() {

        }
    }
}