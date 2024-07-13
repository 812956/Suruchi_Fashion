
async function submitAddress() {

  const fullname = document.getElementById('fullname').value
  const mobile = document.getElementById('mobile').value
  const altmobile = document.getElementById('alt-mobile').value
  const locality = document.getElementById('locality').value
  const address = document.getElementById('useraddress').value
  const City = document.getElementById('City/District').value
  const landmark = document.getElementById('landmark').value
  const userState = document.getElementById('userState').value
  const postCode = document.getElementById('postcode').value


   const nameRegex = /^[a-zA-Z](?:\s{0,2}[a-zA-Z])*$/;
   const mobileRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[789]\d{9}$/;
   const altmobileRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[789]\d{9}$/;
   const localityRegex = /^(?!^\d+$)[a-zA-Z0-9,'.\s-]+$/;
   const addressRegex = /^[0-9]+(?:[a-zA-Z\s]+|[a-zA-Z\s]+\s[a-zA-Z\s]+)?,\s?[a-zA-Z\s]+,\s?[a-zA-Z]+\s?[0-9]+$/;
   const cityRegex = /^(?![\s\d])(?!.*\s{3,})[a-zA-Z'-]+$/;
   const landmarkRegex = /^(?![\s\d])(?!.*\s{3,})[a-zA-Z\d'.,-]+(?<!\s)$/;
   const stateRegex = /^(?![\s\d])(?!.*\s{3,})[a-zA-Z'-]+(?<!\s)$/;
   const zipcodeRegex = /^(?!.*\s)[0-9]{6}(?:-[0-9]{6})?$(?<!\s)/;

   let isValid = true


   


   if (!nameRegex.test(fullname)) {
    showError('name-error', "Name can only contain letters and may include up to two spaces between words.");
    isValid = false;
    return
    } else {
        hideError('name-error');
    } 

   if (!mobileRegex.test(mobile)) {
    showError('mobile-error', "Mobile number must be a valid 10-digit number starting with 7, 8, or 9, and may include a country code.");
    isValid = false;
    return
    } else {
        hideError('mobile-error');
    } 
   
    if (!altmobileRegex.test(altmobile)&&altmobile!='') {
    showError('altmobile-error', "Alternate mobile number must be a valid 10-digit number starting with 7, 8, or 9, and may include a country code.");
    isValid = false;
    return 
    } else {
        hideError('altmobile-error');
    } 


   if (!localityRegex.test(locality)) {
    showError('locality-error', "Locality can only contain letters, numbers, commas, apostrophes, periods, spaces, and hyphens.");
    isValid = false;
    return
    } else {
        hideError('locality-error');
    } 
    
   if (!addressRegex.test(address)) {
    showError('address-error', "Address should start with a number and be followed by valid words, optionally separated by commas and spaces.");
    isValid = false;
    return
    } else {
        hideError('address-error');
    } 
   if (!cityRegex.test(City)) {
    showError('city-error', "City name can only contain letters, apostrophes, and hyphens, with no more than two spaces between words.");
    isValid = false;
    return
    } else {
        hideError('city-error');
    } 

   if (!landmarkRegex.test(landmark)) {
    showError('landmark-error',  "Landmark can only contain letters, numbers, apostrophes, periods, commas, and hyphens, without starting or ending with spaces.");
    isValid = false;
    return
    } else {
        hideError('landmark-error');
    } 
    
   if (!stateRegex.test(userState)) {
    showError('state-error',"State name can only contain letters, apostrophes, and hyphens, without starting or ending with spaces.");
    isValid = false;
    return
    } else {
        hideError('state-error');
    } 

   if (!zipcodeRegex.test(postCode)) {
    showError('zipcode-error', "Zip code must be a valid 6-digit number and may optionally include a hyphen followed by another 6-digit number.");
    isValid = false;
    return
    } else {
        hideError('zipcode-error');
    } 


    if(isValid){
       try{
        const response =  await fetch('/user_profile/add_address',{
            method:'POST',
            headers:{
                'Content-Type' :'application/json'
            },
            body:JSON.stringify({fullname,mobile,altmobile,locality,address,City,landmark,userState,postCode})

        })

        const data = await response.json()
        if(data.success){
           
            const result =  await Swal.fire({
                title: "Good job!",
                text: "You clicked the button!",
                icon: "success"
            })

            if(result.isConfirmed){
                
                const addressData = data.savedAddress
                const userEmail = data.userEmail

                const eleAddress = document.getElementById('v-pills-address')
                
                const newAddressElement = document.createElement('div')
                newAddressElement.classList.add('col-md-6')
                newAddressElement.style.marginBottom = '18px'
                newAddressElement.setAttribute('id',addressData._id)
                newAddressElement.innerHTML = `<div>
                <div class="seller-info">
                    <h5 class="heading">Address</h5>
                    <div class="info-list">
                        <div class="info-title">
                        <p>Name:</p>
                        <p>Email:</p>
                        <p>Phone:</p>
                        <p>City:</p>
                        <p>Locality:</p>
                        <p>Location:</p>
                        <p>Zip:</p>
                        </div>
                        <div class="info-details">
                            <p id="${addressData._id}adname" >
                              ${addressData.fullName}
                            </p>
                            <p id="${addressData._id}admail" >
                              ${userEmail.email}
                            </p>
                            <p id="${addressData._id}admbile" >
                              ${addressData.mobile}, ${addressData.altMobile? addressData.altMobile : ''}
                            </p>
                            <p id="${addressData._id}adlocality" >${addressData.city}</p>
                            <p id="${addressData._id}adcity" >${addressData.locality}</p>
                            <p id="${addressData._id}adaddress" >
                               ${addressData.address}
                            </p>
                            <p id="${addressData._id}pincode" >
                               ${addressData.pinCode}
                            </p>
                        </div>
                    </div>
                    <div
                        class="button-group d-flex justify-content-end align-items-end mt-3">
                        <button class="btn btn-primary btn-lg mr-2"
                        onclick="modalAction('.edit');giveDataToedit('${addressData.fullName}','${addressData.mobile}','${addressData.altMobile}','${addressData.locality}','${addressData.city}','${addressData.state}','${addressData.landMark}','${addressData.address}','${addressData.pinCode}','${addressData._id}')">
                            <i class="fas fa-plus"></i> Edit
                        </button>
                        <div class="w-100"></div>
                       
                        <button class="btn btn-danger btn-lg delete-button" data-address-id="${addressData._id}">
                        <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </div>
            </div>`
                          
             
            document.getElementById('addressContainer').appendChild(newAddressElement)

            }
            

        }else{
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message
            });
        }
       }
       catch(error){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Somthing went wrong please try again later'
        }); 
       }
    }



    function showError(errorId, message) {
        let errorElement = document.getElementById(errorId);
        errorElement.textContent = message;
    }

    function hideError(errorId) {
        let errorElement = document.getElementById(errorId);
        errorElement.textContent = '';
    }

}


