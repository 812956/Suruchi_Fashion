
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Swiper instances
    function initializeSwipers() {
        window.swiperPreview = new Swiper('.product__media--preview.swiper-container', {
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            // other Swiper configurations...
        });

        window.swiperNav = new Swiper('.product__media--nav.swiper-container', {
            slidesPerView: 3,
            spaceBetween: 10,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            // other Swiper configurations...
        });
    }

    // Initialize Swiper instances
    initializeSwipers();

    // Initialize GLightbox
    let lightbox = GLightbox({
        selector: '.glightbox'
    });

    // Function to update Swiper images
    async function selectedVariatImages(color, productId) {
        console.log(color, productId);

        const response = await fetch('/variantColorImages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ color, productId })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Update Swiper slides
            updateSwiperImages(data.variantImages.images,data.variantImages.sizes,data.variantImages.stocks);
           

        } else {
            console.error('Failed to fetch variant images');
        }
    }

    function updateSwiperImages(images,sizes,stocks) {
        const swiperWrapperPreview = document.querySelector('.product__media--preview .swiper-wrapper');
        const swiperWrapperNav = document.querySelector('.product__media--nav .swiper-wrapper');
        const productsColorDetails = document.querySelector('#sizes .variant__input--fieldset');



        if (!swiperWrapperPreview || !swiperWrapperNav) {
            console.error('Swiper wrappers not found');
            return;
        }

        // Clear existing slides
        swiperWrapperPreview.innerHTML = '';
        swiperWrapperNav.innerHTML = '';
        productsColorDetails.innerHTML = '';


        // Add new slides
        images.forEach(image => {
            const slidePreview = document.createElement('div');
            slidePreview.classList.add('swiper-slide');
            slidePreview.innerHTML = `
                <div class="product__media--preview__items">
                    <a class="product__media--preview__items--link glightbox" data-gallery="product-media-preview" href="${image}">
                        <img class="product__media--preview__items--img" src="${image}" alt="product-media-img">
                    </a>
                </div>
            `;
            swiperWrapperPreview.appendChild(slidePreview);

            const slideNav = document.createElement('div');
            slideNav.classList.add('swiper-slide');
            slideNav.innerHTML = `
                <div class="product__media--nav__items">
                    <img class="product__media--nav__items--img" src="${image}" alt="product-nav-img">
                </div>
            `;
            swiperWrapperNav.appendChild(slideNav);
        });

        let legentElement = document.createElement('legend')
        legentElement.classList.add('variant__input--fieldset','mb-8')
        legentElement.textContent = 'Available Sizes :'
        legentElement.style.fontWeight = 'bold';
        
        productsColorDetails.appendChild(legentElement)
            
        // Add new sizes
        sizes.forEach((size,index) => {
            
            if(stocks[index]!==0){
            const input = document.createElement('input')
            input.id = size
            input.name = 'sizes'
            input.type = 'radio'
            input.value = size

            const label = document.createElement('label')
            label.className = `variant__size--value red` 
            label.htmlFor = size;
            label.title = size;
            label.textContent = size;

            productsColorDetails.appendChild(input)
            productsColorDetails.appendChild(label)
                
            }

        })

        
        
        // Update Swiper instances
        window.swiperPreview.update();
        window.swiperNav.update();

        // Reinitialize GLightbox
        lightbox.destroy();
        lightbox = GLightbox({
            selector: '.glightbox'
        });
    }

    // Attach the function to the global scope if needed
    window.selectedVariatImages = selectedVariatImages;
});


async function addToCart(productName,productId){
    
    // let selectedColor = document.querySelector("input[name=color]:checked")?.value
    let queryString = window.location.search
    let urlParams = new URLSearchParams(queryString);
    let color = urlParams.get('color');
    console.log(color)
    let selectedColor = color
    let selectedSize = document.querySelector("input[name=sizes]:checked")?.value
    let productPrice = document.getElementById('productPrice').innerHTML

    let isValid = true

    if(!selectedColor){
        Swal.fire("please Select a color!");
        isValid = false
       return  
    }
    if(!selectedSize){
        Swal.fire("please Select a size!");
        isValid = false
       return 
    }
    
    productPrice = productPrice.split('').filter((x)=> x!='₹').join('')

    console.log(selectedColor,selectedSize,productName,productPrice)

  if(isValid){
    const response = await fetch('/cart',{
        method:'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify({
            productName,
            selectedColor,
            selectedSize,
            productPrice ,
            productId
        })
    })
    
   
 
    const data = await response.json()

    console.log(data.message)

    // if(response.status===403&&data.message){
     
    //     Swal.fire(data.message)
    //     .then(result => {
    //         if(result.isConfirmed){
    //             window.location.reload()
    //         }
    //     })
       
    //    return
    // }
    // if(response.status===403){
    //     window.location.href = '/signUp'
    // }

    
    if(data.success){
        Swal.fire({
            title: data.message,
          
            showCancelButton: true,
            confirmButtonText: "Ok",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
               window.location.href = '/cart'
            }
          });
    }else if(data.success===false){


        if(data.message=='JWTvulnerable' ||data.message=='notfound' || data.message=='blocked' || data.message=='nojwt' ){
         
            window.location.href = '/signIn'
          return
         }

        Swal.fire({
            position: "top-end",
            icon: "info",
            title: data.message,
            showConfirmButton: false,
            timer: 1800
          }); 
    }

  }
   
}




    function addToWishlist(productName,productId) {
    // Perform actions to add productId to the user's wishlist
    // Example: You can use fetch API to send a request to your backend

      
    // let selectedColor = document.querySelector("input[name=color]:checked")?.value
    let queryString = window.location.search
    let urlParams = new URLSearchParams(queryString);
    let color = urlParams.get('color');
    console.log(color)
    let selectedColor = color
    let selectedSize = document.querySelector("input[name=sizes]:checked")?.value
    let productPrice = document.getElementById('productPrice').innerHTML

    let isValid = true

    if(selectedColor==null){
        Swal.fire("please Select a color!");
        isValid = false
       return  
    }
    if(!selectedSize){
        Swal.fire("please Select a size!");
        isValid = false
       return 
    }
    
    productPrice = productPrice.split('').filter((x)=> x!='₹').join('')

    
    Swal.fire("Do you want add this product in to wishList")
    .then((result)=>{
        
        if(result.isConfirmed){
            console.log('hello') 

        fetch('/wishList/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productName,
            selectedColor,
            selectedSize,
            productPrice ,
            productId
        }),
    })
    .then(response => {
        if (!response.ok) {
            Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Product is already in the wishList!",
                    
                    });
            throw new Error('Failed to add to wishlist');
        }

        Swal.fire({
                    // icon: "error",
                    title: "Oops...",
                    text: "Product added successfully!",
                    
                    });
        // Optionally, update UI to indicate success (e.g., change button color or text)
        console.log('Product added to wishlist successfully');
    })
    .catch(error => {
        console.error('Error adding product to wishlist:', error);
        // Handle error - display error message to the user, etc.
    });

        }

    })
        
    

}


async function addToCartWishList(productName,productId,selectedColor,selectedSize,productPrice){
    

  console.log('hello world how are you ')
    console.log(selectedColor,selectedSize,productName,productPrice)

 
    const response = await fetch('/cart',{
        method:'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify({
            productName,
            selectedColor,
            selectedSize,
            productPrice ,
            productId
        })
    })
    
   
 
    const data = await response.json()

    console.log(data.message)

    // if(response.status===403&&data.message){
     
    //     Swal.fire(data.message)
    //     .then(result => {
    //         if(result.isConfirmed){
    //             window.location.reload()
    //         }
    //     })
       
    //    return
    // }
    // if(response.status===403){
    //     window.location.href = '/signUp'
    // }

    
    if(data.success){
        Swal.fire({
            title: data.message,
          
            showCancelButton: true,
            confirmButtonText: "Ok",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
               window.location.href = '/cart'
            }
          });
    }else if(data.success===false){


        if(data.message=='JWTvulnerable' ||data.message=='notfound' || data.message=='blocked' || data.message=='nojwt' ){
         
            window.location.href = '/signIn'
          return
         }

        Swal.fire({
            position: "top-end",
            icon: "info",
            title: data.message,
            showConfirmButton: false,
            timer: 1800
          }); 
    }

  }
   






async function showCartDetails() {
    
    const response = await fetch('/viewCartinProduct')
    const data = await response.json()

    
    if(data.success ){
        
        
        const cartData = data.cartItems
        console.log(cartData)
        const cartContainer = document.querySelector('.minicart__product');
        cartContainer.innerHTML = ''; // Clear existing content
    
        cartData.products.forEach(product => {
            console.log(product)
            const productItem = document.createElement('div');
            productItem.classList.add('minicart__product--items', 'd-flex');
            productItem.innerHTML = `
                <div class="minicart__thumb">
                    <a href="product-details.html"><img src="${product.variantId.images[0]}" alt="product-img"></a>
                </div>
                <div class="minicart__text">
                    <h3 class="minicart__subtitle h4"><a href="product-details.html">${product.productName}</a></h3>
                    <span class="current__price"><b>Price: </b>$${product.variantPrice}</span>
                    <span class="color__variant"><b>Color: </b>${product.variantColor}</span>
                    <div class="minicart__price">
                    <span class="current__price"><b>Size: </b>${product.variantSize}</span>
                        <span class="current__price"><b>Quant: </b>${product.quantity}</span>
                    </div>
                </div>
            `;
            cartContainer.appendChild(productItem);
        });
    
        // Update the cart total amounts
        // document.querySelector('.minicart__amount_list span:nth-child(2) b').textContent = `$${cartData.subTotal.toFixed(2)}`;
        // document.querySelector('.minicart__amount_list:nth-child(2) span:nth-child(2) b').textContent = `$${cartData.total.toFixed(2)}`;
    }
    
    else if(!data.success){
        const cartHeader =  document.querySelector('.minicart__header--desc')
        cartHeader.textContent = data.message
        cartHeader.style.color = 'red'
    }

}



