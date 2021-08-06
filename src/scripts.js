jQuery.event.special.touchstart = {
  setup: function (_, ns, handle) {
    this.addEventListener("touchstart", handle, {
      passive: !ns.includes("noPreventDefault"),
    });
  },
};

let globalData = {}; // Speaker data
let isCardActive = false;
let globalMarkovChain = null;
var mainSpeakers = []
getData();

// Speaker card
let speakerContext = [
  {
    name: "Matt Caudle",
    img: "https://faithconnector.s3.amazonaws.com/gracelifecc/images/member/eldermattcaudle.jpg",
  },
  {
    name: "Tom Gordy",
    img: "https://faithconnector.s3.amazonaws.com/gracelifecc/images/member/eldertomgordy.jpg",
    main: true,
  },
  {
    name: "Kevin Kifer",
    img: "https://faithconnector.s3.amazonaws.com/gracelifecc/images/member/kevin_new.jpg",
    main: true,
  },
  {
    name: "Lance Utne",
    img: "https://faithconnector.s3.amazonaws.com/gracelifecc/images/member/1elderlanceutne.jpg",
    main: true,
  },
  {
    name: "Dave Waters",
    img: "https://faithconnector.s3.amazonaws.com/gracelifecc/images/member/dave_pict.png",
    main: true,
  },
  // {
  //   name: 'Steve Benedict',
  //   img: 'https://s3.amazonaws.com/media.cloversites.com/64/64354c63-df3d-4350-9b85-f3c3c700bd9d/site-images/2f92ec66-6989-4517-bc8f-371ada5969b2@2x.jpg'
  // },
  {
    name: "Ryne Caudle",
    img: "https://faithconnector.s3.amazonaws.com/gracelifecc/images/member/ryne.jpg",
  },
];

// Get data from local files
function getData() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var data = JSON.parse(xmlhttp.responseText);
      /// temp
      data = data.reverse();
      ///
      globalData = data;
      console.log(globalData.length);

      // Handle the data
      handleData(data);
    }
  };
  xmlhttp.open("GET", "./data.json", true);
  xmlhttp.send();
}