async function giveDataToedit(name,mobile,altmobile,locality,city,state,landMark,address,pincode,addressId){
   
   document.getElementById('editname').placeholder = name
   document.getElementById('editmobile').placeholder = mobile
   document.getElementById('editalt-mobile').placeholder = altmobile
   document.getElementById('editlocality').placeholder = locality
   document.getElementById('edituseraddress').placeholder = address
   document.getElementById('editCity/District').placeholder = city
   document.getElementById('editlandmark').placeholder = landMark
   document.getElementById('edituserState').value = state
   document.getElementById('editpostcode').placeholder = pincode

  const input =  document.getElementById('hiddenField').value = addressId
  document.getElementById('hiddenField').placeholder = state
  
}

 
async function editsubmitAddress(){
    const fullname =  document.getElementById('editname').value
    const editmobile = document.getElementById('editmobile').value
    const editaltmobile = document.getElementById('editalt-mobile').value
    const editlocality = document.getElementById('editlocality').value
    const editaddress = document.getElementById('edituseraddress').value
    const editcity = document.getElementById('editCity/District').value
    const editlandmark = document.getElementById('editlandmark').value
    const edituserState = document.getElementById('edituserState').value
    const editpostCode = document.getElementById('editpostcode').value
    const hiddenAddressId = document.getElementById('hiddenField').value
    const oldState = document.getElementById('hiddenField').placeholder
 
 
    const nameRegex = /^[a-zA-Z](?:\s{0,2}[a-zA-Z])*$/;
    const mobileRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[789]\d{9}$/;
    const altmobileRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[789]\d{9}$/;
    const localityRegex = /^(?!^\d+$)[a-zA-Z0-9,'.\s-]+$/;
    const addressRegex = /^[0-9]+(?:[a-zA-Z\s]+|[a-zA-Z\s]+\s[a-zA-Z\s]+)?,\s?[a-zA-Z\s]+,\s?[a-zA-Z]+\s?[0-9]+$/;
    const cityRegex = /^(?![\s\d])(?!.*\s{3,})[a-zA-Z'-]+$/;
    const landmarkRegex = /^(?![\s\d])(?!.*\s{3,})[a-zA-Z\d'.,-]+(?<!\s)$/;
    const stateRegex = /^(?![\s\d])(?!.*\s{3,})[a-zA-Z'-]+(?<!\s)$/;
    const zipcodeRegex = /^(?!.*\s)[0-9]{6}(?:-[0-9]{6})?$(?<!\s)/;
 
    let isValid = true;
  

     if (fullname && !nameRegex.test(fullname)) {
         showError('editname-error', "Name can only contain letters.");
         isValid = false;
     } else {
         hideError('editname-error');
     }
 
     if (editmobile && !mobileRegex.test(editmobile)) {
         showError('editmobile-error', "Invalid mobile number format.");
         isValid = false;
     } else {
         hideError('editmobile-error');
     }
 
     if (editaltmobile&& !altmobileRegex.test(editaltmobile)) {
         showError('editaltmobile-error', "Invalid alternate mobile number format.");
         isValid = false;
     } else {
         hideError('editaltmobile-error');
     }
 
     if (editlocality&& !localityRegex.test(editlocality)) {
         showError('editlocality-error', "Invalid locality format.");
         isValid = false;
     } else {
         hideError('editlocality-error');
     }
 
     if (editaddress&&!addressRegex.test(editaddress)) {
         showError('editaddress-error', "Invalid address format.");
         isValid = false;
     } else {
         hideError('editaddress-error');
     }
 
     if (editcity&&!cityRegex.test(editcity)) {
         showError('editcity-error', "Invalid city format.");
         isValid = false;
     } else {
         hideError('editcity-error');
     }
 
     if (editlandmark&&!landmarkRegex.test(editlandmark)) {
         showError('editlandmark-error', "Invalid landmark format.");
         isValid = false;
     } else {
         hideError('editlandmark-error');
     }
 
     if (edituserState&&!stateRegex.test(edituserState)) {
         showError('editstate-error', "Invalid state format.");
         isValid = false;
     } else {
         hideError('editstate-error');
     }
 
     if (editpostCode&&!zipcodeRegex.test(editpostCode)) {
         showError('editzipcode-error', "Invalid ZIP code format.");
         isValid = false;
     } else {
         hideError('editzipcode-error');
     }

    
 
     if(isValid){
        
        try {

            const formData = {}
         
            if(fullname){
               formData.fullName = fullname
            }
            if(editmobile){
                formData.mobile = editmobile
            }
            if(editaltmobile){
                formData.altMobile = editaltmobile
            }
            if(editlocality){
                formData.locality = editlocality
            }
            if(editaddress){
                formData.address = editaddress
            }
            if(editcity){
                formData.city = editcity
            }
            if(editlandmark){
                formData.landMark = editlandmark
            }
            if(edituserState){
                formData.state = edituserState
            }
            if(editpostCode){
                formData.postCode = editpostCode
            }

             formData.addresId = hiddenAddressId


            
            const response = await  fetch('/user_profile/edit_address',{
              method:'PUT',
              headers:{
                'Content-Type':'application/json'
              },
              body:JSON.stringify(formData) 
            })

            const data = await response.json()

            if(data.success){
                const edited = data.edited

                console.log(`${edited._id}addname`)

                document.getElementById(`${edited._id}adname`).innerHTML = edited.fullName
                document.getElementById(`${edited._id}admbile`).innerHTML = `${edited.mobile},${edited.altMobile}`
                document.getElementById(`${edited._id}adlocality`).innerHTML = edited.locality
                document.getElementById(`${edited._id}adcity`).innerHTML = edited.city
                document.getElementById(`${edited._id}adaddress`).innerHTML = edited.address
                document.getElementById(`${edited._id}pincode`).innerHTML = edited.pinCode

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Your changes have been successfully saved.',
                    confirmButtonText: 'OK'
                  })
                  
            }else{
                Swal.fire({
                    icon: 'warning',
                    title: 'No Updates!',
                    text: data.message,
                    confirmButtonText: 'Got it!'
                  });
            }

 
        } catch (error) {
         
        }

     }


    function showError(errorId, message) {
        let errorElement = document.getElementById(errorId);
        errorElement.textContent = message;
        }
    
        function hideError(errorId) {
            let errorElement = document.getElementById(errorId);
            errorElement.textContent = '';
        }


   }


   document.getElementById('addressContainer').addEventListener('click', function(event) {
    if (event.target.closest('.delete-button')) {
        const addressId = event.target.closest('.delete-button').getAttribute('data-address-id');
        deleteAddress(addressId);
    }
    });



async function deleteAddress(addressId){

      let deleteAddress = document.getElementById(addressId)

      Swal.fire({
        title: "Are you sure to delete?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          
            fetch(`/user_profile/delete_address?addressId=${addressId}`,{
                method:'DELETE'
            })
            .then(response => response.json())
            .then(data => {
              if(data.success){
                deleteAddress.parentNode.removeChild(deleteAddress)
                Swal.fire({
                    title: "Deleted!",
                    text: "Your address has been deleted.",
                    icon: "success"
                });
              }
              
            })
           
         
        }
      });



     
}









