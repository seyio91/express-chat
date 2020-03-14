
    $.fn.customPaginate = function(options){
        var paginationContainer = this;
        var itemsToPaginate;

        var defaults = {
            itemsPerPage: 5
        };

        var settings = {};

        $.extend(settings, defaults, options);

        var itemsPerPage = settings.itemsPerPage;

        itemsToPaginate = $(settings.itemsToPaginate);
        console.log(itemsToPaginate)
        var numberOfPaginationLinks = Math.ceil((itemsToPaginate.length / itemsPerPage));
        $(`<ul id="testPaginate" ></ul>`).prependTo(paginationContainer);

        console.log(`i should see number of links here`)
        console.log(numberOfPaginationLinks)

        for (var index=0; index < numberOfPaginationLinks; index++){
            paginationContainer.find("ul#testPaginate").append(`<li>${index+1}</li>`);
        }

        itemsToPaginate.filter(`:gt(${itemsPerPage - 1})`).hide();

        paginationContainer.find("ul#testPaginate li").on('click', function(){

            var linkNumber = $(this).text();

            var itemsToHide = itemsToPaginate.filter(`:lt(${((linkNumber - 1) * itemsPerPage)})`);
            $.merge(itemsToHide, itemsToPaginate.filter(`:gt(${((linkNumber * itemsPerPage) - 1)})`));
            itemsToHide.hide();

            var itemsToShow = itemsToPaginate.not(itemsToHide);
            itemsToShow.show();
        })

    }


    // Custom.js while above is paginate.js
    // $(document).ready(function(){
        $(".pagination").customPaginate({

            itemsToPaginate : "li#post"
        })
    // })
    