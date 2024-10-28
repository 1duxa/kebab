#[allow(dead_code,deprecated)]
pub mod product {
    use std::{fs::{self, File}, io::Read, path::PathBuf};
    use crate::sqlclient::sqlclient::{sql_exec, sql_exec_non_query};
    use base64;
    use serde::Serialize;
    use sqlx::prelude::FromRow;
    
    #[derive(FromRow,Debug,Serialize)]
    pub struct ProductEntity {
        pub product_id:i64,
        pub product_name: String,
        pub description: String,
        pub image: Vec<u8>,
        pub price: i32,
    }
    impl Default for  ProductEntity{
        fn default() -> Self {
            Self {product_id:0, product_name: "default".into(), description: "default".into(), image: Vec::new(),price: 0 }
        }
    }
    pub async fn load_image_from_path_to_db(path: PathBuf, product: ProductEntity) {
        
        let mut image = Vec::new();
        if let Err(e) = File::open(&path)
            .and_then(|mut file| file.read_to_end(&mut image))
        {
            eprintln!("Error reading image file: {:?}", e);
            return;
        }

        let image_str = base64::encode(&image);
        
        let command = format!(
            "
            INSERT INTO 
                PRODUCTS(
                    PRODUCT_NAME,
                    IMAGE,
                    IS_AVAILIABLE,
                    PRICE
                ) 
            VALUES ('{}', decode('{}', 'base64'), true, {})
            ",
            product.product_name.replace("'", "''"),
            image_str,
            product.price
        );
        
        if let Err(e) = sql_exec_non_query(&command).await {
            eprintln!("Error executing SQL command: {:?}", e);
        }
    }
    pub async fn load_all_from_folder_to_db(path:&str) -> Result<(),String> {
        let paths = fs::read_dir(path).expect("Bad path");

        for path in paths{
            load_image_from_path_to_db(path.expect("could not unwrap path").path(), ProductEntity::default()).await;
        }
        Ok(())
    }
    pub async fn get_products(where_statment:&str) -> Vec<ProductEntity>{
         sql_exec::<ProductEntity>(
            format!("
                        SELECT PRODUCT_ID,PRODUCT_NAME,description,image,price 
                        FROM PRODUCTS 
                        WHERE {}",where_statment).as_str())
            .await.expect("bad where statment or err")
    }


}

#[cfg(test)]
mod tests {
    use crate::product::product::{get_products, load_all_from_folder_to_db};

    use super::product::{load_image_from_path_to_db, ProductEntity};
    use tokio;
    
    #[tokio::test]
    async fn test_load_image_from_path_to_db() {
        let path = "/home/duxa/Зображення/Doner.webp";
        
        let product = ProductEntity {
            product_id:0,
            product_name: "Чотири сири Мікс донер кебаб".to_string(),
            description: "Хрусткий лаваш, соус білий на основі йогурту та сирний соус, мікс салату, мікс сирів, помідор, синя цибуля, огірок маринований, куряче м’ясо, теляче м’ясо.".to_string(),
            image: Vec::new(), 
            price: 0,
        };        
        load_image_from_path_to_db(std::path::PathBuf::from(path), product).await;
    }
    #[tokio::test]
    async fn test_load_dir_from_path_to_db() {
        let path = "/home/duxa/Зображення/kebab_images";
        let _  = load_all_from_folder_to_db(path).await;
    }
    #[tokio::test]
    async fn test_get_products() {

        let res  = get_products("product_id = 3").await;
        println!("{:#?}",res);

    }
}
