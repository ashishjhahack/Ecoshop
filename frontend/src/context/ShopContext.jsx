import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets";       // Now we have dynamic data
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = '10';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});

    const [products, setProducts] = useState([]);     // Now we have dynamic product

    const [token, setToken] = useState('')

    const navigate = useNavigate();

    const addToCart = async (itemId, size) => {
        if (!itemId) {
            toast.error('Product ID is missing');
            return;
        }
        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        setCartItems((prev) => {
            const newCart = { ...prev };
            if (!newCart[itemId]) {
                newCart[itemId] = {};
            }
            newCart[itemId][size] = (newCart[itemId][size] || 0) + 1;
            return newCart;
        });

        if (token) {
            try {
                await axios.post(`${backendUrl}/api/cart/add`, { itemId, size }, { headers: { token } });
                toast.success('Cart added successfully');
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    };


    // useEffect(() => {
    //     console.log(cartItems)
    // },[cartItems])

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        setCartItems((prev) => {
            const newCart = { ...prev };
            if (!newCart[itemId]) newCart[itemId] = {};
            newCart[itemId][size] = quantity;
            return newCart;
        });

        if (token) {
            try {
                await axios.post(`${backendUrl}/api/cart/update`, { itemId, size, quantity }, { headers: { token } });
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    };


    const getCartAmount = () => {
        let totalAmt = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmt += itemInfo.price * cartItems[items][item];   // multiply product price and quantity
                    }
                }
                catch (error) {

                }
            }
        }
        return totalAmt;
    }


    const getProductsData = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/list`)
            if (response.data.success) {
                setProducts(response.data.products)
            }
            else {
                toast.error(response.data.message);
            }
        }
        catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const getUserCart = async (token) => {     // Whenever we reload the webpage it still show the cart
        try {
            const res = await axios.post(`${backendUrl}/api/cart/get`, {}, { headers: { token } })
            if (res.data.success) {
                setCartItems(res.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message);
        }

    }
    useEffect(() => {
        getProductsData();
    }, [])

    useEffect(() => {     // now if we reload the webpage login is still available
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'));    // if we reload the webpage cart is still available
        }
    }, [])

    const value = {        // this things we can access it any other components
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart,setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl,
        token, setToken
    }
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}
export default ShopContextProvider;