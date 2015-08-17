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
        $("#bpm").text("BPM: " + bpm.bpm.toFixed(2));
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
$("#bpm-double").click(function(e) {
    bpm.time /= 2;
    bpm.bpm *= 2;
    $("#bpm").text("BPM: " + Math.round(bpm.bpm));
});
$("#bpm-half").click(function(e) {
    bpm.time *= 2;
    bpm.bpm /= 2;
    $("#bpm").text("BPM: " + Math.round(bpm.bpm));
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
        from: tagFrom,
        to: tagTo
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
var intervals = [];
function clearIntervals() {
    while (intervals.length > 0) clearInterval(intervals.pop());
}
var activeTags = [];
function dispActive() {
    $("#active").text(activeTags.length > 0 ? "Active tags: " + activeTags.join(", ") : "No active tags.");
}
$("#player").on("playing", function(e) {
    clearIntervals();
    var time = $("#player").prop("currentTime");
    if (bpm.bpm) {
        var atOffset = function() {
            interval = setInterval(function() {
                beat = !beat;
                console.log(beat);
            }, bpm.time);
        };
        setTimeout(atOffset, (time < offset ? offset - time : time / bpm.time) * 1000);
    }
    $.each(tags, function(i, tag) {
        if (time < tag.to) {
            setTimeout(function() {
                activeTags.splice(activeTags.indexOf(tag.name), 1);
                dispActive();
            }, (tag.to - time) * 1000);
            var atStart = function() {
                activeTags.push(tag.name);
                dispActive();
            };
            if (time < tag.from) {
                setTimeout(atStart, (tag.from - time) * 1000);
            } else atStart();
        }
    });
}).on("abort emptied pause", function(e) {
    clearIntervals();
});
