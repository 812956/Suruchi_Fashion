async function toggleStatus(userId,button,statusField,entity,subEntity){
    console.log(userId)
    const confirmButtonText = button.innerHTML

    const result = await Swal.fire({
      title: `Are you sure you want to  this ?`,
      text: "You can revert this action in the profile.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText
    })

    if(result.isConfirmed){
       const response = await axios.patch(`/admin/admin_panel/${entity}_management/block_${subEntity}`,{
        userId:userId
       })

      const userState = response.data.userState;
      statusField.innerHTML = userState ? 'Blocked' : 'Unblocked';
      statusField.classList.remove('text-success', 'text-danger');
      statusField.classList.add(userState ? 'text-danger' : 'text-success');

      button.innerHTML = userState ? 'Unblock' : 'Block';
      button.classList.remove('btn-success', 'btn-danger');
      button.classList.add(userState ? 'btn-success' : 'btn-danger');

      Swal.fire(
          'Updated!',
          `User has been ${userState ? 'blocked' : 'unblocked'}!`,
          'success'
      );
        
    }else{
      swal(`User remains ${statusField.innerHTML.toLowerCase()}.`);
    }

   } 