import Slider from 'react-slick';
import './Carousel.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../ToastProvider';

class ProductEntity {
    product_name: string | any;
    description: string | any;
    image: Int8Array | any;
    quantity: string | any;
}

const int8ArrayToBase64 = (int8Array: Int8Array): string => {
    const bytes = new Uint8Array(int8Array);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return window.btoa(binary);
};

const Carousel = () => {
    const [products, setProducts] = useState<ProductEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCarousel, setShowCarousel] = useState(false);
    const { showMessage } = useToast();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            showMessage("Fetching products...");
            const data: ProductEntity[] = await invoke('get_products_where', { whereStatment: "product_id in (1,2,4)" });
            setProducts(data);
            setLoading(false);
            setShowCarousel(true);
        } catch (error) {
            showMessage("Error fetching products: " + error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnFocus: false,
        pauseOnHover: true,
        appendDots: (dots: React.ReactNode) => (
            <div>
                <ul style={{ margin: "0px", padding: "0px" }}>{dots}</ul>
            </div>
        ),
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            }
        ]
    };

    return (
        <div>
            {loading && <div>Loading...</div>}
            {showCarousel && (
                <div className="full-width-carousel">
                    <Slider {...settings}>
                        {products.map((product) => (
                            <div className="full-width-slide" key={product.product_name}>
                                <img
                                    src={`data:image/jpeg;base64,${int8ArrayToBase64(product.image)}`}
                                    alt={product.product_name}
                                    className="slide-image"
                                />
                                <div className="slide-content">
                                    <h2>{product.product_name}</h2>
                                    <p>{product.description}</p>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
        </div>
    );
};

export default Carousel;
