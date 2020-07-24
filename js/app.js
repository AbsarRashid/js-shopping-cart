/*const client = contentful.createClient({ //Contentful Link Path
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "8crk4yyuyazn",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "UJq4-nvK1CQxrYluQWn48oXZ8MugDIwk4BLoo-_NC9k"
});*/
//console.log(client);

//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

let cart = [];
let buttonsDOM = [];
// Getting Poducts
class Products {
    async getProducts() { // Return the destructed needed array named productitem
        //async and await wait for the function to settle and then execute next lines of code
        try {
            // let contentful = await client.getEntries({ //Contentful Link Path
            //     content_type: 'comfyHouseProduct'
            // });
            //console.log(contentful);
            let results = await fetch("products.json"); // Fetching Data from local directory
            let data = await results.json(); // Retrieving Data from Json
            let productitem = data.items; //data.items; //Value of Object
            productitem = productitem.map(item => { //Getting new array by map() where we destructure the productarray and get the data needed
                //Destructuring Json Items
                const {
                    title,
                    price
                } = item.fields;
                const {
                    id
                } = item.sys;
                const images = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    images
                };
            });
            return productitem;
        } catch (error) {
            console.log(error);
        }

    }
}

// display products
class UI { // This class handles all the request and response of UI
    //Product from Json 
    displayProducts(products) { //Shows product. Returns HTML to the page with the data we received from products.getProducts()
        let result = "";
        //

        products.forEach(product => { //Looping the product to set value of each product
            result += `<article class = "product">
         <div class = "img-container" >
         <img src = ${product.images}
            alt = "product"
            class = "product-img">
                <button class = "bag-btn" data-id = ${product.id}>
                <i class = "fas fa-shopping-cart"></i>
            Add To Bag
                </button> </div> <h3> ${product.title} </h3> 
                <h4>$${product.price}</h4>
                </article>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() { //On Add to Cart Click What happens
        const buttons = [...document.querySelectorAll(".bag-btn")]; //Spread Operator as we don't know how many number of buttons and hold all the buttonaraay in here
        buttonsDOM = buttons; //Button Document Object Model
        buttons.forEach((button) => { //Looping button for accessing every button
            let id = button.dataset.id; //Get data from button (data-id)
            let inCart = cart.find((item) => item.id === id); //Check if cart array consist of the item of product clicked by id from data-id of button
            if (inCart) { // On Page Load Check if the cart array in local storage  has any of the item of the product
                buttons.innerHTML = "In Cart";
                buttons.disabled = true;
            }
            button.addEventListener('click', (event) => { //On Click Trigger
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                //Get product from all Products
                //Getting data from Local Storage filtering by Button ID      
                let cartItem = {
                    ...Storage.getProduct(id),
                    amount: 1
                };
                //add product to cart
                cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValue(cart);
                //display cart items
                this.addCartItem(cartItem);
                //show the cart
                this.showCart();
            });

        });
    }
    setCartValue(cart) {
        let temptotal = 0;
        let itemstotal = 0;
        cart.map(item => {
            temptotal += item.price * item.amount;
            itemstotal += item.amount;
        });
        cartTotal.innerText = parseFloat(temptotal.toFixed(2));
        cartItems.innerText = itemstotal;
    }
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<img src=${item.images} alt="Cart Product Image">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
                </div>`;
        cartContent.append(div);
        //console.log(cartContent);
    }
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    setupApp() {
        cart = Storage.getCart();
        this.setCartValue(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart); //We are not accessing anything within the class. So no arrow function. We are accessing the cartBtn and adding class
        closeCartBtn.addEventListener("click", this.hideCart); //We are not accessing anything within the class. So no arrow function. We are accessing the closeCartBtn and removing class
    }
    populateCart(items) {
        items.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic() {
        //Clear Cart Button
        clearCartBtn.addEventListener("click", () => { // Here we need to access the class. Thats why arrow function
            this.clearCart();
        });
        //Cart Functionality
        cartContent.addEventListener("click", event => { // Callback Function

            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                cartContent.removeChild(removeItem.parentElement.parentElement); //Removing From DOM
                this.removeItem(removeItem.dataset.id);
            }
            if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempitem = cart.find(item => item.id === id);
                tempitem.amount = tempitem.amount + 1; // Adding by 1 and Updating cart
                Storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerHTML = tempitem.amount;
            }
            if (event.target.classList.contains("fa-chevron-down")) {
                let lowAmount = event.target;
                let id = lowAmount.dataset.id;
                let tempitem = cart.find(item => item.id === id);
                tempitem.amount = tempitem.amount - 1; // Adding by 1 and Updating cart
                if (tempitem.amount === 0) {
                    cartContent.removeChild(lowAmount.parentElement.parentElement);
                    this.removeItem(id);
                } else {
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    lowAmount.previousElementSibling.innerHTML = tempitem.amount;
                }

            }
        });




    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class = "fas fa-shopping-cart"></i>
            Add To Bag`;


    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

//Local Storage
class Storage { //Stores Data in Browser Cache
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products)); //Setting items of key: products and value: named products type {object}, To make the Json object string Json.stringify
    }
    static getProduct(id) { //Check if the button clicked product is already present in the cart
        let products = JSON.parse(localStorage.getItem("products")); //Local storage always recive strings. To convert back to Json.. we use Json.parse
        return products.find((product) => product.id === id); //Check Process tthrough Array Function

    }
    static saveCart(cartitems) {
        localStorage.setItem("cart", JSON.stringify(cartitems));
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => { //What happens when DOM Loads
    const ui = new UI(); // Create instance of UI Class 
    const products = new Products(); // Create instance of product Class 
    //Setup Application
    ui.setupApp();
    //get all products
    products.getProducts().then(products => {
        /*.then is used to finish one call and get to the next. Here We get the produt from local directory using products class and after recceiving
                the data, we send it to UI for showing it to the user at the same time we save the data to local storge and after the whole process finishes we again go to then() for button 
                and checck if any product in the display is in the cart and all also initiate what happens if a button is clicked*/
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });

});