function handleData(data, showYearLabels = true) {
  // Add 3 predicted speakers to the data
  let lastDate = new Date(data[data.length - 1].date);
  let spelledOutDates = []
  for (var i = 0; i < 3; i++) {
    // Add week to lastDate
    lastDate = new Date(lastDate.getTime() + 1000 * 60 * 60 * 24 * 7);
      // Update prediciton date to next week
      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      spelledOutDates.push(months[lastDate.getMonth()] + " " + lastDate.getDate())
      $(".prediction-date-" + (i + 1)).html(spelledOutDates[i]);
    

    // MM/DD/YYYY
    let formattedDate =
      lastDate.getMonth() +
      1 +
      "/" +
      lastDate.getDate() +
      "/" +
      lastDate.getFullYear();

    // Add to data
    data.push({
      speaker: "Speaker",
      date: formattedDate,
      title: `${spelledOutDates[i]} message`,
      link: false,
      predicted: true,
    });
  }
  $(".prediction-date").html(spelledOutDates[0]);
    

  // Assign ID to speaker by popularity (0 = most popular, 1 = next most popular, etc.)
  let speakers = new Set(data.map((d) => d.speaker));
  let speakerCounts = {};
  for (let speaker of speakers) {
    speakerCounts[speaker] = 0;
  }
  for (let d of data) {
    speakerCounts[d.speaker]++;
  }
  let sortedSpeakers = Object.keys(speakerCounts).sort(
    (a, b) => speakerCounts[b] - speakerCounts[a]
  );
  data.forEach((speaker) => {
    speaker.id = sortedSpeakers.indexOf(speaker.speaker);
  });

  // Populate table under "data" header
  let tfirstrow = document.getElementById("table-firstrow");
  for (let year = 2018; year < new Date().getFullYear() + 1; year++) {
    tfirstrow.innerHTML += `<th>${year}</th>`; // Add column for each year from 2017
  }
  let tbody = document.getElementById("table-body");
  let tbodyHtml = "";
  let rank = 0;
  let lastSermonCount = 9999;
  let tableSpeakers = [];
  for (let i = 0; i < sortedSpeakers.length; i++) {
    let speaker = sortedSpeakers[i];
    if (
      data.find((d) => d.speaker == speaker).predicted ||
      !speaker ||
      speaker.includes(",") ||
      speaker.includes("&") ||
      speaker.includes("Video")
    ) {
      // If predicted, ignore
      continue;
    }
    tableSpeakers.push(speaker);

    let sermonCount = speakerCounts[speaker];
    if (sermonCount != lastSermonCount) {
      lastSermonCount = sermonCount;
      rank++;
    }

    let sermonCountByYearHtml = ""; // Populate table with count for each year
    for (let year = 2018; year < new Date().getFullYear() + 1; year++) {
      let count = data.filter(
        (d) => d.speaker == speaker && d.date.includes(year)
      ).length;
      sermonCountByYearHtml += `<td>${count}</div>`;
    }

    tbodyHtml += `
  <tr>
    <td scope="row">${rank}</td>
    <td>${speaker}</td>
    <td>${sermonCount}</td>
    ${sermonCountByYearHtml}
  </tr>   
    `;
  }

  tbody.innerHTML = tbodyHtml;

  // Populate legend from data
  let colors = ["blue", "green", "orange", "red", "yellow"];
  let legendHtml = "";
  for (let i = 0; i < sortedSpeakers.slice(0, 5).length; i++) {
    let speaker = sortedSpeakers[i];
    legendHtml += `<span class="badge badge-pill ${colors[i]} ${i != 4 ? "text-white" : "text-black"}">${speaker}</span>\n`;
  }
  legendHtml += `
    <span class="badge badge-pill gray text-white">Other</span>
    <span class="badge badge-pill purple text-white">Future</span>`;
  $("#legend-container").html(legendHtml);

  // Populate circles from data
  var circles = document.getElementById("circles");
  let yearLabel = "2017";
  for (var i = 0; i < data.length; i++) {
    var circle = document.createElement("div");
    let circleColor;
    if (data[i].predicted) {
      circleColor = "purple";
    } else if (data[i].speaker.includes("Video")) {
      circleColor = "tint";
    } else if (data[i].id >= colors.length) {
      circleColor = "gray";
    } else {
      circleColor = colors[data[i].id];
    }
    circle.className = "grid-cell " + circleColor;
    circle.id = "circle" + i;
    if (showYearLabels) {
      let speakerYear = data[i].date.split("/")[2];
      if (speakerYear != yearLabel) {
        yearLabel = speakerYear;
        let yearDiv = document.createElement("h5");
        yearDiv.className = "year-label";
        yearDiv.innerHTML = yearLabel;
        circles.appendChild(yearDiv);
        let emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-cell";
        circles.appendChild(emptyDiv);
      }
    }
    circles.appendChild(circle);
  }

  $(document).click(function () {
    for (let i = 0; i < data.length; i++) {
      let c = document.getElementById("circle" + i);
      c.classList.remove("active");

      // Reset effects
      c.style.opacity = 1;
      c.style.transform.scale = 1;
    }
    isCardActive = false;
  });

  $(".grid-cell").hover(function () {
    if (isCardActive) {
      return;
    }
    let id = $(this).attr("id").slice(6);
    let name = globalData[id].speaker;

    // Effects
    $(".grid-cell").css("transform", "");
    $(".grid-cell").css("opacity", 0.8);
    for (let i = 0; i < data.length; i++) {
      if (data[i].speaker == name) {
        $("#circle" + i).css("transform", "scale(1.12)");
        $("#circle" + i).css("opacity", 1);
      }
    }
    populateCard(id);
  });

  $(".grid-cell").click(function (e) {
    e.stopPropagation();
    let ind = $(this).attr("id").slice(6);
    let name = globalData[ind].speaker;
    var circle = document.getElementById("circle" + ind);

    // Remove class "active" from all other circles
    for (let i = 0; i < data.length; i++) {
      if (i != ind) {
        let c = document.getElementById("circle" + i);
        c.classList.remove("active");
      }
    }
    // Add class "active" to circle if it's not already active
    if (!circle.classList.contains("active")) {
      circle.classList.add("active");
      isCardActive = true;
    } else {
      circle.classList.remove("active");
      isCardActive = false;
    }

    // Effects
    $(".grid-cell").css("transform", "");
    $(".grid-cell").css("opacity", 0.8);
    for (let i = 0; i < data.length; i++) {
      if (data[i].speaker == name) {
        $("#circle" + i).css("transform", "scale(1.12)");
        $("#circle" + i).css("opacity", 1);
      }
    }

    // Add class "active" to card
    populateCard(ind);
  });
  populateCard(data.length - 1 - 3); // Populate imedately with latest speaker

  // Build Markov Chain
  let nodes = [];
  for (let i = 0; i < tableSpeakers.length; i++) {
    nodes.push({
      word: tableSpeakers[i],
      id: i,
    });
  }
  let edges = [];
  for (let i = 0; i < data.length - 1; i++) {
    data[i].nextSpeaker = data[i + 1].speaker;
  }
  for (let i = 0; i < tableSpeakers.length; i++) {
    for (let j = 0; j < tableSpeakers.length; j++) {
      let count = data.filter(
        (d) =>
          d.speaker == tableSpeakers[i] && d.nextSpeaker == tableSpeakers[j]
      ).length;
      let all = data.filter((d) => d.speaker == tableSpeakers[i]).length;
      let weight = (count * 10) / data.length;
      if (i != j && weight > 0) {
        edges.push({
          source: i,
          target: j,
          weight: weight,
        });
      }
    }
  }
  globalMarkovChain = {
    nodes: nodes,
    edges: edges,
  };

  setTimeout(function () {
    graphMarkovChain(globalMarkovChain);
  }, 1000);

  // Rotation bias
  mainSpeakers = speakerContext.filter(s => s.main)
  for (let speaker of mainSpeakers) {
    for (let i = data.length - 1 - 3; i >= 0; i--) {
      if (data[i].speaker == speaker.name) {
        speaker.lastSermonIndex = i
        break
      }
    }
  }
  mainSpeakers.sort((a, b) => a.lastSermonIndex - b.lastSermonIndex);
  for (let i = 0; i < mainSpeakers.length; i++) {
    $('.speaker-rotation-' + (i+1)).html(mainSpeakers[i].name);
  }

  let lastSpeaker = mainSpeakers[mainSpeakers.length - 1].name;
  populateMCB(lastSpeaker, true)

  return false;
}

