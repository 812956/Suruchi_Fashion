

async function showSavebuttonGender(){
   
    const saveButton = document.getElementById('saveButton-name-gender')
    const editSpan = document.getElementById('Name-gender-username')
    
    if(saveButton.style.display =='none'){
       saveButton.style.display = 'inline-block'
       editSpan.innerHTML = 'Cancel'
       
       const fullName = document.getElementById('profileFullname')
       const userName = document.getElementById('profileUsername')
       const gender = document.querySelectorAll('input[name="gender"]')

       fullName.disabled = false
       userName.disabled = false
       gender.forEach(input => input.disabled=false)

    }else{
        saveButton.style.display= 'none'
        editSpan.innerHTML = 'Edit'
        
       const fullName = document.getElementById('profileFullname')
       const userName = document.getElementById('profileUsername')
       const gender = document.querySelectorAll('input[name="gender"]')

       fullName.disabled = true
       userName.disabled = true
       gender.forEach(input => input.disabled=true)

    }
} 


async function saveNameGenderData() {
    
    const fullName = document.getElementById('profileFullname').value
    const userName = document.getElementById('profileUsername').value
    const genderElement = document.querySelector('input[name="gender"]:checked')
    const gender = genderElement? genderElement.value:'';
    
    const nameRegex = /^[a-zA-Z](?:\s{0,2}[a-zA-Z])*$/;
    // const usernameRegex = /^(?!.*[_.]{2})(?!.*\s)[a-zA-Z0-9._]{3,16}(?<![_.])$/;
    const usernameRegex = /^[\w.-]+(?<!\s)[\w.-]{6,63}([\w.-])?(?!\s)$/


    let isValid = true

    if(fullName && !nameRegex.test(fullName)){
        showError('name-gender-error','Invalid Name')
        isValid = false
    }else{
        hideError('name-gender-error')
    } 

    if(userName && !usernameRegex.test(userName)){
        showError('username-gender-error','Username can only include letters, numbers, underscores, dots, and hyphens.')
        isValid = false
    }
    else{
        hideError('username-gender-error')
    }

    if(isValid){

    try{
        
    const updatedNameGender = {}

    if(fullName){
        updatedNameGender.fullName = fullName
    }
    if(userName){
        updatedNameGender.userName = userName
    }
    if(gender){
        updatedNameGender.gender = gender
    }

    console.log(updatedNameGender)

    const response = await fetch('/user_profile/edit-name-gender',{
        method:'PUT',
        headers:{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(updatedNameGender)
    })

    if(response.status === 404){
        window.location.reload()
    }

    const data = await response.json()

    if(data.success){

        const saveButton = document.getElementById('saveButton-name-gender')
        const editSpan = document.getElementById('Name-gender-username')
         
        editSpan.innerHTML = 'Edit'
        saveButton.style.display = 'none'

        Swal.fire({
            title: "Account details updated",
            showClass: {
              popup: `
                animate__animated
                animate__fadeInUp
                animate__faster
              `
            },
            hideClass: {
              popup: `
                animate__animated
                animate__fadeOutDown
                animate__faster
              `
            }
        });
        
        const fullName = document.getElementById('profileFullname')
        const userName = document.getElementById('profileUsername')
        const gender = document.querySelectorAll('input[name="gender"]') 

        fullName.placeholder = data.updatedNameandGender.fullName
        userName.placeholder = data.updatedNameandGender.userNameforLogged?data.updatedNameandGender.userNameforLogged:data.updatedNameandGender.name

        fullName.value = ''
        userName.value = ''
        

        fullName.disabled = true
        userName.disabled = true
        gender.forEach(input=> input.disabled=true)
     
        
    }
    
    }catch(err){
    
        console.log(err)

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

async function showSavebuttonNumber(){

    const saveBtn = document.getElementById('saveButton-number')
    const editSpan = document.getElementById('number-edit-span') 
    const telephone = document.getElementById('telephone')


    if(saveBtn.style.display === 'none'){
        saveBtn.style.display ='inline-block'
        editSpan.innerHTML = 'Cancel'
        telephone.disabled = false
    }


    else{
       saveBtn.style.display = 'none'
       editSpan.innerHTML = 'Edit'
       telephone.disabled = true
    }

}

async function savePhone() {

      const mobile = document.getElementById('telephone').value
      const mobileRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[789]\d{9}$/;
     
      const isValid = true
      if(mobile && !mobileRegex.test(mobile) ){
        showError('number-edit-error', 'Please enter a valid 10-digit mobile number.')
        isValid = false
      }
      else{
        hideError('number-edit-error')
      }

      if(isValid){

        if(mobile){

            console.log(mobile)
           
           const response = await fetch('/user_profile/editPhone',{
            method:'PATCH',
            headers:{
                'Content-Type' : 'application/json'
            },
            body:JSON.stringify({
              mobile
            })

           })

           if(response.status === 404){
            window.location.reload()
           }

           const data = await response.json()


           if(data.success){
             
            const saveBtn = document.getElementById('saveButton-number')
            const editSpan = document.getElementById('number-edit-span') 
            const telephone = document.getElementById('telephone')

            editSpan.innerHTML = 'Edit'
            saveBtn.style.display = 'none'
           
            telephone.placeholder = data.updatedUserbyNumber.mobile
            telephone.value = ''
            telephone.disabled = true

           }

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





