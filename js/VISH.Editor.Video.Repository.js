VISH.Editor.Video.Repository = (function(V, $, undefined) {
	
	var carrouselDivId = "tab_video_repo_content_carrousel";
	var previewDivId = "tab_video_repo_content_preview";
	var currentVideos = new Array();
	var selectedVideo = null;
	
	var init = function() {
		var myInput = $("#tab_video_repo_content").find("input[type='search']");
		$(myInput).watermark('Search content');
		$(myInput).keydown(function(event) {
			if(event.keyCode == 13) {
				VISH.Editor.Video.Repository.requestData($(myInput).val());
				$(myInput).blur();
			}
		});
	};	
	
	var onLoadTab = function() {
		var previousSearch = ($("#tab_video_repo_content").find("input[type='search']").val() != "");
		if(!previousSearch) {
			_cleanVideoPreview();
			_requestInitialData();
		}
	};
	
	/*
	 * Request inicial data to the server.
	 */
	var _requestInitialData = function() {
		//VISH.Editor.API.requestRecomendedVideos(VISH.Editor.Video.Repository.onDataReceived, VISH.Editor.Video.Repository.onAPIError);
	};
	
	/*
	 * Request data to the server.
	 */
	var requestData = function(text) {
		VISH.Editor.API.requestVideos(text, VISH.Editor.Video.Repository.onDataReceived, VISH.Editor.Video.Repository.onAPIError);
	};
	
	/*
	 * Fill tab_video_repo_content_carrousel div with server data.
	 */
	var onDataReceived = function(data) {
		//Clean previous content
		VISH.Editor.Carrousel.cleanCarrousel(carrouselDivId);
		//clean previous preview if any
		_cleanVideoPreview(); 

		//Clean previous videos
		currentVideos = new Array();

		var content = "";

		if(data.videos.length==0){
			$("#" + carrouselDivId).html("No results found.");
		} 
		else{ 
			//data.videos is an array with the results
			$.each(data.videos, function(index, video) {
				content = content + "<div><img src='" + video.poster + "' videoId='" + video.id + "'></div>";
				currentVideos[video.id] = video;
			});
	
			$("#" + carrouselDivId).html(content);
			VISH.Editor.Carrousel.createCarrousel(carrouselDivId, 1, VISH.Editor.Video.Repository.onClickCarrouselElement,5);
		}
	};
	
	var onAPIError = function() {
		console.log("API error");
		//VISH.Editor.Carrousel.cleanCarrousel(carrouselDivId);
	};
	
	var onClickCarrouselElement = function(event) {
		var videoId = $(event.target).attr("videoid");
		var renderedVideo = VISH.Renderer.renderVideo(currentVideos[videoId], "preview");
		_renderVideoPreview(renderedVideo, currentVideos[videoId]);
		selectedVideo = currentVideos[videoId];
	};
	
	var _renderVideoPreview = function(renderedVideo, video) {
		var videoArea = $("#" + previewDivId).find("#tab_video_repo_content_preview_video");
		var metadataArea = $("#" + previewDivId).find("#tab_video_repo_content_preview_metadata");
		var button = $("#" + previewDivId).find(".okButton");
		$(videoArea).html("");
		$(metadataArea).html("");
		if((renderedVideo) && (video)) {
			$(videoArea).append(renderedVideo);
			var table = _generateTable(video.author, video.title, video.description);
			$(metadataArea).html(table);
			$(button).show();
		}
	};
	
	var _cleanVideoPreview = function() {
		var videoArea = $("#" + previewDivId).find("#tab_video_repo_content_preview_video");
		var metadataArea = $("#" + previewDivId).find("#tab_video_repo_content_preview_metadata");
		var button = $("#" + previewDivId).find(".okButton");
		$(videoArea).html("");
		$(metadataArea).html("");
		$(button).hide();
	};
	
	var _generateTable = function(author, title, description) {

		if(!author) {
			author = "";
		}
		if(!title) {
			title = "";
		}
		if(!description) {
			description = "";
		}

		return "<table class=\"metadata\">" + "<tr class=\"even\">" + "<td class=\"title header_left\">Author</td>" + "<td class=\"title header_right\"><div class=\"height_wrapper\">" + author + "</div></td>" + "</tr>" + "<tr class=\"odd\">" + "<td class=\"title\">Title</td>" + "<td class=\"info\"><div class=\"height_wrapper\">" + title + "</div></td>" + "</tr>" + "<tr class=\"even\">" + "<td colspan=\"2\" class=\"title_description\">Description</td>" + "</tr>" + "<tr class=\"odd\">" + "<td colspan=\"2\" class=\"info_description\"><div class=\"height_wrapper_description\">" + description + "</div></td>" + "</tr>" + "</table>";
	};
	
	var addSelectedVideo = function() {
		if(selectedVideo != null) {
			var sourcesArray = [];
			var options = new Array();
			options['poster'] = selectedVideo.poster;
			var sources = JSON.parse(selectedVideo.sources);			
			$.each(sources, function(index, source) {
				sourcesArray.push([source.src, source.type]);
			});
			VISH.Editor.Video.HTML5.drawVideo(sourcesArray, options);
			$.fancybox.close();
		}
	};
	
	return {
		init : init,
		onLoadTab : onLoadTab,
		requestData : requestData,
		onDataReceived : onDataReceived,
		onAPIError : onAPIError,
		addSelectedVideo : addSelectedVideo,
		onClickCarrouselElement : onClickCarrouselElement
	};

})(VISH, jQuery);
