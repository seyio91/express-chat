$(document).ready(function(){
    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results[1] || 0;
    }
    
    var id = $.urlParam('id');

    const url = "http://localhost:3000/blog_posts/" + id
    //Hello word
    $.get(url, function(data){
        $("#edit_title").val(data.title);
        $("#edit_author").val(data.author);
        $("#edit_tags").val(data.tags);
        $("#edit_image").val(data.image_src);
        $("#edit_blogpost").val(data.blog_main);
        const editDate = data.date;
    });

	//add user to json file
	$("#edit_publish").click(function(event){
        event.preventDefault();
		const blog_title = $("#edit_title").val();
		const blog_author = $("#edit_author").val();
		const blog_tags = $("#edit_tags").val();
        const blog_image = $("#edit_image").val();
        const blog_post = $("#edit_blogpost").val();
        const todayDate = new Date();
		const data = {
            author : blog_author,
            title : blog_title,
            image_src : blog_image,
            blog_main : blog_post,
            tags : blog_tags,
            date: todayDate
        }
		//validation before posting 
		if (blog_title == "" || blog_author === "" || blog_tags === "" || blog_post === "" ){
			alert("Complete all required fields")
        } else {
           $.ajax({
            url: url,
            data: data,
            dataType: "json",
            type: "put",
            success: function(){
                alert("record Edit")
                window.location.replace("blog_posts.html")
            }
        })
           
        //console.log("data was posted")
		}
    })

    


}) //waits for document to be loaded before execution