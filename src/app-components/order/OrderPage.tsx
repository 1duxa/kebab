import { useEffect, useState } from "react";
import { useToast } from "../../components/ToastProvider";
import { invoke } from "@tauri-apps/api/core";
import './OrderPage.css';  // Import the CSS file

class ProductEntity {
    product_id: number | any;
    product_name: string | any;
    description: string | any;
    image: Int8Array | any;
    price: number | any;
}

interface OrderItem {
    product: ProductEntity;
    quantity: number;
}
class Order {
    product_id: number | any;
    price: number | any;
    quantity: number | any;
}
const int8ArrayToBase64 = (int8Array: Int8Array): string => {
    const bytes = new Uint8Array(int8Array);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return window.btoa(binary);
};

export default function OrderPage() {
    const [products, setProducts] = useState<ProductEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const { showMessage } = useToast();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            showMessage("Fetching products...");
            const data: ProductEntity[] = await invoke('get_products_where', { whereStatment: "is_availiable = true" });
            setProducts(data);
        } catch (error) {
            showMessage("Error fetching products: " + error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToOrder = (product: ProductEntity) => {
        setOrderItems(prevItems => {
            const existingItem = prevItems.find(item => item.product.product_id === product.product_id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.product.product_id === product.product_id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevItems, { product, quantity: 1 }];
            }
        });
    };

    const handleRemoveFromOrder = (product: ProductEntity) => {
        setOrderItems(prevItems =>
            prevItems
                .map(item => 
                    item.product.product_id === product.product_id && item.quantity > 1 
                        ? { ...item, quantity: item.quantity - 1 } 
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    };

    const calculateTotalPrice = () => {
        return orderItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
    };

    const handlePlaceOrder = async () => {
        const orderData:Order[] = orderItems.map(item => ({
            product_id: item.product.product_id as number,
            price: item.product.price as number,
            quantity: item.quantity as number,
        }));
        
        try {
            const loginName:string | null = localStorage.getItem("loginName");

            await invoke('place_order', { products: orderData,total:calculateTotalPrice(), user:  loginName?.toString()});
            showMessage("Order placed successfully!");
            setOrderItems([]);
        } catch (error) {
            showMessage("Error placing order: " + error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="order-container">
            <div>
                <h2>Available Products</h2>
                {loading && <p>Loading...</p>}
                {!loading && (
                    <div className="product-list">
                        {products.map(product => (
                            <div key={product.product_name} className="product">
                                <img src={`data:image/png;base64,${int8ArrayToBase64(product.image)}`} alt={product.product_name} />
                                <h3>{product.product_name}</h3>
                                <p>{product.description}</p>
                                <p>Price: ${product.price}</p>
                                <button onClick={() => handleAddToOrder(product)}>+</button>
                                <button onClick={() => handleRemoveFromOrder(product)}>-</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="order-summary">
                <h2>Your Order</h2>
                <ul className="order-list">
                    {orderItems.map(item => (
                        <li key={item.product.product_name}>
                            {item.product.product_name} - {item.quantity} x ${item.product.price}
                        </li>
                    ))}
                </ul>
                <p className="order-total">Total: ${calculateTotalPrice()}</p>
                <button 
                    onClick={handlePlaceOrder} 
                    className="place-order-button" 
                    disabled={orderItems.length === 0}>
                    Place Order
                </button>
            </div>
        </div>
    );
}
