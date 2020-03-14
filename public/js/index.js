$(document).ready(function(){
    //my dynamic tags function
    $.get("http://localhost:3000/tags", function(data){
        data.forEach((tag)=>{
            $('#tags').append(`<option value="${tag.title}" >${tag.title}</option>`)
        })
    })

    class SendPostData {
        constructor(author, title, image_src, blog_main, date, tags){
            this.author = author;
            this.title = title;
            this.image_src = image_src;
            this.blog_main = blog_main;
            this.date = date;
            this.tags = tags;
        }
    }

    function UI(){}


	function reset(){
        $("#title").val("");
        $("#author").val("");
        $("#tags").val("");
        $("#image").val("");
        $("#blogpost").val("");
        console.log("reset worked")
    }
	//add user to json file
	$("#publish").click(function(event){
        event.preventDefault();
		const blog_title = $("#title").val();
		const blog_author = $("#author").val();
		const blog_tags = $("#tags").val();
        const blog_image = $("#image").prop('files')[0];
        const blog_post = $("#blogpost").val();
        const todayDate = new Date();

        const data = new SendPostData(blog_author, blog_title, blog_image, blog_post, todayDate, blog_tags)

        console.log(data)

        //Check if  user is signed in before posting. if User not signed in force login again
        
		//validation before posting 
		if (blog_title == "" || blog_author === "" || blog_tags === "" || blog_post === "" ){
			alert("Complete all required fields")
        } else {
           $.post("http://localhost:3000/blog_posts", data, alert("New Post Created"))
           reset();
		}
    })

    $.get("http://localhost:3000/blog_posts", function(data){
        //data = data.reverse();

        data.forEach(function(blog_post){
            $("#blog_display").prepend(`
            <div class="post-preview" id="post">
            <a href="views.html?id=${blog_post.id}">
              <h2 class="post-title">
              ${blog_post.title} 
              </h2>
              <h3 class="post-subtitle">
              ${blog_post.blog_main.slice(0,50)}...
              </h3>
            </a>
            <p class="post-meta">Posted by
              <a href="#">${blog_post.author}</a>
              on ${blog_post.date.slice(0,24)}</p>
              <p class="text-right"> <i class="fas fa-folder-open"></i>  <a href="tag_post.html?tag=${blog_post.tags}">${blog_post.tags}</a></p>
              <hr>
          </div>
            `)
            $("#featured_titles").prepend(`<li class="list-group-item" id="titlePost"><a href="views.html?id=${blog_post.id}">${blog_post.title}</a></li>`)

        })

    //page pagination
    $("#pagination").customPaginate({

        itemsToPaginate : "div#post"
    })

    $("#titlePagination").customPaginate({

        itemsToPaginate : "li#titlePost"
    })
    //del test
    
    })
    .fail(
        function(){
            console.log("testing failed get")
        }
    );

    

    //Calling Categories
    $.get("http://localhost:3000/tags", function(data){
        data.forEach((tag)=>{
            $("#category_view").append(`
                <li class="list-group-item"><a href="tag_post.html?tag=${tag.title}">${tag.title}</a></li>
                `)
        })   
    });

    async function getUsers(){
        response = await fetch('http://localhost:3000/tags?_page=1&_limit=3')
        const data = await response.json();
        retVal = {
            data: data,
            link: response.headers.get('link')
        }
        return retVal
    }

    async function somefunc(){
        value = await getUsers()
        // console.log('this is some: ', some)
        console.log('this is value: ', value)
    }

    somefunc()

}) //waits for document to be loaded before execution

