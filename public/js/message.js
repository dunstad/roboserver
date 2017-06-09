function main() {
  var bannerMessage = document.getElementById('bannerMessage');
  var messages = [
    '<a href="">Your support</a> makes this project possible. Thanks!',
  ];
  var randomMessage = messages[Math.floor(Math.random() * messages.length)];
  bannerMessage.innerHTML = randomMessage;
}

main();