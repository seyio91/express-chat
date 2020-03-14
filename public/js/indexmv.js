$(document).ready(function(){
    const postUrl = "http://localhost:3000/blog_posts";
    const tagUrl = "http://localhost:3000/tags";
    function reset(){
        $("#title").val("");
        $("#author").val("");
        $("#tags").val("");
        $("#image").val("");
        $("#blogpost").val("");
        console.log("reset worked")
    }
    var model = {
        getAllPosts: (url, func)=>{
            $.get(url, (data)=> func(data))
        },
        addPost: (url, data, func)=>{
            $.post(url, data, ()=> func())
        }
    };

    var octopus = {
        getTitles: (link, someFunc)=> {
            model.getAllPosts(link, someFunc) 
        },
        addBlogPost: (link, data, addFunc)=> {
            model.addPost(data, link, addFunc);
            view.render();
        }
    }

    var view = {
        init: ()=>{
            this.blogDisplay = $('#blog_display')
            this.featuredTitles = $("#featured_titles")
            this.categories = $("#category_view")
            this.tagOptions = $('#tags')
            var publisher = $('#publish')
            publisher.click(function(event){
                event.preventDefault();
                sessionkey = JSON.parse(localStorage.getItem("localSession"));
                currentUser = sessionkey.userID
                let blog_title = $("#title").val();
                let blog_author = $("#author").val();
                let blog_tags = $("#tags").val();
                let blog_image = $("#image").prop('files')[0];
                let blog_post = $("#blogpost").val();
                let todayDate = new Date();
                data = {
                    "author": blog_author,
                    "username": currentUser,
                    "title": blog_title,
                    "image_src": blog_image.name,
                    "blog_main": blog_post,
                    "tags": blog_tags,
                    "date": todayDate
                }
                console.log(data)
                if (blog_title == "" || blog_author === "" || blog_tags === "" || blog_post === "" ){
                    alert("Complete all required fields")
                } else {
                    octopus.addBlogPost(postUrl, data, alert("new post created"))
                    reset()
                }

            })
            view.render();
        },

        render: ()=>{
            let blogposttemplate = '<div class="post-preview" id="post"> <a href="views.html?id=${id}"><h2 class="post-title">${title}</h2><h3 class="post-subtitle">${blog_main.slice(0,50)}...</h3></a><p class="post-meta">Posted by<a href="#">${author}</a>on ${date.slice(0,24)}</p><p class="text-right"> <i class="fas fa-folder-open"></i>  <a href="tag_post.html?tag=${tags}">${tags}</a></p><hr></div>'
            let featuredtemplate = '<li class="list-group-item" id="titlePost"><a href="views.html?id=${id}">${title}</a></li>'

            $.template('blogArticles', blogposttemplate)
            $.template('featuredArticles', featuredtemplate)
            $.template('tagView', '<li class="list-group-item"><a href="tag_post.html?tag=${title}">${title}</a></li>')
            $.template('tagOption', '<option value="${title}" >${title}</option>')

            viewfunc = (data)=>{
                $.tmpl('blogArticles', data).prependTo(this.blogDisplay)
                $.tmpl('featuredArticles', data).prependTo(this.featuredTitles)
                $("#pagination").customPaginate({ itemsToPaginate : "div#post" })
            };

            tagfunc = (data)=>{
                $.tmpl('tagView', data).appendTo(this.categories)
                $.tmpl('tagOption', data).appendTo(this.tagOptions)
            }

            octopus.getTitles(postUrl, viewfunc)
            octopus.getTitles(tagUrl, tagfunc)
        }
    }

    view.init()
})