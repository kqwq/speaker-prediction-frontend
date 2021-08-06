

for (var i = 0; i < 1000; i++) {
  var ele = $(".cs_accent_fg")[i];
  data[i] = {
    title: ele.innerHTML,
    date: $(".widget-card__date")[i].innerHTML,
    speaker: $(".widget-card__speaker")[i].innerHTML,
    link: $(".widget-card__thumb")[i].href,
  };
}

console.log(JSON.stringify(data, null, 2));