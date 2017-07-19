function populatePlayer(data, sortBy) {
  var filtered = data;
  if (sortBy == "timelor" || sortBy == "lor") {
    $("#rownm").remove();
    $("#rowjv").remove();
    markPersonalBest('lor');
    filtered = filterRaid(sortBy.substring(0, 1) == "t" ? filterTime(data) : filterLeaderboardGenerated(data), "lor");
    populateStatsLoR(filterLeaderboardGenerated(data));
  } else if (sortBy == "timenm" || sortBy == "nm") {
    $("#rowlor").remove();
    $("#rowjv").remove();
    markPersonalBest('nm');
    filtered = filterRaid(sortBy.substring(0, 1) == "t" ? filterTime(data) : filterLeaderboardGenerated(data), "lornm");
    populateStatsNM(filterLeaderboardGenerated(data));
  } else if (sortBy == "timejv" || sortBy == "jv") {
    $("#rowlor").remove();
    $("#rownm").remove();
    markPersonalBest('jv');
    filtered = filterRaid(sortBy.substring(0, 1) == "t" ? filterTime(data) : filterLeaderboardGenerated(data), "jv");
    populateStatsJV(filterLeaderboardGenerated(data));
  } else if (sortBy == "date") {
    filtered = filtered.sort(function (a, b) { return (a.leaderboardGenerated > b.leaderboardGenerated) ? -1 : ((b.leaderboardGenerated > a.leaderboardGenerated) ? 1 : 0); });
  } else {
    filtered = filterLeaderboardGenerated(data);
    markPersonalBest('lor');
    markPersonalBest('lornm');
    markPersonalBest('jv');
    populateStats(filterLeaderboardGenerated(data));
  }
  populateTable(filtered);
}

function filterTime(data) {
  var victory = data.filter(function (r) { return r.objective == "VICTORY"; });
  var sorted = victory.sort(function (a, b) { return (a.time < b.time) ? -1 : ((b.time < a.time) ? 1 : 0); });
  return sorted;
}

function scrollToHash() {
  var hash = window.location.href.split('#')[1] || null;
  if (hash !== null) {
    var row = $('#' + hash);
    $("html, body").animate({ scrollTop: row.offset().top }, 100);
  }
}

function filterRaid(data, raid) {
  if (raid == "lor") {
    return data.filter(function (r) { return r.type == "lor"; });
  } else if (raid == "nm" || raid == "lornm") {
    return data.filter(function (r) { return r.type == "lornm"; });
  } else if (raid == "jv") {
    return data.filter(function (r) { return r.type == "jv"; });
  } else {
    return data;
  }
}

function filterLeaderboardGenerated(data) {
  var filtered = data.filter(function (r) {
    return !(r.objective == "FAILED" && failedUnder(r.time));
  });
  filtered.sort(function (a, b) { return (a.leaderboardGenerated > b.leaderboardGenerated) ? -1 : ((b.leaderboardGenerated > a.leaderboardGenerated) ? 1 : 0); });
  return filtered;
}

function populateTable(data) {
  $("#table").find("tr:gt(0)").remove();
  var table = document.getElementById("table");

  $.each(data, function (i, r) {
    var dataType = r.type;
    var row = table.insertRow();

    var type = row.insertCell(0);
    var date = row.insertCell(1);
    var result = row.insertCell(2);
    var time = row.insertCell(3);
    var objective = row.insertCell(4);
    var kills = row.insertCell(5);
    var deaths = row.insertCell(6);
    var host = row.insertCell(7);
    var players = row.insertCell(8);


    if (dataType == "lor") {
      type.innerHTML = "LoR";
    }
    if (dataType == "lornm") {
      type.innerHTML = "NM LoR";
    }
    if (dataType == "jv") {
      type.innerHTML = "JV";
    }

    var leaderboardGeneratedSeconds = new Date(r.leaderboardGenerated).getTime() / 1000;


    $(row).attr('data-time', timeToSeconds(r.time));
    $(row).attr('data-type', r.type);
    $(row).attr('data-objective', r.objective);
    $(row).attr('id', r.trialId);
    //$(date).append($('<a>').attr('href', '/player/?user=' + r.host + '&date=' + r.leaderboardGenerated + '#' + hostNice + '_' + leaderboardGeneratedSeconds).text(formatDate(r.leaderboardGenerated)));
    // $(date).append($('<a>').attr('href', '/player/?user=' + r.host + '&date=' + r.leaderboardGenerated + '#' + hostNice + '_' + leaderboardGeneratedSeconds).text(formatDate(r.leaderboardGenerated)));
    $(date).text(formatDate(r.leaderboardGenerated));

    objective.className = 'objective';

    //date.innerHTML = formatDate(r.leaderboardGenerated);
    result.innerHTML = r.objective;
    time.innerHTML = r.time;
    if (r.objective != "VICTORY") {
      objective.innerHTML = r.previousObjective;
    }
    kills.innerHTML = r.kills;
    deaths.innerHTML = r.deaths;
    $(host).append($("<a>").attr("href", "/player/?user=" + r.host).text(r.host));
    $.each(r.players, function (i, p) {
      var player = $("<a>")
        .attr("href", "/player/?user=" + p)
        .text(p);
      $(players).append(player);
      if (i < r.players.length - 1) {
        $(players).append(", ");
      }
    });

    if (dataType == "lor" || dataType == "lornm") {
      if (r.objective == "VICTORY") {
        var seconds = timeToSeconds(r.time);
        if (seconds < 900) {
          row.className = "speedrun";
        } else if (seconds < 1200) {
          row.className = "fastrun";
        } else if (seconds > 3600) {
          row.className = "slowrun";
        } else {
          row.className = "run";
        }
      } else if (r.objective == "FAILED") {
        row.className = "failed";
      } else {
        row.className = "run";
      }
    } else if (dataType == "jv") {
      if (r.objective == "VICTORY") {
        var seconds = timeToSeconds(r.time);
        if (seconds < 1200) {
          row.className = "speedrun";
        } else if (seconds < 1500) {
          row.className = "fastrun";
        } else if (seconds > 3600) {
          row.className = "slowrun";
        } else {
          row.className = "run";
        }
      } else if (r.objective == "FAILED") {
        row.className = "failed";
      } else {
        row.className = "run";
      }
    }

    //Only for eastereggs (can be removed)
    $(row).attr('data-host', r.host);
    $(row).attr('data-players', r.players + "");

  });
}