function populateCard(ind) {
  let speaker = globalData[ind];
  let name = speaker.speaker;

  // Name
  $("#speaker-name").html(name);

  // Image
  let matches = speakerContext.filter((p) => p.name == name);
  if (matches.length > 0) {
    $("#speaker-img").attr("src", matches[0].img);
  } else {
    $("#speaker-img").attr(
      "src",
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
    );
  }

  // Title of sermon
  $("#sermon-title").html(speaker.title);

  // Link to sermon
  if (speaker.link) {
    $("#sermon-link").css("display", "block");
    $("#sermon-link").attr("href", speaker.link);
  } else {
    $("#sermon-link").css("display", "none");
  }

  // Date of sermon
  $("#sermon-date").html(speaker.date);
}

function populateMCB(speaker1, firstTime = false) {
  $('.mcb-speaker-origin').html(speaker1);
  // Markov Chain bias (only main speakers)
  let nextSpeakerWeights = [];
  let dataTop4Only = globalData.filter(d => speakerContext.find(s => s.name == d.speaker)?.main);
  for (let i = 0; i < dataTop4Only.length -1; i++) {
    dataTop4Only[i].nextMainSpeaker = dataTop4Only[i+1].speaker;
  }
  for (let i = 0; i < mainSpeakers.length; i++) {
    let nextSpeaker = mainSpeakers[i].name;
    let matches = dataTop4Only.filter(d => d.speaker == speaker1 && d.nextMainSpeaker == nextSpeaker).length;
    let all = dataTop4Only.filter(d => d.speaker == speaker1).length;
    nextSpeakerWeights.push({
      next: nextSpeaker,
      weight: matches / all
    });
    $(".mcb-speaker-" + (i + 1)).html(nextSpeaker);// mcb = markov chain bias
    let percent = `${Math.round((matches / all) * 100)}%`;
    $(".mcb-chance-" + (i + 1)).html(percent);
  }

  if (firstTime) {
    // Calculate final prediction 
    let finalScores = [];
    for (let i = 0; i < mainSpeakers.length; i++) {
      let hisSermons = dataTop4Only.filter(d => d.speaker == mainSpeakers[i].name)
      let lastSermonDate = hisSermons[hisSermons.length - 1].date
      let weeksSinceLastSermon = Math.floor((new Date() - new Date(lastSermonDate)) / 1000 / 60 / 60 / 24 / 7);
      
      let score = nextSpeakerWeights[i].weight * 100 + weeksSinceLastSermon * 100 / 4
      console.log(mainSpeakers[i].name + ": " + score)
      finalScores.push(score);
    }
    let highestScore = Math.max(...finalScores);
    let highestIndex = finalScores.indexOf(highestScore);
    let highestSpeaker = mainSpeakers[highestIndex].name;
    $('.final-prediction-speaker').html(highestSpeaker);
  }
}



$(document).ready(function () {
  $(".dropdown-item").click(function(){
    $("#dropdown-title").text($(this).text()); // Set the dropdown text
    populateMCB($(this).text()); // Populate the markov chain bias
  });
})


function showPrediction() {
  $("#before-show").fadeOut(400, function () {
    $("#after-show").fadeIn();
  });
}


// --------------------------
// Checkbox logic

function checkYears(checked) {
  if (checked) {
    $(".year-label").css("display", "block");
    $(".empty-cell").css("display", "block");
  } else {
    $(".year-label").css("display", "none");
    $(".empty-cell").css("display", "none");
  }
}

function checkLegend(checked) {
  if (checked) {
    $("#legend-container").css("display", "block");
  } else {
    $("#legend-container").css("display", "none");
  }
}
function checkGuestSpeakers(checked) {
  if (checked) {
    $(".gray").css("display", "inline-block");
    $(".tint").css("display", "inline-block");
  } else {
    $(".gray").css("display", "none");
    $(".tint").css("display", "none");
  }
}


alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
// alphabet



function chunkify(arr, n) {
  let output = ""
  while (n < arr.length) {
    for (let i = 0; i < n; i ++) {
      output += arr[i]
    }
    output += "\n";
  }
  return output
}
