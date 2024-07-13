
function logOut(){
 
    try {

         
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
        });
        swalWithBootstrapButtons.fire({
            title: "Are you sure?",
            text: "You are about to log out.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, log me out!",
            cancelButtonText: "No, stay logged in",
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {

                fetch('/logOut')
                .then(response => response.json())
                .then(data =>{
                    if(data.success){
                        
                        swalWithBootstrapButtons.fire({
                            title: "Logged Out",
                            text: "You have been successfully logged out.",
                            icon: "success"
                        })
                        .then(result =>{
                            if(result.isConfirmed){
                                window.location.reload()
                            }
                        })
                    }
                })
                
                // Here you can add code to handle the logout process
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                    title: "Cancelled",
                    text: "You remain logged in.",
                    icon: "error"
                });
            }
        });
        


    } catch (error) {
        
    }

}