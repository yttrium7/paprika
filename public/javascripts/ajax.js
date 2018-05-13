
$('.editBio').on('click', function(event) {
	event.preventDefault();
	$.ajax({
		url: '/profile/edit-bio',
		type: 'get',
		dataType: 'json',
		success:function(data){
			$('#editBio').html(data.data);
		},
		error:function(data){
			alert('error');
		}
	});
});

$('.editAvatar').on('click', function(event) {
	event.preventDefault();
	$.ajax({
		url: '/profile/edit-avatar',
		type: 'get',
		dataType: 'json',
		success:function(data){
			$('#editAvatar').html(data.data);
		},
		error:function(data){
			alert('error');
		}
	});
});