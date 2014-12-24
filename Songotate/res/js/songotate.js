// add dataTransfer to jQuery event objects
jQuery.event.props.push("dataTransfer");
$(document.body).on("dragover", function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
}).on("drop", function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files;
    if (files.length === 0) return;
    if (files.length > 1) alert("Too many files!  I'll just take the first one...");
    var file = files[0];
    window._file = file;
    if (file.type.substr(0, 6) !== "audio/" && !confirm("This doesn't look like an audio file.  Try anyway?")) return;
    $("#intro").text(file.name);
    var reader = new FileReader();
    reader.onload = function(e) {
        $("#player").prop("src", e.target.result);
    };
    reader.readAsDataURL(file);
});
var bpm = {
    diffs: [],
    last: 0
};
$("#bpm").click(function(e) {
    clearTimeout(bpm.timeout);
    bpm.timeout = setTimeout(function() {
        bpm.diffs = [];
        bpm.last = 0;
        $("#bpm").text("BPM: " + Math.round(bpm.bpm));
    }, 2000);
    var last = bpm.last;
    bpm.last = (new Date()).getTime();
    if (last !== 0) {
        bpm.diffs.push(bpm.last - last);
        var average = 0;
        for (var i = 0; i < bpm.diffs.length; i++) average += bpm.diffs[i];
        bpm.time = average / bpm.diffs.length;
        bpm.bpm = (1000 * 60) / bpm.time;
        $("#bpm").text(bpm.bpm);
    }
});
var offset = 0;
$("#offset").click(function(e) {
    offset = $("#player").prop("currentTime");
    $("#offset").text("Offset: " + offset);
});
$("#offset-seek").click(function(e) {
    $("#player").prop("currentTime", offset);
});
var tags = [];
var tagFrom = 0;
$("#tag-from").click(function(e) {
    tagFrom = $("#player").prop("currentTime");
    $("#tag-from").text("From: " + tagFrom);
});
var tagTo = 0;
$("#tag-to").click(function(e) {
    tagTo = $("#player").prop("currentTime");
    $("#tag-to").text("To: " + tagTo);
});
$("#tag-add").click(function(e) {
    tags.push({
        name: $("#tag-name").val(),
        range: [tagFrom, tagTo]
    });
    console.log(tags);
    $("#tags-list").append($("<li/>").text($("#tag-name").val() + ": " + tagFrom + " -> " + tagTo));
    $("#tag-name").val("");
});
$("#tag-clear").click(function(e) {
    tags = [];
    $("#tags-list").empty();
});
var beat = true;
var interval;
$("#player").on("playing", function(e) {
    if (!bpm.bpm) return;
    clearInterval(interval);
    var atOffset = function() {
        interval = setInterval(function() {
            beat = !beat;
            console.log(beat);
        }, bpm.time);
    };
    var time = $("#player").prop("currentTime");
    setTimeout(atOffset, (offset > time ? offset - time : time / bpm.time) * 1000);
}).on("abort emptied pause", function(e) {
    clearInterval(interval);
});