function populateStats(data) {
  populateStatsJV(data);
  populateStatsLoR(data);
  populateStatsNM(data);
}

function formatClearRate(victory, count){
  if(count == 0){
    return "N/A";
  }
  return numeral(victory / count).format('0%');
}

function formatCompletions(victory, count){
  if(count == 0){
    return "N/A";
  }
  return victory + ' / ' + count;
}

function populateStatsJV(data) {
  var jv = data.filter(function (r) { return r.type == "jv"; });
  var summary = getSummary(jv);
  $("#averageJV").text(formatTime(summary.average));
  $("#clearRateJV").text(formatClearRate(summary.victory, summary.count));
  $("#completionsJV").text(formatCompletions(summary.victory, summary.count));
  $("#bestJV").text(formatTime(summary.best));
}

function populateStatsNM(data) {
  var lornm = data.filter(function (r) { return r.type == "lornm"; });
  var summary = getSummary(lornm);
  $("#averageLorNightmare").text(formatTime(summary.average));
  $("#clearRateLorNightmare").text(formatClearRate(summary.victory, summary.count));
  $("#completionsLorNightmare").text(formatCompletions(summary.victory, summary.count));
  $("#bestLorNightmare").text(formatTime(summary.best));
}

function populateStatsLoR(data) {
  var lor = data.filter(function (r) { return r.type == "lor"; });
  var summary = getSummary(lor);
  $("#averageLor").text(formatTime(summary.average));
  $("#clearRateLor").text(formatClearRate(summary.victory, summary.count));
  $("#completionsLor").text(formatCompletions(summary.victory, summary.count));
  $("#bestLor").text(formatTime(summary.best));
}

function markPersonalBest(type) {
  var tableRows = $('#table tr');
  var filtered = tableRows.filter(function (i, x) { return $(x).attr('data-type') == type && $(x).attr('data-objective') == 'VICTORY'; });
  var sorted = filtered.sort(function (a, b) { return +$(a).attr('data-time') > +$(b).attr('data-time') ? 1 : ((+$(b).attr('data-time') > +$(a).attr('data-time')) ? -1 : 0); });
  var top = $(sorted[0]);
  var objective = top.children('.objective');
  var img = $('<img>')
    .attr('src', '/img/star.png')
    .attr('height', '19px')
    .attr('title', 'Personal Best');
  objective.append(img);
}

function getSummary(arr) {
  var victory = arr.filter(function (r) { return r.objective == "VICTORY"; });
  var failed = arr.filter(function (r) { r.objective == "FAILED"; });
  var avg = victory.reduce(function (total, r) { return total + timeToSeconds(r.time); }, 0) / victory.length;
  var best = Math.min.apply(null, victory.map(function (r) { return timeToSeconds(r.time); }));
  return {
    average: avg,
    count: arr.length,
    victory: victory.length,
    failed: failed.length,
    best: best
  };
}

function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function failedUnder(time) {
  if (timeToSeconds(time) > 420) {
    return false;
  } else {
    return true;
  }
}

function formatTime(n) {
  if(isNaN(n) || !isFinite(n)){
    return "N/A";
  }
  n = Math.ceil(n);
  var hours = Math.floor(n / 60 / 60),
    minutes = Math.floor((n - (hours * 60 * 60)) / 60),
    seconds = Math.round(n - (hours * 60 * 60) - (minutes * 60));
  var h = "";
  if (hours > 0) {
    h = ((hours < 10) ? '0' + hours : hours) + ':';
  }

  return h + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
}

function timeToSeconds(time) {
  if (time === undefined) {
    return 0;
  }
  var a = time.split(":");
  var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  return seconds;
}

function formatDate(date) {
  return moment.utc(date).format("YYYY-MM-DD HH:mm");
}


