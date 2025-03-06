const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NWNmNDk0OTJjMjEwZGU0OGQ1NjQ3NDJjOTllNjNlOCIsIm5iZiI6MTcyNzM0NzIyMi44MTk4MjEsInN1YiI6IjY2ZjUyYjM3MzMzNWFiYTdhMTczZWIyOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.92t3xZ5OCAwAFSOtFxuKfUeSZdLsOwJIYCmjb6h1_Ag'
    }
};

$(document).ready(function () { 
    // When the modal is hidden 
    $('#videoModal').on('hidden.bs.modal', function() { 
        // Find the iframe within the modal 
        var iframe = $(this).find('iframe');
        // Set the src attribute to an empty string to stop the video 
        iframe.attr('src', ''); 
    });
});
function getMoviePoster()
{
    var movies = $(".poster");
    for (let i = 0; i < movies.length; i++){
        let movieName = movies[i].id;
        movieName = movieName.slice(movieName.indexOf(":") + 1, movieName.length);
        movieName = movieName.replace(/_/g, ' ');
        let index = movieName.search(/\(.*?\)/g);
        movieName = movieName.slice(0,index);

        fetch('https://api.themoviedb.org/3/search/movie?query='+ movieName +'&include_adult=false&language=en-US&page=1', options)
        .then(response => response.json())
        .then(response => {


            movieID = $("#"+response.results[0].id);
            if(response.results.length > 0){

                $("[data-id=\""+movies[i].id+"\"] .additional-info button").attr('id', response.results[0].id);
                var release_date = response.results[0].release_date;
                var overview = response.results[0].overview;

                //add image
                fetch('https://api.themoviedb.org/3/movie/'+ response.results[0].id +'/images', options)
                .then(response => response.json())
                .then(response => {
                    let poster = response.posters.find(poster => poster.iso_639_1 === 'en');
                    if(poster){
                        moviePosterPath = response.posters[0].file_path;
                        $("[id=\""+movies[i].id+"\"] img").attr("src", "http://image.tmdb.org/t/p/w780"+poster.file_path);
                        $("[id=\""+movies[i].id+"\"] img ").css("background-image", " linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(http://image.tmdb.org/t/p/w780"+poster.file_path+")");
                    } else if(response.posters[0].file_path){
                        moviePosterPath = response.posters[0].file_path 
                        $("[id=\""+movies[i].id+"\"] img").attr("src", "http://image.tmdb.org/t/p/w780"+ response.posters[0].file_path);
                        $("[id=\""+movies[i].id+"\"] img ").css("background-image", " linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(http://image.tmdb.org/t/p/w780"+response.posters[0].file_path+")");
                    }
                    $("[id=\""+movies[i].id+"\"] .movie-name-poster ").css("display", "none");
                })
                .catch(err => {
                    console.error(err);
                    $("#open-info").on('show.bs.modal', function (e) {
                        return e.preventDefault(); 
                    });
                }); 

                // add rating
                let result = response.results.find(result => result.original_language === 'en');
                if(result && result.vote_average != 0) {
                    $("[id=\""+movies[i].id+"\"] .rating")[0].innerHTML = result.vote_average.toFixed(1);
                } else {
                    result = response.results.find(result => result.vote_average != 0);
                    $("[id=\""+movies[i].id+"\"] .rating")[0].innerHTML = result.vote_average.toFixed(1);
                }

                // open modal on click() event 
                if(response.results[0].id) {
                    $("#"+response.results[0].id).removeAttr("disabled");
                }
                $("#"+response.results[0].id).on("click", function(){
                    // add info to modal
                    moviePosterPath = $("[data-id=\""+movies[i].id+"\"] .findme")[0].getAttribute('src');
                    
                    $(".modal-content").css("background-image", " linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url("+moviePosterPath+")");
                    $(".description .overview")[0].innerHTML = overview;
                    $(".release-date")[0].innerHTML = release_date;

                    //get alternative title in US
                    fetch('https://api.themoviedb.org/3/movie/'+ this.id +'/alternative_titles?country=US', options)
                    .then(res => res.json())
                    .then(response => {
                        $("#youtubeVideoModal")[0].innerHTML = response.titles[0].title;
                        })
                    .catch(err => {
                        console.error(err);
                        $("#youtubeVideoModal")[0].innerHTML = movieName;

                    });
                    

                    // get official trailer
                    fetch('https://api.themoviedb.org/3/movie/'+this.id+'/videos?language=en-US', options)
                    .then(res => res.json())
                    .then(res => {
                        document.getElementById('youtube-video').style.display = 'block';
                        document.getElementById('error-message').style.display = 'none';
                        $(".youtube-video iframe").attr('src', 'https://www.youtube.com/embed/'+res.results[0].key);                        
                    })
                    .catch(err => {
                        document.getElementById('youtube-video').style.display = 'none';
                        document.getElementById('error-message').style.display = 'block';
                        console.error(err);
                    });

                    //add genre , runtime
                    fetch('https://api.themoviedb.org/3/movie/'+ this.id, options)
                    .then(response => response.json())
                    .then(response => {
                        var genres = "";
                        for (let element of response.genres ) {
                            genres = element.name + ", " + genres;
                        }
                        $(".genre")[0].innerHTML = genres.substring(0, genres.length - 2);;
                        $(".runtime")[0].innerHTML = response.runtime + "m";
                    })
                    .catch(err => {
                        console.error(err);
                        $("#open-info").on('show.bs.modal', function (e) {
                            return e.preventDefault(); 
                        });
                    }); 
                });
            }
        })
        .catch(err => console.error(err));
    }
};