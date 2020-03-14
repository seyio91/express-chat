$(document).ready(function(){
    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results[1] || 0;
    }
    
    var tag_id = $.urlParam('tag');
    $('#tagDiplayTitle').append(`${tag_id}`)

    tUrl = "http://localhost:3000/blog_posts?tags=" + tag_id;

    $.get(tUrl, function(data){
        console.log(data)
        $(document).prop('title', `Category: ${tag_id}`);
        if (data.length >0){
            for (let i=0; i < data.length; i++){
            //prepend
            $("#tag_search").prepend(`
            <div class="post-preview" id="tagPost">
            <a href="views.html?id=${data[i].id}">
              <h2 class="post-title">
              ${data[i].title} 
              </h2>
              <h3 class="post-subtitle">
              ${data[i].blog_main.slice(0,50)}...
              </h3>
            </a>
            <p class="post-meta">Posted by
              <a href="#">${data[i].author}</a>
              on ${data[i].date.slice(0,24)}</p>
              <p class="text-right"> <i class="fas fa-folder-open"></i>  <a href="tag_post.html?tag=${data[i].tags}">${data[i].tags}</a></p>
              <hr>
          </div>
          
            `)

            

            }
            $("#tagPagination").customPaginate({

                itemsToPaginate : "div#tagPost"
            })
        } else {
            //handle later if you remember
            $("#tag_search").prepend(`
                <h1>No Articles for Category: "${tag_id}". <p>Page Not yet Developed</p></h1>
            `)
        }
    }).fail(function(){
        alert("Page Not Found")
        window.location.href= "index.html"
    });
})