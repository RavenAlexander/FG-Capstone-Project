import React, {createContext, useState} from 'react'
// import all_product from '../Components/assets/all_product' // This is sample data
import { useEffect } from 'react';

export const ShopContext = createContext(null);

const getDefaultCart = ()=> { // You can have a max of 300 cart items
    let cart = {};
    for (let index = 0; index < 300+1; index++) {
        cart[index] = 0;
    } return cart;
}

// const getDefaultCart = ()=> { // This is commented out because it is only used with the sample data for testing
//     let cart = {};
//     for (let index = 0; index < all_product.length+1; index++) {
//         cart[index] = 0;
//     } return cart;
// }

const ShopContextProvider = (props) => {
    const [all_product, setAll_Product] = useState([]);
    const [cartItems, setCartItems] = useState(getDefaultCart());

    useEffect(() => { // This pulls from the backend database
        fetch('http://localhost:4000/allproducts')
        .then((response) => response.json())
        .then((data) => setAll_Product(data))

        if(localStorage.getItem('auth-token')) { 
            fetch('http://localhost:4000/getcart', { 
                method: 'POST',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem("auth-token")}`,
                    'Content-Type' : 'application/json',
                },
                body: "",
            }).then((response) => response.json())
            .then((data) => setCartItems(data));
        }
    }, [])
    
    const addtoCart = (itemId) => {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        // console.log(cartItems); - for testing
        if(localStorage.getItem('auth-token')) { //if the user is logged in, the rest will happen
            fetch('http://localhost:4000/addtocart', {
                method: 'PUT',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem("auth-token")}`,
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({"itemId": itemId})
            })
            .then((response) => response.json())
            .then((data) => console.log(data));
        }
    }
    
    const removeFromCart = (itemId) => {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
        if(localStorage.getItem('auth-token')) { //if the user is logged in, the rest will happen
            fetch('http://localhost:4000/removefromcart', {
                method: 'DELETE',
                headers: {
                    Accept: 'application/form-data',
                    'auth-token': `${localStorage.getItem("auth-token")}`,
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({"itemId": itemId})
            })
            .then((response) => response.json())
            .then((data) => console.log(data));
        }
    }
    
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems)
            { 
                if(cartItems[item]>0)
                    {
                        let itemInfo = all_product.find((product)=>product.id===Number(item))
                        totalAmount += itemInfo.new_price * cartItems[item];
                    }
                }
                return totalAmount;
    }

    const getTotalCartItems = () => {
        let totalItem = 0;
        for(const item in cartItems)
            {
                if(cartItems[item]>0)
                    {
                        totalItem += cartItems[item];
                    }
            }
            return totalItem;
    }

    const contextValue = {getTotalCartItems, getTotalCartAmount, all_product, cartItems, addtoCart, removeFromCart} //This allows me to use the cartItems data from any component
    return (
        <ShopContext.Provider value={contextValue} key={props.children}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider