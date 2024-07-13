

async function isStockAvail(button,size,variantId) {

   const index = button.getAttribute('data-index')
   const input = document.getElementById(`quantity-${index}`)
   let previouscount = input.value
   let currentCount = parseInt(input.value)
   const buttons = document.querySelectorAll('.quickview__value--quantity')


    
   if(currentCount==5 && button.id==`increase${index}`){
      Swal.fire("increasing limit exeeded");
      return
    }

    if(currentCount==1 && button.id==`decrease${index}`){
      Swal.fire("decreasing limit exeeded");
      return
    }

   if(currentCount!==5 && button.id==`increase${index}` || currentCount!==1 && button.id==`decrease${index}`){
    
    buttons.forEach(button =>{
      button.disabled = true 
    })


    if(button.id==`increase${index}`){
      currentCount+=1 
      console.log(currentCount)
   }

   if(button.id==`decrease${index}`){
     currentCount --
     console.log(currentCount)
   }
   

   
   const response = await fetch(`/isStockAvailableinVariantStock`,{
     method:'PATCH',
     headers:{
        'Content-Type':'application/json'
     },
     body:JSON.stringify({
        size,
        variantId,
        currentCount
     })
   })


   const data = await response.json()

   const productrow = document.getElementById(`product-row-${index}`)
   const totalfield = productrow.querySelector('#total')
   // const price = parseInt(productrow.querySelector('#total').innerHtML)

   if(!data.success){
       
      if(data.message === 'stockless'){
         input.value = data.currentStock
         // Swal.fire(`Sorry, we only have ${data.currentStock} the available quantity will updated in your cart`);

         Swal.fire({
            icon: 'warning',
            title: 'Limited Stock Available',
            text: `We currently have only ${data.currentStock} units of this item in stock.`,
            footer: 'Your cart will be updated with the available quantity.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
            showCloseButton: true,
            customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                footer: 'custom-swal-footer'
            }
        });
   

         buttons.forEach(button =>{
            button.disabled = false 
         })

         return
      }
      
      input.value = previouscount
       
      
      if(productrow){
         
          const cartcontent = productrow.querySelector('.cart__content')
          const cart__tablebodyList = productrow.querySelectorAll('.cart__table--body__list')

          if(cartcontent && cart__tablebodyList ){
              
            const contentChildren = Array.from(cartcontent.children)
            contentChildren.forEach(child => {
               if(!child.matches('h4')){
                  child.style.display = 'none'
               }
            })

            cart__tablebodyList.forEach((tableData,index) => {
             console.log(tableData)
             if(index!=0){
               tableData.style.display = 'none'
             }

            })
 
            const productspan = document.createElement('span')
            productspan.className = 'text-danger'
            productspan.textContent = `This product is currenctly out of stock.`
            
            cartcontent.appendChild(productspan)

               
            const td = document.createElement('td');
            td.className = 'cart__table--body__list';
            td.colSpan = '3';
            const span = document.createElement('span');
            span.className = 'text-danger';
            span.textContent = 'Product details not available.';
            td.appendChild(span);

            productrow.appendChild(td);

            buttons.forEach(button =>{
               button.disabled = false 
             })
   
          }

         

      }

   }
   else{

      buttons.forEach(button =>{
         button.disabled = false 
      })
      input.value = currentCount 
      totalfield.textContent = '₹'+ data.variant.quantity * data.variant.variantPrice

      calculateTotals();

   }


   }

    
}



function removeCartItem(variantId, variantSize, rowId) {
   Swal.fire({
       title: "Are you sure?",
       text: "You won't be able to revert this!",
       icon: "warning",
       showCancelButton: true,
       confirmButtonColor: "#3085d6",
       cancelButtonColor: "#d33",
       confirmButtonText: "Yes, delete it!"
   }).then((result) => {
       if (result.isConfirmed) {
           // Proceed with deleting the cart item
           fetch('/cart', {             
               method: 'DELETE',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ variantId, variantSize })
           })
           .then(response => response.json())
           .then(data => {
               if (data.success) {
                   // Remove the item row from the cart
                   const row = document.getElementById(rowId);
                   if (row) {
                       row.remove();
                       calculateTotals();
                   }
                   // Show success message
                   Swal.fire({
                       title: "Deleted!",
                       text: "Your file has been deleted.",
                       icon: "success"
                   });
               } else {
                   // Handle different error messages
                   if (['JWTvulnerable', 'notfound', 'blocked', 'nojwt'].includes(data.message)) {
                       window.location.href = '/signIn';
                       return;
                   }
                   console.error('Failed to delete the item from the cart:', data.message);
                   alert('Failed to remove the item from the cart.');
               }
           })
           .catch(error => {
               console.error('Error:', error);
               alert('An error occurred while removing the item from the cart.');
           });
       }
   });
}






